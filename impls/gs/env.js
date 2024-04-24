class Env {
  #outer;
  #data;

  constructor(outer) {
    this.#outer = outer;
    this.#data = new Map();
  }

  static new(outer, bindings = [], exprs = []) {
    const newEnv = new Env(outer);

    for (let i = 0; i < bindings.length; i++) {
      const b = bindings[i].value;
      if (b === "&" && bindings[i + 1]) {
        newEnv.set(bindings[i + 1].value, exprs.slice(i));
        break;
      }
      newEnv.set(b, exprs[i]);
    }

    return newEnv;
  }

  set(key, val) {
    this.#data.set(key, val);
  }

  find(key) {
    const val = this.#data.has(key)
      ? this.#data.get(key)
      : this.#outer?.get(key);
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
