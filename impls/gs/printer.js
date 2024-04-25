const { MalType } = require("./types");

const pr_str = (malType) => {
  if (malType instanceof Function) return "#<function>";
  return malType instanceof MalType ? malType.pr_str() : malType.toString();
};

module.exports = { pr_str };
