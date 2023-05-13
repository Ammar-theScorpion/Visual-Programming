import * as Type from './ast.js' 
import { tokenize, TokenType } from "./lexical.js";
import { Symbol, SymbolClass, SymbolFunction } from './symbol.js';
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
        if(value==='NULL')
            return 'void*'
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

    handle_assigment(left, env){
        let op = '';
        let right_op = 'NULL';
        this.move();
        let right;
        // check for prompt
        if(this.getCurrentToken().value == 'prompt'){
            this.move();this.move();this.move();
            let prompt = `'Enter ${left.value}'`  
            if(this.getCurrentToken().type!=TokenType.EOC && this.getCurrentToken().type !== TokenType.newLine)
                prompt = this.move().value;
            right='input('+prompt+')'.replace("\n", '')

        }else{
                right = this.parse_additive_expr(env);
            if(right['kind']){
             
                if(right.value!=null){
                    const lookup = env.lookUp(left)
                    let value = '';

                    if(right.kind=='Op'){

                        op = this.move().value+' ';
                        if(op.indexOf('(')!==-1){
                            op=op.replace('(','')
                            while(this.getCurrentToken().value!==')'){
                                right = this.parse_additive_expr(env);
                                right_op+=right.value;
                            }this.move();
                        }
                        else
                            right = this.parse_additive_expr(env);
                    }
                    if(right.kind=='Identifier'){
                        if(right_op=='')
                            right_op = right.value;
                        const function_scope = SymbolFunction.lookUp(this.current_scope);
                        if(function_scope !== undefined){
                            const parameters = function_scope[0];
                            if(parameters && parameters.hasOwnProperty(right.value)){
                                value = parameters[right.value]
                            }
                        }else{
                            
                            if(env.lookUp(right.value) == null)
                                return {error:(`${right.value} is not decalred yet\n`)};
                            value = env.lookUp(right.value)[0]
                        }
                    }
                    else{
                        value = this.getVarType(right.value);
                        if(value=='string'){
                            lookup[1] = right.value.replace(/'/g, '\"');
                            right.value = lookup[1]
                            
                        }
                        if(right_op=='NULL')
                            right_op = right.value;

                    }

                    if(lookup[0] !=='void*' &&  value != lookup[0]&& this.lang=='C++'){
                        return {error:(`${left.value} is ${lookup[0]}. Cannot change data type in C++`)};
                    }
                    lookup[0] = value;
                    env.isset(true);
                }

            }
        }
        right.value = op + right_op
        
        left = {
            kind:'assignmentStatement',
            left,
            right
        };
        return left;
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
            case TokenType.For:
                return this.parse_for_statement(env);
            case TokenType.Else:
                return this.parse_else_statement(env);
            case TokenType.Int: case type==TokenType.Float: case TokenType.String: case TokenType.Create:
                return this.parse_var(env) 
            case TokenType.Print:
                return (this.parse_print_statement(env))
            case TokenType.Def:
                return (this.pasre_function_statement(env))
            case TokenType.Class:
                return (this.pasre_class_statement(env))
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
        if(op === '}')
            return body['body']=[]
        while (this.inBody() && this.validToken()) { 
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
            env, 
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
        let varname = this.move().value; // same scope
        while(this.getCurrentToken().type!==TokenType.Equals){ // check if valid var name
            varname += this.move().value;
        }
        if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(varname)) {
            while(this.getCurrentToken().type!==TokenType.newLine)
                this.move();
            return {error:`Symbol '${varname[varname.length-1]}' cannot be in a var name`};
        }
          
        const lookup = env.lookUp(varname, false)
        if(lookup != null){
            vartype = lookup[0];
        }else
            vartype='void*';
            //kind='createListStatement';
            // check if the var is already declared
            const valid = env.declareVar([varname,  ['void*', 'null']], this.line, 'var');
            if(valid!=undefined)return valid;
            // check if the var is already declared
        let varvalue = 'null';
        if(this.getCurrentToken().type==TokenType.Equals){ 
            
            let left = this.handle_assigment(varname, env);
            if(left['error']) return left.error;
            varvalue = left.right.value;
            vartype = this.getVarType(varvalue)
        }
 
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
            varBody,
            env
            
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
        if(left.kind!='BinaryExpression' && left.kind!='private' && left.kind!='public'){
            const error =  this.generateBodyError(env, left);
            if(error!=true)return error
        }
 

        if(this.getCurrentToken().type==TokenType.Equals){
            left = this.handle_assigment(left);
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
                return {kind:'SpecChar', value:(this.move().value)};
                this.move();
                let value = this.parse_additive_expr(env);
                this.move();
            case TokenType.Public: case TokenType.Private:
                let valu = this.move().value
                return {kind:`${valu}`, value:valu};
            case TokenType.Identifier:
                let v  = this.getCurrentToken().value
                if(v.indexOf(':')!==-1)
                    return {kind:'Op', value:v};

                return {kind:'Identifier', value:this.move().value};
            case TokenType.Equals:
                return {kind:'Equals', value:(this.move().value)};
            case TokenType.Number:
                const val = this.move().value;
                return {kind:'Number', value:parseFloat(val)};
            case TokenType.String:
                return {kind:'String', value:this.move().value};
            case TokenType.Up: case TokenType.Low: case TokenType.Cat:
                    return {kind:'Op', value:this.getCurrentToken().value};
            case TokenType.NULL:
                    return {kind:'NULL', value:this.move().value};
            default:
                return {kind: 'Number', value: null}
        }
    }
    pasre_call_statement(env){
        this.move();
        const function_name = this.move().value;
        let argsv=[];
        let argsk='';
        let paramenters = SymbolFunction.lookUp(function_name);
        if(paramenters===undefined)
            return {error:`call block should be under the function '${function_name}'`}
        let f =0
        while(this.validToken() && this.getCurrentToken().value!='\n'){
            const argu_name = this.move();
            let val = this.move().value;
            
            val = this.parse_multitive_expr();
            if(val==='!')
                return {error:`missing one potential argument '${argu_name.value}'`}
            paramenters[f++][argu_name.value] = this.getVarType(val.value);
            argsv.push(val.value);
            argsk += val.kind ;

        }this.move();
        argsv = argsv.join(', ');
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
            this.line ++;

        }
        this.move();
        return body;
    }
    pasre_class_statement(env){
        let private_env = new Symbol(env);
        this.move();
        const name = this.move().value;

        let body={
            kind:'classStatement',
            name,
        };
        this.move(); //remove { 
        let pr;
        while (this.inBody() && this.validToken()) { 
            if(this.getCurrentToken().value=='\n'){
                this.move();
                continue;
            }
            const statement = this.parse_statement(private_env);
            if(statement.kind == 'public'){
                pr = private_env;
                private_env = new Symbol(env);
            }
            if (body.body) {
                body.body.push(statement);
            }else
                body['body'] = [statement];
            this.line ++;
        }
        if(!this.inBody())
            this.move();
        SymbolClass.declareClass(name, pr, private_env);

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
            if(this.getCurrentToken().value=='\n'){
                this.move();
                continue;
            }
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
        SymbolFunction.set_scope(return_type);
        
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
            this.line ++;

        }
        if(!this.inBody())
            this.move();
        return body;
    }

    parse_for_statement(env){ // dic[index_name] = [from, to, by];
        let for_env = new Symbol(env);
        let body={
            kind:'forStatement',
        };
        this.move();
        let indexes = {};
        while(this.getCurrentToken().value !== '{'){ // recieve all indexes
            const name = this.move().value;
            const from = this.move().value;
            const to = this.move().value;
            const by = this.move().value;

            indexes[name] = [from, to, by];
        }
        body['indexes'] = indexes;
        this.move(); //remove { 
        while (this.inBody() && this.validToken()) { 
            if(this.getCurrentToken().type == TokenType.newLine){this.move(); continue;}
            const statement = this.parse_statement(for_env);
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
            this.line ++;

        }
        if(!this.inBody())
            this.move();
        return body;
    }
}
