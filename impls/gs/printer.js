const { MalType } = require("./types");

const pr_str = (malType, printReadably = false) => {
  if (malType instanceof Function) return "#<function>";
  return malType instanceof MalType
    ? malType.pr_str(printReadably)
    : malType.toString();
};

module.exports = { pr_str };
