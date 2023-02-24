import * as Type from './ast.js' 
import { tokenize, TokenType } from "./lexical.js";

export class Parser{
    constructor(){
        this.tokens = [];
    }

    getLexical(args){
        return tokenize(args);
    }

    getCurrentToken(){
        return this.tokens[0];
    }

    move(){
        const prev = this.tokens.shift();
        return prev;
    }

    validToken(){
        return this.getCurrentToken().type != TokenType.EOC
    }

    inBody(){
        return this.getCurrentToken().value != '}';
    }

    produceAST(srcCode){
        this.tokens = this.getLexical(srcCode);
        const program ={
            kind:'program',
            body:[]
        };

        while(this.validToken()){
            if(!this.inBody())
                this.move();
            console.log(this.getCurrentToken().value)
            program.body.push(this.parse_statement());
        }
        return program
    }

    parse_statement(){
        if(this.getCurrentToken().type==TokenType.If)
            return this.pasre_if_statement();
        else if(this.getCurrentToken().type==TokenType.Repeat)
            return this.parse_repeate_statement();
        else if(this.getCurrentToken().type==TokenType.Else)
            return this.parse_else_statement();
        return this.parse_expr();
    }

    parse_expr(){
        return this.parse_additive_expr();
    }
 
    parse_additive_expr(){
        //10+2-5
        let left = this.parse_multitive_expr();
        while(this.getCurrentToken().value == '+' || this.getCurrentToken().value == '>' || this.getCurrentToken().value == '<'){
            const operater = this.move();
            const right = this.parse_multitive_expr();

            left = {
                kind: "BinaryExpression",
                left,
                right,
                operater: operater
            };
        }
        return left;
    }

    parse_multitive_expr(){
        //10+2-5
        let left = this.parse_value_expr();
        while(this.getCurrentToken().value == '*' || this.getCurrentToken().value == '/'){
            const operater = this.move();
            const right = this.parse_value_expr();

            left = {
                kind: "BinaryExpression",
                left,
                right,
                operater: operater.value
            };
        }
        return left;
    }
    parse_value_expr(){
        const token = this.getCurrentToken().type;
        switch(token){
            case TokenType.Identifier:
                return {kind:'Identifier', value:this.move().value};
            case TokenType.Equals:
                return {kind:'Equals', value:(this.move().value)};
            case TokenType.Number:
                return {kind:'Number', value:parseInt(this.move().value)};
        }
    }

    pasre_if_statement(){
        let body={};
        this.move();
        const condition = this.parse_expr();
        this.move();
        body={
            kind:'ifStatement',
            condition,
        };
        this.move(); //remove { 
        while (this.inBody() && this.validToken()) { 
            const statement = this.parse_statement();
            if (body.body) {
                body.body.push(statement);
            }else
                body['body'] = [statement];
        }
        if(!this.inBody())
            this.move();
        return body;
    }

    parse_repeate_statement(){
        let body={};
        this.move();
        const condition = this.parse_expr();

        body={
            kind:'whileStatement',
            condition,
        };
        this.move(); //remove { 
        while (this.inBody() && this.validToken()) { 
            const statement = this.parse_statement();
            if (body.body) {
                body.body.push(statement);
            }else
                body['body'] = [statement];
        }
        if(!this.inBody())
            this.move();
        return body;
    }

    parse_else_statement(){
        let body={kind:'else'};
        this.move();
        this.move(); //remove { 

        while (this.inBody() && this.validToken()) { 
            const statement = this.parse_statement();
            if (body.body) {
                body.body.push(statement);
            }else
                body['body'] = [statement];
        }
        if(!this.inBody())
            this.move();
        return body;

    }
}