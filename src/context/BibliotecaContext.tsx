import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import {
    CREDENCIALES_PERSONAL,
    LIBROS,
    LISTAS_ESPERA_INICIALES,
    USUARIO_ACTUAL,
} from "../data/libros";
import { Cola } from "../estructuras/Cola";
import { Pila } from "../estructuras/Pila";
import {
    cancelarNotificacion,
    notificarEntregaDisponible,
    programarRecordatorioDevolucion,
} from "../lib/notificaciones";
import type { AvisoApp, Libro, Prestamo } from "../types";

type ResultadoReserva =
  | { ok: true; tipo: "prestamo"; fechaDevolucion: string }
  | { ok: true; tipo: "espera"; posicion: number }
  | { ok: false; error: string };

type ResultadoEntrega = {
  persona: string | null;
  notificadoPorSistema: boolean;
};

type ReservaUsuarioEspera = {
  isbn: string;
  titulo: string;
  posicion: number;
};

type ResumenEsperaMostrador = {
  isbn: string;
  titulo: string;
  frente: string;
  cantidad: number;
};

type BibliotecaContextValor = {
  prestamos: Prestamo[];
  avisos: AvisoApp[];
  ultimosTresVistos: Libro[];
  misReservasEnEspera: ReservaUsuarioEspera[];
  librosConEspera: ResumenEsperaMostrador[];
  sesionActiva: boolean;
  registrarVisto: (libro: Libro) => void;
  obtenerEjemplaresDisponibles: (isbn: string) => number;
  obtenerCantidadEnEspera: (isbn: string) => number;
  estaReservadoOPrestado: (isbn: string) => boolean;
  reservarLibro: (libro: Libro) => ResultadoReserva;
  devolverLibro: (isbn: string) => Promise<void>;
  alternarRecordatorio: (isbn: string, activar: boolean) => Promise<void>;
  entregarAlSiguiente: (isbn: string) => Promise<ResultadoEntrega>;
  descartarAviso: (id: string) => void;
  iniciarSesion: (usuario: string, clave: string) => boolean;
  cerrarSesion: () => void;
};

const BibliotecaContext = createContext<BibliotecaContextValor | null>(null);

function crearColasIniciales(): Record<string, Cola<string>> {
  const mapa: Record<string, Cola<string>> = {};
  for (const [isbn, personas] of Object.entries(LISTAS_ESPERA_INICIALES)) {
    mapa[isbn] = new Cola<string>(personas);
  }
  return mapa;
}

function formatearFecha(fecha: Date): string {
  return fecha.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function crearPrestamoParaLibro(libro: Libro): Prestamo {
  const hoy = new Date();
  const devolucion = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);

  return {
    isbn: libro.isbn,
    titulo: libro.titulo,
    fechaPrestamo: formatearFecha(hoy),
    fechaDevolucion: formatearFecha(devolucion),
    recordatorioActivo: false,
    notificacionId: null,
  };
}

