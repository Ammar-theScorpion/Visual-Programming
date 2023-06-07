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

export function checkBreakContinue(ast){
  for (let index = 0; index < ast.length; index++) {
    const element = ast[index];
        
      if (element['body']) {
        for (const statement of element.body) {
          if (statement.kind === "BreakStatement") {
            if(element.kind==='whileStatement'||element.kind==='forStatement')
                return true; 
            return false; 
          }
        }
      }else if(element.kind === "BreakStatement"){
        return false;
      }
    }
    return true; 
}

export function checkReturnFunction(ast) {
  
    for (let index = 0; index < ast.length; index++) {
      const element = ast[index];
          
        if (element['body']) {
          for (const statement of element.body) {
            if (statement.kind === "returnStatement") {
              if(element.kind==='functionStatement')
                  return true; 
              return false; 
            }
          }
        }else if(element.kind === "returnStatement"){
          return false;
        }
      }
      return true; 
}
