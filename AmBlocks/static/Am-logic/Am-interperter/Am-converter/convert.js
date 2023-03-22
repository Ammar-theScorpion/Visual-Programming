// covert the string from the parser to different PG
import { Parser } from "../Am-translater/parser.js";
import { ConverterPy } from "./convertPy.js";

export class Converter{
    constructor(){
        this.py = new ConverterPy()
        this.ast = [];
        this.parser = new Parser();
    }
    moveNode(array){
        const prev = array.shift();
        return prev;
    }
    canMove(array){
        return array.kind != ''
    }
    getAST(srcCode){
        return this.parser.produceAST(srcCode);
    }
    covertString(srcCode){ // main entry
        this.ast = this.getAST(srcCode).body;
        let code = [];
        this.py.ast = this.ast.slice();
        let codepy = this.py.covertString();
        while(this.canMove(this.ast[0])){
            code.push(this.generateCode(this.moveNode(this.ast), -1)+'\n');
        }return [code.join(''), codepy];
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
      return node.varBody[0] +' '+ node.varname+' = '+this.generateCode(node.varBody[1])+';\n';
    }

    generateBinaryExpression(ExpressionNode){
        return ExpressionNode.left.value+ ' '+ ExpressionNode.operater.value + ' '+ ExpressionNode.right.value;
    }

    generatePrintStatement(printNode){
        const printValue = printNode.printValue;
        return 'std::cout << '+ printValue+';\n';
    }
    generateIfStatement(ifNode, level){
        const condition = ifNode.condition;
        let conditionValue = 'false';
        if (conditionValue != condition) {
          conditionValue = condition.left.value;
          conditionValue += condition.operater.value;
          conditionValue += condition.right.value;
        }
        const body = ifNode.body;
        let bodyValue = '';
        if (body) {
          while (body.length) {
            bodyValue += this.generateCode(body.shift(), level + 1);
          }
        }
        const indentation = level>=0?'\t'.repeat(level):"";
        return `${indentation}if(${conditionValue}){\n\t${bodyValue}}\n`;
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
        return `${indentation}if( ${conditionValue} ){\n\t${bodyValue}}`;
    }
    
    generateReapetStatement(ifNode){
        const condition = ifNode.condition;
        let conditionValue = condition.left.value;
        conditionValue += condition.operater.value;
        conditionValue += condition.right.value;
        const body = ifNode.body;
        let bodyValue = '';
        if(body){
            while(body.length){
                bodyValue += this.generateCode(this.moveNode(body));
            }
        }
        return `while ( ${conditionValue} ) {\n${bodyValue}}\n`
    }
    generateElseStatement(ifNode){
        const body = ifNode.body;
        let bodyValue = '';
        if(body){
            while(body.length){
                bodyValue += this.generateCode(this.moveNode(body));
            }
        }
        return `else {\n${bodyValue}}\n`
    }
}
