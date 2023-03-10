export class Symbol{
    constructor(){
        this.symbolTable = {};
        this.parent = null;
    }

    pushVar(varattr){// {type, name, value}
        this.symbolTable[varattr[0]] = [varattr[1], varattr[2]];
    }

    lookUp(varName){
        return this.symbolTable[varName];
    }

}