const { sum, multiply, subtract, divide } = require("lodash");
const { MalList, MalType, MalVector, MalNil } = require("./types");

const toValue = (e) => e.value;

const executeFunction = (fn, args) => new MalType(args.map(toValue).reduce(fn));

function partitionArray(arr, chunkSize = 1, overlap = 1) {
  const result = [];
  const step = chunkSize - overlap;
  for (let i = 0; i < arr.length - step; i += step) {
    result.push(arr.slice(i, i + chunkSize));
  }
  return result;
}

const ns = {
  "+": (...args) => new MalType(sum(args.map(toValue))),
  "-": (...args) => executeFunction(subtract, args),
  "*": (...args) => executeFunction(multiply, args),
  "/": (...args) => executeFunction(divide, args),
  "=": (...args) => {
    if (args.length === 1) return new MalType(true);
    const argPairs = partitionArray(args, 2, 1);
    return new MalType(argPairs.every(([a, b]) => a.equals(b)));
  },
  "<": (...args) => executeFunction((a, b) => a < b, args),
  "<=": (...args) => executeFunction((a, b) => a <= b, args),
  ">": (...args) => executeFunction((a, b) => a > b, args),
  "and": (...args) => executeFunction((a, b) => a && b, args),
  ">=": (...args) => executeFunction((a, b) => a >= b, args),
  "list": (...args) => new MalList(args),
  "list?": (x) => new MalType(x instanceof MalList),
  "empty?": (x) => {
    if (x instanceof MalNil) return new MalType(true);
    return new MalType((x.value || []).length === 0);
  },
  "count": (list) => {
    if (list instanceof MalNil) return new MalType(0);
    return new MalType((list.value || []).length);
  },
  // "not": (x) => new MalType(!x.value),
};

module.exports = ns;