export function BibliotecaProvider({ children }: { children: ReactNode }) {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [listasEspera, setListasEspera] =
    useState<Record<string, Cola<string>>>(crearColasIniciales);
  const [recientes, setRecientes] = useState<Pila<Libro>>(
    () => new Pila<Libro>(),
  );
  const [avisos, setAvisos] = useState<AvisoApp[]>([]);
  const [sesionActiva, setSesionActiva] = useState<boolean>(false);

  const registrarVisto = useCallback((libro: Libro) => {
    setRecientes((actual) => {
      if (actual.cima()?.isbn === libro.isbn) {
        return actual;
      }
      const copia = actual.clonar();
      copia.apilar(libro);
      return copia;
    });
  }, []);

  const obtenerEjemplaresDisponibles = useCallback(
    (isbn: string): number => {
      const libroBase = LIBROS.find((item) => item.isbn === isbn);
      if (!libroBase) {
        return 0;
      }
      const estaPrestado = prestamos.some((p) => p.isbn === isbn);
      return Math.max(0, libroBase.ejemplares - (estaPrestado ? 1 : 0));
    },
    [prestamos],
  );

  const obtenerCantidadEnEspera = useCallback(
    (isbn: string): number => {
      return listasEspera[isbn]?.tamanio ?? 0;
    },
    [listasEspera],
  );

  const estaReservadoOPrestado = useCallback(
    (isbn: string): boolean => {
      const enPrestamos = prestamos.some((p) => p.isbn === isbn);
      if (enPrestamos) {
        return true;
      }
      const cola = listasEspera[isbn];
      return cola ? cola.aArray().includes(USUARIO_ACTUAL) : false;
    },
    [prestamos, listasEspera],
  );

  const reservarLibro = useCallback(
    (libro: Libro): ResultadoReserva => {
      if (estaReservadoOPrestado(libro.isbn)) {
        return {
          ok: false,
          error: "Ya tenés este libro en préstamo o en tu lista de espera.",
        };
      }

      const disponibles = obtenerEjemplaresDisponibles(libro.isbn);

      if (disponibles > 0) {
        const nuevoPrestamo = crearPrestamoParaLibro(libro);
        setPrestamos((actuales) => [nuevoPrestamo, ...actuales]);
        return {
          ok: true,
          tipo: "prestamo",
          fechaDevolucion: nuevoPrestamo.fechaDevolucion,
        };
      }

      const colaActual = listasEspera[libro.isbn];
      const nuevaCola = colaActual ? colaActual.clonar() : new Cola<string>();
      nuevaCola.encolar(USUARIO_ACTUAL);
      const posicion = nuevaCola.tamanio;

      setListasEspera((previo) => ({
        ...previo,
        [libro.isbn]: nuevaCola,
      }));

      return {
        ok: true,
        tipo: "espera",
        posicion,
      };
    },
    [estaReservadoOPrestado, obtenerEjemplaresDisponibles, listasEspera],
  );

  const devolverLibro = useCallback(
    async (isbn: string) => {
      const prestamo = prestamos.find((p) => p.isbn === isbn);
      if (prestamo?.notificacionId) {
        await cancelarNotificacion(prestamo.notificacionId);
      }

      setPrestamos((actuales) => actuales.filter((p) => p.isbn !== isbn));
    },
    [prestamos],
  );

  const alternarRecordatorio = useCallback(
    async (isbn: string, activar: boolean) => {
      const prestamo = prestamos.find((p) => p.isbn === isbn);
      if (!prestamo) {
        return;
      }

      if (!activar) {
        await cancelarNotificacion(prestamo.notificacionId);
        setPrestamos((actuales) =>
          actuales.map((p) =>
            p.isbn === isbn
              ? { ...p, recordatorioActivo: false, notificacionId: null }
              : p,
          ),
        );
        return;
      }

      const notificacionId = await programarRecordatorioDevolucion(
        prestamo.titulo,
        prestamo.isbn,
      );

      setPrestamos((actuales) =>
        actuales.map((p) =>
          p.isbn === isbn
            ? { ...p, recordatorioActivo: true, notificacionId }
            : p,
        ),
      );
    },
    [prestamos],
  );

  const entregarAlSiguiente = useCallback(
    async (isbn: string): Promise<ResultadoEntrega> => {
      const colaActual = listasEspera[isbn];
      if (!colaActual || colaActual.estaVacia()) {
        return { persona: null, notificadoPorSistema: false };
      }

      const copiaCola = colaActual.clonar();
      const persona = copiaCola.desencolar() ?? null;

      setListasEspera((previo) => ({
        ...previo,
        [isbn]: copiaCola,
      }));

      if (persona !== USUARIO_ACTUAL) {
        return { persona, notificadoPorSistema: false };
      }

      const libro = LIBROS.find((item) => item.isbn === isbn);
      if (libro) {
        setPrestamos((actuales) => {
          if (actuales.some((p) => p.isbn === isbn)) {
            return actuales;
          }
          return [crearPrestamoParaLibro(libro), ...actuales];
        });
      }

      const titulo = libro?.titulo ?? `ISBN ${isbn}`;
      const notificadoPorSistema = await notificarEntregaDisponible(titulo);

      if (!notificadoPorSistema) {
        const nuevoAviso: AvisoApp = {
          id: `${isbn}-${Date.now()}`,
          mensaje: `Tu reserva de "${titulo}" fue liberada en el mostrador y ya figura en tus préstamos.`,
          fecha: formatearFecha(new Date()),
        };
        setAvisos((actuales) => [nuevoAviso, ...actuales]);
      }

      return { persona, notificadoPorSistema };
    },
    [listasEspera],
  );

  const descartarAviso = useCallback((id: string) => {
    setAvisos((actuales) => actuales.filter((aviso) => aviso.id !== id));
  }, []);

  const iniciarSesion = useCallback(
    (usuario: string, clave: string): boolean => {
      const esValido =
        usuario.trim() === CREDENCIALES_PERSONAL.usuario &&
        clave === CREDENCIALES_PERSONAL.clave;
      if (esValido) {
        setSesionActiva(true);
      }
      return esValido;
    },
    [],
  );

  const cerrarSesion = useCallback(() => {
    setSesionActiva(false);
  }, []);

  const ultimosTresVistos = useMemo(() => {
    return recientes.aArray().slice(-3).reverse();
  }, [recientes]);

  const misReservasEnEspera = useMemo<ReservaUsuarioEspera[]>(() => {
    const resultado: ReservaUsuarioEspera[] = [];

    for (const [isbn, cola] of Object.entries(listasEspera)) {
      const indice = cola.aArray().indexOf(USUARIO_ACTUAL);
      if (indice !== -1) {
        const libro = LIBROS.find((item) => item.isbn === isbn);
        resultado.push({
          isbn,
          titulo: libro?.titulo ?? isbn,
          posicion: indice + 1,
        });
      }
    }

    return resultado;
  }, [listasEspera]);

  const librosConEspera = useMemo<ResumenEsperaMostrador[]>(() => {
    const resultado: ResumenEsperaMostrador[] = [];

    for (const [isbn, cola] of Object.entries(listasEspera)) {
      const frente = cola.frente();
      if (frente && cola.tamanio > 0) {
        const libro = LIBROS.find((item) => item.isbn === isbn);
        resultado.push({
          isbn,
          titulo: libro?.titulo ?? isbn,
          frente,
          cantidad: cola.tamanio,
        });
      }
    }

    return resultado;
  }, [listasEspera]);

  const valor = useMemo<BibliotecaContextValor>(
    () => ({
      prestamos,
      avisos,
      ultimosTresVistos,
      misReservasEnEspera,
      librosConEspera,
      sesionActiva,
      registrarVisto,
      obtenerEjemplaresDisponibles,
      obtenerCantidadEnEspera,
      estaReservadoOPrestado,
      reservarLibro,
      devolverLibro,
      alternarRecordatorio,
      entregarAlSiguiente,
      descartarAviso,
      iniciarSesion,
      cerrarSesion,
    }),
    [
      prestamos,
      avisos,
      ultimosTresVistos,
      misReservasEnEspera,
      librosConEspera,
      sesionActiva,
      registrarVisto,
      obtenerEjemplaresDisponibles,
      obtenerCantidadEnEspera,
      estaReservadoOPrestado,
      reservarLibro,
      devolverLibro,
      alternarRecordatorio,
      entregarAlSiguiente,
      descartarAviso,
      iniciarSesion,
      cerrarSesion,
    ],
  );

  return (
    <BibliotecaContext.Provider value={valor}>
      {children}
    </BibliotecaContext.Provider>
  );
}

export function useBiblioteca(): BibliotecaContextValor {
  const contexto = useContext(BibliotecaContext);
  if (!contexto) {
    throw new Error(
      "useBiblioteca debe utilizarse dentro de BibliotecaProvider.",
    );
  }
  return contexto;
}
