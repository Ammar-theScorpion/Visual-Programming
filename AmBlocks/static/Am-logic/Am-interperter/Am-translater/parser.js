import * as Type from './ast.js' 
import { tokenize, TokenType } from "./lexical.js";
import { Symbol } from './symbol.js';
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
        let program ={
            kind:'program',
            body:[]
        };
        this.env= new Symbol(null)

        while(this.validToken()){
            if(!this.inBody())
                this.move();
            program.body.push(this.parse_statement(this.env));
        }
        program.body.push({kind:'', value:TokenType.EOC});
        return program
    }

    parse_statement(env){
        const type = this.getCurrentToken().type;
        if(type==TokenType.If)
            return this.pasre_if_statement(env);
        else if(type==TokenType.Repeat)
            return this.parse_repeate_statement(env);
        else if(type==TokenType.Else)
            return this.parse_else_statement(env);
        else if(type==TokenType.Int || type==TokenType.Float || type==TokenType.String)
            return this.parse_var(env) 
        else if(type==TokenType.Print)
            return (this.parse_print_statement(env))
        return this.parse_expr(env);
    }

    parse_print_statement(env){
        let body={};
        this.move();
        let printValue = '';
        while(this.validToken() && this.getCurrentToken().value!='\n'){
            printValue += this.move().value;
        }
        if(this.validToken() ){
            this.move();
        }
        body={
            kind:'printStatement',
            printValue,
        };
        return body;
    }
    parse_var(env){
        let body={};
        const vartype = this.move().value;
        const varname = this.move().value;
        let varvalue = 0;
        if(this.getCurrentToken().type==TokenType.Equals){ 
            this.move();
            varvalue = this.parse_expr(env);
        }

        let varBody = [
            vartype,
            varvalue
        ];
         
        env.declareVar([varname, varBody]);
        body = {
            kind:'declarationStatements',
            varname,
            varBody
            
        }
        return body;
    }
    parse_expr(env){
        return this.parse_assignment()
    }
    parse_assignment(){
        let left = this.parse_additive_expr();
        if(this.getCurrentToken().type==TokenType.Equals){
            this.move();
            const right = this.parse_additive_expr();
            left = {
                kind:'assignmentStatement',
                left,
                right
            };
        }
        return left;
    }
 
    parse_additive_expr(env){
        //10+2-5
        let left = this.parse_multitive_expr();
        while(this.getCurrentToken().value == '+' || this.getCurrentToken().value == '>' || this.getCurrentToken().value == '<'){
            const operater = this.move();
            const right = this.parse_multitive_expr();

            left = {
                kind: "BinaryExpression",
                left,
                right,
                operater 
            };
        }
        return left;
    }

    parse_multitive_expr(env){
        //10+2-5
        let left = this.parse_value_expr();
        while(this.getCurrentToken().value == '*' || this.getCurrentToken().value == '/'){
            const operater = this.move();
            const right = this.parse_value_expr();
            
            left = {
                kind: "BinaryExpression",
                left,
                right,
                operater
            };
        }
        return left;
    }
    parse_value_expr(env){
        const token = this.getCurrentToken().type;
        switch(token){ 
            case TokenType.Identifier:
                return {kind:'Identifier', value:this.move().value};
            case TokenType.Equals:
                return {kind:'Equals', value:(this.move().value)};
            case TokenType.Number:
                return {kind:'Number', value:parseInt(this.move().value)};
            case TokenType.String:
                return {kind:'String', value:(this.move().value)};
            default:
                return {kind: 'Number', value: 0}
        }
    }
    pasre_if_statement(env){
        let body={};
        this.move();
        let condition = this.parse_expr();
        if (condition.value === 0)
            condition = 'false'
        this.move();
        body={
            kind:'ifStatement',
            condition,
        };
        this.move(); //remove { 
        while (this.inBody() && this.validToken()) { 
            const statement = this.parse_statement(env);
            if (body.body) {
                body.body.push(statement);
            }else
                body['body'] = [statement];
        }
        if(!this.inBody())
            this.move();
        return body;
    }

    parse_repeate_statement(env){
        let body={};
        this.move();
        const condition = this.parse_expr();

        body={
            kind:'whileStatement',
            condition,
        };
        this.move(); //remove { 
        while (this.inBody() && this.validToken()) { 
            const statement = this.parse_statement(env);
            if (body.body) {
                body.body.push(statement);
            }else
                body['body'] = [statement];
        }
        if(!this.inBody())
            this.move();
        return body;
    }

    parse_else_statement(env){
        let body={kind:'else'};
        this.move();
        this.move(); //remove { 

        while (this.inBody() && this.validToken()) { 
            const statement = this.parse_statement(env);
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
