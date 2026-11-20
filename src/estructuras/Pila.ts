export class Pila<T> {
  #items: T[];

  constructor(iniciales: T[] = []) {
    this.#items = [...iniciales];
  }

  apilar(elemento: T): void {
    this.#items.push(elemento);
  }

  desapilar(): T | undefined {
    return this.#items.pop();
  }

  cima(): T | undefined {
    if (this.#items.length === 0) {
      return undefined;
    }
    return this.#items[this.#items.length - 1];
  }

  get tamanio(): number {
    return this.#items.length;
  }

  estaVacia(): boolean {
    return this.#items.length === 0;
  }

  aArray(): T[] {
    return [...this.#items];
  }

  clonar(): Pila<T> {
    return new Pila<T>(this.#items);
  }
}
