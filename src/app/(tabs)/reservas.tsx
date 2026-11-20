import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { AvisoBanner } from "../../components/AvisoBanner";
import { Boton } from "../../components/Boton";
import { COLORES, ESPACIADO, RADIO, TIPOGRAFIA } from "../../constants/tema";
import { useBiblioteca } from "../../context/BibliotecaContext";
import { usePermiso } from "../../hooks/usePermiso";

export default function PantallaMisReservas() {
  const {
    prestamos,
    misReservasEnEspera,
    avisos,
    devolverLibro,
    alternarRecordatorio,
    descartarAviso,
  } = useBiblioteca();

  const permisoNotif = usePermiso("notificaciones");
  const { recargar } = permisoNotif;

  useFocusEffect(
    useCallback(() => {
      void recargar();
    }, [recargar]),
  );

  async function manejarCambioRecordatorio(isbn: string, activar: boolean) {
    if (!activar) {
      await alternarRecordatorio(isbn, false);
      return;
    }

    if (permisoNotif.concedido) {
      await alternarRecordatorio(isbn, true);
      return;
    }

    router.push({
      pathname: "/permisos/[recurso]",
      params: { recurso: "notificaciones", isbn },
    });
  }

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <View style={styles.estadoNotif}>
        <Text style={styles.tituloNotif}>
          Notificaciones:{" "}
          {permisoNotif.concedido
            ? "Activadas"
            : permisoNotif.estado === "bloqueado"
              ? "Bloqueadas en el sistema"
              : "Sin activar"}
        </Text>
        <Text style={styles.descripcionNotif}>
          {permisoNotif.concedido
            ? "Recibirás recordatorios de devolución y avisos del mostrador."
            : "Podés usar la app normalmente: los avisos del mostrador aparecerán acá arriba."}
        </Text>
      </View>

      {avisos.length > 0 ? (
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Avisos de la biblioteca</Text>
          {avisos.map((aviso) => (
            <AvisoBanner
              key={aviso.id}
              aviso={aviso}
              onDescartar={descartarAviso}
            />
          ))}
        </View>
      ) : null}

      <View style={styles.seccion}>
        <Text style={styles.tituloSeccion}>Mis préstamos</Text>
        {prestamos.length === 0 ? (
          <View style={styles.vacio}>
            <Text style={styles.textoVacio}>
              Todavía no tenés préstamos activos.
            </Text>
          </View>
        ) : (
          prestamos.map((prestamo) => (
            <View key={prestamo.isbn} style={styles.tarjeta}>
              <Text style={styles.tituloLibro}>{prestamo.titulo}</Text>
              <Text style={styles.detalle}>
                Devolver antes del {prestamo.fechaDevolucion}
              </Text>

              <View style={styles.filaSwitch}>
                <Text style={styles.textoSwitch}>Recordarme (demo 15 s)</Text>
                <Switch
                  value={prestamo.recordatorioActivo}
                  onValueChange={(valor) => {
                    void manejarCambioRecordatorio(prestamo.isbn, valor);
                  }}
                  accessibilityLabel={`Activar recordatorio para ${prestamo.titulo}`}
                  trackColor={{
                    false: COLORES.borde,
                    true: COLORES.primarioClaro,
                  }}
                  thumbColor={
                    prestamo.recordatorioActivo
                      ? COLORES.primario
                      : COLORES.superficie
                  }
                />
              </View>

              <Boton
                titulo="Devolver"
                variante="secundario"
                onPress={() => {
                  void devolverLibro(prestamo.isbn);
                }}
              />
            </View>
          ))
        )}
      </View>

      <View style={styles.seccion}>
        <Text style={styles.tituloSeccion}>Mis reservas en espera</Text>
        {misReservasEnEspera.length === 0 ? (
          <View style={styles.vacio}>
            <Text style={styles.textoVacio}>
              No estás en ninguna lista de espera.
            </Text>
          </View>
        ) : (
          misReservasEnEspera.map((reserva) => (
            <View key={reserva.isbn} style={styles.tarjeta}>
              <Text style={styles.tituloLibro}>{reserva.titulo}</Text>
              <Text style={styles.detalle}>
                Posición en la lista de espera: #{reserva.posicion}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    padding: ESPACIADO.md,
    gap: ESPACIADO.lg,
  },
  estadoNotif: {
    backgroundColor: COLORES.superficie,
    borderRadius: RADIO.md,
    borderWidth: 1,
    borderColor: COLORES.borde,
    padding: ESPACIADO.md,
  },
  tituloNotif: {
    fontSize: TIPOGRAFIA.cuerpo,
    fontWeight: "700",
    color: COLORES.textoPrincipal,
    marginBottom: ESPACIADO.xs,
  },
  descripcionNotif: {
    fontSize: TIPOGRAFIA.pequeno,
    color: COLORES.textoSecundario,
  },
  seccion: {
    gap: ESPACIADO.sm,
  },
  tituloSeccion: {
    fontSize: TIPOGRAFIA.subtitulo,
    fontWeight: "700",
    color: COLORES.textoPrincipal,
  },
  tarjeta: {
    backgroundColor: COLORES.superficie,
    borderRadius: RADIO.md,
    borderWidth: 1,
    borderColor: COLORES.borde,
    padding: ESPACIADO.md,
    gap: ESPACIADO.sm,
  },
  tituloLibro: {
    fontSize: TIPOGRAFIA.subtitulo,
    fontWeight: "700",
    color: COLORES.textoPrincipal,
  },
  detalle: {
    fontSize: TIPOGRAFIA.cuerpo,
    color: COLORES.textoSecundario,
  },
  filaSwitch: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: ESPACIADO.xs,
  },
  textoSwitch: {
    fontSize: TIPOGRAFIA.cuerpo,
    color: COLORES.textoPrincipal,
  },
  vacio: {
    backgroundColor: COLORES.superficie,
    borderRadius: RADIO.md,
    borderWidth: 1,
    borderColor: COLORES.borde,
    padding: ESPACIADO.md,
  },
  textoVacio: {
    fontSize: TIPOGRAFIA.cuerpo,
    color: COLORES.textoSecundario,
  },
});
