import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
    AREA_TACTIL_MINIMA,
    COLORES,
    ESPACIADO,
    RADIO,
    TIPOGRAFIA,
} from "../constants/tema";
import type { AvisoApp } from "../types";

type PropsAvisoBanner = {
  aviso: AvisoApp;
  onDescartar: (id: string) => void;
};

export function AvisoBanner({ aviso, onDescartar }: PropsAvisoBanner) {
  return (
    <View style={styles.contenedor}>
      <View style={styles.textos}>
        <Text style={styles.mensaje}>{aviso.mensaje}</Text>
        <Text style={styles.fecha}>{aviso.fecha}</Text>
      </View>
      <Pressable
        onPress={() => onDescartar(aviso.id)}
        accessibilityRole="button"
        accessibilityLabel="Descartar aviso"
        style={styles.botonCerrar}
      >
        <Ionicons name="close" size={20} color={COLORES.avisoTexto} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORES.avisoFondo,
    borderRadius: RADIO.md,
    padding: ESPACIADO.md,
    marginBottom: ESPACIADO.sm,
  },
  textos: {
    flex: 1,
    marginRight: ESPACIADO.sm,
  },
  mensaje: {
    fontSize: TIPOGRAFIA.cuerpo,
    color: COLORES.avisoTexto,
    fontWeight: "600",
  },
  fecha: {
    fontSize: TIPOGRAFIA.pequeno,
    color: COLORES.avisoTexto,
    marginTop: ESPACIADO.xs,
  },
  botonCerrar: {
    minWidth: AREA_TACTIL_MINIMA,
    minHeight: AREA_TACTIL_MINIMA,
    alignItems: "center",
    justifyContent: "center",
  },
});
