import type { Libro } from "../types";

export const USUARIO_ACTUAL = "Estudiante IPF";

export const CREDENCIALES_PERSONAL = {
  usuario: "bibliotecario",
  clave: "ipf2026",
} as const;

export const LIBROS: Libro[] = [
  {
    isbn: "9789500426404",
    titulo: "Ficciones",
    autor: "Jorge Luis Borges",
    anio: 1944,
    ejemplares: 3,
  },
  {
    isbn: "9789875666474",
    titulo: "El Aleph",
    autor: "Jorge Luis Borges",
    anio: 1949,
    ejemplares: 2,
  },
  {
    isbn: "9788437604947",
    titulo: "Quentin Durward",
    autor: "Sir Walter Scott",
    anio: 1823,
    ejemplares: 0,
  },
  {
    isbn: "9788420471839",
    titulo: "Cien años de soledad",
    autor: "Gabriel García Márquez",
    anio: 1967,
    ejemplares: 0,
  },
  {
    isbn: "9789505153183",
    titulo: "Rayuela",
    autor: "Julio Cortázar",
    anio: 1963,
    ejemplares: 0,
  },
  {
    isbn: "9780132350884",
    titulo: "Clean Code",
    autor: "Robert C. Martin",
    anio: 2008,
    ejemplares: 4,
  },
  {
    isbn: "9780135957059",
    titulo: "The Pragmatic Programmer",
    autor: "Andrew Hunt y David Thomas",
    anio: 2019,
    ejemplares: 2,
  },
  {
    isbn: "9780201633610",
    titulo: "Design Patterns",
    autor: "Erich Gamma et al.",
    anio: 1994,
    ejemplares: 1,
  },
  {
    isbn: "9781449373320",
    titulo: "Designing Data-Intensive Applications",
    autor: "Martin Kleppmann",
    anio: 2017,
    ejemplares: 2,
  },
  {
    isbn: "9780262033848",
    titulo: "Introduction to Algorithms",
    autor: "Thomas H. Cormen",
    anio: 2009,
    ejemplares: 3,
  },
  {
    isbn: "9788498387087",
    titulo: "El túnel",
    autor: "Ernesto Sabato",
    anio: 1948,
    ejemplares: 2,
  },
  {
    isbn: "9789500738637",
    titulo: "Sobre héroes y tumbas",
    autor: "Ernesto Sabato",
    anio: 1961,
    ejemplares: 1,
  },
  {
    isbn: "9788497592208",
    titulo: "La casa de los espíritus",
    autor: "Isabel Allende",
    anio: 1982,
    ejemplares: 3,
  },
  {
    isbn: "9788420674209",
    titulo: "Crónica de una muerte anunciada",
    autor: "Gabriel García Márquez",
    anio: 1981,
    ejemplares: 2,
  },
  {
    isbn: "9789507314384",
    titulo: "Los siete locos",
    autor: "Roberto Arlt",
    anio: 1929,
    ejemplares: 1,
  },
];

// Listas de espera iniciales para libros sin ejemplares disponibles (A2)
export const LISTAS_ESPERA_INICIALES: Record<string, string[]> = {
  "9788437604947": ["María Gómez", "Carlos Benítez"],
  "9788420471839": ["Lucía Fernández"],
};
