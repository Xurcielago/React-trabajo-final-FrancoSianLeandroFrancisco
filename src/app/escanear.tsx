import { CameraView, type BarcodeScanningResult } from "expo-camera";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Boton } from "../components/Boton";
import { EstadoPantalla } from "../components/EstadoPantalla";
import {
    AREA_TACTIL_MINIMA,
    COLORES,
    ESPACIADO,
    RADIO,
    TIPOGRAFIA,
} from "../constants/tema";
import { LIBROS } from "../data/libros";
import { usePermiso } from "../hooks/usePermiso";

const REGEX_ISBN_13 = /^\d{13}$/;

export default function PantallaEscanear() {
  const permiso = usePermiso("camara");
  const [isbnManual, setIsbnManual] = useState<string>("");
  const [errorManual, setErrorManual] = useState<string | null>(null);
  const [avisoEscaneo, setAvisoEscaneo] = useState<string | null>(null);

  const yaMostroPreviaRef = useRef<boolean>(false);
  const escaneoBloqueadoRef = useRef<boolean>(false);

  useEffect(() => {
    if (
      !yaMostroPreviaRef.current &&
      (permiso.estado === "preguntable" || permiso.estado === "bloqueado")
    ) {
      yaMostroPreviaRef.current = true;
      router.push({
        pathname: "/permisos/[recurso]",
        params: { recurso: "camara" },
      });
    }
  }, [permiso.estado]);

  function manejarCodigoEscaneado(resultado: BarcodeScanningResult) {
    if (escaneoBloqueadoRef.current) {
      return;
    }

    escaneoBloqueadoRef.current = true;
    const codigo = resultado.data.trim();
    const libroEncontrado = LIBROS.find((item) => item.isbn === codigo);

    if (libroEncontrado) {
      router.replace({
        pathname: "/libro/[isbn]",
        params: { isbn: libroEncontrado.isbn },
      });
      return;
    }

    setAvisoEscaneo(
      `El código ${codigo} no corresponde a ningún libro del catálogo.`,
    );
  }

  function reanudarEscaneo() {
    setAvisoEscaneo(null);
    escaneoBloqueadoRef.current = false;
  }

  function buscarPorIsbnManual() {
    const limpio = isbnManual.replaceAll("-", "").trim();

    if (!REGEX_ISBN_13.test(limpio)) {
      setErrorManual("Ingresá un ISBN válido de exactamente 13 dígitos.");
      return;
    }

    const existe = LIBROS.some((item) => item.isbn === limpio);
    if (!existe) {
      setErrorManual(
        `No encontramos ningún libro con el ISBN ${limpio} en el catálogo.`,
      );
      return;
    }

    setErrorManual(null);
    router.replace({
      pathname: "/libro/[isbn]",
      params: { isbn: limpio },
    });
  }

  function renderizarZonaCamara() {
    if (permiso.estado === "cargando") {
      return (
        <View style={styles.cajaEstado}>
          <EstadoPantalla
            tipo="cargando"
            titulo="Preparando cámara"
            descripcion="Verificando los permisos del dispositivo."
          />
        </View>
      );
    }

    if (permiso.estado === "concedido") {
      return (
        <View style={styles.zonaCamara}>
          <View style={styles.marcoCamara}>
            <CameraView
              style={styles.camara}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ["ean13"] }}
              onBarcodeScanned={manejarCodigoEscaneado}
            />
          </View>
          <Text style={styles.ayudaCamara}>
            Apuntá al código de barras EAN-13 de la contratapa del libro.
          </Text>
          {avisoEscaneo ? (
            <View style={styles.cajaAviso}>
              <Text style={styles.textoAviso}>{avisoEscaneo}</Text>
              <Boton
                titulo="Seguir escaneando"
                variante="secundario"
                onPress={reanudarEscaneo}
              />
            </View>
          ) : null}
        </View>
      );
    }

    if (permiso.estado === "preguntable") {
      return (
        <View style={styles.cajaPermiso}>
          <Text style={styles.tituloPermiso}>Cámara no habilitada</Text>
          <Text style={styles.textoPermiso}>
            Para escanear códigos de barras necesitamos acceso a la cámara.
            También podés escribir el ISBN debajo.
          </Text>
          <Boton
            titulo="Habilitar cámara"
            onPress={() =>
              router.push({
                pathname: "/permisos/[recurso]",
                params: { recurso: "camara" },
              })
            }
          />
        </View>
      );
    }

    return (
      <View style={styles.cajaPermiso}>
        <Text style={styles.tituloPermiso}>Permiso de cámara bloqueado</Text>
        <Text style={styles.textoPermiso}>
          Habilitá la cámara desde Ajustes del sistema para escanear, o usá el
          ingreso manual de ISBN.
        </Text>
        <Boton
          titulo="Abrir Ajustes"
          onPress={() => {
            void permiso.abrirAjustes();
          }}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.flex}
    >
      <ScrollView contentContainerStyle={styles.contenedor}>
        {renderizarZonaCamara()}

        <View style={styles.seccionManual}>
          <Text style={styles.tituloManual}>Ingresar ISBN a mano</Text>
          <Text style={styles.descripcionManual}>
            Escribí los 13 dígitos sin guiones que figuran en la contratapa.
          </Text>
          <TextInput
            value={isbnManual}
            onChangeText={(texto) => {
              setIsbnManual(texto);
              if (errorManual) {
                setErrorManual(null);
              }
            }}
            placeholder="Ej: 9789500426404"
            placeholderTextColor={COLORES.textoSecundario}
            keyboardType="number-pad"
            maxLength={17}
            accessibilityLabel="Ingresar número ISBN manualmente"
            style={styles.input}
          />
          {errorManual ? (
            <Text style={styles.textoError}>{errorManual}</Text>
          ) : null}
          <Boton
            titulo="Buscar libro por ISBN"
            variante="secundario"
            onPress={buscarPorIsbnManual}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  contenedor: {
    padding: ESPACIADO.md,
    gap: ESPACIADO.lg,
  },
  cajaEstado: {
    minHeight: 220,
    backgroundColor: COLORES.superficie,
    borderRadius: RADIO.lg,
    borderWidth: 1,
    borderColor: COLORES.borde,
  },
  zonaCamara: {
    gap: ESPACIADO.sm,
  },
  marcoCamara: {
    height: 280,
    borderRadius: RADIO.lg,
    overflow: "hidden",
    backgroundColor: COLORES.textoPrincipal,
  },
  camara: {
    flex: 1,
  },
  ayudaCamara: {
    fontSize: TIPOGRAFIA.pequeno,
    color: COLORES.textoSecundario,
    textAlign: "center",
  },
  cajaAviso: {
    backgroundColor: COLORES.avisoFondo,
    borderRadius: RADIO.md,
    padding: ESPACIADO.md,
    gap: ESPACIADO.sm,
  },
  textoAviso: {
    fontSize: TIPOGRAFIA.cuerpo,
    color: COLORES.avisoTexto,
    fontWeight: "600",
  },
  cajaPermiso: {
    backgroundColor: COLORES.superficie,
    borderRadius: RADIO.lg,
    borderWidth: 1,
    borderColor: COLORES.borde,
    padding: ESPACIADO.lg,
    gap: ESPACIADO.sm,
  },
  tituloPermiso: {
    fontSize: TIPOGRAFIA.subtitulo,
    fontWeight: "700",
    color: COLORES.textoPrincipal,
  },
  textoPermiso: {
    fontSize: TIPOGRAFIA.cuerpo,
    color: COLORES.textoSecundario,
    marginBottom: ESPACIADO.xs,
  },
  seccionManual: {
    backgroundColor: COLORES.superficie,
    borderRadius: RADIO.lg,
    borderWidth: 1,
    borderColor: COLORES.borde,
    padding: ESPACIADO.lg,
    gap: ESPACIADO.sm,
  },
  tituloManual: {
    fontSize: TIPOGRAFIA.subtitulo,
    fontWeight: "700",
    color: COLORES.textoPrincipal,
  },
  descripcionManual: {
    fontSize: TIPOGRAFIA.pequeno,
    color: COLORES.textoSecundario,
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
