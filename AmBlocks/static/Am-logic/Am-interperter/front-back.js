import { Converter } from "./Am-converter/convert.js";
Array.prototype.insert = function (index, ...items) {
    this.splice(index, 0, ...items);
};
export class Blocks {
    static _instance;
    
    constructor() {
      this.covert = new Converter();
      this.blocks = $();
      this.rules = {
        'one-condition':'text',
        'operationLogic':'text',
        'many-condition':'text',
      };
      
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
        const This = this;
        this.blocks.each(function(){
            let child = $(this);
            const rule = rules[child.attr('id')];
            const element = child.find(rule);
            element.each(function(){
                const text = this.text();
                textCode+=text;
                if(text.indexOf('then')!==-1){
                    textCode+='{';

                }
            });
            if(textCode.indexOf('then')!==-1){ 
                textCode+='}';
            }


        });
        return textCode;
    }
    translate() {
        this.sortChildren();
        // if cond then{ 
        //   x=1
        //   if cond then{ 
        //      if cond then
        //}
        //   if cond then
        //}
        //this.parser.produceAST((("if 50>60 then Ammar=3 if x<b then  if xx<bx then")))
        // if 50>60 then { Ammar=3 if x<b then { if xx<bx then { repeat i<10 { v } } }z=1 }
        // { Ammar=3 if x<b then { if xx<bx then { repeat i<10 { v } else { u=1 } } }  else { tt=44 } z=1 }
        // = " Ammar=3 if x<b then { if xx<bx then { repeat i<10 { v } else { u=1 } } }  else { tt=44 } z=1"; 
        //const src = (this.getBlocksAsString());
        //console.log(src)
        //console.log(this.covert.covertString(src));
    }
}