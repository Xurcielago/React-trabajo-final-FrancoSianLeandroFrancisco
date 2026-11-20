import { router, usePathname } from "expo-router";
import { EstadoPantalla } from "../components/EstadoPantalla";

export default function PantallaNoEncontrada() {
  const rutaInexistente = usePathname();

  return (
    <EstadoPantalla
      tipo="error"
      titulo="Página no encontrada (404)"
      descripcion={`La dirección "${rutaInexistente}" no existe en Biblioteca IPF.`}
      textoAccion="Volver al catálogo"
      onAccion={() => router.replace("/")}
    />
  );
}
