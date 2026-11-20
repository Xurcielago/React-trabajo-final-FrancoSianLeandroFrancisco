import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { EstadoPantalla } from "../../../components/EstadoPantalla";
import { TarjetaLibro } from "../../../components/TarjetaLibro";
import {
    AREA_TACTIL_MINIMA,
    COLORES,
    ESPACIADO,
    RADIO,
    TIPOGRAFIA,
} from "../../../constants/tema";
import { useBiblioteca } from "../../../context/BibliotecaContext";
import { useLibros } from "../../../hooks/useLibros";
import type { Libro } from "../../../types";

export default function PantallaCatalogo() {
  const { libros, cargando, error, reintentar } = useLibros();
  const {
    ultimosTresVistos,
    obtenerEjemplaresDisponibles,
    obtenerCantidadEnEspera,
  } = useBiblioteca();

  function abrirDetalle(isbn: string) {
    router.push({
      pathname: "/libro/[isbn]",
      params: { isbn },
    });
  }

  function renderizarCabecera() {
    return (
      <View style={styles.cabecera}>
        <View style={styles.accesosRapidos}>
          <Pressable
            onPress={() => router.push("/buscar")}
            accessibilityRole="button"
            accessibilityLabel="Abrir buscador de libros"
            style={({ pressed }) => [
              styles.botonAcceso,
              pressed && styles.presionado,
            ]}
          >
            <Ionicons
              name="search-outline"
              size={20}
              color={COLORES.primario}
            />
            <Text style={styles.textoAcceso}>Buscar</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/escanear")}
            accessibilityRole="button"
            accessibilityLabel="Abrir escáner de código de barras"
            style={({ pressed }) => [
              styles.botonAcceso,
              pressed && styles.presionado,
            ]}
          >
            <Ionicons
              name="barcode-outline"
              size={20}
              color={COLORES.primario}
            />
            <Text style={styles.textoAcceso}>Escanear</Text>
          </Pressable>
        </View>

        {ultimosTresVistos.length > 0 ? (
          <View style={styles.seccionRecientes}>
            <Text style={styles.tituloSeccion}>Vistos recientemente</Text>
            <View style={styles.listaChips}>
              {ultimosTresVistos.map((item) => (
                <Pressable
                  key={item.isbn}
                  onPress={() => abrirDetalle(item.isbn)}
                  accessibilityRole="button"
                  accessibilityLabel={`Volver a ver ${item.titulo}`}
                  style={({ pressed }) => [
                    styles.chipReciente,
                    pressed && styles.presionado,
                  ]}
                >
                  <Text style={styles.textoChip} numberOfLines={1}>
                    {item.titulo}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        <Text style={styles.tituloSeccion}>Catálogo completo</Text>
      </View>
    );
  }

  function renderizarLibro({ item }: { item: Libro }) {
    return (
      <TarjetaLibro
        libro={item}
        ejemplaresDisponibles={obtenerEjemplaresDisponibles(item.isbn)}
        cantidadEnEspera={obtenerCantidadEnEspera(item.isbn)}
        onPress={() => abrirDetalle(item.isbn)}
      />
    );
  }

  if (cargando) {
    return (
      <EstadoPantalla
        tipo="cargando"
        titulo="Cargando catálogo"
        descripcion="Consultando los ejemplares disponibles en la Biblioteca IPF."
      />
    );
  }

  if (error) {
    return (
      <EstadoPantalla
        tipo="error"
        titulo="No se pudo cargar el catálogo"
        descripcion={error}
        textoAccion="Reintentar"
        onAccion={reintentar}
      />
    );
  }

  return (
    <FlatList
      data={libros}
      keyExtractor={(item) => item.isbn}
      renderItem={renderizarLibro}
      ListHeaderComponent={renderizarCabecera}
      ListEmptyComponent={
        <EstadoPantalla
          tipo="vacio"
          titulo="El catálogo está vacío"
          descripcion="Por el momento no hay libros registrados para consultar."
          textoAccion="Actualizar"
          onAccion={reintentar}
        />
      }
      contentContainerStyle={styles.lista}
    />
  );
}

const styles = StyleSheet.create({
  lista: {
    padding: ESPACIADO.md,
    flexGrow: 1,
  },
  cabecera: {
    marginBottom: ESPACIADO.sm,
  },
  accesosRapidos: {
    flexDirection: "row",
    gap: ESPACIADO.sm,
    marginBottom: ESPACIADO.md,
  },
  botonAcceso: {
    flex: 1,
    minHeight: AREA_TACTIL_MINIMA,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: ESPACIADO.sm,
    backgroundColor: COLORES.superficie,
    borderRadius: RADIO.md,
    borderWidth: 1,
    borderColor: COLORES.primario,
    paddingHorizontal: ESPACIADO.md,
  },
  textoAcceso: {
    color: COLORES.primario,
    fontSize: TIPOGRAFIA.cuerpo,
    fontWeight: "600",
  },
  presionado: {
    opacity: 0.75,
  },
  seccionRecientes: {
    marginBottom: ESPACIADO.md,
  },
  tituloSeccion: {
    fontSize: TIPOGRAFIA.subtitulo,
    fontWeight: "700",
    color: COLORES.textoPrincipal,
    marginBottom: ESPACIADO.sm,
  },
  listaChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: ESPACIADO.sm,
  },
  chipReciente: {
    minHeight: AREA_TACTIL_MINIMA,
    justifyContent: "center",
    backgroundColor: COLORES.primario,
    borderRadius: RADIO.completo,
    paddingHorizontal: ESPACIADO.md,
    maxWidth: "100%",
  },
  textoChip: {
    color: COLORES.textoInvertido,
    fontSize: TIPOGRAFIA.pequeno,
    fontWeight: "600",
  },
});
