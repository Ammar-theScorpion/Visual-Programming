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
        if(lang==='Python')
          return this.py.covertString();

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
        return include_str+code_str;
    }
    generateFunction(node){
      switch(node){
        case 'append':
            return 'push_back'
        case 'length':
            return 'size'
        case 'pop':
            return 'pop_back'
        case 'remove':
            return 'earse'
        case 'input':
            return 'cout << '
          default:
            return node;
      }
    }
    CPlusSentex(node){
      if(node=='insert' || node[0] == 'remove')
        return true
      return false;
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
          case 'multiBinary':
              return this.getExpressionString(node, level);
          default:
              return typeof(node.error)=='string'?node.error:(node.value !== undefined? node.value : node);
       }
      }
      generateReturnStatement(node, level){
        return `return ${node.statement};`
      }
      generateOpListStatement(node, level){
        const listName = node.listName;
        const body = node.body;
        let op = listName;
        if (body) {
          while (body.length) {
            let bodyValue = '';
            let val = body.shift();
            val=val.split('(');

            if(val[0] == 'sort')
              op=val[0]+'('+listName+'.begin(), '+listName+'.end())';
            else{
              if(this.CPlusSentex(val[0]))
              bodyValue += this.generateFunction(val[0])+'('+listName+'.begin() + '+val[1];
              else
              bodyValue += this.generateFunction(val[0])+'('+val[1];
              op += `.${bodyValue}`;
            }
          }
          op += `;\n`;
        }
        return op;
      }
    generateListStatement(node, level){
        return `std::vector<${node.list_type}> ${node.listName};\n`;
    }
    generateEachStatement(node, level){
      const body = node.body;
      let bodyValue = '';
      if (body) {
        while (body.length) {
          bodyValue += this.generateCode(body.shift(), level + 1);
        }
      }
      return `for (${node.iterateable_type} ${node.varname} : ${node.varname_over}){\n ${bodyValue} \n}`;
    }
    generateCallStatement(node, level){
      return `${node.function_name}(${node.argsv})\n`;
    }
    generateFunctionStatement(node, level){
      const body = node.body;
      let bodyValue = '';
      if (body) {
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
      return `${node.type} ${node.name} (${args}) {\n\t${bodyValue}\n}`;

    }
    generateassignmentStatement(node, level){
        let right = node.right;
        if(typeof right === 'string' && right.indexOf('input')!==-1){
          right = `cout << "${right.substr(7, right.length-2-7)}";\n`
          right += `cin >> ${node.left.value}`
        }else{
          right = this.generateCode(node.right);
        }

        return node.left.value + ' = '+ right +';\n';
      }
    generateDeclarationStatements(node, level){
      return node.varBody[0] +' '+ node.varname+';\n';
    }

    generateBinaryExpression(ExpressionNode){
        return ExpressionNode.left.value+ ' '+ ExpressionNode.operater + ' '+ ExpressionNode.right.value;
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
    
    generatePrintStatement(printNode){
        const printValue = printNode.printValue.replace(',','<<');
        return 'std::cout << '+ printValue+';\n';
    }
    generateIfStatement(ifNode, level){
        const condition = ifNode.condition;
        let conditionValue = 'false';
        if (conditionValue != condition) {
          conditionValue = this.getExpressionString(condition);
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
      
    
    generateReapetStatement(ifNode, level){
      const condition = ifNode.condition;
      let conditionValue = 'false';
      if (conditionValue != condition) {
        conditionValue = this.getExpressionString(condition);
      }
      const body = ifNode.body;
      let bodyValue = '';
      if (body) {
        while (body.length) {
          bodyValue += '\t'+this.generateCode(body.shift(), level + 1);
        }
      }
      const indentation = level>=0?'\t'.repeat(level):"";
      return `${indentation}while(${conditionValue}){\n${'\t'.repeat(level+1)}${bodyValue}}`;
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
