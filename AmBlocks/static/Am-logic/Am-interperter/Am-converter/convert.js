// covert the string from the parser to different PG
import { Parser } from "../Am-translater/parser.js";

export class Converter{
    constructor(){
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
        while(this.canMove(this.ast[0])){
            code.push(this.generateCode(this.moveNode(this.ast)));
        }return code.join('');
    }
    generateCode(node){ 
        switch (node.kind) {
            case 'ifStatement':
                return this.generateIfStatement(node);
            case 'whileStatement':
                return this.generateReapetStatement(node);
            case 'else':
                return this.generateElseStatement(node);
        default:
            break;
        }
    }
    generateIfStatement(ifNode){
        const condition = ifNode.condition;

        let conditionValue = 'false';
        if(conditionValue!=condition){
            conditionValue = condition.left.value;
            conditionValue += condition.operater.value;
            conditionValue += condition.right.value;
        }
        const body = ifNode.body;
        let bodyValue = '';
        if(body){
            while(body.length){
                bodyValue += this.generateCode(this.moveNode(body));
            }
        }
        return `if ( ${conditionValue} ) {\n ${bodyValue}}\n`
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
        return `reapet ( ${conditionValue} ) {\n ${bodyValue}}\n`
    }
    generateElseStatement(ifNode){
        const body = ifNode.body;
        let bodyValue = '';
        if(body){
            while(body.length){
                bodyValue += this.generateCode(this.moveNode(body));
            }
        }
        return `else {\n ${bodyValue}}\n`
    }
}