const readline = require("node:readline");
const { stdin: input, stdout: output } = require("node:process");
const { read_str } = require("./reader");
const { pr_str } = require("./printer");
const { MalList, Symbol, MalVector, MalType, MalHashMap } = require("./types");
const { Env } = require("./env");
const { chunk } = require("lodash");

const rl = readline.createInterface({ input, output });

const env = new Env();
env.set("+", (a, b) => new MalType(a.value + b.value));
env.set("-", (a, b) => new MalType(a.value - b.value));
env.set("/", (a, b) => new MalType(a.value / b.value));
env.set("*", (a, b) => new MalType(a.value * b.value));

const READ = (str) => {
  const exp = read_str(str);
  return exp;
};

const handleDef = ([key, val]) => {
  const value = EVAL(val, env);
  env.set(key.value, value.value);
  return value;
};

const handleLet = (ast, env) => {
  const lastExpression = ast.value.at(-1);
  const bindings = ast.value.slice(1, -1);
  bindings
    .flatMap(({ value }) => chunk(value, 2))
    .forEach(([key, val]) => env.set(key.value, EVAL(val, env).value));

  return EVAL(lastExpression, env);
};

const eval_ast = (ast, env) => {
  if (ast instanceof Symbol) {
    const fn = env.get(ast.value) || ast.value;
    if (fn === undefined) throw new Error("No Value Found");
    return new MalType(fn);
  }

  if (ast instanceof MalList) {
    return new MalList(ast.value.map((e) => EVAL(e, env)));
  }

  if (ast instanceof MalVector) {
    return new MalVector(ast.value.map((e) => EVAL(e, env)));
  }

  if (ast instanceof MalHashMap) {
    return new MalHashMap(
      ast.value.map(([k, v]) => [EVAL(k, env), EVAL(v, env)])
    );
  }

  return ast;
};

const EVAL = (ast, env) => {
  if (!(ast instanceof MalList)) {
    return eval_ast(ast, env);
  }

  if (ast.value.length === 0) {
    return ast;
  }

  switch (ast.value[0].value) {
    case "def!":
      return handleDef(ast.value.slice(1, 3), env);
    case "let*":
      const newEnv = new Env(env);
      return handleLet(ast, newEnv);
    default:
      const [fn, ...args] = eval_ast(ast, env).value;
      return fn.value.apply(null, args);
  }
};

const PRINT = (ast) => pr_str(ast);

const rep = (str) => PRINT(EVAL(READ(str), env));

const repl = () => {
  rl.question("user> ", (input) => {
    try {
      console.log(rep(input));
    } catch (e) {
      console.log(e);
    }

    repl();
  });
};

repl();
