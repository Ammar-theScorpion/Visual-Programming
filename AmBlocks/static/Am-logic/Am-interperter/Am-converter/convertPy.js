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
        return(ExpressionNode.left.value+ ' '+ ExpressionNode.operater.value + ' '+ ExpressionNode.right.value);
    }

    generateBody(node, level, type, cond=true){
      let condition = '';
      let conditionValue = 'false';
      if(cond){
        condition = node.condition;
        if (conditionValue != condition) {
            conditionValue = condition.left.value;
            conditionValue += condition.operater.value;
            conditionValue += condition.right.value;
        }else
          conditionValue='False'
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
          default:
            return node.value;
         }
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
        const body = node.body;
        let bodyValue = '';
        if (body) {
          while (body.length) {
            bodyValue += this.generateCode(body.shift(), level + 1);
          }
        }
        return `for (char ${node.varname} : ${node.varname_over}):\n ${bodyValue} \n`;
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
        return `def ${node.name} (${node.args}):\n\t ${bodyValue} \n`;
      }
      generateassignmentStatement(node, level){
        return node.left.value + ' = '+ this.generateCode(node.right)+'\n';
      }
      generateDeclarationStatements(node, level){
        return node.varname+' = '+this.generateCode(node.varBody[1])+'\n';
      }
      generateIfStatement(ifNode, level) {
        this.generateBody(ifNode, level, 'if');
      }
      
    generateReapetStatement(reNode){
      this.generateBody(reNode, level, 'while');
    }
    generateElseStatement(elseNode, level){
      this.generateBody(elseNode, level, 'else', false);
    }
}
