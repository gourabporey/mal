const toString = (elem) =>
  elem instanceof MalType ? elem.pr_str() : elem.toString();

class MalType {
  constructor(value) {
    this.value = value;
  }

  pr_str() {
    return this.value;
  }
}

class MalList extends MalType {
  constructor(list) {
    super(list);
  }

  pr_str() {
    return "(" + this.value.map(toString).join(" ") + ")";
  }
}

class MalVector extends MalType {
  constructor(list) {
    super(list);
  }

  pr_str() {
    return "[" + this.value.map(toString).join(" ") + "]";
  }
}

class MalHashMap extends MalType {
  constructor(pairs) {
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
