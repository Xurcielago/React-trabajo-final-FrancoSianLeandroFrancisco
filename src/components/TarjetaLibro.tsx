import { Pressable, StyleSheet, Text, View } from "react-native";
import {
    AREA_TACTIL_MINIMA,
    COLORES,
    ESPACIADO,
    RADIO,
    TIPOGRAFIA,
} from "../constants/tema";
import type { Libro } from "../types";

type PropsTarjetaLibro = {
  libro: Libro;
  ejemplaresDisponibles: number;
  cantidadEnEspera: number;
  onPress: () => void;
};

export function TarjetaLibro({
  libro,
  ejemplaresDisponibles,
  cantidadEnEspera,
  onPress,
}: PropsTarjetaLibro) {
  const hayDisponibles = ejemplaresDisponibles > 0;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalle de ${libro.titulo} de ${libro.autor}`}
      style={({ pressed }) => [styles.tarjeta, pressed && styles.presionada]}
    >
      <Text style={styles.titulo}>{libro.titulo}</Text>
      <Text style={styles.meta}>
        {libro.autor} ({libro.anio})
      </Text>
      <View style={styles.filaEstado}>
        <View
          style={[
            styles.etiqueta,
            hayDisponibles
              ? styles.etiquetaDisponible
              : styles.etiquetaSinStock,
          ]}
        >
          <Text
            style={[
              styles.textoEtiqueta,
              hayDisponibles ? styles.textoDisponible : styles.textoSinStock,
            ]}
          >
            {hayDisponibles
              ? `${ejemplaresDisponibles} disponible${ejemplaresDisponibles === 1 ? "" : "s"}`
              : "Sin ejemplares"}
          </Text>
        </View>
        {cantidadEnEspera > 0 ? (
          <Text style={styles.espera}>{cantidadEnEspera} en espera</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    minHeight: AREA_TACTIL_MINIMA,
    backgroundColor: COLORES.superficie,
    borderRadius: RADIO.md,
    borderWidth: 1,
    borderColor: COLORES.borde,
    padding: ESPACIADO.md,
    marginBottom: ESPACIADO.sm,
  },
  presionada: {
    opacity: 0.75,
  },
  titulo: {
    fontSize: TIPOGRAFIA.subtitulo,
    fontWeight: "700",
    color: COLORES.textoPrincipal,
    marginBottom: ESPACIADO.xs,
  },
  meta: {
    fontSize: TIPOGRAFIA.pequeno,
    color: COLORES.textoSecundario,
    marginBottom: ESPACIADO.sm,
  },
  filaEstado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  etiqueta: {
    paddingHorizontal: ESPACIADO.sm,
    paddingVertical: ESPACIADO.xs,
    borderRadius: RADIO.sm,
  },
  etiquetaDisponible: {
    backgroundColor: COLORES.exitoFondo,
  },
  etiquetaSinStock: {
    backgroundColor: COLORES.avisoFondo,
  },
  textoEtiqueta: {
    fontSize: TIPOGRAFIA.pequeno,
    fontWeight: "600",
  },
  textoDisponible: {
    color: COLORES.exitoTexto,
  },
  textoSinStock: {
    color: COLORES.avisoTexto,
  },
  espera: {
    fontSize: TIPOGRAFIA.pequeno,
    color: COLORES.textoSecundario,
  },
});
