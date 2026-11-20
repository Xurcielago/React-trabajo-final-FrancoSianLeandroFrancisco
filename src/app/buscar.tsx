import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { EstadoPantalla } from "../components/EstadoPantalla";
import { TarjetaLibro } from "../components/TarjetaLibro";
import {
    AREA_TACTIL_MINIMA,
    COLORES,
    ESPACIADO,
    RADIO,
    TIPOGRAFIA,
} from "../constants/tema";
import { useBiblioteca } from "../context/BibliotecaContext";
import { buscarLibros } from "../lib/api";
import type { Libro } from "../types";

export default function PantallaBuscar() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const consulta = typeof q === "string" ? q : "";

  const [resultados, setResultados] = useState<Libro[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState<number>(0);

  const { obtenerEjemplaresDisponibles, obtenerCantidadEnEspera } =
    useBiblioteca();

  useEffect(() => {
    const textoLimpio = consulta.trim();

    if (textoLimpio.length === 0) {
      setResultados([]);
      setCargando(false);
      setError(null);
      return;
    }

    let cancelado = false;

    async function ejecutarBusqueda() {
      setCargando(true);
      setError(null);

      try {
        const datos = await buscarLibros(textoLimpio);
        if (!cancelado) {
          setResultados(datos);
        }
      } catch {
        if (!cancelado) {
          setError("No pudimos completar la búsqueda. Intentá nuevamente.");
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    void ejecutarBusqueda();

    return () => {
      cancelado = true;
    };
  }, [consulta, intento]);

  function actualizarConsulta(texto: string) {
    router.setParams({ q: texto });
  }

  function renderizarResultado({ item }: { item: Libro }) {
    return (
      <TarjetaLibro
        libro={item}
        ejemplaresDisponibles={obtenerEjemplaresDisponibles(item.isbn)}
        cantidadEnEspera={obtenerCantidadEnEspera(item.isbn)}
        onPress={() =>
          router.push({
            pathname: "/libro/[isbn]",
            params: { isbn: item.isbn },
          })
        }
      />
    );
  }

  return (
    <View style={styles.contenedor}>
      <View style={styles.barraBusqueda}>
        <Ionicons
          name="search-outline"
          size={20}
          color={COLORES.textoSecundario}
        />
        <TextInput
          value={consulta}
          onChangeText={actualizarConsulta}
          placeholder="Buscar por título o autor..."
          placeholderTextColor={COLORES.textoSecundario}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Buscar libros por título o autor"
          style={styles.campoTexto}
        />
        {consulta.length > 0 ? (
          <Pressable
            onPress={() => actualizarConsulta("")}
            accessibilityRole="button"
            accessibilityLabel="Limpiar búsqueda"
            style={styles.botonLimpiar}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={COLORES.textoSecundario}
            />
          </Pressable>
        ) : null}
      </View>

      {consulta.trim().length === 0 ? (
        <EstadoPantalla
          tipo="vacio"
          titulo="Buscá en el catálogo"
          descripcion="Escribí el título o el autor de un libro para ver resultados."
        />
      ) : cargando ? (
        <EstadoPantalla
          tipo="cargando"
          titulo="Buscando libros"
          descripcion={`Consultando coincidencias para "${consulta.trim()}".`}
        />
      ) : error ? (
        <EstadoPantalla
          tipo="error"
          titulo="Ocurrió un problema"
          descripcion={error}
          textoAccion="Reintentar"
          onAccion={() => setIntento((actual) => actual + 1)}
        />
      ) : (
        <FlatList
          data={resultados}
          keyExtractor={(item) => item.isbn}
          renderItem={renderizarResultado}
          ListHeaderComponent={
            resultados.length > 0 ? (
              <Text style={styles.contador}>
                {resultados.length} resultado
                {resultados.length === 1 ? "" : "s"} para &quot;
                {consulta.trim()}&quot;
              </Text>
            ) : undefined
          }
          ListEmptyComponent={
            <EstadoPantalla
              tipo="vacio"
              titulo="Sin coincidencias"
              descripcion={`No encontramos libros que coincidan con "${consulta.trim()}".`}
            />
          }
          contentContainerStyle={styles.lista}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    padding: ESPACIADO.md,
  },
  barraBusqueda: {
    minHeight: AREA_TACTIL_MINIMA,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORES.superficie,
    borderRadius: RADIO.md,
    borderWidth: 1,
    borderColor: COLORES.borde,
    paddingHorizontal: ESPACIADO.md,
    marginBottom: ESPACIADO.md,
    gap: ESPACIADO.sm,
  },
  campoTexto: {
    flex: 1,
    minHeight: AREA_TACTIL_MINIMA,
    fontSize: TIPOGRAFIA.cuerpo,
    color: COLORES.textoPrincipal,
  },
  botonLimpiar: {
    minWidth: AREA_TACTIL_MINIMA,
    minHeight: AREA_TACTIL_MINIMA,
    alignItems: "center",
    justifyContent: "center",
  },
  contador: {
    fontSize: TIPOGRAFIA.pequeno,
    color: COLORES.textoSecundario,
    marginBottom: ESPACIADO.sm,
  },
  lista: {
    flexGrow: 1,
  },
});
