export class Symbol{
    constructor(parent){
        this.parent = parent;
        this.symbolTable = {};
        this.declared = false;
    }

    declareVar(varattr, line, type){// s{{naem, [type, value]}
        const exist = this.symbolTable.hasOwnProperty(varattr[0]);
        if(!exist || exist && line == this.symbolTable[varattr[0]][2])
            this.symbolTable[varattr[0]] = [varattr[1][0], varattr[1][1], line, type];
        else{
            return {error:`${varattr[0]} is already defined!`};
        }
    }
    assignVar(varattr){//[name, value]
        let at = this.resolve(varattr[0]);
        at.symbolTable[varattr[0]] = varattr[1];
    }

    resolve(varname, resolve){
        if(this.symbolTable.hasOwnProperty(varname))
            return this;
        if(this.parent==null)
            return null;//`${varname} is not defined yet`;
        if(resolve)
            return  this.parent.resolve(varname); 
    }

    lookUp(varName, resolve=true){
        let at = this.resolve(varName, resolve);
        return (at!==null && at!==undefined) ?at.symbolTable[varName]:at;
    }

    isset(set){
        this.declared = set;
    }
}


export class SymbolFunction{
    static tracker = {} // tracks for a function existence by storing function name as a key and the value is the number of paramenters and their return type
    constructor(){
        this.function_name;
        this.return_type;
        this.function_env;
    }

   static declareVar(name, parameters){
        if(!SymbolFunction.tracker.hasOwnProperty(name)){
            this.function_name = name;
            let parameters_dic = [];
            let para_len = 0;
            if(parameters!=""){
                const p_list = parameters.split(','); // [{'a':'void'}, 'b']
                para_len = p_list.length;
                for (let index = 0; index < para_len; index++) {
                    const element = p_list[index];
                    parameters_dic.push({[element]:'void*'});
                }
            }
            SymbolFunction.tracker[name] = [parameters_dic, para_len, 'void'];
        }else{
            const p_list = SymbolFunction.tracker[name];
            const _list = parameters.split(',');
            if( _list.length == p_list[1] ){
                //check for type
                return `${name} is already defined`
            }
            SymbolFunction.tracker[name] = [_list, _list.length];
        } 
    }
    static set_scope(scope){
        SymbolFunction.tracker[this.function_name].push({'scope': scope});
    }

    static set_return_type(name, return_type){
        const p_list = SymbolFunction.tracker[name];
        p_list[p_list.length-1] = return_type;

    }
    static lookUp(functionName){
        const p_list = SymbolFunction.tracker[functionName];
        return p_list!==undefined?p_list[0]:p_list;
    }

}

export class SymbolClass{
    static tracker = {};

    static declareClass(c_name, private_env, public_env){
        SymbolClass.tracker[c_name] = [private_env, public_env];
    }

}