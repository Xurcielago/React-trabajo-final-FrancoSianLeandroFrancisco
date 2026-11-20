import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Boton } from "../components/Boton";
import {
    AREA_TACTIL_MINIMA,
    COLORES,
    ESPACIADO,
    RADIO,
    TIPOGRAFIA,
} from "../constants/tema";
import { useBiblioteca } from "../context/BibliotecaContext";

export default function PantallaLogin() {
  const { iniciarSesion } = useBiblioteca();
  const [usuario, setUsuario] = useState<string>("");
  const [clave, setClave] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  function manejarIngreso() {
    const ok = iniciarSesion(usuario, clave);
    if (!ok) {
      setError(
        "Usuario o contraseña incorrectos. Revisá los datos e intentá de nuevo.",
      );
      return;
    }

    setError(null);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.contenedor}
    >
      <View style={styles.tarjeta}>
        <Text style={styles.titulo}>Ingreso del personal</Text>
        <Text style={styles.descripcion}>
          Iniciá sesión para administrar las listas de espera desde el
          mostrador.
        </Text>

        <View style={styles.grupoCampo}>
          <Text style={styles.etiqueta}>Usuario</Text>
          <TextInput
            value={usuario}
            onChangeText={(texto) => {
              setUsuario(texto);
              if (error) {
                setError(null);
              }
            }}
            placeholder="bibliotecario"
            placeholderTextColor={COLORES.textoSecundario}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Usuario del personal"
            style={styles.input}
          />
        </View>

        <View style={styles.grupoCampo}>
          <Text style={styles.etiqueta}>Contraseña</Text>
          <TextInput
            value={clave}
            onChangeText={(texto) => {
              setClave(texto);
              if (error) {
                setError(null);
              }
            }}
            placeholder="Ingresá tu contraseña"
            placeholderTextColor={COLORES.textoSecundario}
            secureTextEntry
            accessibilityLabel="Contraseña del personal"
            style={styles.input}
          />
        </View>

        {error ? <Text style={styles.textoError}>{error}</Text> : null}

        <Boton titulo="Ingresar" onPress={manejarIngreso} />
      </View>
    </KeyboardAvoidingView>
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
  descripcion: {
    fontSize: TIPOGRAFIA.cuerpo,
    color: COLORES.textoSecundario,
  },
  grupoCampo: {
    gap: ESPACIADO.xs,
  },
  etiqueta: {
    fontSize: TIPOGRAFIA.pequeno,
    fontWeight: "600",
    color: COLORES.textoPrincipal,
  },
  input: {
    minHeight: AREA_TACTIL_MINIMA,
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: RADIO.md,
    paddingHorizontal: ESPACIADO.md,
    fontSize: TIPOGRAFIA.cuerpo,
    color: COLORES.textoPrincipal,
    backgroundColor: COLORES.fondo,
  },
  textoError: {
    fontSize: TIPOGRAFIA.pequeno,
    color: COLORES.errorTexto,
    fontWeight: "600",
  },
});
