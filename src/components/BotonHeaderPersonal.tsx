import { router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import {
    AREA_TACTIL_MINIMA,
    COLORES,
    ESPACIADO,
    TIPOGRAFIA,
} from "../constants/tema";
import { useBiblioteca } from "../context/BibliotecaContext";

export function BotonHeaderPersonal() {
  const { sesionActiva } = useBiblioteca();

  function manejarPresion() {
    if (sesionActiva) {
      router.push("/mostrador");
    } else {
      router.push("/login");
    }
  }

  return (
    <Pressable
      onPress={manejarPresion}
      accessibilityRole="button"
      accessibilityLabel={
        sesionActiva ? "Ir al mostrador del personal" : "Ingresar como personal"
      }
      style={({ pressed }) => [styles.boton, pressed && styles.presionado]}
    >
      <Text style={styles.texto}>
        {sesionActiva ? "Mostrador" : "Personal"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    minHeight: AREA_TACTIL_MINIMA,
    minWidth: AREA_TACTIL_MINIMA,
    paddingHorizontal: ESPACIADO.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  presionado: {
    opacity: 0.7,
  },
  texto: {
    color: COLORES.primario,
    fontSize: TIPOGRAFIA.cuerpo,
    fontWeight: "700",
  },
});
