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
          default:
            return node.value;
         }
      }
      generateassignmentStatement(node, level){
        return node.left.value + ' = '+ this.generateCode(node.right);
      }
      generateDeclarationStatements(node, level){
        return node.varname+' = '+this.generateCode(node.varBody[1])+'\n';
      }
      generateIfStatement(ifNode, level) {
        const condition = ifNode.condition;
        let conditionValue = 'false';
        if (conditionValue != condition) {
          conditionValue = condition.left.value;
          conditionValue += condition.operater.value;
          conditionValue += condition.right.value;
        }else
          conditionValue='False'
        const body = !ifNode.body?undefined: [...ifNode.body];
        let bodyValue = '';
        if (body) {
          while (body.length) {
            bodyValue += '\t'+this.generateCode(body.shift(), level + 1);
          }
        }
        const indentation = level>=0?'\t'.repeat(level):"";
        return `${indentation}if ${conditionValue}:\n${indentation}${bodyValue}`;

      }
      
    
    generateReapetStatement(ifNode){
        const condition = ifNode.condition;
        let conditionValue = condition.left.value;
        conditionValue += condition.operater.value;
        conditionValue += condition.right.value;
        const body = [...ifNode.body];
        let bodyValue = '';
        if(body){
            while(body.length){
                bodyValue += this.generateCode(body.shift());
            }
        }
        return( `while ${conditionValue}:\n\t${bodyValue}\n`)
    }
    generateElseStatement(ifNode){
        const body = ifNode.body;
        let bodyValue = '';
        if(body){
            while(body.length){
                bodyValue += this.generateCode(body.shift());
            }
        }
        return( `else:\n\t${bodyValue}\n`)
    }
}
