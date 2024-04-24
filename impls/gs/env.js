class Env {
  #outer;
  #data;

  constructor(outer, bindings = [], exprs = []) {
    this.#outer = outer;
    this.#data = new Map();
    this.#bindArgs(bindings, exprs);
  }

  #bindArgs(bindings, exprs) {
    bindings.forEach((b, i) => {
      this.set(b.value, exprs[i]);
    });
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

  get data() {
    return this.#data;
  }
}

module.exports = { Env };
