import { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Boton } from "../components/Boton";
import { EstadoPantalla } from "../components/EstadoPantalla";
import { COLORES, ESPACIADO, RADIO, TIPOGRAFIA } from "../constants/tema";
import { useBiblioteca } from "../context/BibliotecaContext";

export default function PantallaMostrador() {
  const { librosConEspera, entregarAlSiguiente, cerrarSesion } =
    useBiblioteca();
  const [mensajeEstado, setMensajeEstado] = useState<string | null>(null);

  async function manejarEntrega(isbn: string, titulo: string) {
    const resultado = await entregarAlSiguiente(isbn);

    if (!resultado.persona) {
      setMensajeEstado(`La lista de espera de "${titulo}" ya estaba vacía.`);
      return;
    }

    const canalAviso = resultado.notificadoPorSistema
      ? "Se envió una notificación al dispositivo."
      : "Si correspondía a tu cuenta, el aviso quedó disponible en Mis reservas.";

    setMensajeEstado(
      `Se entregó "${titulo}" a ${resultado.persona}. ${canalAviso}`,
    );
  }

  return (
    <View style={styles.contenedor}>
      {mensajeEstado ? (
        <View style={styles.bannerExito}>
          <Text style={styles.textoExito}>{mensajeEstado}</Text>
        </View>
      ) : null}

      <FlatList
        data={librosConEspera}
        keyExtractor={(item) => item.isbn}
        renderItem={({ item }) => (
          <View style={styles.tarjeta}>
            <Text style={styles.titulo}>{item.titulo}</Text>
            <Text style={styles.dato}>
              Siguiente en la fila:{" "}
              <Text style={styles.destacado}>{item.frente}</Text>
            </Text>
            <Text style={styles.dato}>Personas esperando: {item.cantidad}</Text>
            <View style={styles.accionTarjeta}>
              <Boton
                titulo="Entregar al siguiente"
                onPress={() => {
                  void manejarEntrega(item.isbn, item.titulo);
                }}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EstadoPantalla
            tipo="vacio"
            titulo="Sin listas de espera"
            descripcion="No hay libros con personas esperando para retirar en este momento."
          />
        }
        contentContainerStyle={styles.lista}
      />

      <View style={styles.pie}>
        <Boton
          titulo="Cerrar sesión"
          variante="peligro"
          onPress={cerrarSesion}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    padding: ESPACIADO.md,
  },
  bannerExito: {
    backgroundColor: COLORES.exitoFondo,
    borderRadius: RADIO.md,
    padding: ESPACIADO.md,
    marginBottom: ESPACIADO.md,
  },
  textoExito: {
    fontSize: TIPOGRAFIA.cuerpo,
    color: COLORES.exitoTexto,
    fontWeight: "600",
  },
  lista: {
    flexGrow: 1,
    gap: ESPACIADO.sm,
  },
  tarjeta: {
    backgroundColor: COLORES.superficie,
    borderRadius: RADIO.md,
    borderWidth: 1,
    borderColor: COLORES.borde,
    padding: ESPACIADO.md,
    marginBottom: ESPACIADO.sm,
    gap: ESPACIADO.xs,
  },
  titulo: {
    fontSize: TIPOGRAFIA.subtitulo,
    fontWeight: "700",
    color: COLORES.textoPrincipal,
  },
  dato: {
    fontSize: TIPOGRAFIA.cuerpo,
    color: COLORES.textoSecundario,
  },
  destacado: {
    fontWeight: "700",
    color: COLORES.textoPrincipal,
  },
  accionTarjeta: {
    marginTop: ESPACIADO.sm,
  },
  pie: {
    paddingTop: ESPACIADO.md,
    borderTopWidth: 1,
    borderTopColor: COLORES.borde,
  },
});
