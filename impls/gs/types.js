const toString = (elem) =>
  elem instanceof MalType ? elem.pr_str() : elem.toString();

const pr_str = (val, printReadably = false) => {
  if (val instanceof Function) return "#<function>";
  return val instanceof MalType ? val.pr_str(printReadably) : val.toString();
};

class MalType {
  constructor(value) {
    this.value = value;
  }

  pr_str() {
    return this.value;
  }

  equals(other) {
    return this.value === other.value;
  }
}

class MalSeq extends MalType {
  constructor(list) {
    super(list);
  }

  equals(other) {
    if (!(other instanceof MalSeq)) return false;
    if (this.value.length !== other.value.length) return false;
    return this.value.every((val, i) => val.equals(other.value[i]));
  }

  count() {
    return this.value.length;
  }
}

class MalList extends MalSeq {
  constructor(list) {
    super(list);
  }

  pr_str() {
    return "(" + this.value.map((v) => pr_str(v)).join(" ") + ")";
  }
}

class MalVector extends MalSeq {
  constructor(list) {
    super(list);
  }

  pr_str() {
    return "[" + this.value.map(toString).join(" ") + "]";
  }
}

class MalHashMap extends MalSeq {
  constructor(pairs = []) {
    super(pairs);
  }

  pr_str() {
    return (
      "{" + this.value.map((keyVal) => keyVal.map(toString).join(" ")) + "}"
    );
  }
}

class MalNil extends MalType {
  constructor() {
    super(null);
  }

  pr_str() {
    return "nil";
  }

  count() {
    return 0;
  }
}

class MalString extends MalType {
  constructor(value) {
    super(value);
  }

  pr_str(printReadably = false) {
    if (printReadably) {
      return (
        '"' +
        this.value
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"')
          .replace(/\n/g, "\\n") +
        '"'
      );
    }

    return '"' + this.value + '"';
  }

  count() {
    return this.value.length;
  }
}

class Symbol extends MalType {
  constructor(value) {
    super(value);
  }
}

class MalFunc extends MalType {
  constructor(body, params, env) {
    super();
    this.body = body;
    this.params = params;
    this.env = env;
  }

  pr_str() {
    return "#<function>";
  }
}

module.exports = {
  Symbol,
  MalType,
  MalList,
  MalVector,
  MalHashMap,
  MalNil,
  MalString,
  MalFunc,
  pr_str,
};
