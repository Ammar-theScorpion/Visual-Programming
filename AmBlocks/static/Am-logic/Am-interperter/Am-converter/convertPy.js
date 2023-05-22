// covert the string from the parser to different PG

export class ConverterPy{
    constructor(){
        this.ast='';
    }
    clear(){
    }
    moveNode(array){
      const prev = array.shift();
      return prev;
    }
    canMove(array){
        return array.kind != ''
    }
    covertString(){ // main entry
      let codepy = [];
      while(this.canMove(this.ast[0])){
        codepy.push(this.generateCode(this.moveNode(this.ast), -1)+'\n');
      }return codepy.join('')
  }
    generatePrintStatement(printNode){
      const printValue = printNode.printValue//.replace(',','<<');
      let print = 'print(';
      let printThings = [];
      for (let index = 0; index < printValue.length; index++) {
        const element = printValue[index];
        printThings.push(this.generateCode(element));
        
      } 
      return print+printThings.join(' , ')+')';

    }
    generateBinaryExpression(ExpressionNode){
        return(ExpressionNode.left.value+ ' '+ ExpressionNode.operater + ' '+ ExpressionNode.right.value);
    }

    generateBody(node, level, type, cond=true){
      const condition = node.condition;
      let conditionValue = 'False';
      if (condition !== undefined && conditionValue.toLowerCase() != condition) {
        conditionValue = this.getExpressionString(condition);
      }
      const body = !node.body?undefined: [...node.body];
      let bodyValue = '\t'+'pass';

      if (body) {
        bodyValue = '';
        while (body.length) {
          bodyValue += '\t'+this.generateCode(body.shift(), level + 1);
        }
      }
      const indentation = level>=0?'\t'.repeat(level):"";
      return `${indentation}${type} ${conditionValue}:\n${'\t'.repeat(level+1)}${bodyValue}`;
    }

    analysOperations(ope){
      const [methodName, argsStr] = ope.split(":");
      const args = argsStr ? argsStr.split(",") : [];
    
      // Map the method name to the corresponding Python code
      switch (methodName) {
        case "up":
          return `${args[0]}.upper()`;
        case "low":
          return `${args[0]}.lower()`;
        case "cat":
          return `${args[0]} + ${args[1]}`;
        case "cnt":
          return `${args[0]}.count('${args[1]}')`;
        case "spt":
          return `${args[0]}.split('${args[1]}')`;
        case "idx":
          return `${args[0]}.index('${args[1]}')`;
        // Handle the special case of [:::] separator
        case "replace":
          if (args[1] === "[:::]") {
            return `${args[0]}.replace('${args[1]}', ':')`;
          } else {
            return `${args[0]}.replace('${args[1]}', '${args[2]}')`;
          }
        case "slc":
          if (args.length === 1) {
            return `${args[0]}[:]`;
          } 
          else if (args.length === 2) {
            return `${args[0]}[${args[1]}:]`;
          } else if (args.length === 3) {
            return `${args[0]}[${args[1]}:${args[2]}]`;
          } else if (args.length === 4) {
            return `${args[0]}[${args[1]}:${args[2]}:${args[3]}]`;
          } else {
            throw new Error(`Invalid number of arguments for slice operation`);
          }
      }return methodName == 'NULL'?'None':methodName;

    }

