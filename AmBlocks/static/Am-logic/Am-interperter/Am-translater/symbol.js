export class Symbol{
    constructor(parent){
        this.parent = parent;
        this.symbolTable = {};
    }

    declareVar(varattr){// s{{naem, [type, value]}
        if(!this.symbolTable.hasOwnProperty(varattr[0]))
            this.symbolTable[varattr[0]] = [varattr[1][0], varattr[1][1]];
        else
            return `${varattr[0]} is already defined!`;
    }
    assignVar(varattr){//[name, value]
        let at = this.resolve(varattr[0]);
        at.symbolTable[varattr[0]] = varattr[1];
    }

    resolve(varname){
        if(this.symbolTable.hasOwnProperty(varname))
            return this;
        if(this.parent==null)
            return null;//`${varname} is not defined yet`;

        return  this.parent.resolve(varname); 
    }

    lookUp(varName){
        let at = this.resolve(varName);
        return at!==null?at.symbolTable[varName]:at;
    }

}






