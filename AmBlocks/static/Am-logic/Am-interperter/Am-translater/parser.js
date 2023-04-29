import * as Type from './ast.js' 
import { tokenize, TokenType } from "./lexical.js";
import { Symbol, SymbolFunction } from './symbol.js';
export class Parser{
    constructor(){
        this.tokens = [];
        this.lang = '';
        this.line = 0;
        this.current_scope = null;
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
    getVarType(value){
        if(value==='')
            return 'void'
        if (/^-?\d+\.\d+/.test(value)) {
            return 'float';
        }
        if (/^-?\d+/.test(value)) {
            return 'int';
        }if(value[0]=='\''){ 
            if(value[value.length-1]=='\'') {
                if(value.length==3)
                    return 'char';
                else{
                    return 'string';
                }
            }else
                return ('error missing \'');
        }
    }

    eatBodyError(){
        while (this.inBody() && this.validToken()) this.move();  
    }
    generateBodyError(env, left, error_type=1){
        if(left.kind == 'Number' || left.kind == 'String'){
        if(error_type==1)
            while(this.getCurrentToken().type!==TokenType.newLine)
                this.move();
        else{
            this.eatBodyError();
        }
            return {error:(`${left.value} should be lvalue\n`)};
        }
        if(env.lookUp(left.value)==null){

            let error = {error:(`${left.value} is not declared yet\n`)};
            if(error_type==1)
            while(this.getCurrentToken().type!==TokenType.newLine)
            this.move();
            else{
                this.eatBodyError();
            }
            return error;
        }return true
    }
    produceAST(srcCode, env, lang){
        SymbolFunction.tracker = {};
        this.tokens = this.getLexical(srcCode);
        let program ={
            kind:'program',
            body:[]
        };
        this.lang = lang;
        this.line=0
        while(this.validToken()){
            if(!this.inBody() || this.getCurrentToken().value=='\n'){
                this.move();
                continue;
            }
            program.body.push(this.parse_statement(env));
            this.line ++;
        }
        program.body.push({kind:'', value:TokenType.EOC});
        return program
    }

    parse_statement(env){
        const type = this.getCurrentToken().type;
        switch(type){
            case TokenType.If:
                return this.pasre_if_statement(env);
            case TokenType.Repeat:
                return this.parse_repeate_statement(env);
            case TokenType.Else:
                return this.parse_else_statement(env);
            case TokenType.Int: case type==TokenType.Float: case TokenType.String: case TokenType.Create:
                return this.parse_var(env) 
            case TokenType.Print:
                return (this.parse_print_statement(env))
            case TokenType.Def:
                return (this.pasre_function_statement(env))
            case TokenType.Call:
                return (this.pasre_call_statement(env))
            case TokenType.Each:
                return (this.pasre_each_statement(env))
            case TokenType.CreateL:
                return (this.pasre_createList_statement(env))
            case TokenType.List:
                return (this.pasre_opList_statement(env))
            case TokenType.Return:
                return (this.pasre_return_statement(env))
            default:
                return this.parse_expr(env);
        }
    }
    
    pasre_return_statement(env){
        let body={};
        this.move();
        let statement = '';
        while(this.validToken() && this.getCurrentToken().value!='\n'){
            statement += this.move().value;
        }
        if(this.validToken() ){
            this.move();
        }
        body={
            kind:'returnStatement',
            statement
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
            
        this.move();//{
        let opvalue = '';
        const op = this.move().value;
        while (this.inBody() && this.validToken()) { 
            if(this.getCurrentToken().value!='}')
                opvalue += this.move().value;
        }

        if (body.body) {
            body.body.push(op+'('+opvalue+')');
        }else
            body['body'] = [op+'('+opvalue+')'];

        if(op.indexOf('append')!=-1){
            env.lookUp(listName)[0] = this.getVarType(opvalue);
        }
        if(!this.inBody())
            this.move();
        return body;
    }
    pasre_createList_statement(env){
        let body={};
        this.move();
        const listName = this.move().value;
        const lookup = env.lookUp(listName)

        let list_type;
        if(lookup != null){
            list_type = lookup[0];
        }else
            list_type='void*';

        const valid = env.declareVar([listName, [list_type, 'null']], this.line, 'list');
        if(valid!=undefined)return valid;
        body={
            kind:'createListStatement',
            listName, 
            list_type, 
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
        let vartype = this.move().value;
        let kind='declarationStatements'
        const varname = this.move().value; // same scope
        const lookup = env.lookUp(varname)
        if(lookup != null){
            vartype = lookup[0];
        }else
            vartype='void*';
            //kind='createListStatement';
        let varvalue = 0;
        if(this.getCurrentToken().type==TokenType.Equals){ 
            this.move();
            varvalue = this.parse_expr(env);
        }
        // check if the var is already declared
        const valid = env.declareVar([varname,  [vartype, 'null']], this.line, 'var');
        if(valid!=undefined)return valid;

        //check if the var is the same as the function name

        if(varname === this.current_scope && this.lang === 'C++'){
            return {error:`${varname} cannot hold the function name`};
        }

        //check if the var is the same as the one of the parameters name
        if(this.lang == 'C++'){
            const function_scope = SymbolFunction.lookUp(this.current_scope);
            if(function_scope !== undefined){
                const parameters = function_scope[0];
                if(parameters && parameters.hasOwnProperty(varname)){
                    return {error:`${varname} is exist in the parameters`};
                }
            }
        }
        
        let varBody = [
            vartype,
            varvalue
        ];
        
        body = {
            kind:kind,
            varname,
            varBody
            
        }
        env.declared = false;
        /*let console = document.getElementById("sidebar1");
        let p = document.createElement("p");
        p.textContent = vartype +' '+ varname;
        console.appendChild(p);*/
        return body;
    }
    parse_expr(env){
        return this.parse_assignment(env)
    }
    parse_assignment(env){
        let left = this.parse_additive_expr(env);
        if(left.kind!='BinaryExpression'){
            const error =  this.generateBodyError(env, left);
            if(error!=true)return error
        }

        if(this.getCurrentToken().type==TokenType.Equals){
            this.move();
            const right = this.parse_additive_expr(env);
            if(right['kind']){
                if(right.value==left.value)
                    return {error:(`Cannot assign a variable to iself\n`)};

                if(right.value){
                    const lookup = env.lookUp(left.value)
                    let value = '';
                    if(right.kind=='Identifier'){
                        if(env.lookUp(right.value) == null)
                            return {error:(`${right.value} is not decalred yet\n`)};
                        value = env.lookUp(right.value)[0]
                    }
                    else{
                        value = this.getVarType(right.value);
                        if(value=='string'){
                            lookup[1] = right.value.replace(/'/g, '\"');
                            right.value = lookup[1]
                        }

                    }
                    lookup[0] = value;
                    env.isset(true);
                }
                      /*  if(this.getVarType(right.value) != lookup[0]&&this.lang=='C++'){
                            return {error:(`${left.value} is ${lookup[0]}. Cannot change data type in C++`)};
                        }*/
            }
            left = {
                kind:'assignmentStatement',
                left,
                right
            };
        }
        return left;
    }
    pasre_para(env){
        let left = this.parse_additive_expr(env); 
        while(left.kind == 'SpecChar'){
            left =this.parse_additive_expr(env)
            left = {
                kind:'multiBinary',
                left
            }
        } //'multiCondition
        return left;
    }
    parse_additive_expr(env){
        //10+2-5
        let left = this.parse_multitive_expr(env); 

        while(this.getCurrentToken().value == '+' || this.getCurrentToken().value == '>' || this.getCurrentToken().value == '<'  || this.getCurrentToken().value == '%' || this.getCurrentToken().value == '&' || this.getCurrentToken().value=='|'){
            let operater = this.move().value;
            if(this.getCurrentToken().value=='&' || this.getCurrentToken().value=='|' || this.getCurrentToken().value=='='){
                operater += this.move().value;
            }
            const right = this.parse_multitive_expr(env);

            left = {
                kind: "BinaryExpression",
                left,
                right,
                operater 
            };
        }/*if(this.getCurrentToken().value=='\n')
            this.move()*/
        return left;
    }

    parse_multitive_expr(env){
        //10+2-5
        let left = this.parse_value_expr(env);

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
                this.move();
                let value = this.parse_additive_expr(env);
                this.move();
                return value;
            case TokenType.Identifier:
                return {kind:'Identifier', value:this.move().value};
            case TokenType.Equals:
                return {kind:'Equals', value:(this.move().value)};
            case TokenType.Number:
                const val = this.move().value;
                return {kind:'Number', value:parseFloat(val)};
            case TokenType.String:
                return {kind:'String', value:this.move().value};
            default:
                return {kind: 'Number', value: 0}
        }
    }
    pasre_call_statement(env){
        this.move();
        const function_name = this.move().value;
        let argsv='';
        let argsk='';
        let paramenters = SymbolFunction.lookUp(function_name);
        if(paramenters===undefined)
            return {error:`call block should be under the function '${function_name}'`}
        while(this.validToken() && this.getCurrentToken().value!='\n'){
            const argu_name = this.move();
            let val = this.move().value;
            
            val = this.parse_multitive_expr();
            if(val==='!')
                return {error:`missing one potential argument '${argu_name.value}'`}
            paramenters[0][argu_name.value] = this.getVarType(val.value);
            argsv += val.value;
            argsk += val.kind ;

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
        let varname_over = this.parse_value_expr(env);
        const error =  this.generateBodyError(env, varname_over, 2);
        if(error!=true)return error
        //check the type
            for (let index = 0; index < array.length; index++) {
                const element = array[index];
            }
        varname_over = varname_over.value
        const lookup = env.lookUp(varname_over);
        const var_type = lookup[3];
        if(var_type!='list' && lookup[0]!='string')
            return {error:`Cannot iterate over ${lookup[0]}`};
        const type = lookup[0];
        let iterateable_type;
        switch(type){
            case 'string':
                iterateable_type = 'char';
            default:
                iterateable_type = type;
        }
        body={
            kind:'eachStatement',
            varname,
            iterateable_type,
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
        let function_env = new Symbol(env);
        let return_type = 'void';
        let body={};
        this.move();
        const name = this.move().value;
        let args='';
        while(this.getCurrentToken().value!=='{'){
            args+=this.move().value;
            
        }
        const valid_declartion = SymbolFunction.declareVar(name, args);
        if(valid_declartion){  this.eatBodyError(); return {error: valid_declartion};}
        const params = SymbolFunction.lookUp(name)
        this.move(); //remove { 
        body={
            kind:'functionStatement',
            name,
            params,
            type:'void'
        };
        this.current_scope = name;
        while (this.inBody() && this.validToken()) { 
            const statement = this.parse_statement(function_env);
            if(statement.kind=='returnStatement'){
                return_type = this.getVarType(statement.statement);
                SymbolFunction.set_return_type(name, return_type);
                body.type = return_type;
            }
            if (body.body) {
                body.body.push(statement);
            }else
                body['body'] = [statement];
            this.line ++;
        }
        if(!this.inBody())
            this.move();
        return body;
    }

    pasre_if_statement(env){
        let if_env = new Symbol(env);
        let body={};
        this.move();
        let condition;
        if(this.getCurrentToken().value == 'then')
            condition = 'false'
        else
            condition = this.parse_expr(env);
        body={
            kind:'ifStatement',
            condition,
        };
        this.move(); //remove { 
        this.move(); //remove { 
        while (this.inBody() && this.validToken()) { 
            if(this.getCurrentToken().type == TokenType.newLine){this.move(); continue;}
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
        let repeat_env = new Symbol(env);
        let body={};
        this.move();
        let condition;
        if(this.getCurrentToken().value == '{')
            condition = 'false'
        else
            condition = this.parse_expr(env);
        body={
            kind:'whileStatement',
            condition,
        };
        this.move(); //remove { 
        while (this.inBody() && this.validToken()) { 
            if(this.getCurrentToken().type == TokenType.newLine){this.move(); continue;}
            const statement = this.parse_statement(repeat_env);
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
        let else_env = new Symbol(env);
        let body={kind:'else'};
        this.move();
        this.move(); //remove { 

        while (this.inBody() && this.validToken()) { 
            const statement = this.parse_statement(else_env);
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
