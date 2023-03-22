import { Converter } from "./Am-converter/convert.js";
Array.prototype.insert = function (index, ...items) {
    this.splice(index, 0, ...items);
};
export class Blocks {
    static _instance;
    
    constructor() {
      this.covert = new Converter();
      this.blocks = $();
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

    isInput(params) {
        return (/['"-?0-9]/).test(params)  
    }
    generateVarType(statement){
        let type = '';
        const value = statement[statement.length-1];
        if (/^-?\d+/.test(value)) {
            type='int '
        }if (/^-?\d+\.\d+/.test(value)) {
            type = 'float ';
        } else if(value[0]=='\''){ 
            if(value[value.length-1]=='\'') {
            type = 'string ';

        }else
            return 'error missing \''
    }
        return type + statement.join('');
    }

    getBlocksAsString(currentElement, at=1, childat=1){
        let textCode="";
        let saveLastBlock = '';
        let textAt = currentElement.querySelector(`text:nth-of-type(${at})`);
        if(textAt)
            textAt = textAt.textContent;
        while(textAt && textAt.length){
            at++;
            // process block
            if(textAt.indexOf('then')!==-1 || textAt.indexOf('else')!==-1){
                textCode+=textAt+' {';
                let nextchild = currentElement.querySelector(`.draggable:nth-of-type(${childat})`);
                while(nextchild){
                    textCode+=this.getBlocksAsString(nextchild, 1, 1);
                    childat++;
                    nextchild = currentElement.querySelector(`.draggable:nth-of-type(${childat})`);
                }textCode+='}';
            // process normalBlock
            }
            else if(textAt.indexOf('print')!=-1 || this.isInput(textAt)){
                textCode = $(currentElement).find('.Am-text').text()+ (textAt.indexOf('print')!=-1?'\n':'');
                textCode.replace(/\t/g, '')
                at++;
            }else if(textAt.indexOf('▾')!==-1){
                const $textElements = $(currentElement).find('.Am-text');
                saveLastBlock = $textElements[4].textContent;
                $textElements.slice(1, 4).each(function() {
                    textCode += $(this).text();
                  });
                  textAt = saveLastBlock;
                  childat++;
            }
            else{
                textCode+=textAt;
            }if(textAt==saveLastBlock)
                saveLastBlock = '';
            else{
                textAt = currentElement.querySelector(`text:nth-of-type(${at})`);
                if(textAt)
                    textAt = textAt.textContent;
            }
        }return textCode;
    };// if then {}
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
        // = " print('dsd') if x<b then { if xx<bx then { repeat i<10 { v } else { u=1 } } }  else { tt=44 } z=1"; 
        let src = "int x = '5' x=5*4 if x<b then { int c = 's'  }";
      /*  for(const b of this.blocks){
            let child = b;
             
            src += this.getBlocksAsString(child);

        }console.log(src);*/
        //src = this.generateVarType(src.split(' '));     

        const languages = (this.covert.covertString(src));
        return languages;
    }
}