import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { COLORES, ESPACIADO, TIPOGRAFIA } from "../constants/tema";
import { Boton } from "./Boton";

type TipoEstado = "cargando" | "error" | "vacio";

type PropsEstadoPantalla = {
  tipo: TipoEstado;
  titulo: string;
  descripcion?: string;
  textoAccion?: string;
  onAccion?: () => void;
};

export function EstadoPantalla({
  tipo,
  titulo,
  descripcion,
  textoAccion,
  onAccion,
}: PropsEstadoPantalla) {
  return (
    <View style={styles.contenedor}>
      {tipo === "cargando" && (
        <ActivityIndicator
          size="large"
          color={COLORES.primario}
          style={styles.indicador}
        />
      )}
      <Text style={[styles.titulo, tipo === "error" && styles.tituloError]}>
        {titulo}
      </Text>
      {descripcion ? (
        <Text style={styles.descripcion}>{descripcion}</Text>
      ) : null}
      {textoAccion && onAccion ? (
        <View style={styles.accion}>
          <Boton titulo={textoAccion} onPress={onAccion} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: ESPACIADO.lg,
  },
  indicador: {
    marginBottom: ESPACIADO.md,
  },
  titulo: {
    fontSize: TIPOGRAFIA.subtitulo,
    fontWeight: "700",
    color: COLORES.textoPrincipal,
    textAlign: "center",
    marginBottom: ESPACIADO.xs,
  },
  tituloError: {
    color: COLORES.errorTexto,
  },
  descripcion: {
    fontSize: TIPOGRAFIA.cuerpo,
    color: COLORES.textoSecundario,
    textAlign: "center",
    marginBottom: ESPACIADO.md,
  },
  accion: {
    marginTop: ESPACIADO.sm,
  },
});
