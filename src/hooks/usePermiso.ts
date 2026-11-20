import { useCameraPermissions } from "expo-camera";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useState } from "react";
import { AppState, Linking } from "react-native";
import { asegurarCanalAndroid } from "../lib/notificaciones";
import type { EstadoPermisoApp, RecursoPermiso } from "../types";

type ResultadoUsePermiso = {
  estado: EstadoPermisoApp;
  concedido: boolean;
  puedePreguntar: boolean;
  solicitar: () => Promise<boolean>;
  abrirAjustes: () => Promise<void>;
  recargar: () => Promise<void>;
};

export function usePermiso(recurso: RecursoPermiso): ResultadoUsePermiso {
  const [permisoCamara, pedirPermisoCamara, obtenerPermisoCamara] =
    useCameraPermissions();
  const [permisoNotif, setPermisoNotif] =
    useState<Notifications.NotificationPermissionsStatus | null>(null);

  const recargar = useCallback(async () => {
    if (recurso === "camara") {
      await obtenerPermisoCamara();
      return;
    }

    const actual = await Notifications.getPermissionsAsync();
    setPermisoNotif(actual);
  }, [recurso, obtenerPermisoCamara]);

  useEffect(() => {
    if (recurso !== "notificaciones") {
      return;
    }

    let activo = true;

    async function consultarInicial() {
      const actual = await Notifications.getPermissionsAsync();
      if (activo) {
        setPermisoNotif(actual);
      }
    }

    void consultarInicial();

    return () => {
      activo = false;
    };
  }, [recurso]);

  useEffect(() => {
    const suscripcion = AppState.addEventListener(
      "change",
      (siguienteEstado) => {
        if (siguienteEstado === "active") {
          void recargar();
        }
      },
    );

    return () => {
      suscripcion.remove();
    };
  }, [recargar]);

  const solicitar = useCallback(async (): Promise<boolean> => {
    if (recurso === "camara") {
      const respuesta = await pedirPermisoCamara();
      return respuesta.granted;
    }

    await asegurarCanalAndroid();
    const respuesta = await Notifications.requestPermissionsAsync();
    setPermisoNotif(respuesta);
    return respuesta.granted;
  }, [recurso, pedirPermisoCamara]);

  const abrirAjustes = useCallback(async () => {
    await Linking.openSettings();
  }, []);

  const permisoActual = recurso === "camara" ? permisoCamara : permisoNotif;

  let estado: EstadoPermisoApp = "cargando";
  if (permisoActual) {
    if (permisoActual.granted) {
      estado = "concedido";
    } else if (permisoActual.canAskAgain) {
      estado = "preguntable";
    } else {
      estado = "bloqueado";
    }
  }

  return {
    estado,
    concedido: estado === "concedido",
    puedePreguntar: estado === "preguntable",
    solicitar,
    abrirAjustes,
    recargar,
  };
}
