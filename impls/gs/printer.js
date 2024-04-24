const { MalType, MalFn } = require("./types");

const pr_str = (malType) => {
  return malType instanceof MalType ? malType.pr_str() : malType.toString();
};

module.exports = { pr_str };
