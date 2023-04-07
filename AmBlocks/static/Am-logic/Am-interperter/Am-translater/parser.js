import * as Type from './ast.js' 
import { tokenize, TokenType } from "./lexical.js";
import { Symbol } from './symbol.js';
export class Parser{
    constructor(){
        this.tokens = [];
        this.env = null;
        this.lang = '';
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
    translate_expression(expression){
        if(expression.kind!='BinaryExpression')
            return '';
        
        return this.translate_expression(expression.left)+expression.left.value+expression.operater.value+expression.right.value;
    }

    produceAST(srcCode, env, lang){
        this.tokens = this.getLexical(srcCode);
        let program ={
            kind:'program',
            body:[]
        };
        this.lang = lang;

        while(this.validToken()){
            if(!this.inBody())
                this.move();
            program.body.push(this.parse_statement(env));
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
        else if(type==TokenType.Def)
            return (this.pasre_function_statement(env))
        else if(type==TokenType.Call)
            return (this.pasre_call_statement(env))
        else if(type==TokenType.Each)
            return (this.pasre_each_statement(env))
        else if(type==TokenType.Create)
            return (this.pasre_createList_statement(env))
        else if(type==TokenType.List)
            return (this.pasre_opList_statement(env))
        else if(type==TokenType.Return)
            return (this.pasre_return_statement(env))

        return this.parse_expr(env);
    }
    pasre_return_statement(env){
        let body={};
        this.move();
        let returnValue = '';
        while(this.validToken() && this.getCurrentToken().value!='\n'){
            const statement = this.parse_statement(env);
            if(statement.kind=='BinaryExpression'){
                returnValue+=this.translate_expression(statement);
            }
        }this.move();
        body={
            kind:'returnStatement',
            returnValue

        }
        return body;
    }
    pasre_opList_statement(env){
        let body={};
        this.move();
        const listName = this.move().value;
        body={
            kind:'opListStatement',
            listName,
        };
        this.move();
        while (this.inBody() && this.validToken()) { 
            const op = this.move().value;
            //const opvalue = this.move().value;
            if (body.body) {
                body.body.push(op+'('+')');
            }else
                body['body'] = [op+'('+')'];
        }
        if(!this.inBody())
            this.move();
        return body;
    }
    pasre_createList_statement(env){
        let body={};
        this.move();
        this.move();
        const listName = this.move().value;
        body={
            kind:'createListStatement',
            listName,
        };
        return body;
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
        env.declareVar([varname,  [vartype, varvalue.value]]);

        let varBody = [
            vartype,
            varvalue
        ];
         
        body = {
            kind:'declarationStatements',
            varname,
            varBody
            
        }
        return body;
    }
    parse_expr(env){
        return this.parse_assignment(env)
    }
    parse_assignment(env){
        let left = this.parse_additive_expr();
        if(left.kind=='Identifier'){
            const lookup = env.lookUp(left.value)
            if(lookup == null){
                console.log(`${left.value} is not declared yet`)
            }
            if(this.getCurrentToken().type==TokenType.Equals){
                this.move();
            const right = this.parse_additive_expr();
            if(right.kind != lookup[0]&&this.lang=='C++'){
                console.log(`${left.value} is ${lookup[0]}. Cannot change data type in C++`);
            }
            left = {
                kind:'assignmentStatement',
                left,
                right
            };
        }
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
            case TokenType.SpecChar:
                return {kind:'SpecChar', value:this.move().value};
            case TokenType.Identifier:
                return {kind:'Identifier', value:this.move().value};
            case TokenType.Equals:
                return {kind:'Equals', value:(this.move().value)};
            case TokenType.Number:
                const val = this.move().value;
                return {kind:'Number', value:parseFloat(val)};
            case TokenType.String:
                return {kind:'String', value:(this.move().value)};
            default:
                return {kind: 'Number', value: 0}
        }
    }
    pasre_call_statement(env){
        this.move();
        const function_name = this.move().value;
        let argsv='';
        let argsk='';
        while(this.validToken() && this.getCurrentToken().value!='\n'){
            const val = this.move();
            argsv += val.value;
            argsk += val.kind;
        }this.move();
        const body={
            kind:'CallStatement',
            function_name,
            argsv,
            argsk
        };
        return body;

    }
    pasre_each_statement(env){
        let body={};
        this.move();
        const varname = this.move().value;
        const varname_over = this.move().value;
        const varinfo = env.lookUp(varname_over);
        if(varinfo==null){
                console.log(`${varname_over} is not declared yet`)
        }else if(varinfo[0]!='string'){
            console.log(`${varname_over} is not iteratable`)

        }
        //check the type
        body={
            kind:'eachStatement',
            varname,
            varname_over,

        };
        this.move();
        while (this.inBody() && this.validToken()) { 
            const statement = this.parse_statement(env);
            if (body.body) {
                body.body.push(statement);
            }else
                body['body'] = [statement];
        }
        this.move();
        return body;
    }
    pasre_function_statement(env){
        let body={};
        this.move();
        const name = this.move().value;
        let args='';
        while(this.getCurrentToken().value!=='{'){
            args+=this.move().value;
        }
        this.move(); //remove { 
        body={
            kind:'functionStatement',
            name,
            args
        };
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

    pasre_if_statement(env){
        let if_env = new Symbol(env);
        let body={};
        this.move();
        let condition = this.parse_expr(env);
        if (condition.value === 0)
            condition = 'false'
        body={
            kind:'ifStatement',
            condition,
        };
        this.move(); //remove { 
        while (this.inBody() && this.validToken()) { 
            const statement = this.parse_statement(if_env);
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
        const condition = this.parse_expr(env);

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
