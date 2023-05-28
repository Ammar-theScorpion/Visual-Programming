// covert the string from the parser to different PG
import { checkIfElseOrder } from "../Am-translater/syntex.js";

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
      if(!checkIfElseOrder(this.ast)){
        codepy.push('unvalid else: must followd with if-block:');
      }
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
      return print+printThings.join(' , ')+')';//this

    }
    generateBinaryExpression(ExpressionNode){
        return(ExpressionNode.left.value+ ' '+ ExpressionNode.operater + ' '+ ExpressionNode.right.value);
    }

    generateBody(node, level, type, cond = true) {
      const condition = node.condition;
      let conditionValue = '';
      if (cond) {
        conditionValue = 'False';
      }
      if (condition !== undefined && conditionValue.toLowerCase() != condition) {
        conditionValue = this.generateCode(condition);

      }
      const body = node.body  
      let bodyValue = '\tpass';
    
      if (body) {
        bodyValue = '';
        while (body.length) {
          bodyValue += '\n    ' + this.generateCode(body.shift(), level + 1);
        }
      }
      const indentation = level >= 0 ? '\t'.repeat(level) : '';
      return `${indentation}${type} ${conditionValue}:\n${bodyValue}`;
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
          case 'stringStatement':
                return this.generateStringStatement(node, level);
              case 'multiBinary':
                return this.getExpressionString(node, level);
          default:
            return typeof(node.error)=='string'?node.error:(node.value !== undefined? node.value : node);
         }
      }

      generateMBinaryExpression(ExpressionNode){
        let exp = '';
        for(let n of ExpressionNode.body){
          exp += this.generateCode(n)+' ';
        }
          return exp;
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
            op=`${on}.upper()`;
          case "low":
            return `${on}.lower()`;
            case "Len": 
            op= `len(${on})`;break;
          case "cat":
            return `${onstring} + ${on}`;
          case "cnt":
            return `${onstring}.count(${on})`;
          case "spt":
            return `${onstring}.split(${on})`;
          case "idx":
            return `${onstring}[${on}]`;
          // Handle the special case of [:::] separator
          case "repl":
            if (isNaN(on) ) {
              return `${onstring}.replace(${onstring}[:])`;
            } 
            let argss = on.toString().split('.')
            if (argss.length===1) {
              return `${onstring}.replace('${argss[0]}', '')`;
            } else {
              return `${onstring}.replace('${argss[0]}', '${argss[1]}')`;
            }
          case "sub":
            if (isNaN(on) ) {
              return `${onstring}[:]`;
            } 
            let args = on.toString().split('.')
             if (args.length === 1) {
              return `${onstring}[${args[0]}:]`;
            } else if (args.length === 2) {
              return `${onstring}[${args[0]}:${args[1]}]`;
            } else if (args.length === 3) {
              return `${args[0]}[${args[1]}:${args[2]}:${args[3]}]`;
            } else {
              throw new Error(`Invalid number of arguments for slice operation`);
            }
        }
        return 'None';
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
        const listName = node.listName.value;
        const body = !node.body?undefined: [...node.body];
        let bodyValue ='';
        for (let index = 0; index < body.length; index++) {
          const element = body[index];
          bodyValue+=this.generateCode(element);
        }
        const operation = node.ops;
        const dtype = node.env.lookUp(listName)[3];
        switch (operation) {
          case 'init':
              if (dtype === 'set') {
                  return `${listName} = new Set(${body});`;
              } else {
                  return `${listName} = [${body}];`;
              }
          case 'apd':
              if (dtype === 'set') {
                  return `${listName}.add(${bodyValue});`;
              } else {
                  return `${listName}.append(${bodyValue});`;
              }
          case 'int':
              if (dtype === 'set') {
                  return `${listName}.add(${body[0]});`;
              } else {
                  return `${listName}.splice(${body[1]}, 0, ${body[0]});`;
              }
          case 'pop':
              if (dtype === 'set') {
                  return `${listName}.delete(${bodyValue});`;
              } else {
                  return `${listName}.pop();`;
              }
          case 'cel':
              if (dtype === 'set') {
                  return `${listName}.clear();`;
              } else {
                  return `${listName} = [];`;
              }
          case 'del':
              if (dtype === 'set') {
                  return `${listName}.delete(${bodyValue});`;
              } else {
                  return `${listName}.splice(${bodyValue}, 1);`;
              }
          case 'isempty':
              if (dtype === 'set') {
                  return `${listName}.size === 0;`;
              } else {
                  return `len(${listName}) === 0;`;
              }
          case 'length':
              if (dtype === 'set') {
                  return `${listName}.size;`;
              } else {
                  return `len(${listName});`;
              }
          case 'fin':
              if (dtype === 'set') {
                  return `${listName}.has(${bodyValue});`;
              } else {
                  return `${listName}.includes(${bodyValue});`;
              }
        }
      
      }
      generateListStatement(node, level){

        let env = node.env;
        let look = env.lookUp(node.listName);
        let equalto = [];
        if(look != null || look!=undefined){
           if(look[1]){
            for (let index = 0; index < look[1].length; index++) {
              const element = look[1][index];
              equalto.push(this.generateCode(element));
              
            }
           }
        }
          let dt = node.dtype;
          dt = (dt =='list'?'vector':dt);
          return `${node.listName} = [${equalto.join(', ')}]\n`;

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
              params.push(`${key}`);
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
        return node.varname + `= ${this.generateCode(node.varBody[1])}`+ ';\n';
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
