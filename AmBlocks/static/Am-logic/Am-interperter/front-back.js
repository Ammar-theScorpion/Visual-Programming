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
      this.error = '';    
      this.index = 0;
      this.insideSc = false;

      this.env = new Symbol() /// for debug mode to store var resutls
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
    sortX(allOperations){
        const elementsWithX = [];

        for (let i = 0; i < allOperations.length; i++) {
        const translationOper = allOperations[i].getAttribute('transform').match(/translate\(([^,]+),/)[1];
        const xValue = parseFloat(translationOper);

        // Push the element and its 'x' value to the array
        elementsWithX.push({
            element: allOperations[i],
            xValue: xValue
        });
        }

        elementsWithX.sort((a, b) => a.xValue - b.xValue);

        return elementsWithX.map(obj => obj.element);
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
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    getChildren(currentElement, search){
        const nextchild = currentElement.querySelectorAll(`:scope > ${search}`);

        let code = '';
        for (let index = 0; index < nextchild.length; index++) {
            const element = nextchild[index];
            code+=this.getBlocksAsString(element, 1, 1);
            this.insideSc = true

        }return code;
    }

    getBlocksAsString(currentElement, at=1, childat=1){
        let textCode='';
        let textAt = currentElement.querySelector(`text:nth-of-type(${at})`);
        if(textAt)
            textAt = textAt.textContent;
            // process block
            //
            ///     OOP         ///  
            if(currentElement.id == 'class'){
                const name  = this.capitalizeFirstLetter(currentElement.querySelector('.name').textContent);
                textCode = 'class ' + name + '{';
                let next = currentElement.querySelector('.access_modifiers');
                textCode += next.textContent;
                while (next.nextElementSiblinzg) {
                    textCode += this.getBlocksAsString(next.nextElementSibling);
                    next = next.nextElementSibling;
                  }
                  textCode += this.getBlocksAsString(next);

                textCode+='}';
                return textCode;
            }
            ///     OOP         ///  
            if(currentElement.id == 'else'){

                textCode+= 'else {';
                textCode += ` ${this.getChildren(currentElement, '.draggable:not(.selected)')}`;
                textCode+=' }';
                textCode+=' '+this.getChildren(currentElement, `.selected`);
                this.index+=(currentElement.querySelectorAll(`:scope > .draggable`)).length;//:scope > 
                return textCode;
            }
            if(currentElement.id == 'if'){
                textCode+= 'if';
                textCode+=' ' + currentElement.querySelector('.ofc').querySelector('.Am-text').textContent;
                textCode+=' '+this.getChildren(currentElement, `.draggable.circleOps`);
                textCode+=' then {';
                textCode += ` ${this.getChildren(currentElement, '.draggable:not(.selected):not(.circleOps)')}`;
                textCode+=' }';
                textCode+=' '+this.getChildren(currentElement, `.selected`);
                this.index+=(currentElement.querySelectorAll(`:scope > .draggable:not(.circleOps)`)).length;//:scope > 

                return textCode;
            }
            if(currentElement.id == 'counter'){
                //for (let index = 0; index < array.length; index++) 
                textCode+= 'for';
                const allinputs = currentElement.querySelector('svg .s');
                let dic = {};
                    const allAmText = allinputs.querySelectorAll('.main');
                    const from = allAmText[0].textContent;
                    let to = this.getChildren(allinputs, `.draggable.circleOps`);
                    if(to==='')
                        to = allAmText[1].textContent;

                    const by = allAmText[2].textContent;
                    const index_name = allinputs.querySelector('.varname').textContent;

                    textCode += ` ${index_name} ${from} ${to} ${by}`;    
                textCode += `{ ${this.getChildren(currentElement, '.draggable:not(.selected):not(.circleOps)')}`;
                textCode+=' }';
                textCode+=' '+this.getChildren(currentElement, `.selected`);
                this.index+=(currentElement.querySelectorAll(`:scope > .draggable:not(.circleOps)`)).length;//:scope > 

                return textCode;
            }
            if(currentElement.id == 'while'){
                textCode+= 'while';
                textCode+=' ' + currentElement.querySelector('.ofc').querySelector('.Am-text').textContent;
                textCode+=' '+this.getChildren(currentElement, `.draggable.circleOps`);
                textCode+=' then {';
                textCode += ` ${this.getChildren(currentElement, '.draggable:not(.selected):not(.circleOps)')}`;
                textCode+=' }';
                textCode+=' '+this.getChildren(currentElement, `.selected`);
                this.index+=(currentElement.querySelectorAll(`:scope > .draggable:not(.circleOps)`)).length;//:scope > 

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
                const function_name = currentElement.querySelector('.Am-edit.fname .Am-text').textContent.replace(' ', '_');
                
                const variables = currentElement.querySelector('.Am-text:nth-of-type(2)').textContent.replace('with:', '');

                textCode += 'def '+ function_name +' ' + variables+ '{';
                textCode += ` ${this.getChildren(currentElement, '.draggable:not(.selected):not(.circleOps)')}`;
                +this.getChildren(currentElement, '.draggable.circleOps') + '\n';
                textCode+=' }';

                //this.getVarType(printedValue);
                

                textCode+=' '+this.getChildren(currentElement, `.selected`);
                this.index+=(currentElement.querySelectorAll(`:scope > .draggable:not(.circleOps)`)).length;//:scope > 
                
                return textCode;
            }else if (currentElement.id == 'print'){


                const printedValue = currentElement.querySelector('.Am-edit .Am-text').textContent.replace(/\t/g, '').replace(/\u00A0/g, ' ')
                +this.getChildren(currentElement, '.draggable.circleOps');
                textCode += 'print ' + printedValue + '\n';
                textCode+=' '+this.getChildren(currentElement, `.selected`);
             
                this.index+=(currentElement.querySelectorAll(`:scope > .draggable:not(.circleOps)`)).length;//:scope > 
                //this.getVarType(printedValue);
                return textCode;
                
            }else if (currentElement.id == 'return'){
                const returnedValue = currentElement.querySelector('.Am-edit .Am-text').textContent.replace(/\t/g, '').replace(/\u00A0/g, ' ')+this.getChildren(currentElement, '.draggable');

                textCode += 'return ' + returnedValue + '\n';
                //this.getVarType(printedValue);
                return textCode;
                
            }else if (currentElement.id == 'string' || currentElement.classList.contains('string')){
                const operation =  currentElement.querySelector('.operation').textContent.replace(/\t/g, '').replace(/\u00A0/g, ' ');
                let onstring ="";
                if(operation==='cat' || operation==='idx' || operation==='spt')
                    onstring = currentElement.querySelector('.Am-edit .onstring').textContent.replace(/\t/g, '');
                let on = currentElement.querySelector('.Am-edit .Am-text.on').textContent.replace(/\t/g, '').replace(/\u00A0/g, ' ')+this.getChildren(currentElement, '.draggable');
                if(on==='')
                    on="'n'";

                if(operation === 'sub' || operation === 'repl'){
                    onstring = currentElement.querySelector('.Am-edit .onstring').textContent.replace(/\t/g, '');

                    on = currentElement.querySelector('.Am-edit .on').textContent.replace(/\t/g, '') + 
                               '.'+ currentElement.querySelector('.Am-edit .to').textContent.replace(/\t/g, '');
                               if(on===' ')
                               on="0";
                }
                textCode += `strings ${operation} ${onstring} ${on} \n`
                return textCode;
                
            }else if (currentElement.id == 'math'){
                const operation =  currentElement.querySelector('.operation').textContent.replace(/\t/g, '').replace(/\u00A0/g, ' ');
                let on = currentElement.querySelector('.on').textContent.replace(/\t/g, '').replace(/\u00A0/g, ' ')+this.getChildren(currentElement, '.draggable');
                if(on==='')
                    on='0';
                textCode += `math ${operation} ${on} `
                return textCode;
                
            }else if (currentElement.id == 'indexAt'){
                const printedValue = currentElement.querySelector('.Am-edit .Am-text').textContent.replace(/\t/g, '').replace(/\u00A0/g, ' ')+this.getChildren(currentElement, '.draggable');

                textCode += '[' + printedValue + ']';
                return textCode;
                
            }else if(currentElement.id=='caller'){
                
                const call =  currentElement.querySelector(`.Am-text:nth-of-type(${2})`).textContent.replace(' ', '_');
                const args = currentElement.querySelectorAll(':scope > .Am-edit .Am-text.name');
                const oargs = currentElement.querySelectorAll(':scope > .Am-text');
                const argss = currentElement.querySelectorAll('.draggable');

                let arguements = '';
                let index;
                for ( index = 2; index < oargs.length; index+=2) {
                    arguements += oargs[index].textContent+' ';
                    let n = null;
                    if(argss[index-2])
                        n = this.getChildren(currentElement, '.draggable');
                    if(n==null)
                        n = args[index-2].textContent;
                    arguements += '!'+ n + ' ';
                    
                }
                while(argss[index-2]){

                        let n = this.getChildren(currentElement, '.draggable');
                    arguements += '!'+ n + ' ';
                    index++;

                }
                textCode += 'call '+call+' ' + arguements + '\n';
                return textCode;

            }else if(currentElement.id=='each'){
                const varname =  currentElement.querySelector(`.Am-edit:nth-of-type(${1}) .Am-text`).textContent;
                let varname_over =  currentElement.querySelector(`.Am-edit:nth-of-type(${2}) .Am-text`).textContent;
                if(varname_over=='')
                    varname_over = "'n'"; 

                textCode += 'each '+varname+' '+varname_over+'{';
                textCode+=this.getChildren(currentElement, '.draggable.in:not(.selected):not(.circleOps)');
                textCode+='}';
                textCode+=' '+this.getChildren(currentElement, `.selected`);
                this.index+=(currentElement.querySelectorAll(`:scope > .draggable:not(.circleOps)`)).length;//:scope > 
                return textCode;
           
            }else if (currentElement.id == 'make_var'){

                const texts = currentElement.querySelectorAll('.Am-text');
                const varName = texts[1].textContent;
                let equalto = texts[3].textContent;
                const printedValue = this.getChildren(currentElement, '.draggable.circleOps');
                if(printedValue)
                    equalto = printedValue;
                equalto = ` = ${equalto.replace(/\t/g, '').replace(/\u00A0/g)}\n`
                textCode += 'allfather '+varName+equalto;

                textCode+=' '+this.getChildren(currentElement, `.selected`);
             
                this.index+=(currentElement.querySelectorAll(`:scope > .draggable:not(.circleOps)`)).length;//:scope > 

                return textCode;

            }else if (currentElement.id == 'operation' || currentElement.id == 'condition'){
                let allOperations = currentElement.querySelectorAll(':scope > .draggable');
                let allAmText = currentElement.querySelectorAll(':scope > .Am-edit:not(.op)');
                let allOps = currentElement.querySelectorAll(':scope > .am-drop');


                //////////////////////////////////////////////////////
                    ////////////////// sort first ///////////////////
                        allOperations = this.sortX(allOperations)
                        allAmText = this.sortX(allAmText)
                        allOps = this.sortX(allOps)
                        let alops = []; 
                        for (let index = 0; index < allOps.length; index++) {
                            const element = allOps[index].querySelector('.op');
                            alops.push(element);
                        }allOps = alops
                    ////////////////// sort first ///////////////////
                //////////////////////////////////////////////////////

                let alltext = '';
                let tcounter=0;
                let ocounter=0;
                for (let index = 0; index < allOps.length; index++) {

                    let translationEdit= 0;
                    if(tcounter < allAmText.length)
                        translationEdit=allAmText[tcounter].previousElementSibling.getAttribute('transform').match(/translate\(([^,]+),/)[0];

                    let translationOper = 0;
                    if(ocounter < allOperations.length)
                        translationOper=allOperations[ocounter].getAttribute('transform').match(/translate\(([^,]+),/)[0];

                    if(translationOper == translationEdit){
                        alltext += this.getBlocksAsString(allOperations[ocounter],1,1);
                    }else{
                         
                        alltext += allAmText[tcounter].querySelector('.Am-text').textContent;
                    }
                    tcounter++;   
                    alltext += allOps[index].textContent;
                }
                while(ocounter < allOperations.length){
                    alltext += this.getChildren(currentElement, '.draggable');
                    ocounter++;
                }
                if(tcounter < allAmText.length){
                    alltext += allAmText[allAmText.length-1].querySelector('.Am-text').textContent;
                    tcounter++;
                }
               return 'op '+alltext+'\n';
            

            }else if (currentElement.id == 'assigmnemt'){
                const name = currentElement.querySelector('.name').textContent 
                const op = currentElement.querySelector('.op').textContent 
                let eq = currentElement.querySelector('.eq').textContent 
                
                let pr=null;
                try{
                    pr = currentElement.querySelector('.pr').textContent 
                }catch(err){
                }
                let o = this.getChildren(currentElement, `.draggable.circleOps`);
                if(o!='')
                    eq = o;
                textCode += ` ${this.getChildren(currentElement, '.draggable:not(.selected):not(.circleOps)')}`;
                textCode+=' '+this.getChildren(currentElement, `.selected`);
                this.index+=(currentElement.querySelectorAll(`:scope > .draggable:not(.circleOps)`)).length;//:scope > 

                if(pr!=null)
                    eq = pr;
                return `${name} ${op} ${eq}\n ${textCode}`;

            } else if (currentElement.id == 'create_list'|| currentElement.id == 'create_set'){

                const lists = currentElement.querySelectorAll('.Am-text');

                textCode += 'allfatherL ' +currentElement.id.split('_')[1]+' '+ lists[1].textContent+' ';
                const values = currentElement.querySelectorAll('.list_create');
                let v=[];
                for (let index = 0; index < values.length; index++) {
                    let value = values[index].querySelector('.draggable');
                    if(!value){
                        value = values[index].querySelector('.op.Am-edit .Am-text');
                        v.push(value.textContent);
                    }else
                        v.push(this.getBlocksAsString(value))
                }
                if(v.length!==0)
                    return `allfatherL ${currentElement.id.split('_')[1]} ${lists[1].textContent} {${v.join(' ')}}\n`

                    textCode+=' '+this.getChildren(currentElement, `.selected`)+' ';
             
                    this.index+=(currentElement.querySelectorAll(`:scope > .draggable:not(.circleOps)`)).length;//:scope > 
    
                return textCode;

            }
            else if (currentElement.classList.contains('ops')){
                const name = currentElement.querySelector(`.dataStructureName`).textContent.replace(' ','_');
                
                const values =this.getChildren(currentElement, '.draggable.circleOps');
                let  printedValue = ''
                try{
                    printedValue= currentElement.querySelector('.Am-edit .Am-text').textContent.replace(/\t/g, '').replace(/\u00A0/g, ' ')
                }catch(err){
                    ///
                }
                if(values)
                    printedValue = values

                    textCode+=' '+this.getChildren(currentElement, `.selected`)+' ';
             
                    this.index+=(currentElement.querySelectorAll(`:scope > .draggable:not(.circleOps)`)).length;//:scope > 
                /*let v=[];
                for (let index = 0; index < values.length; index++) {
                    v.push(values[index].textContent);
                }*/
                return `list ${name} {${printedValue}} ${currentElement.id}\n ${textCode}`
            }
            else if (currentElement.id == 'list'){
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
                    //this.index ++;
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
        }

        /////////////////GAME BLOCKS/////////////////
        else if(currentElement.id==='turn' || currentElement.id==='move'){
            textCode+=currentElement.id+' ';
            textCode+= currentElement.querySelector('.op').textContent+' '
            let by = this.getChildren(currentElement, '.draggable.circleOps');
            if(by===''){
                by = currentElement.querySelector('.by').textContent
            }
            textCode+=by+' ';
            textCode+= this.getChildren(currentElement, `.selected`);
            this.index+=(currentElement.querySelectorAll(`:scope > .draggable`)).length;
            return textCode+'\n';
        }
        else if(currentElement.id==='color'){
            textCode+='color ' + currentElement.querySelector('.coloring').getAttribute('fill')+'\n';
            textCode+=' '+this.getChildren(currentElement, `.selected`)
            this.index+=(currentElement.querySelectorAll(`:scope > .draggable`)).length;
            return textCode;
        }

        else if(currentElement.id==='colour'){
            textCode+='colour ' 
            textCode+=this.getChildren(currentElement, `.draggable.circleOps`);
            textCode+='\n'
            textCode+=' '+this.getChildren(currentElement, `.selected`)
            this.index+=(currentElement.querySelectorAll(`:scope > .draggable`)).length;
            return textCode;
        }
        else if(currentElement.id==='pen'){
            textCode+='pen ' + currentElement.querySelector('.op').textContent+'\n';
            textCode+=' '+this.getChildren(currentElement, `.selected`)
            this.index+=(currentElement.querySelectorAll(`:scope > .draggable`)).length;
            return textCode;
        }
        else if(currentElement.id==='break'){
            textCode+='break ' + currentElement.querySelector('.op').textContent+'\n';
            textCode+=' '+this.getChildren(currentElement, `.selected`)
            this.index+=(currentElement.querySelectorAll(`:scope > .draggable`)).length;
            return textCode;
        }
        
        return textCode;
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
        let env = new Symbol();
        const languages = (this.covert.covertString(src, env, lang));//
        return [languages, this.error];
    }

    translateSteps(lang, current_block){
        this.sortChildren();
        if(current_block>=this.blocks.length)return[''];
        const translateBlock = this.getBlocksAsString(this.blocks[current_block]);
        const languages = (this.covert.covertString(translateBlock, this.env, lang));
//    save_variable_state(variables)
        return [languages];
    }
}