import { Stack } from "expo-router";
import { BotonHeaderPersonal } from "../../../components/BotonHeaderPersonal";
import { COLORES } from "../../../constants/tema";

export const unstable_settings = {
  anchor: "index",
};

export default function LayoutCatalogo() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: COLORES.primario,
        headerStyle: { backgroundColor: COLORES.superficie },
        contentStyle: { backgroundColor: COLORES.fondo },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Biblioteca IPF",
          headerRight: () => <BotonHeaderPersonal />,
        }}
      />
      <Stack.Screen
        name="libro/[isbn]"
        options={{
          title: "Detalle del libro",
        }}
      />
    </Stack>
  );
}
