// covert the string from the parser to different PG
import { Parser } from "../Am-translater/parser.js";
import { ConverterPy } from "./convertPy.js";

const INCLUDE={
  'cout':'#include<iostream>',
  'string':'#include<string>',
  'vector':'#include<vector>',
}
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
    getAST(srcCode, env, lang){
        return this.parser.produceAST(srcCode, env, lang);
    }
    covertString(srcCode, env, lang){ // main entry
        this.ast = this.getAST(srcCode, env, lang).body;
        let code = [];
        this.py.ast = this.ast.slice();
        let codepy = this.py.covertString();
        while(this.canMove(this.ast[0])){
            code.push(this.generateCode(this.moveNode(this.ast), -1)+'\n');
        }
        let code_str = code.join('');
        let include_str='';
        for(const key in INCLUDE){
          if(code_str.indexOf(key)!==-1){
            include_str+=INCLUDE[key]+'\n';
          }
        }
        return [include_str+code_str, codepy];
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
          case 'returnStatement':
              return this.generateReturnStatement(node, level);
          default:
              return node.value;
       }
      }
      generateReturnStatement(node, level){
        return `return ${node.returnValue};`
      }
      generateOpListStatement(node, level){
        const listName = node.listName;
        const body = node.body;
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
        return `std::vector<int> ${node.listName};\n`;
      }
    generateEachStatement(node, level){
      const body = node.body;
      let bodyValue = '';
      if (body) {
        while (body.length) {
          bodyValue += this.generateCode(body.shift(), level + 1);
        }
      }
      return `for (char ${node.varname} : ${node.varname_over}){\n ${bodyValue} \n}`;
    }
    generateCallStatement(node, level){
      return `${node.function_name}(${node.argsv})\n`;
    }
    generateFunctionStatement(node, level){
      const body = node.body;
      let bodyValue = '';
      if (body) {
        while (body.length) {
          bodyValue += this.generateCode(body.shift(), level + 1);
        }
      }
      return `void ${node.name} {\n\t${bodyValue}\n}`;

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
        const printValue = printNode.printValue.replace(',','<<');
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
            bodyValue += '\t'+this.generateCode(body.shift(), level + 1);
          }
        }
        const indentation = level>=0?'\t'.repeat(level):"";
        return `${indentation}if(${conditionValue}){\n${'\t'.repeat(level+1)}${bodyValue}}`;
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
