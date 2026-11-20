import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Boton } from "../../components/Boton";
import { EstadoPantalla } from "../../components/EstadoPantalla";
import { COLORES, ESPACIADO, RADIO, TIPOGRAFIA } from "../../constants/tema";
import { useBiblioteca } from "../../context/BibliotecaContext";
import { usePermiso } from "../../hooks/usePermiso";
import type { RecursoPermiso } from "../../types";

const TEXTOS_RECURSO: Record<
  RecursoPermiso,
  {
    titulo: string;
    beneficio: string;
    icono: "camera-outline" | "notifications-outline";
  }
> = {
  camara: {
    titulo: "Permiso de cámara",
    beneficio:
      "Usamos tu cámara para leer el código de barras de los libros y abrir su ficha al instante.",
    icono: "camera-outline",
  },
  notificaciones: {
    titulo: "Permiso de notificaciones",
    beneficio:
      "Usamos las notificaciones para recordarte cuándo devolver un libro y avisarte cuando tu reserva esté lista.",
    icono: "notifications-outline",
  },
};

export default function PantallaPermisoPrevio() {
  const { recurso, isbn } = useLocalSearchParams<{
    recurso: string;
    isbn?: string;
  }>();

  const esRecursoValido = recurso === "camara" || recurso === "notificaciones";
  const recursoNormalizado: RecursoPermiso =
    recurso === "notificaciones" ? "notificaciones" : "camara";

  const permiso = usePermiso(recursoNormalizado);
  const { alternarRecordatorio } = useBiblioteca();
  const resueltoRef = useRef(false);

  useEffect(() => {
    if (!esRecursoValido || !permiso.concedido || resueltoRef.current) {
      return;
    }

    resueltoRef.current = true;

    if (
      recursoNormalizado === "notificaciones" &&
      typeof isbn === "string" &&
      isbn.length > 0
    ) {
      void alternarRecordatorio(isbn, true).finally(() => {
        router.back();
      });
      return;
    }

    router.back();
  }, [
    esRecursoValido,
    permiso.concedido,
    recursoNormalizado,
    isbn,
    alternarRecordatorio,
  ]);

  if (!esRecursoValido) {
    return (
      <EstadoPantalla
        tipo="error"
        titulo="Permiso no reconocido"
        descripcion="El recurso solicitado no corresponde a ningún permiso de la aplicación."
        textoAccion="Volver"
        onAccion={() => router.back()}
      />
    );
  }

  if (permiso.estado === "cargando") {
    return (
      <EstadoPantalla
        tipo="cargando"
        titulo="Verificando permiso"
        descripcion="Consultando el estado actual en tu dispositivo."
      />
    );
  }

  const info = TEXTOS_RECURSO[recursoNormalizado];
  const estaBloqueado = !permiso.puedePreguntar;

  async function manejarAccionUnica() {
    if (estaBloqueado) {
      await permiso.abrirAjustes();
      return;
    }

    const otorgado = await permiso.solicitar();
    if (!otorgado && !resueltoRef.current) {
      resueltoRef.current = true;
      router.back();
    }
  }

  return (
    <View style={styles.contenedor}>
      <View style={styles.tarjeta}>
        <View style={styles.circuloIcono}>
          <Ionicons name={info.icono} size={40} color={COLORES.primario} />
        </View>
        <Text style={styles.titulo}>{info.titulo}</Text>
        <Text style={styles.beneficio}>{info.beneficio}</Text>

        {estaBloqueado ? (
          <Text style={styles.notaBloqueo}>
            El permiso fue bloqueado en el sistema. Podés habilitarlo desde
            Ajustes o cerrar esta ventana para continuar sin él.
          </Text>
        ) : null}

        <View style={styles.accion}>
          <Boton
            titulo={estaBloqueado ? "Abrir Ajustes" : "Continuar"}
            onPress={() => {
              void manejarAccionUnica();
            }}
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
    alignItems: "center",
  },
  circuloIcono: {
    width: 76,
    height: 76,
    borderRadius: RADIO.completo,
    backgroundColor: COLORES.fondo,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: ESPACIADO.md,
  },
  titulo: {
    fontSize: TIPOGRAFIA.titulo,
    fontWeight: "700",
    color: COLORES.textoPrincipal,
    textAlign: "center",
    marginBottom: ESPACIADO.sm,
  },
  beneficio: {
    fontSize: TIPOGRAFIA.cuerpo,
    color: COLORES.textoSecundario,
    textAlign: "center",
    marginBottom: ESPACIADO.md,
  },
  notaBloqueo: {
    fontSize: TIPOGRAFIA.pequeno,
    color: COLORES.avisoTexto,
    backgroundColor: COLORES.avisoFondo,
    borderRadius: RADIO.sm,
    padding: ESPACIADO.sm,
    textAlign: "center",
    marginBottom: ESPACIADO.md,
  },
  accion: {
    width: "100%",
  },
});
