import { Converter } from "./Am-converter/convert.js";
import { Symbol } from '../Am-interperter/Am-translater/symbol.js';
Array.prototype.insert = function (index, ...items) {
    this.splice(index, 0, ...items);
};
export class Blocks {
    static _instance;
    
    constructor() {
      this.covert = new Converter();
      this.blocks = $();
      this.env = new Symbol();
      this.error = '';    
      this.index = 0;
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
    clean(){
        this.blocks.empty().remove();
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
    generateVarType(statement){// continue from ' x ' let x = 3 remove let down there
        let type = '';
        for (let index = 2; index < statement.length; index++) {
            const value = statement[index];
            type = this.getVarType(value);
        
        }
        return type + statement.join('');
    }
    getChildren(currentElement, search){
        let nextchild = currentElement.querySelectorAll(`.${search}`);
        let code = '';
        for (let index = 0; index < nextchild.length; index++) {
            const element = nextchild[index];
            code+=this.getBlocksAsString(element, 1, 1);
            this.index ++;

        }return code;
    }

    getBlocksAsString(currentElement, at=1, childat=1){
        let textCode='';
        let saveLastBlock = 0;
        let textAt = currentElement.querySelector(`text:nth-of-type(${at})`);
        if(textAt)
            textAt = textAt.textContent;
        while(textAt && textAt.length){
            at++;
            // process block
            //
              
            if(currentElement.id == 'else'){
                textCode+= 'else'+ '{';
                textCode+=this.getChildren(currentElement, 'make-var');
                textCode+=this.getChildren(currentElement, 'draggable');
                textCode+='}';
                return textCode;
            }
            if(currentElement.id == 'if'){
                textCode+= 'if';
                const allAmText = currentElement.querySelectorAll('.Am-text');
                let index=1;
                while(allAmText[index].textContent!=' then'){
                    textCode+=allAmText[index].textContent;
                    index++;
                }textCode+=' then {';
                textCode+=this.getChildren(currentElement, 'make-var');
                textCode+=this.getChildren(currentElement, `draggable:nth-of-type(${2})`);
                textCode+=' }';
                return textCode;
            }
            if(currentElement.id == 'while'){
                textCode+= 'repeat';
                const allAmText = currentElement.querySelectorAll('#condition .Am-text');
                let index=1;
                for (let index = 0; index < allAmText.length; index++) {
                    const element = allAmText[index];
                    textCode+=element.textContent;
                }textCode+=' {';
                textCode+=this.getChildren(currentElement, 'make-var');
                textCode+=this.getChildren(currentElement, 'draggable:not(.operation-logic)');
                textCode+=' }';
                return textCode;
            }
            if(currentElement.id == 'multiConditionBlock'){
                let nextchild = currentElement.children;
                for (let index = 0; index < nextchild.length; index++) {
                    const element = nextchild[index];
                    if(element.classList.contains('draggable')){
                        textCode+='('+this.getBlocksAsString(element, 1, 1)+ ')';
                    }
                    else if(element.classList.contains('am-drop')){
                        textCode+=element.querySelector('.ope').textContent;
                    }
                }
                  
                return textCode+'\n';
            }
            else if(currentElement.id == 'function'){
                const function_name = currentElement.querySelector('.Am-edit .Am-text').textContent.replace(' ', '_');
                const variables = currentElement.querySelector('.Am-text:nth-of-type(2)').textContent.replace('with:', '');

                textCode += 'def '+ function_name +' ' + variables+ '{';
                textCode+=this.getChildren(currentElement, 'make-var');
                textCode+=this.getChildren(currentElement, 'draggable');
                textCode+='}';
                return textCode;
            }else if (currentElement.id == 'print'){
                const printedValue =  currentElement.querySelector('.Am-edit .Am-text').textContent.replace(/\t/g, '').replace(/\u00A0/g, ' ');
                textCode += 'print ' + printedValue + '\n';
                //this.getVarType(printedValue);
                return textCode;
                
            }else if (currentElement.id == 'return'){
                const returnedValue =  currentElement.querySelector('.Am-edit .Am-text').textContent.replace(/\t/g, '').replace(/\u00A0/g, ' ');
                textCode += 'return ' + returnedValue + '\n';
                //this.getVarType(printedValue);
                return textCode;
                
            }else if (currentElement.id == 'indexAt'){
                const printedValue =  currentElement.querySelector('.Am-edit .Am-text').textContent.replace(/\t/g, '').replace(/\u00A0/g, ' ');
                textCode += '[' + printedValue + ']';
                return textCode;
                
            }else if(currentElement.id=='caller'){
                const call =  currentElement.querySelector(`.Am-text:nth-of-type(${2})`).textContent.replace(' ', '_');
                const args = currentElement.querySelectorAll('.Am-text');
                const edit_args = currentElement.querySelectorAll('.Am-edit');

                let arguements = '';
                for (let index = 0; index < edit_args.length; index++) {
                    arguements += args[index+2].textContent+' ';
                    arguements += '!'+edit_args[index].querySelector('.Am-text').textContent + ' ';
                    
                }
                textCode += 'call '+call+' ' + arguements + '\n';
                return textCode;
            }else if(currentElement.id=='each'){
                const varname =  currentElement.querySelector(`.Am-edit:nth-of-type(${1}) .Am-text`).textContent;
                let varname_over =  currentElement.querySelector(`.Am-edit:nth-of-type(${2}) .Am-text`).textContent;
                if(varname_over=='')
                    varname_over = []; 
                textCode += 'each '+varname+' '+varname_over+'{';
                textCode+=this.getChildren(currentElement, 'draggable.in');
                textCode+='}';
                return textCode;
           
            }else if (currentElement.id == 'make_var'){
                const varName =  currentElement.querySelector('text').textContent.replace(/\t/g, '').replace(/\u00A0/g, ' ')
                textCode += varName+' ';
                return textCode;

            }else if (currentElement.id == 'assigmnemt' || currentElement.id == 'operation'){
                const varName =  currentElement.querySelector('.Am-edit .Am-text').textContent.replace(/\t/g, '').replace(/\u00A0/g, ' ').replace(' ', '_');
                const allAmText = currentElement.querySelectorAll('.Am-text');
                const equalto = allAmText[allAmText.length - 1].textContent.replace(/\t/g, '').replace(/\u00A0/g, ' ').replace(' ', '_');
                let operater = allAmText[1].textContent;
                textCode += varName +` ${operater} `+ equalto;
                return textCode+'\n';

            }else if(currentElement.id=='condition'){
                const allAmText = currentElement.querySelectorAll('.Am-text');
                const firstOper = allAmText[0].textContent;
                const operation = allAmText[1].textContent;
                const lastOper = allAmText[2].textContent;
                textCode += firstOper +' '+ operation + ' ' + lastOper;
                return textCode+'\n';

            }else if (currentElement.id == 'create_list'){
                const listName =  currentElement.querySelector('.Am-edit .Am-text').textContent.replace(/\t/g, '').replace(/\u00A0/g, ' ').replace(' ', '_');
                textCode += 'allfatherL ' + listName;
                return textCode;

            }else if (currentElement.id == 'list'){
                const listname =  currentElement.querySelector(`.listname`).textContent.replace(' ','_');
                textCode += 'list ' + listname;
                let nextchild = currentElement.querySelector('.op');
                let opname=null
                let opvalue = ''
                let string='';
                if(nextchild){
                    opname =  nextchild.querySelector(`.opname`);
                    opvalue =  nextchild.querySelectorAll('.Am-edit .Am-text');
                    if(opvalue==null)
                        opvalue='';
                }
                textCode+='{'
                if(opname!=null){ 
                    this.index ++;
                    opname = opname.textContent.toLowerCase();
                }
                if(opvalue!==''){
                    for (let index = 0; index < opvalue.length; index++) {
                        const element = opvalue[index];
                        string += element.textContent.replace(/\t/g, '').replace(/\u00A0/g, ' ').replace(' ', '_');
                        if(index+1<opvalue.length)
                            string += ','
                    }

                }
                textCode+=opname==null?'':opname+' '+ string;
                textCode+='}'
                return textCode;
   
                
            }
          /*  if(textAt.indexOf('then')!==-1 || textAt.indexOf('else')!==-1 ){
                textCode+= textAt+ '{';
                let nextchild = currentElement.querySelectorAll('.draggable');
                for (let index = 0; index < nextchild.length; index++) {
                    const element = nextchild[index];
                    textCode+=this.getBlocksAsString(element, 1, 1);
                    childat++;
                }
                textCode+='}';
            // process normalBlock
            }
            else if(textAt.indexOf('print')!=-1 || this.isInput(textAt)){
                textCode = $(currentElement).find('.Am-text').text()+ (textAt.indexOf('print')!=-1?'\n':'');
                textCode.replace(/\t/g, '')
                this.getVarType('c');
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
                textAt = currentElement.querySelector(`.Am-text:nth-of-type(${at})`);
                if(textAt)
                    textAt = textAt.textContent;
            }*/
        }return textCode;
    };// if then {}
    translate(lang) {
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
        /*this.env.declareVar(['h',  ['int', '3']]);
        let src = "x = g * h";/*
        
        /*for(const b of this.blocks){ // set let before every var
            let child = b;
            src += this.getBlocksAsString(child);
        } */    
        let src = '';
        //src = 'create list ammar list ammar{ append 5 } int x=2 x = "x" print ammar [1] *2+4 \n' //list ammar
        //src = 'int x=1 string y="ammar" if x*x+x>10 {} print x+x+x*x\n float z=3.14 def do_something x, y, z {print x,y,z\n return x+y+z\n } call do_something x,y,z\n' //list ammar
        for (; this.index < this.blocks.length; this.index++) {
            const element = this.blocks[this.index];
            src += this.getBlocksAsString(element);
        }
        //src = this.generateVarType(src.split(' '));    
        //src += this.generateVarType('print f'.split(' '));
        //src = 'if then { int x=4 if then { float c=22.2 if then { string vv="dfdf" }else { print c\n vd=3 } } if then {} }'
        //src = 'string x = "loop" each i g {print(i)\n}';
        this.index = 0;
        const languages = (this.covert.covertString(src, this.env, lang));
        return [languages, this.error];
    }

    translateSteps(lang, current_block){
        if(current_block>=this.blocks.length)return[''];
        const translateBlock = this.getBlocksAsString(this.blocks[current_block]);
        const languages = (this.covert.covertString(translateBlock, this.env, lang));
//    save_variable_state(variables)
        return [languages];
    }
}