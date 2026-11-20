import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { COLORES } from "../../constants/tema";

export default function LayoutTabs() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORES.primario,
        tabBarInactiveTintColor: COLORES.textoSecundario,
        tabBarStyle: { backgroundColor: COLORES.superficie },
        headerTintColor: COLORES.primario,
        headerStyle: { backgroundColor: COLORES.superficie },
      }}
    >
      <Tabs.Screen
        name="(catalogo)"
        options={{
          title: "Catálogo",
          headerShown: false,
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? "library" : "library-outline"}
              size={size}
              color={focused ? COLORES.primario : COLORES.textoSecundario}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="reservas"
        options={{
          title: "Mis reservas",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? "bookmark" : "bookmark-outline"}
              size={size}
              color={focused ? COLORES.primario : COLORES.textoSecundario}
            />
          ),
        }}
      />
    </Tabs>
  );
}
