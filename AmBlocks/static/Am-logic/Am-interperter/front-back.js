import { Parser } from "./Am-translater/parser.js";
Array.prototype.insert = function (index, ...items) {
    this.splice(index, 0, ...items);
};
export class Blocks {
    static _instance;
  
    constructor() {
      this.blocks = $();
      this.rules = {
        'one-condition':'text',
        'operationLogic':'text',
        'many-condition':'text',
      };
      this.parser = new Parser();
    }
  
    static getInstance() {
      if (!Blocks._instance) {
        Blocks._instance = new Blocks();
      }
      return Blocks._instance;
    }

    getBlocks(){
        return this.blocks;
    }

    setBlocks(blocks){
        this.blocks = blocks
    }

    addBlock(block) {
        this.blocks=this.blocks.add(block);
    }
    ////////////////////  {{  BLOCKS -----------> STRING  }}  ////////////////////
    
    sortChildren(){
        this.blocks.sort(function(a, b) {
            let aTop = $(a).position().top;
            let bTop = $(b).position().top;
            return aTop - bTop;
        });
    }
    getBlocksAsString(){ // translate Blocks into Strings
        let textCode = "";
        let rules = this.rules;
        this.blocks.each(function(){
            let child = $(this);
            const rule = rules[child.attr('id')];
            const element = child.find(rule);
            textCode+=element.text() ;
            textCode+='\nnew '

        });
        return textCode;
    }
    translate() {
        this.sortChildren();
        // if cond then{ 
        //   x=1
        //   if cond then{ 
        //      if cond then
        //   }
        //   if cond then
        //}
        //this.parser.produceAST((("if 50>60 then Ammar=3 if x<b then  if xx<bx then")))
        // if 50>60 then { Ammar=3 if x<b then { if xx<bx then { repeat i<10 { v } } }z=1 }
        const src = "if 50>60 then { Ammar=3 if x<b then { if xx<bx then { repeat i<10 { v } else { u=1 } } }  else { tt=44 } z=1 }"; 
        console.log(src);
        console.log((this.parser.produceAST(src)));
    }

    lexer=(srcCode)=>{
        console.log(srcCode)
        const regex = /\b(if|while)\b|[<=>!]=?|[\d]+|[()]+/g;
        let tokens = [];
        let match;
        while(match = regex.exec(srcCode)){
            let result = 'BinaryExpression';
            if(match[0][0] >='0' && match[0][0]<='9')
                result = 'IntLitral';
                tokens.push({
                    type:  ( match[0] === 'if') ? match[0]+'Statement' : result,
                    value: match[0]
                });
            }
        return tokens;
    }
}