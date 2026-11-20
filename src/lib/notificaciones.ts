import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const CANAL_PRESTAMOS = "prestamos";
const SEGUNDOS_RECORDATORIO_DEMO = 15;

export function configurarHandlerNotificaciones(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function asegurarCanalAndroid(): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(CANAL_PRESTAMOS, {
    name: "Recordatorios de préstamos",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
  });
}

export async function programarRecordatorioDevolucion(
  tituloLibro: string,
  isbn: string,
): Promise<string> {
  await asegurarCanalAndroid();

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Recordatorio de devolución",
      body: `No olvides devolver "${tituloLibro}" a la Biblioteca IPF.`,
      data: { isbn },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: SEGUNDOS_RECORDATORIO_DEMO,
      channelId: CANAL_PRESTAMOS,
    },
  });
}

export async function cancelarNotificacion(
  notificacionId: string | null,
): Promise<void> {
  if (!notificacionId) {
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(notificacionId);
}

export async function notificarEntregaDisponible(
  tituloLibro: string,
): Promise<boolean> {
  const permiso = await Notifications.getPermissionsAsync();

  if (!permiso.granted) {
    return false;
  }

  await asegurarCanalAndroid();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Tu libro está listo para retirar",
      body: `Ya podés pasar por el mostrador a retirar "${tituloLibro}".`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
      channelId: CANAL_PRESTAMOS,
    },
  });

  return true;
}