    generateCode(node, level) {
        switch (node.kind) {
          case 'ifStatement':
            return this.generateIfStatement(node, level);
          case 'whileStatement':
            return this.generateReapetStatement(node, level);
          case 'forStatement':
            return this.generateForStatement(node, level);
          case 'else':
            return this.generateElseStatement(node, level);
          case 'printStatement':
            return this.generatePrintStatement(node, level);
          case 'BinaryExpression':
            return this.generateBinaryExpression(node, level);
          case 'declarationStatements':
            return this.generateDeclarationStatements(node, level);
          case 'assignmentStatement':
            return this.generateassignmentStatement(node, level);
          case 'functionStatement':
            return this.generateFunctionStatement(node, level);
          case 'CallStatement':
              return this.generateCallStatement(node, level);
          case 'eachStatement':
              return this.generateEachStatement(node, level);
          case 'createListStatement':
              return this.generateListStatement(node, level);
          case 'mathStatement':
              return this.generateMathStatement(node, level);
          case 'opListStatement':
              return this.generateOpListStatement(node, level);
              case 'multiBinary':
                return this.getExpressionString(node, level);
          default:
            return typeof(node.error)=='string'?node.error:(node.value !== undefined? node.value : node);
         }
      }
      generateMathStatement(node, level){
        let op = node.op;
        switch(op){
          case 'ln':
            op = 'log'; break;
          case 'log':
            op = 'log10'; break;
          case 'e^':
            op = 'exp'; break;
          case '10^':
            op = 'pow'; break;
        }
        return `${op}(${this.generateCode(node.on)})`
      }
      getExpressionString(expression) {
        let expressionStr = '';
        traverseExpression(expression);
      
        function traverseExpression(node) {
          if (node.kind === 'BinaryExpression') {
            expressionStr += '(';
            traverseExpression(node.left);
            expressionStr += node.operater + ' ';
            traverseExpression(node.right);
            expressionStr += ') ';
          } else {
            expressionStr += node.value + ' ';
          }
        }
      
        return '(' + expressionStr.trim() + ')';
      }
      generateOpListStatement(node, level){
        const listName = node.listName;
        const body = !node.body?undefined: [...node.body];
        let bodyValue ='';
        for (let index = 0; index < body.length; index++) {
          const element = body[index];
          bodyValue+=this.generateCode(element);
        }
        const operation = node.ops;
        switch (operation) {
          case 'initialize':
            return `${listName} = [${body}]`;
          case 'append':
            return `${listName}.append(${bodyValue})`;
          case 'insert':
            return ` ${listName}.[${body[1]}] = ${body[0]}`;
          case 'pop':
            return `${listName}.pop()`;
          case 'clear':
            return `${listName}.clear()`;
          case 'delete':
            return `${listName}.remove(${bodyValue})`;
          case 'isempty':
            return `len(${listName})==0`;
          case 'length':
            return `len(${listName})`;
          case 'find':
            return `${bodyValue} in ${listName}`;
        }
      }
      generateListStatement(node, level){
        let env = node.env;
        let look = env.lookUp(node.listName);
        let equalto = '';
        if(look != null || look!=undefined){
           if(look[1])
            equalto = look[1]
        }
          return `${node.listName} = [${equalto}]\n`;
      }
      generateEachStatement(node, level){
        const body = !node.body?undefined: [...node.body];
        let bodyValue = '';
        if (body) {
          while (body.length) {
            bodyValue += this.generateCode(body.shift(), level + 1);
          }
        }
        return `for ${node.varname} in ${node.varname_over}:\n\t${bodyValue} \n`;
      }
      generateCallStatement(node, level){
        return `${node.function_name}(${node.argsv})\n`;
      }
      generateFunctionStatement(node, level){
        const body = node.body;
        let bodyValue = 'pass';
        if (body) {
        bodyValue = '';
          while (body.length) {
            bodyValue += this.generateCode(body.shift(), level + 1)+'\n\t';
          }
        }
        let args = '';
        const paramenters = node.params;
        let params = [];
        for (let dict of paramenters) {
          for (let key in dict) {
              params.push(`${dict[key]} ${key}`);
            }
          }
        args+= params.join(', ');
        return `def ${node.name} (${args}):\n\t ${bodyValue} \n`;
      }
      generateassignmentStatement(node, level){
        return node.left.value + ' = '+ this.analysOperations(node.right.value)+'\n';
      }
      generateDeclarationStatements(node, level){
        let env = node.env;
        let look = env.lookUp(node.varname);
        return node.varname + `= ${this.analysOperations(node.varBody[1])}`+ ';\n';
      }
    generateIfStatement(ifNode, level) {
        return this.generateBody(ifNode, level, 'if');
    }
    generateForStatement(body, level){
      const indexes = body.indexes;
      let from = [];
      let to = [];
      
        for (let key in indexes) {
          const index = indexes[key];
          from.push(`${key}`);
          to.push(`range(${index[0]}, ${index[1]}, ${index[2]})`);
      }

      let co = to.length>1? 'zip(' : '';
      let for_ = `for ${from.join(', ')} in${co} ${to.join(', ')}${co!==''?')':''}`;
      let bodyValue = '\t'+'pass';
      let body_=body.body;
      if(body_){
        bodyValue = '';
        while (body_.length) {
          bodyValue += '\t'+this.generateCode(body_.shift(), level + 1);
        }
      }
      const indentation = level>=0?'\t'.repeat(level):"";
      return `${indentation}${for_}:\n${'\t'.repeat(level+1)}${bodyValue}`;
   } 
    generateReapetStatement(reNode, level){
      return this.generateBody(reNode, level, 'while');
    }
    generateElseStatement(elseNode, level){
      return this.generateBody(elseNode, level, 'else', false);
    }
}
