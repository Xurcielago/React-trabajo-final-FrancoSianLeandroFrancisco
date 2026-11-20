import { Stack } from "expo-router";
import { useEffect } from "react";
import { COLORES } from "../constants/tema";
import {
  BibliotecaProvider,
  useBiblioteca,
} from "../context/BibliotecaContext";
import { configurarHandlerNotificaciones } from "../lib/notificaciones";

export const unstable_settings = {
  anchor: "(tabs)",
};

function StackRaiz() {
  const { sesionActiva } = useBiblioteca();

  useEffect(() => {
    configurarHandlerNotificaciones();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerTintColor: COLORES.primario,
        headerStyle: { backgroundColor: COLORES.superficie },
        contentStyle: { backgroundColor: COLORES.fondo },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="buscar" options={{ title: "Buscar libros" }} />
      <Stack.Screen name="escanear" options={{ title: "Escanear código" }} />
      <Stack.Screen
        name="reservar/[isbn]"
        options={{
          title: "Confirmar reserva",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="permisos/[recurso]"
        options={{
          title: "Permiso necesario",
          presentation: "modal",
        }}
      />
      <Stack.Protected guard={!sesionActiva}>
        <Stack.Screen
          name="login"
          options={{
            title: "Acceso del personal",
            presentation: "modal",
          }}
        />
      </Stack.Protected>
      <Stack.Protected guard={sesionActiva}>
        <Stack.Screen
          name="mostrador"
          options={{
            title: "Mostrador de biblioteca",
          }}
        />
      </Stack.Protected>
      <Stack.Screen name="reserva" options={{ headerShown: false }} />
      <Stack.Screen
        name="+not-found"
        options={{ title: "Página no encontrada" }}
      />
    </Stack>
  );
}

export default function LayoutRaiz() {
  return (
    <BibliotecaProvider>
      <StackRaiz />
    </BibliotecaProvider>
  );
}
