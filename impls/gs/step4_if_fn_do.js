const readline = require("node:readline");
const _ = require("lodash");
const { stdin: input, stdout: output } = require("node:process");
const { read_str } = require("./reader");
const { pr_str } = require("./printer");
const { MalList, Symbol, MalVector, MalHashMap, MalNil } = require("./types");
const { Env } = require("./env");
const ns = require("./core");

const rl = readline.createInterface({ input, output });

const env = new Env();
Object.entries(ns).forEach(([fn, exp]) => {
  env.set(new Symbol(fn), exp);
});

const READ = (str) => {
  const exp = read_str(str);
  return exp;
};

const handleDef = ([key, val]) => {
  const value = EVAL(val, env);
  env.set(key, value);
  return value;
};

const handleLet = (ast, env) => {
  const newEnv = new Env(env);
  const lastExpression = ast.value[2] || new MalNil();
  const bindings = _.chunk(ast.value[1].value, 2);
  bindings.forEach(([k, v]) => newEnv.set(k, EVAL(v, newEnv)));

  return EVAL(lastExpression, newEnv);
};

const handleIf = (ast, env) => {
  const [_, pred, then, el = new MalNil()] = ast.value;
  const result = EVAL(pred, env).value;
  const astToExecute = [false, null].includes(result) ? el : then;

  return EVAL(astToExecute, env);
};

const handleFn = (ast, env) => {
  return (...args) => {
    const [_, bindings, body] = ast.value;
    return EVAL(body, Env.new(env, bindings.value, args));
  };
};

const handleDo = (ast, env) => {
  return eval_ast(new MalList(ast.value.slice(1)), env).value.at(-1);
};

const eval_ast = (ast, env) => {
  if (ast instanceof Symbol) {
    return env.get(ast);
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
      return handleDef(ast.value.slice(1, 3));
    case "let*":
      return handleLet(ast, env);
    case "do":
      return handleDo(ast, env);
    case "if":
      return handleIf(ast, env);
    case "fn*":
      return handleFn(ast, env);
    default:
      const [fn, ...args] = eval_ast(ast, env).value;
      return fn.apply(null, args);
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

rep("(def! not (fn* (a) (if a false true)))");
repl();
