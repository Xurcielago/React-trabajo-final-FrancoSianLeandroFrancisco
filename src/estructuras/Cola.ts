export class Cola<T> {
  #items: T[];
  #frente: number;

  constructor(iniciales: T[] = []) {
    this.#items = [...iniciales];
    this.#frente = 0;
  }

  encolar(elemento: T): void {
    this.#items.push(elemento);
  }

  desencolar(): T | undefined {
    if (this.tamanio === 0) {
      return undefined;
    }

    const elemento = this.#items[this.#frente];
    this.#frente += 1;

    // Compactación periódica para liberar memoria sin usar shift()
    if (this.#frente > 0 && this.#frente * 2 >= this.#items.length) {
      this.#items = this.#items.slice(this.#frente);
      this.#frente = 0;
    }

    return elemento;
  }

  frente(): T | undefined {
    if (this.tamanio === 0) {
      return undefined;
    }
    return this.#items[this.#frente];
  }

  get tamanio(): number {
    return this.#items.length - this.#frente;
  }

  estaVacia(): boolean {
    return this.tamanio === 0;
  }

  aArray(): T[] {
    return this.#items.slice(this.#frente);
  }

  clonar(): Cola<T> {
    return new Cola<T>(this.aArray());
  }
}
