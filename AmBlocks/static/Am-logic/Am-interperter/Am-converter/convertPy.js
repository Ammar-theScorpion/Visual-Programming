// covert the string from the parser to different PG

export class ConverterPy{
    constructor(){
        this.codepy = [];
    }
    clear(){
        this.codepy = [];
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
          default:
            break;
        }
      }
      
      generateIfStatement(ifNode, level) {
        const condition = ifNode.condition;
        let conditionValue = 'false';
        if (conditionValue != condition) {
          conditionValue = condition.left.value;
          conditionValue += condition.operater.value;
          conditionValue += condition.right.value;
        }
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
