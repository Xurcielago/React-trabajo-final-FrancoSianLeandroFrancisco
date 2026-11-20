import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Boton } from "../../components/Boton";
import { EstadoPantalla } from "../../components/EstadoPantalla";
import { COLORES, ESPACIADO, RADIO, TIPOGRAFIA } from "../../constants/tema";
import { useBiblioteca } from "../../context/BibliotecaContext";
import { LIBROS } from "../../data/libros";

function obtenerFechaDevolucionEstimada(): string {
  const devolucion = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return devolucion.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function PantallaConfirmarReserva() {
  const { isbn } = useLocalSearchParams<{ isbn: string }>();
  const [errorReserva, setErrorReserva] = useState<string | null>(null);

  const {
    obtenerEjemplaresDisponibles,
    obtenerCantidadEnEspera,
    estaReservadoOPrestado,
    reservarLibro,
  } = useBiblioteca();

  const isbnLimpio = typeof isbn === "string" ? isbn.trim() : "";
  const libro = LIBROS.find((item) => item.isbn === isbnLimpio);

  if (!libro) {
    return (
      <EstadoPantalla
        tipo="error"
        titulo="Libro no encontrado"
        descripcion="No se pudo iniciar la reserva porque el ISBN indicado no existe."
        textoAccion="Volver al catálogo"
        onAccion={() => router.dismissTo("/")}
      />
    );
  }

  const disponibles = obtenerEjemplaresDisponibles(libro.isbn);
  const enEspera = obtenerCantidadEnEspera(libro.isbn);
  const yaLoTengo = estaReservadoOPrestado(libro.isbn);
  const fechaEstimada = obtenerFechaDevolucionEstimada();

  function manejarConfirmacion() {
    if (!libro) {
      return;
    }

    const resultado = reservarLibro(libro);
    if (!resultado.ok) {
      setErrorReserva(resultado.error);
      return;
    }

    router.dismissTo("/reservas");
  }

  return (
    <View style={styles.contenedor}>
      <View style={styles.tarjeta}>
        <Text style={styles.titulo}>{libro.titulo}</Text>
        <Text style={styles.autor}>{libro.autor}</Text>

        {yaLoTengo ? (
          <View style={styles.cajaAviso}>
            <Text style={styles.textoAviso}>
              Ya tenés este libro registrado en tus préstamos o en tu lista de
              espera. No se puede reservar dos veces el mismo título.
            </Text>
          </View>
        ) : disponibles > 0 ? (
          <View style={styles.cajaExito}>
            <Text style={styles.textoExito}>
              Hay {disponibles} ejemplar{disponibles === 1 ? "" : "es"}{" "}
              disponible{disponibles === 1 ? "" : "s"}. Al confirmar se
              registrará un préstamo por 7 días (devolución estimada:{" "}
              {fechaEstimada}).
            </Text>
          </View>
        ) : (
          <View style={styles.cajaAviso}>
            <Text style={styles.textoAviso}>
              Actualmente no hay ejemplares en estante. Al confirmar ingresarás
              a la lista de espera en la posición #{enEspera + 1}.
            </Text>
          </View>
        )}

        {errorReserva ? (
          <Text style={styles.textoError}>{errorReserva}</Text>
        ) : null}

        <View style={styles.acciones}>
          {yaLoTengo ? (
            <Boton
              titulo="Ir a Mis reservas"
              onPress={() => router.dismissTo("/reservas")}
            />
          ) : (
            <Boton titulo="Confirmar" onPress={manejarConfirmacion} />
          )}
          <Boton
            titulo="Cancelar"
            variante="secundario"
            onPress={() => router.back()}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: "center",
    padding: ESPACIADO.lg,
  },
  tarjeta: {
    backgroundColor: COLORES.superficie,
    borderRadius: RADIO.lg,
    borderWidth: 1,
    borderColor: COLORES.borde,
    padding: ESPACIADO.lg,
    gap: ESPACIADO.md,
  },
  titulo: {
    fontSize: TIPOGRAFIA.titulo,
    fontWeight: "700",
    color: COLORES.textoPrincipal,
  },
  autor: {
    fontSize: TIPOGRAFIA.cuerpo,
    color: COLORES.textoSecundario,
  },
  cajaExito: {
    backgroundColor: COLORES.exitoFondo,
    borderRadius: RADIO.md,
    padding: ESPACIADO.md,
  },
  textoExito: {
    fontSize: TIPOGRAFIA.cuerpo,
    color: COLORES.exitoTexto,
    fontWeight: "600",
  },
  cajaAviso: {
    backgroundColor: COLORES.avisoFondo,
    borderRadius: RADIO.md,
    padding: ESPACIADO.md,
  },
  textoAviso: {
    fontSize: TIPOGRAFIA.cuerpo,
    color: COLORES.avisoTexto,
    fontWeight: "600",
  },
  textoError: {
    fontSize: TIPOGRAFIA.pequeno,
    color: COLORES.errorTexto,
    fontWeight: "600",
  },
  acciones: {
    gap: ESPACIADO.sm,
    marginTop: ESPACIADO.xs,
  },
});
