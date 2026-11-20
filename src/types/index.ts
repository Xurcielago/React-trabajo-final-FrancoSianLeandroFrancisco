export type Libro = {
  isbn: string;
  titulo: string;
  autor: string;
  anio: number;
  ejemplares: number;
};

export type Prestamo = {
  isbn: string;
  titulo: string;
  fechaPrestamo: string;
  fechaDevolucion: string;
  recordatorioActivo: boolean;
  notificacionId: string | null;
};

export type ReservaEspera = {
  isbn: string;
  titulo: string;
  usuario: string;
};

export type AvisoApp = {
  id: string;
  mensaje: string;
  fecha: string;
};

export type RecursoPermiso = 'camara' | 'notificaciones';

export type EstadoPermisoApp = 'cargando' | 'concedido' | 'preguntable' | 'bloqueado';