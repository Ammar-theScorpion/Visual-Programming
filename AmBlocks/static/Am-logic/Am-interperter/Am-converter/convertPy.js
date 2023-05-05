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
        const printValue = printNode.printValue;
        return('print('+ printValue+')')+'\n';
    }
    generateBinaryExpression(ExpressionNode){
        return(ExpressionNode.left.value+ ' '+ ExpressionNode.operater + ' '+ ExpressionNode.right.value);
    }

    generateBody(node, level, type, cond=true){
      const condition = node.condition;
      let conditionValue = 'false';
      if (condition !== undefined && conditionValue != condition) {
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

    generateCode(node, level) {
        switch (node.kind) {
          case 'ifStatement':
            return this.generateIfStatement(node, level);
          case 'whileStatement':
            return this.generateReapetStatement(node, level);
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
          case 'opListStatement':
              return this.generateOpListStatement(node, level);
              case 'multiBinary':
                return this.getExpressionString(node, level);
          default:
            return typeof(node.error)=='string'?node.error:(node.value !== undefined? node.value : node);
         }
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
        let op = listName;
        if (body) {
          while (body.length) {
            let bodyValue = '';
            bodyValue += body.shift();
            op += `.${bodyValue}`;
          }
          op += `\n`;
        }
        return op;
      }
      generateListStatement(node, level){
        return `${node.listName} = []\n`;
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
        let bodyValue = 'pass';
        if (node.body) {
          const body = node.body.slice();
          bodyValue = '';
          while (body.length) {
            bodyValue += this.generateCode(body.shift(), level + 1);
          }

        }
        let args = '';
      const paramenters = node.params;
      let params = [];
      for (let dict of paramenters) {
        for (let key in dict) {
            params.push(`${key}`);
          }
        }
      args+= params.join(', ');
        return `def ${node.name} (${args}):\n\t ${bodyValue} \n`;
      }
      generateassignmentStatement(node, level){
        return node.left.value + ' = '+ this.generateCode(node.right)+'\n';
      }
      generateDeclarationStatements(node, level){
        return node.varname+' = '+'None'+'\n';
      }
    generateIfStatement(ifNode, level) {
        return this.generateBody(ifNode, level, 'if');
    }
      
    generateReapetStatement(reNode, level){
      return this.generateBody(reNode, level, 'while');
    }
    generateElseStatement(elseNode, level){
      return this.generateBody(elseNode, level, 'else', false);
    }
}
