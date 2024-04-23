class Env {
  #outer;
  #data;

  constructor(outer) {
    this.#outer = outer;
    this.#data = new Map();
  }

  set(key, val) {
    this.#data.set(key, val);
  }

  find(key) {
    const val = this.#data.get(key) || this.#outer?.get(key);
    if (val === undefined) throw new Error(`${key} not found`);
    return val;
  }

  get(key) {
    return this.find(key);
  }
}

module.exports = { Env };
