import { Pressable, StyleSheet, Text } from "react-native";
import {
    AREA_TACTIL_MINIMA,
    COLORES,
    ESPACIADO,
    RADIO,
    TIPOGRAFIA,
} from "../constants/tema";

type VarianteBoton = "primario" | "secundario" | "peligro";

type PropsBoton = {
  titulo: string;
  onPress: () => void;
  variante?: VarianteBoton;
  deshabilitado?: boolean;
  accessibilityLabel?: string;
};

export function Boton({
  titulo,
  onPress,
  variante = "primario",
  deshabilitado = false,
  accessibilityLabel,
}: PropsBoton) {
  return (
    <Pressable
      onPress={onPress}
      disabled={deshabilitado}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? titulo}
      accessibilityState={{ disabled: deshabilitado }}
      style={({ pressed }) => [
        styles.base,
        variante === "primario" && styles.primario,
        variante === "secundario" && styles.secundario,
        variante === "peligro" && styles.peligro,
        deshabilitado && styles.deshabilitado,
        pressed && !deshabilitado && styles.presionado,
      ]}
    >
      <Text
        style={[
          styles.texto,
          variante === "secundario" && styles.textoSecundario,
        ]}
      >
        {titulo}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: AREA_TACTIL_MINIMA,
    minWidth: AREA_TACTIL_MINIMA,
    paddingHorizontal: ESPACIADO.md,
    paddingVertical: ESPACIADO.sm,
    borderRadius: RADIO.md,
    alignItems: "center",
    justifyContent: "center",
  },
  primario: {
    backgroundColor: COLORES.primario,
  },
  secundario: {
    backgroundColor: COLORES.superficie,
    borderWidth: 1,
    borderColor: COLORES.primario,
  },
  peligro: {
    backgroundColor: COLORES.errorTexto,
  },
  deshabilitado: {
    opacity: 0.5,
  },
  presionado: {
    opacity: 0.8,
  },
  texto: {
    color: COLORES.textoInvertido,
    fontSize: TIPOGRAFIA.cuerpo,
    fontWeight: "600",
  },
  textoSecundario: {
    color: COLORES.primario,
  },
});
