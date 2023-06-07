import { tokenize, TokenType } from "./lexical.js";

import { Symbol, SymbolClass, SymbolFunction } from './symbol.js';
export class Parser{

    constructor(){
        this.tokens = [];
        this.lang = '';
        this.line = 0;
        this.current_scope = null;
        this.reservedCppWords = ['if', 'else','int', 'float', 'string',  'each',  'class', 'private', 'public', 'NULL',  'for'];
        this.reservedPythonWords = ['if', 'else','then', 'for', 'while', 'def', 'class', 'print', 'return', 'None'];
        this.reservedCommonWords = this.reservedCppWords.concat(this.reservedPythonWords);

        this.func_body = {};
        this.program ={
            kind:'program',
            body:[]
        };  
    }

    isValidCppVariable(variable) {
        var regex = new RegExp('^\\b(?!' + this.reservedCppWords.join('|') + '\\b)\\w+$');
        return regex.test(variable);
      }
      

    isValidPythonVariable(variable) {
        var regex = new RegExp('^\\b(?!' + this.reservedPythonWords.join('|') + '\\b)\\w+$');
        return regex.test(variable);
    }
    isValidCommonVariable(variable) {
        var regex = new RegExp('^\\b(?!' + this.reservedCommonWords.join('|') + '\\b)\\w+$');
        return regex.test(variable);
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
    getListOpType(lst, env){
        switch((lst.ops).toLowerCase()){
            case "len":
                return 'int';
            case 'pop':
                let lstname = lst.listName.value;
                return env.lookUp(lstname)[0];
            case 'idx':
                let lsname = lst.onstring;
                let type= env.lookUp(lsname)[0];
                if (type == 'string')
                    type = 'char';
                else{
                    let on = lst.on;
                    if(on.kind=='Identifier')
                    return type[env.lookUp(on.value)[2]];
                    else
                    return type[on.value];
                }   

            
        }
    }
    getMathType(mth, env){
        /* check mathexpression first * */
        if(mth.kind === 'mathStatement'){
            return this.getMathType(mth.on);
        }
        if(mth.kind === "Identifier"){
            const lookup = env.lookUp(mth.value);
            if(lookup!=null){
                if(lookup[3] == 'list')
                    return['std::vector<'+(lookup[0].length==0?'void*':lookup[0][0])+'> '];
                return lookup;
            }
            return 'undefined'
        }
        if(mth.kind === "returnStatement"){
            let allreturn ='';
            for (let index = 0; index < mth.returnV.length; index++) {
                const element = mth.returnV[index];
                let r = this.getMathType(element, env);
                if(r['error'])return r.error;
                    switch(r[3]){
                        case 'list':
                            allreturn += 'std::vector<'+r[0]+'> ';break;
                        case 'set':
                            allreturn += 'std::set<'+r[0]+'> ';break;
                        default:
                            if(r.indexOf('var')!==-1)
                                allreturn += r[0];
                            else
                                allreturn += r;
                            allreturn += ' ';

                    }
            }
            return allreturn === '' ? 'void':allreturn;
        }
        if(mth.kind === "stringStatement"){
            return this.getListOpType(mth, env);
        }if(mth.kind === 'opListStatement'){
            return this.getListOpType(mth, env);
        }if(mth.kind === "CallStatement"){
            const function_scope = SymbolFunction.tracker[mth.function_name];

            if(this.lang === 'C++' && function_scope[2] === 'void'){
                return {error:'void function cannot be lvalue'};
            }

            return function_scope[2];
        }if(mth.kind === 'MBinaryExpression'){
            for (let index = 0; index < mth.body.length; index++) {
                const element = mth.body[index];
                return this.getMathType(element, env);
            }
        }
        if(mth.kind === 'BinaryExpression'){
            let expressionStr=[]
            let all = this.traverseExpression(mth, expressionStr, env);
            for (let index = 0; index < all.length; index++) {
                if(Array.isArray(all[index]))
                all[index] = all[index][0]
                
            }
            let o = '';
            let returnt = '';
            if(all.includes('>') || all.includes('<'))
                returnt = 'bool';
            if(all.includes('&&') || all.includes('||')){
                if(all.includes('string')){
                    return { error: 'string not supported here' };
                }
                o = 'bool';
            }
            // for operations
            if (all.includes('string')) {
                
                if (all.includes('int') || all.includes('float')) {
                    if(this.lang ==='Python' && all.includes('int') && all.includes('+') )
                        o= 'string';
                    return { error: 'this binary operation is not supported' };
                } else {
                    let index = all.indexOf('string');
                    let opertaor = all[index+1];
                    if(this.lang ==='C++'){
                        if (opertaor == ('-') ||opertaor == ('*') || opertaor == ('/')) {
                            return 'Invalid string operation';
                        }
                    }
                        o= 'string';
                }
            } else if (all.includes('float')) {
                if (all.includes('int')) {
                        o= 'float';
                } else {
                    return { error: 'this binary operation is not supported' };
                }
            } else if (all.includes('int')) {
                    o= 'int';
            } else {
                return { error: 'this binary operation is not supported' };
            }
            
            if(returnt === ''){
                return o;}
                
            return returnt
        }
        return this.getVarType(mth.value, env);
    }

     traverseExpression(node, expressionStr, env) {
            if (node.kind === 'BinaryExpression') {
            this.traverseExpression(node.left, expressionStr, env);
            expressionStr.push(node.operater)
            this.traverseExpression(node.right, expressionStr, env);
            } else {
            expressionStr.push(this.getMathType(node, env));
            }
        return expressionStr
     }

    getVarType(value, env=null){
       
        // retrun datatype based on the value

         if(value ==='true' || value ==='false')return 'bool';
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
         if(env){
            let type = env.lookUp(value);
            if(type[3] == 'list')
                return'std::vector<'+(type[0].length==0?'void*':type[0])+'> ';
            return type[0];
        }
    }

    eatBodyError(){
        while (this.inBody() && this.validToken()) this.move();  
    }
    generateBodyError(env, left, error_type=1, onleft=false){

        if(left.kind == 'Number' || left.kind == 'String'){
            if(!onleft)  
                return left;
            if(error_type==1)
            while(this.getCurrentToken().type!==TokenType.newLine)
            this.move();
            else{
                this.eatBodyError();
            }
            return {error:(`${left.value} should be lvalue\n`)};
        }

        const function_scope = SymbolFunction.lookUp(this.current_scope);
        if(env.lookUp(left.value)==null && (function_scope == undefined || function_scope.length==0)){

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

    handle_assigment(left, env, kind=''){
        let op = '';
        let right_op = 'NULL';
        this.move();
        let varvalue;
        let vartype;
        let right;

        let datatype = 'var';
        // check for prompt
        if(this.getCurrentToken().value == 'prompt'){
            this.move();this.move();this.move();
            let prompt = `'Enter ${left}'`  
            if(this.getCurrentToken().type!=TokenType.EOC && this.getCurrentToken().type !== TokenType.newLine)
                prompt = this.move().value;
            right='input('+prompt+')'.replace("\n", '')

        }else{
          
                right = this.parse_statement(env);
            if(right['kind']){
                const lookup = env.lookUp(left)
                if(right.value!=null){ /// parse normal assi
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
                        if(right_op=='NULL')
                            right_op = right.value;
                        const function_scope = SymbolFunction.lookUp(this.current_scope);
                        if(function_scope !== undefined && function_scope.length!==0){
                            const parameters = function_scope[0];
                            if(parameters && parameters.hasOwnProperty(right.value)){
                                value = parameters[right.value]
                            }
                        }
                            
                            if(env.lookUp(right.value) == null)
                                return {error:(`${right.value} is not decalred yet\n`)};
                            value = this.getVarType(right.value, env);
                            if(value.indexOf('vector')!==-1){
                                datatype = 'list'
                                kind[0] = 'createListStatement';
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
                        return {error:(`${left} is ${lookup[0]}. Cannot change data type in C++`)};
                    }
                    lookup[0] = value;
                    lookup[2] = right.value;
                    lookup[3] = datatype;
                    env.isset(true);
                    right.value = op + right_op
                    varvalue = right.value;
                    vartype = this.getVarType(varvalue)

                }else{
                    // get varvalue from math if math
                    vartype = this.getMathType(right, env);
                    if(vartype['error'])
                        return vartype;
                    varvalue = right;
                    lookup[0] = vartype;

                }

            }
        }
        
        left = {
            kind:'assignmentStatement',
            left,
            right
        };
        return [left, varvalue, vartype];
    }

    produceAST(srcCode, env, lang){
        SymbolFunction.tracker = {};
        this.tokens = this.getLexical(srcCode);
        this.program ={
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
            this.program.body.push(this.parse_statement(env));
            this.line ++;
        }
        this. program.body.push({kind:'', value:TokenType.EOC});
        return this.program
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
            case TokenType.Int: case type==TokenType.Float: case TokenType.Create:
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
            case TokenType.op:
                return (this.pasre_operation_statement(env))
            case TokenType.Break:
                    return this.pasre_break_statement(env)
            case TokenType.Strings:
                return this.pasre_string_statement(env)
            case TokenType.Math:
                return this.pasre_math_statement(env)

            ///////HANDLe GAME//////////////
            case TokenType.turn:
                    return this.pasre_game_turn(env)
            case TokenType.move:
                    return this.pasre_game_move(env)
            case TokenType.color:
                    return this.pasre_game_color(env)
            case TokenType.colour:
                    return this.pasre_game_colour(env)
            case TokenType.pen:
                    return this.pasre_game_pen(env)
            default:
                return this.parse_expr(env);
        }
    }
    




    ////////GAME BLOCKS///////

    pasre_game_colour(env){
        this.move();
        let color = [];
        while(this.getCurrentToken().value !=='\n')
            color.push(this.parse_statement(env));
        let body = {
            kind:'colourGame',
            color:color,
        };
        return body;
    }

    pasre_game_color(env){
        this.move();
        let color = '';
        while(this.getCurrentToken().value !=='\n')
            color += this.move().value;
        let body = {
            kind:'colorGame',
            color:color,
        };
        return body;
    }
    pasre_game_turn(env){
        this.move();
        let direction = this.move().value;
        let by = this.parse_statement(env);
        let body = {
            kind:'turnGame',
            dirc:direction,
            by:by
        };
        return body;
    }
    pasre_game_pen(env){
        this.move();
        let direction = this.move().value;
        let body = {
            kind:'penGame',
            dirc:direction,
        };
        return body;
    }
    pasre_game_move(env){
        this.move();
        let direction = this.move().value;
        let by = this.parse_statement(env);
        let body = {
            kind:'moveGame',
            dirc:direction,
            by:by
        };
        return body;
    }

    pasre_break_statement(env){
        this.move();
        let direction = this.move().value;
        let body = {
            kind:'BreakStatement',
            dirc:direction,
        };
        return body;
    }
    pasre_operation_statement(env){
        this.move();
        let body = {
            kind:'MBinaryExpression',
        };
        
        while(this.validToken() && this.getCurrentToken().value!='\n'){
            const statement = this.parse_statement(env);
            if (body.body) {
                body.body.push(statement);
            }else
                body['body'] = [statement];
        }if(this.getCurrentToken().value=='\n') this.move()/////\n
        for (let index = 0; index < body.body.length; index++) {
            const element = body.body[index];
            try{let e = this.getMathType(element, env);
            if(e['error']) return e['error'];
        }catch{}
            
        }

        return body;
    }
    pasre_string_statement(env){
        this.move();
        const op = this.move().value;
        const onstring = this.move().value;
        let on='';
        if(this.getCurrentToken().value !== '\n'){
            on= this.parse_statement(env);
        }
        this.move();
        let body={
            kind:'stringStatement',
            ops:op,
            on:on,
            onstring:onstring
        };
        return body;
    }
    pasre_math_statement(env){
        this.move();
        const op = this.move().value;
        const on = this.parse_statement(env);
        
        let body={
            kind:'mathStatement',
            op:op,
            on:on
        };
        return body;
    }
    pasre_return_statement(env){
        this.move();
        let returnV = [];
            while(this.validToken() && this.getCurrentToken().value!='\n'){
                returnV.push(this.parse_statement(env));
            }
        if(this.validToken() ){
            this.move();
        }
        return{kind: 'returnStatement', returnV};
    }
    pasre_opList_statement(env){
        let body={};
        this.move();
        let listName = this.parse_additive_expr(env);
        if(listName.kind!='BinaryExpression' && listName.kind!='private' && listName.kind!='public'){
            const error =  this.generateBodyError(env, listName, true);
            if(error!=true)return error
        }
        body={
            kind:'opListStatement',
            listName,
        };
            
        this.move();//{
        let opvalue=[];
       
        let type=[];
        while (this.inBody() && this.validToken()) { 
            let x = this.parse_statement(env);
            if(x['error'])return x.error;
            let val;
            if(x.value){
                val = this.getVarType(x.value, env);
            }else{

                val = this.getMathType(x, env);
            }
            type.push(val);
            opvalue.push(x);
        }

        /// get list/set type
        const firstElement = type[0];
        let final_type = firstElement;
        
        for (let i = 1; i < type.length; i++) {
            if (type[i] !== firstElement) {
                final_type = 'std::auto';break;
            }
        }
        /// get list/set type
        try{
            env.lookUp(listName)[0] = final_type;
        }catch{}

        body['body'] = opvalue;
        
        if(!this.inBody())
            this.move();

        body['ops'] = this.move().value; // get op type
        body['env'] = env; // get op type
        this.move()
        return body;
    }
    pasre_createList_statement(env){
        let body={};
        this.move();
        const dtype = this.move().value;
        const listName = this.move().value;
        const lookup = env.lookUp(listName)

        let list_type;
        if(lookup != null){
            list_type = lookup[0];
        }else
            list_type='void*';

        let opvalue = [];
        let type=[];
        let final_type=  'void*';
        if(this.getCurrentToken().value==='{'){
            this.move()
            while (this.inBody() && this.validToken()) { 
                let x = this.parse_statement(env);
                if(x['error'])return x.error;
                let val;
                if(x.value){
                    val = this.getVarType(x.value, env);
                }else{
    
                    val = this.getMathType(x, env);
                }
                type.push(val);
                opvalue.push(x);
            }
            
        
        }
        const valid = env.declareVar([listName, [type, opvalue]], this.line, dtype);
        if(valid!=undefined)return valid;
        body={
            kind:'createListStatement',
            listName, 
            list_type, 
            dtype, 
            env, 
        };
        return body;
    }
    parse_print_statement(env){
        let body={};
        this.move();
        let printValue = [];
        let printType = [];
        let eachbody = [];
            while(this.validToken() && this.getCurrentToken().value!='\n'){
                let type = this.parse_statement(env);
                if(this.lang === 'C++'){
                    if(type['kind'] == 'CallStatement')
                        if(SymbolFunction.tracker[type.function_name][2] === 'void')
                            return {error:'Cannot print void function'}
                }
                printValue.push(type);
                if(type.kind === 'Identifier')
                printType.push(env.lookUp(type.value)[3]);
                else
                printType.push(type.value);
            }
          
        if(this.validToken() ){
            this.move();
        }
        body={
            kind:'printStatement',
            printValue,
            printType,
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
        ///******** check for reserived words ************ */
        if(this.lang === 'C++'){ 
            if(!this.isValidCppVariable(varname))
                return {error:`cannot declare'${varname}' reserved word in C++`};

        }else{
            if(!this.isValidPythonVariable(varname))
                return {error:`cannot declare'${varname}' reserved word in Python`};
        }
 
        ///******** check for reserived words ************ */
          
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
            
            let resutl = this.handle_assigment(varname, env, [kind]);
            if(resutl['error']) return resutl['error'];
            let left = resutl[0];
            if(left.right['error']) return left.right;
            varvalue = resutl[1];
            vartype = resutl[2];
 
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
        if(left['error'])return left.error
        if(left.kind!='BinaryExpression' &&  left.kind!='private' && left.kind!='public'){
            const error =  this.generateBodyError(env, left, true);
            if(error!=true)return error
        }
 

        if(this.getCurrentToken().type==TokenType.Equals){
            let resutl = this.handle_assigment(left.value, env);
            if(resutl['error']) return resutl['error'];
            left = resutl[0];
        } //'multiCondition
        return left;
    }
    parse_additive_expr(env){
        //10+2-5
        let left = this.parse_multitive_expr(env); 
        if(!(this.getCurrentToken().value === '!')){ // stop proccessing. This belongs to another block ex(abs(0)+=1)
            while(this.getCurrentToken().value == '+' || this.getCurrentToken().value == '>' || this.getCurrentToken().value == '<'  || this.getCurrentToken().value == '-'  || this.getCurrentToken().value == '%' || this.getCurrentToken().value == '&' || this.getCurrentToken().value=='|' || 
            this.getCurrentToken().value == '+=' || this.getCurrentToken().value == '==' || this.getCurrentToken().value == '>=' || this.getCurrentToken().value == '<='  || this.getCurrentToken().value == '-='  || this.getCurrentToken().value == '%='){
                let operater = this.move().value;
                if(this.getCurrentToken().value=='&' || this.getCurrentToken().value=='|' || this.getCurrentToken().value=='='){
                    operater += this.move().value;
                }
                const right = this.parse_statement(env);

                left = {
                    kind: "BinaryExpression",
                    left,
                    right,
                    operater 
                };
            }/*if(this.getCurrentToken().value=='\n')
                this.move()*/
        }else
            this.move()
        return left;
    }

    parse_multitive_expr(env){
        //10+2-5
        let left = this.parse_value_expr(env);
        let er = this.generateBodyError(env, left);
        if(er['error'])return er;

        while(this.getCurrentToken().value == '*' || this.getCurrentToken().value == '*=' ||this.getCurrentToken().value == '/'||this.getCurrentToken().value == '/=' ){
            const operater = this.move().value;
            const right = this.parse_statement(env);
            let er = this.generateBodyError( env, right);
            if(er['error'])return er;


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
            case TokenType.Bool:
                return {kind:'Boolean', value:this.move().value};
            case TokenType.String:
                return {kind:'String', value:this.move().value};
            case TokenType.Up: case TokenType.Low: case TokenType.Cat:
                    return {kind:'Op', value:this.getCurrentToken().value};
            case TokenType.NULL:
                    return {kind:'NULL', value:this.move().value};
            default:
                return {kind: 'Number', value: 0}
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
        while(this.validToken() && this.getCurrentToken().value!='\n' && this.getCurrentToken()!='inside'){
            const argu_name = this.move();
            let val = this.move().value;
            
            val = this.parse_statement(env);
            if(val==='!')
                return {error:`missing one potential argument '${argu_name.value}'`}
            let s = this.getMathType(val, env);
            if(Array.isArray(s))
                s = s[0];
            paramenters[f++][argu_name.value] = s;
            argsv.push(val);
            argsk += val.kind ;

        }
         const body={
            kind:'CallStatement',
            function_name,
            argsv,
            argsk
        };
        while(this.getCurrentToken().value=='\n')
            this.move()
        ///////////////// 
//        switch 
if(this.getCurrentToken() !='inside'){
        let copy = this.tokens;
        this.tokens = [...this.func_body[function_name]];
        let fbody;
        for(let dict of this.program.body){
            if(dict.name == function_name){
                fbody = dict
                break;
            }
        }

            let function_env = new Symbol(env);
            let return_type = 'void';
            this.move();
            while(this.inBody() && this.validToken()) { 
                if(this.getCurrentToken().value=='\n'){
                    this.move();
                    continue;
                }
                const statement = this.parse_statement(function_env);
                if(statement.kind=='returnStatement'){
                    return_type = this.getMathType(statement, function_env);
                    SymbolFunction.set_return_type(function_name, return_type);
                    fbody.type = return_type;
                }
                if (fbody.body) {
                    fbody.body.push(statement);
                    
                }else
                    fbody['body'] = [statement];
                this.line ++;
            }
                if(!this.inBody())
                    this.move();
                SymbolFunction.set_scope(return_type);

            this.tokens = copy;
        }else
            this.move();

        return body;

    }
    pasre_each_statement(env){
        let body={};
        this.move();
        const varname = this.move().value;
        let varname_over = this.parse_value_expr(env);
        const error =  this.generateBodyError(env, varname_over, 2);
        if(error['error'])return error.error
        //check the type
        varname_over = varname_over.value
        const lookup = env.lookUp(varname_over);
        let var_type;
        let type = 'string';
        if(lookup){

            var_type = lookup[3];
            if(var_type!='list' && lookup[0]!='string')
            return {error:`Cannot iterate over ${lookup[0]}`};
             type = lookup[0];
        } 
        let iterateable_type;
        switch(type){
            case 'string':
                iterateable_type = 'char';break;
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
        // just store the func in symbol table for now

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
        body={
            kind:'functionStatement',
            name,
            params,
            type:'void'
        };
        this.current_scope = name;
         //remove { 
            let o=1, c=0;
        this.func_body[name] = [this.move()];
        while (this.validToken()) { 
            let a = this.getCurrentToken().value;
            if(a==='{')o++;
            else if(a==='}')c++
            let m = this.getCurrentToken().value;
            if(m=='call'){
                if(this.tokens[1].value == name){
                    m=[]
                    while(this.getCurrentToken().value !='\n'){
                        this.func_body[name].push(this.move());
                        
                    }
                    this.func_body[name].push(this.move());
                    this.func_body[name].push('inside');
                }
            }
            this.func_body[name].push(this.move());

            if(a=='}' && o-c === 0)break;
        }
      
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
            condition = this.parse_statement(env);
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
            const from = this.parse_statement(for_env);
            
            //store in symbol 
                const valid = for_env.declareVar([name, ['int', from]], this.line, 'int');
                if(valid!=undefined)return valid;
            //store in symbol 

            const to = this.parse_statement(for_env);
            let by = this.move().value;
            if(by==='-'){
                by+=this.move().value;
            }

            indexes[name] = [from, to, by];
        }
        body['indexes'] = indexes;
        body['env'] = for_env;
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
        let if_env = new Symbol(env);
        let body={};
        this.move();
        let condition;
        if(this.getCurrentToken().value == 'then')
            condition = 'false'
        else
            condition = this.parse_statement(env);
        body={
            kind:'whileStatement',
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

    parse_else_statement(env){
        let else_env = new Symbol(env);
        let body={kind:'else'};
        this.move();
        this.move(); //remove { 

        while (this.inBody() && this.validToken()) { 
            if(this.getCurrentToken().type == TokenType.newLine){this.move(); continue;}

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
