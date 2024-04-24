const toString = (elem) =>
  elem instanceof MalType ? elem.pr_str() : elem.toString();

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
}

class MalList extends MalSeq {
  constructor(list) {
    super(list);
  }

  pr_str() {
    return "(" + this.value.map(toString).join(" ") + ")";
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
}

class MalString extends MalType {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return '"' + this.value + '"';
  }
}

class Symbol extends MalType {
  constructor(value) {
    super(value);
  }
}

class MalFn extends MalType {
  constructor(value) {
    super(value);
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
  MalFn,
};
