export function checkIfElseOrder(ast) {
  if(ast===undefined)return true;
  let foundIf = false;

  for (let i = 0; i < ast.length; i++) {
    if (ast[i].kind === 'ifStatement') {
      if (!checkIfElseOrder(ast[i].body)) {
        return false;
      }
      foundIf = true;
    } else if (ast[i].kind === 'else') {
      if (!foundIf) {
        return false;
      }
      foundIf = false;
    }
  }

  return true;
}
