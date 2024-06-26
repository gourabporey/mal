const {
  Symbol,
  MalList,
  MalType,
  MalVector,
  MalHashMap,
  MalNil,
  MalString,
} = require("./types");

class Reader {
  #tokens;
  #position;

  constructor(tokens) {
    this.#position = 0;
    this.#tokens = tokens;
  }

  peek() {
    return this.#tokens[this.#position];
  }

  next() {
    const current = this.peek();
    this.#position++;
    return current;
  }
}

const tokenize = (input) => {
  const re =
    /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;

  return [...input.trim().matchAll(re)]
    .map((e) => e[1])
    .filter((e) => e !== "");
};

const regexes = {
  DIGIT: /^-?[0-9][0-9.]*$/,
};

const matchRegex = (regex, str) => new RegExp(regex).test(str);

const isDigit = (token) => matchRegex(regexes.DIGIT, token);
const isString = (token) => token.startsWith('"');

const createString = (token) => {
  if (token.endsWith('"'))
    return token
      .slice(1, -1)
      .replace(/\\(.)/g, (_, ch) => (ch === "n" ? "\n" : ch));
  throw new Error("unbalanced");
};

const read_atom = (reader) => {
  const atom = reader.next();

  switch (true) {
    case isDigit(atom):
      return new MalType(new Number(atom).valueOf());
    case atom === "true":
      return new MalType(true);
    case atom === "false":
      return new MalType(false);
    case atom === "nil":
      return new MalNil();
    case isString(atom):
      return new MalString(createString(atom));
    default:
      return new Symbol(atom);
  }
};

const read_seq = (reader, endingSymbol) => {
  const ast = [];

  reader.next();
  while (reader.peek() !== endingSymbol) {
    if (reader.peek() === undefined) throw new Error("unbalanced");
    ast.push(read_form(reader));
  }
  reader.next();

  return ast;
};

const read_list = (reader) => {
  return new MalList(read_seq(reader, ")"));
};

const read_vector = (reader) => {
  return new MalVector(read_seq(reader, "]"));
};

const partitionOfTwo = (list) => {
  return list.reduce((acc, elem, idx) => {
    if (idx % 2 === 0) {
      return [...acc, [elem, list[idx + 1]]];
    }
    return acc;
  }, []);
};

const read_hashmap = (reader) => {
  const keyVals = read_seq(reader, "}");
  if (keyVals.length % 2 === 1) throw new Error("Odd number of arguments");
  return new MalHashMap(partitionOfTwo(keyVals));
};

const read_form = (reader) => {
  const currToken = reader.peek();

  switch (currToken) {
    case "(":
      return read_list(reader);
    case ")":
      throw new Error("unbalanced");
    case "[":
      return read_vector(reader);
    case "]":
      throw new Error("unbalanced");
    case "{":
      return read_hashmap(reader);
    case "}":
      throw new Error("unbalanced");
    case "'":
      reader.next();
      return new MalList(["quote", read_form(reader)]);
    case "`":
      reader.next();
      return new MalList(["quasiquote", read_form(reader)]);
    case "~":
      reader.next();
      return new MalList(["unquote", read_form(reader)]);
    case "~@":
      reader.next();
      return new MalList(["splice-unquote", read_form(reader)]);
    case "@":
      reader.next();
      return new MalList(["deref", read_form(reader)]);
    default:
      return read_atom(reader);
  }
};

const read_str = (input) => {
  const tokens = tokenize(input);
  const reader = new Reader(tokens);
  return read_form(reader);
};

module.exports = { read_str };
