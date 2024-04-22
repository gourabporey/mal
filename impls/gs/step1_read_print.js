const readline = require("node:readline");
const { stdin: input, stdout: output } = require("node:process");
const { read_str } = require("./reader");
const { pr_str } = require("./printer");

const rl = readline.createInterface({ input, output });

const READ = (str) => read_str(str);
const EVAL = (ast) => ast;
const PRINT = (ast) => pr_str(ast);

const rep = (str) => PRINT(EVAL(READ(str)));

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
