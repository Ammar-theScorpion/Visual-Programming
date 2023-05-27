// covert the string from the parser to different PG
import { Parser } from "../Am-translater/parser.js";
import { ConverterPy } from "./convertPy.js";
import { validateIfElseOrder } from "../Am-translater/syntex.js";

const INCLUDE={
  'cout':'#include<iostream>',
  'string':'#include<string>',
  'vector':'#include<vector>',
  'transform':'#include<algorithm>',
  'replace':'#include<algorithm>',
  'find':'#include<algorithm>',
  'set':'#include<set>',
  'toupper':'#include<cctype>',
  'tolower':'#include<cctype>',
}
export class Converter{
    constructor(){
        this.py = new ConverterPy()
        this.ast = [];
        this.parser = new Parser();
        this.m = false;
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

        console.log(validateIfElseOrder(this.ast)) ;
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
        if(this.m)
          include_str+='#include<cmath>'+'\n\n';
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
          case 'forStatement':
            return this.generateForStatement(node, level);
          case 'else':
            return this.generateElseStatement(node, level);
          case 'printStatement':
            return this.generatePrintStatement(node, level);
          case 'BinaryExpression':
            return this.generateBinaryExpression(node, level);
          case 'MBinaryExpression':
            return this.generateMBinaryExpression(node, level);
          case 'declarationStatements':
              return this.generateDeclarationStatements(node, level);
          case 'assignmentStatement':
              return this.generateassignmentStatement(node, level);
          case 'functionStatement':
              return this.generateFunctionStatement(node, level);
          case 'classStatement':
              return this.generateClassStatement(node, level);
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
          case 'mathStatement':
              return this.generateMathStatement(node, level);
          case 'stringStatement':
              return this.generateStringStatement(node, level);
          case 'multiBinary':
              return this.getExpressionString(node, level);
          default:
              return typeof(node.error)=='string'?node.error:(node.value !== undefined? node.value : node);
       }
      }
      generateStringStatement(node){
        let op = node.op;
        let on ;
        let onstring = node.onstring;
         if(node.on.value ==null)
          on = this.generateCode(node.onstring);
          else
          on = this.generateCode(node.on);
        // Map the method name to the corresponding C++ code
        switch(op){

        case "up":
            op=`std::toupper(${on})`;break;
        case"low":
            op= `std::tolower(${on})`;break;
        case "Len": 
            op= `${on}.length()`;break;
        case "cat": 
            op=`(${onstring} + ${on})`;break;
        case "cnt": 
            op = `${onstring}.find_first_of("${on}")`;break;
        case "split": 
            op=`split(${args[0]}, "${args[1]}"`; break;
        case "idx":
          op=`${onstring}[${on}]`;break;

        case "repl":
            if (isNaN(on) ) {
              return `${onstring}.std::replace(${onstring}.begin(), ${onstring}.end(), '', '')`;
            } 
            let argss = on.toString().split('.')
            if (argss.length===1) {
              return `${onstring}.std::replace(${onstring}.begin(), ${onstring}.end(), ${argss[0]}, '')`;
            } else {
              return `${onstring}.std::replace(${onstring}.begin(), ${onstring}.end(), ${argss[0]}, ${argss[1]})`;
            }
        case "sub":
            let str = 0;
            let end='';
            try{
              str =  on.toString().split('.')[0];
              end = on.toString().split('.')[1];
              if(!Number.isFinite(on)){
                str = 0
              }
              if(end==undefined){
                end =''
              }
            }catch(e){}
          op=`${onstring}.substr(${str}${end === '' ? '': ', '+end})`;break;
          /*
          else if "replace"):
            if (args[1] === "[:::]"):
              return `replace_all(${args[0]}, "${args[1]}", ":")`;
            } else {
              return `replace_all(${args[0]}, "${args[1]}", "${args[2]}")`;
            }
          } else if "slc") {
            if (args.length === 1) {
              return `(${args[0]}).substr(${args[0]}.length())`;
            }
            else if (args.length === 2) {
              return `(${args[0]}).substr(${args[1]})`;
            } else if (args.length === 3) {
              return `(${args[0]}).substr(${args[1]}, ${args[2]} - ${args[1]})`;
            } else if (args.length === 4) {
              return `slice(${args[0]}, ${args[1]}, ${args[2]}, ${args[3]})`;
            } else {
              throw new Error("Invalid number of arguments for slice operation");
            }
          } else {
            return methodName;
          }*/

      } return `${op}`;

      }
      generateMathStatement(node, level){
        this.m = true;
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
      generateReturnStatement(node, level){
        return `return ${node.statement};`
      }
      generateOpListStatement(node, level){
        const listName = node.listName.value;
        const body = node.body;
        let bodyValue='';
        /* translate all body statements * */
        for (let index = 0; index < body.length; index++) {
          const element = body[index];
          bodyValue+=this.generateCode(element);
        }
        /* translate all body statements * */
        const operation = node.ops;
        const dtype = node.env.lookUp(listName)[3];
        switch (operation) {
          case 'initialize':
            return `${listName} = {${body}};`;
          case 'append':
              return `${listName}.push_back(${bodyValue});`;
          case 'insert':
              if (dtype == 'set') {
                  return `${listName}.insert(${bodyValue});`;
              } else {
                  return `${listName}.insert(${listName}.begin() + ${body[1]}, ${body[0]});`;
              }
          case 'pop':
              return `${listName}.pop_back();`;
          case 'clear':
              return `${listName}.clear();`;
          case 'delete':
              return `${listName}.erase(${listName}.begin() + ${bodyValue});`;
          case 'isempty':
              return `${listName}.empty();`;
          case 'length':
              return `${listName}.size();`;
          case 'find':
            return `${dtype === 'set' ? (listName + '.find(' + bodyValue + ')') : ('std::find(' + listName + '.begin(), ' + listName + '.end(), ' + bodyValue + ')')};`;
          case 'replace':
            return `${dtype === 'set' ? `${listName}.find(${bodyValue})` : `std::find(${listName}.begin(), ${listName}.end(), ${bodyValue})`};`;
        }
         
      }
    generateListStatement(node, level){
      let type = 'void*'
      let env = node.env;
      let look = env.lookUp(node.listName);
      let equalto = [];
      if(look != null || look!=undefined){
         type = look[0];
         if(look[1]){
          for (let index = 0; index < look[1].length; index++) {
            const element = look[1][index];
            equalto.push(this.generateCode(element));
            
          }
         }
      }
      let dt = node.dtype;
      dt = (dt =='list'?'vector':dt);
        return `std::${dt}<${type}> ${node.listName} = {${equalto.join(', ')}};`;
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
    generateClassStatement(node, level){
      const body = node.body;
      let bodyValue = '';
      if (body) {
        while (body.length) {
          bodyValue += this.generateCode(body.shift(), level + 1)+'\n\t';
        }
      }
      return `class ${node.name}{\n\t${bodyValue}\n}`;

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
          right = `std::cout << "${right.substr(7, right.length-2-7)}";\n`
          right += `std::cin >> ${node.left.value}`
        }else{
          right = this.generateCode(node.right);
          right = this.analysOperations(node.right.value);
        }

        return node.left.value + ' = '+ right +';\n';
      }
    generateDeclarationStatements(node, level){
      let type = node.varBody[0]
      let env = node.env;
      let look = env.lookUp(node.varname);
      if(look != null)
        type = look[0];
      return type +' '+ node.varname + `= ${this.generateCode(node.varBody[1])}`+ ';\n';
    }

    generateMBinaryExpression(ExpressionNode){
      let exp = '';
      for(let n of ExpressionNode.body){
        exp += this.generateCode(n)+' ';
      }
        return exp;
    }
    generateBinaryExpression(ExpressionNode){
        let right = ExpressionNode.right.value;
        if(ExpressionNode.right['kind'])
          right = this.generateCode(ExpressionNode.right);
        return ExpressionNode.left.value+ ' '+ ExpressionNode.operater + ' '+ right;
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
        const printValue = printNode.printValue//.replace(',','<<');
        let print = 'std::cout <<';
        let printThings = [];
        for (let index = 0; index < printValue.length; index++) {
          const element = printValue[index];
          printThings.push(this.generateCode(element));
          
        } 
        return print+printThings.join(' << ');//this.analysOperations(printValue)+';\n';
    }
    generateIfStatement(ifNode, level){

      const condition = ifNode.condition;
      let conditionValue = 'false';
      if (conditionValue != condition) {
        conditionValue = this.generateCode(condition);
      }
      const body = ifNode.body;
      let bodyValue = '';
      if (body) {
        while (body.length) {
          bodyValue += '\n    ' + this.generateCode(body.shift(), level + 1);
        }
      }
      const indentation = level >= 0 ? '\t'.repeat(level) : "";
      return `${indentation}if (${conditionValue}) {\n${'\t'.repeat(level + 1)}${bodyValue}}\n`;
      }
      
    generateForStatement(body, level){
      const indexes = body.indexes;
      let from = [];
      let to = [];
      let by = [];
      
        for (let key in indexes) {
          const index = indexes[key];
          from.push(`int ${key} = ${index[0]}`);
          to.push(`${key} < ${index[1]}`);
          by.push(`${key} += ${index[2]}`);
      }
      let allIndexes = [from.join(', '), to.join(', '), by.join(', ')]
      let allIndexes_res = allIndexes.join(';');
      let body_=body.body;
      let bodyValue = '';
      if(body_){
        while (body_.length) {
          bodyValue += '\t'+this.generateCode(body_.shift(), level + 1);
        }
      }
      const indentation = level>=0?'\t'.repeat(level):"";
      return `${indentation}for(${allIndexes_res}){\n${'\t'.repeat(level+1)}${bodyValue}\n}`;
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
