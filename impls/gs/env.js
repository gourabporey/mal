const { MalList } = require("./types");

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
        newEnv.set(bindings[i + 1], new MalList(exprs.slice(i)));
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
    return this.#data.has(key.value) ? this : this.#outer?.find(key);
  }

  get(key) {
    const env = this.find(key);
    if (env) return env.#data.get(key.value);
    throw new Error(`${key.value} not found`);
  }

  get data() {
    return this.#data;
  }
}

module.exports = { Env };
