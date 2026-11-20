import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Boton } from "../../../../components/Boton";
import { EstadoPantalla } from "../../../../components/EstadoPantalla";
import {
    COLORES,
    ESPACIADO,
    RADIO,
    TIPOGRAFIA,
} from "../../../../constants/tema";
import { useBiblioteca } from "../../../../context/BibliotecaContext";
import { LIBROS } from "../../../../data/libros";

const REGEX_ISBN_13 = /^\d{13}$/;

export default function PantallaDetalleLibro() {
  const { isbn } = useLocalSearchParams<{ isbn: string }>();
  const {
    registrarVisto,
    obtenerEjemplaresDisponibles,
    obtenerCantidadEnEspera,
    estaReservadoOPrestado,
  } = useBiblioteca();

  const isbnNormalizado = typeof isbn === "string" ? isbn.trim() : "";
  const formatoValido = REGEX_ISBN_13.test(isbnNormalizado);
  const libro = formatoValido
    ? LIBROS.find((item) => item.isbn === isbnNormalizado)
    : undefined;

  useEffect(() => {
    if (libro) {
      registrarVisto(libro);
    }
  }, [libro, registrarVisto]);

  if (!formatoValido || !libro) {
    return (
      <>
        <Stack.Screen options={{ title: "Libro no encontrado" }} />
        <EstadoPantalla
          tipo="error"
          titulo="No encontramos ese libro"
          descripcion={
            !formatoValido
              ? `El código "${isbnNormalizado || "vacío"}" no es un ISBN válido de 13 dígitos.`
              : `No existe ningún libro registrado con el ISBN ${isbnNormalizado}.`
          }
          textoAccion="Volver al catálogo"
          onAccion={() => router.replace("/")}
        />
      </>
    );
  }

  const disponibles = obtenerEjemplaresDisponibles(libro.isbn);
  const enEspera = obtenerCantidadEnEspera(libro.isbn);
  const yaLoTengo = estaReservadoOPrestado(libro.isbn);

  return (
    <>
      <Stack.Screen options={{ title: libro.titulo }} />
      <ScrollView contentContainerStyle={styles.contenedor}>
        <View style={styles.tarjeta}>
          <Text style={styles.titulo}>{libro.titulo}</Text>
          <Text style={styles.autor}>{libro.autor}</Text>

          <View style={styles.filaDato}>
            <Text style={styles.etiqueta}>Año de publicación</Text>
            <Text style={styles.valor}>{libro.anio}</Text>
          </View>

          <View style={styles.filaDato}>
            <Text style={styles.etiqueta}>ISBN</Text>
            <Text style={styles.valor}>{libro.isbn}</Text>
          </View>

          <View style={styles.filaDato}>
            <Text style={styles.etiqueta}>Ejemplares disponibles</Text>
            <Text style={styles.valor}>{disponibles}</Text>
          </View>

          <View style={styles.filaDato}>
            <Text style={styles.etiqueta}>Personas en lista de espera</Text>
            <Text style={styles.valor}>{enEspera}</Text>
          </View>
        </View>

        {yaLoTengo ? (
          <View style={styles.aviso}>
            <Text style={styles.textoAviso}>
              Ya tenés este libro en tus préstamos o en tu lista de espera.
            </Text>
          </View>
        ) : null}

        <Boton
          titulo={
            yaLoTengo
              ? "Ver en Mis reservas"
              : disponibles > 0
                ? "Reservar"
                : "Anotarme en lista de espera"
          }
          onPress={() => {
            if (yaLoTengo) {
              router.navigate("/reservas");
              return;
            }
            router.push({
              pathname: "/reservar/[isbn]",
              params: { isbn: libro.isbn },
            });
          }}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    padding: ESPACIADO.md,
    gap: ESPACIADO.md,
  },
  tarjeta: {
    backgroundColor: COLORES.superficie,
    borderRadius: RADIO.lg,
    borderWidth: 1,
    borderColor: COLORES.borde,
    padding: ESPACIADO.lg,
  },
  titulo: {
    fontSize: TIPOGRAFIA.tituloGrande,
    fontWeight: "700",
    color: COLORES.textoPrincipal,
    marginBottom: ESPACIADO.xs,
  },
  autor: {
    fontSize: TIPOGRAFIA.subtitulo,
    color: COLORES.textoSecundario,
    marginBottom: ESPACIADO.lg,
  },
  filaDato: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: ESPACIADO.sm,
    borderTopWidth: 1,
    borderTopColor: COLORES.borde,
  },
  etiqueta: {
    fontSize: TIPOGRAFIA.cuerpo,
    color: COLORES.textoSecundario,
  },
  valor: {
    fontSize: TIPOGRAFIA.cuerpo,
    fontWeight: "700",
    color: COLORES.textoPrincipal,
  },
  aviso: {
    backgroundColor: COLORES.avisoFondo,
    borderRadius: RADIO.md,
    padding: ESPACIADO.md,
  },
  textoAviso: {
    fontSize: TIPOGRAFIA.cuerpo,
    color: COLORES.avisoTexto,
    fontWeight: "600",
  },
});
