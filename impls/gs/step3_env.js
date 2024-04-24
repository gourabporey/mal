const readline = require("node:readline");
const { stdin: input, stdout: output } = require("node:process");
const { read_str } = require("./reader");
const { pr_str } = require("./printer");
const {
  MalList,
  Symbol,
  MalVector,
  MalType,
  MalHashMap,
  MalNil,
} = require("./types");
const { Env } = require("./env");
const { chunk, sum, subtract, divide, multiply } = require("lodash");

const rl = readline.createInterface({ input, output });
const toValue = (e) => e.value;

const env = new Env();
env.set("+", (...args) => new MalType(sum(args.map(toValue))));
env.set("-", (...args) => new MalType(args.map(toValue).reduce(subtract)));
env.set("/", (...args) => new MalType(args.map(toValue).reduce(divide)));
env.set("*", (...args) => new MalType(args.map(toValue).reduce(multiply)));

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
  const lastExpression = ast.value[2] || new MalNil();
  const bindings = chunk(ast.value[1].value, 2);
  bindings.forEach(([key, val]) => env.set(key.value, EVAL(val, env).value));

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
