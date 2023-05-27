export function validateIfElseOrder(ast) {
    let ifStatementFound = false;
    let previousStatement = null;
  
    function traverseStatements(statements) {
      for (const statement of statements) {
        if (statement.kind === 'ifStatement') {
          ifStatementFound = true;
  
          if (previousStatement === 'else') {
            throw new Error('Invalid ordering: "if" statement should come before "else" clause.');
          }
  
          previousStatement = 'if';
  
          if (statement.body && statement.body.length > 0) {
            traverseStatements(statement.body);
          }
        } else if (statement.kind === 'else') {
          if (previousStatement !== 'if' && previousStatement !== 'else if') {
            throw new Error('Invalid ordering: "else" clause should follow "if" or "else if" statement.');
          }
  
          previousStatement = 'else';
  
          if (statement.body && statement.body.length > 0) {
            if (statement.body[0].kind === 'ifStatement') {
              traverseStatements(statement.body);
            } else if (statement.body[0].kind === 'else') {
              throw new Error('Invalid ordering: "else" clause should be followed by "if" statement.');
            }
          }
        }
      }
    }
  
    try {
      traverseStatements(ast);
  
      if (!ifStatementFound) {
        console.log('No "if" statement found in the code.');
      } else if (previousStatement !== 'if' && previousStatement !== null && previousStatement !== 'else') {
        throw new Error('Invalid ordering: "if" statement should not be followed by another statement.');
      } else {
        console.log('Valid ordering: All "if" and "else" statements are in correct order.');
      }
  
      return true;
    } catch (error) {
      console.error(error.message);
      return false;
    }
  }