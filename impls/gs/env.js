const { MalList, MalType } = require("./types");

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
      const b = bindings[i];
      if (b.value === "&" && bindings[i + 1]) {
        const rest = exprs.slice(i);
        newEnv.set(bindings[i + 1], new MalList(rest));
        break;
      }
      newEnv.set(b, exprs[i]);
    }

    return newEnv;
  }

  set(key, val) {
    this.#data.set(key.value, val);
  }

  find(key) {
    const val = this.#data.has(key.value)
      ? this.#data.get(key.value)
      : this.#outer?.find(key);
    if (val === undefined) throw new Error(`${key.value} not found`);
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
