const readline = require("node:readline");
const _ = require("lodash");
const { stdin: input, stdout: output } = require("node:process");
const { read_str } = require("./reader");
const { pr_str } = require("./printer");
const {
  MalList,
  Symbol,
  MalVector,
  MalHashMap,
  MalNil,
  MalFunc,
} = require("./types");
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

  return { ast: lastExpression, env: newEnv };
};

const handleIf = (ast, env) => {
  const [_, pred, then, el = new MalNil()] = ast.value;
  const result = EVAL(pred, env).value;
  const astToExecute = [false, null].includes(result) ? el : then;

  return astToExecute;
};

const handleFn = (ast, env) => {
  return new MalFunc(ast.value[2], ast.value[1], env);
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
  while (true) {
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
        const newState = handleLet(ast, env);
        ast = newState.ast;
        env = newState.env;
        break;
      case "do":
        ast.value.slice(1).forEach((form) => EVAL(form, env));
        ast = ast.value.at(-1);
        break;
      case "if":
        ast = handleIf(ast, env);
        break;
      case "fn*":
        return handleFn(ast, env);
      default:
        const [fn, ...args] = eval_ast(ast, env).value;

        if (fn instanceof MalFunc) {
          ast = fn.body;
          env = Env.new(fn.env, fn.params.value, args);
          break;
        }

        if (fn instanceof Function) {
          return fn.apply(null, args);
        }

        throw new Error(`${fn} is not a Function`);
    }
  }
};

const PRINT = (ast) => pr_str(ast, true);

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
