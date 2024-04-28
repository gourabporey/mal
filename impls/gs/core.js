const _ = require("lodash");
const fs = require("fs");
const { MalList, MalType, MalNil, MalString } = require("./types");
const { pr_str } = require("./printer");
const { read_str } = require("./reader");

const toValue = (e) => e.value;

const reduceArgs = (fn, args) => new MalType(args.map(toValue).reduce(fn));

const partitionArray = (arr, chunkSize = 1, overlap = 1) => {
  const result = [];
  const step = chunkSize - overlap;
  for (let i = 0; i < arr.length - step; i += step) {
    result.push(arr.slice(i, i + chunkSize));
  }
  return result;
};

const sum = (...args) => new MalType(_.sum(args.map(toValue)));
const subtract = (...args) => reduceArgs(_.subtract, args);
const multiply = (...args) => reduceArgs(_.multiply, args);
const divide = (...args) => reduceArgs(_.divide, args);
const isGreaterThan = (...args) => reduceArgs((a, b) => a > b, args);
const isLesserThan = (...args) => reduceArgs((a, b) => a < b, args);
const and = (...args) => reduceArgs((a, b) => a && b, args);
const isLesserThanOrEqual = (...args) => reduceArgs((a, b) => a <= b, args);
const isGreaterThanOrEqual = (...args) => reduceArgs((a, b) => a >= b, args);
const list = (...args) => new MalList(args);
const isList = (x) => new MalType(x instanceof MalList);

const isEqual = (...args) => {
  if (args.length === 1) return new MalType(true);
  const argPairs = partitionArray(args, 2, 1);
  return new MalType(argPairs.every(([a, b]) => a.equals(b)));
};

const isEmpty = (x) => {
  if (x instanceof MalNil) return new MalType(true);
  return new MalType((x.value || []).length === 0);
};

const count = (list) => {
  if (list instanceof MalNil) return new MalType(0);
  return new MalType(list.count());
};

const str = (...args) => {
  return new MalString(
    args
      .map((arg) => (arg instanceof MalString ? arg.value : arg.pr_str()))
      .join("")
  );
};

const prn = (...args) => {
  console.log(...args.map((arg) => pr_str(arg, false)));
  return new MalNil();
};

const slurp = (f) => new MalString(fs.readFileSync(f.value, "utf8"));

const ns = {
  "+": sum,
  "-": subtract,
  "*": multiply,
  "/": divide,
  "=": isEqual,
  "<": isLesserThan,
  "<=": isLesserThanOrEqual,
  ">": isGreaterThan,
  "and": and,
  ">=": isGreaterThanOrEqual,
  "list": list,
  "list?": isList,
  "empty?": isEmpty,
  "count": count,
  "prn": prn,
  "str": str,
  "read-string": (v) => read_str(v.value),
  "slurp": slurp,
};

module.exports = ns;
