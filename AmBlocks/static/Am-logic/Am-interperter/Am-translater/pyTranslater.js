// get Python code and translate it to their visual representation
import { Parser } from "../Am-translater/parser.js";

export class BlockTranslater{
    constructor(){
        this.blockId = {};
        this.parser = new Parser();
        this.indexAt = 0
    }
    
    moveNode(array){
        const prev = array[this.indexAt];
        this.indexAt++;
        return prev;
    }
    canMove(array){
        return array.kind != ''
    }
    getAST(srcCode, env, lang){
        return this.parser.produceAST(srcCode, env, lang);
    }
    
    convertToBlock(pyCode){
        console.log(pyCode)
        let ast = this.getAST(pyCode).body;
        this.generateBlock(this.moveNode(ast));
        return ast; 
    }

    generateBlock(node){
        switch(node.kind){
            case 'printStatement':
                node.kind='printBlock'
                node.printValue=node.printValue.replace('(','').replace(')','')
        }
    }
}