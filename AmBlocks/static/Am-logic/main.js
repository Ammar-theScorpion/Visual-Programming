import {Blocks} from "./Am-interperter/front-back.js";

$(document).ready(function() {
    var clones = Blocks.getInstance();
    let currentElement =0;

    class BlockInfo{
        constructor(){
            this.block=null;
            this.direction=0;
        }
    }
    function findDistance(fElement, Selement, height=0, direction=0){
        let f=0, s=0;
        let ftop = fElement.offset().top
        let stop = Selement.offset().top
        if(direction==1){
            [ftop, stop] = [stop, ftop];
            f=height;
        }else if(direction==-1)
            s=height;
        else
            s=height/2;
        return Math.sqrt(Math.pow(fElement.offset().left - Selement.offset().left, 2) +
               Math.pow(ftop+f - stop+s, 2));
    }
    function findHeight(regex, d){
        let height = 0
        let match = regex.exec(d);
        while (match !== null) {
            height += parseFloat(match[0].split(' ')[1]);
            match = regex.exec(d);
        }
        return height;
    }
    function findLength(d){
        let length = 0
        let match = IF_LK_REGEX.exec(d);
        while (match !== null) {
            length += parseFloat(match[0].split(' ')[2]);
            match = IF_LK_REGEX.exec(d);
        }
        return length;
    }
    function findCustomeDistance(fElement, Selement, regex, path, direction){
        const d = path.attr('d');
        return findDistance(fElement, Selement, findHeight(regex, d), direction);
    }
    function getAllParentPath(currentElement){
        let pathss = []; //jq container
        let parent = currentElement.parent();
        while(parent.prop("tagName") == "g"  ){
            const path = parent.children('path:first');
            if(path.length > 0)
                pathss.push(path); // return the added element
            parent = parent.parent()
        }return $(pathss);
    }
    function alterVerticalLength(droppable, d, height, direction, at){
        if(droppable.prop("tagName")!=='svg'){

            let paths = getAllParentPath(droppable);
            paths = paths.add(droppable.find('path:first')); // return the added element
            paths.each(function() {
                let dd = $(this).attr("d");
                const re = /v ([0-9.]+)/g
                let match = re.exec(dd);
                match = re.exec(dd);
                let matchedString = match[0];
                let newString = `v ${height-5+ (at=='m' ? 0 :( parseFloat(matchedString.split(' ')[1])))}`;
                at='m';
                if(direction==-1){
                    newString = `v ${ 16}`;
                }
                dd = dd.replace(matchedString, newString);
                $(this).attr("d", dd)
                height+=80;
            });
        }
    }
    function alterParentsLength(droppable, draggableLength, regex, direction) {
        let paths = getAllParentPath(droppable); 

        paths.each(function() {
            let next = $(this).parent().children().last();
            /*if(next.is('text')){
                next.attr('transform','translate('+(parseFloat(next.attr('transform').match(TRANS_REGEX)[1].split(",")[0]) + (draggableLength*0.72)*direction) +',24)')
            }*/
            let d = $(this).attr("d");
            let match;
            if(regex==IF_LK_REGEX){

                while(match = regex.exec(d)) {
                    let matchedString = match[0];
                    //let newString = `-2 H ${parseFloat(matchedString.split(' ')[2])+(draggableLength)*direction}`;
                    let newString = `-2 H ${parseFloat(draggableLength)}`;
                    d = d.replace(matchedString, newString);
                }
            }else{
                match = regex.exec(d)
                let matchedString = match[0];
                let newString = `H ${parseFloat(matchedString.split(' ')[1])+(draggableLength*0.72)*direction}`;
                d = d.replace(matchedString, newString);
            }
          $(this).attr("d", d);
      });
    }

    window.translateAndSet =function(){
        let C_Code_List = ['',''];
        let code = '';

        if(step==1 && stepped){
            C_Code_List = clones.translateSteps(lang, currentElement);
            if(currentElement+1<clones.blocks.length)
                currentElement++;
            else
                currentElement=0;
        }
        else if(step!=1){
            C_Code_List = clones.translate(lang);
        }
        const language_list = C_Code_List[0];
        for (let index = 0; index < language_list.length; index++) {
            let C_Code = language_list[index];
            code += C_Code;
            code += '`'
        }
        if(code!=='``'){

            language = code;
            language_type();
        }
        const error = C_Code_List[1];
        document.getElementById('error').innerHTML = error;
    }

    const H_REGEX      = /H ([0-9.]+)/;
    const V_REGEX      = /v ([0-9.]+)/g;
    const IF_LK_REGEX  = /-2 H [0-9.][0-9.]+/g;
    const TRANS_REGEX  = /translate\(([^)]+)\)/;

    const sidebarWidth = $('.left-section').width()+38;
    let gClicked=null;
    let ch= null;
    let chdrag= null;
    let chdirection=0;
    var edit = null;  
    var visited = false;
    let info = new BlockInfo();
    $(document).keydown(function(event) {
        if (event.which === 67 && event.ctrlKey) {
            if(gClicked!=null){
                var clone = gClicked.clone();
                clone.attr('transform', 'translate('  + 20 + ',' + 300 + ')');
                clone.appendTo('svg');
                clones.addBlock(clone);
            }
        }
      });

    $('.create-var').click(function(){
        var foreignObject = $('.make-var');
        if (foreignObject.attr('visibility') === 'visible') {
            foreignObject.attr('visibility', 'hidden');
        } else {
            foreignObject.attr('visibility', 'visible');
        }
    });

    $('.create-list').click(function(){
        var foreignObject = $('#list');
        if (foreignObject.attr('visibility') === 'visible') {
            foreignObject = foreignObject.clone();
            $('#list').parent().append(foreignObject);
        } 
        const name = window.prompt('List Name')
        let d = foreignObject.children('path:first').attr("d");
        foreignObject.find('.listname').text(name)
        let match = ''
        while(match=IF_LK_REGEX.exec(d)){

            let matchedString = match[0];
            //let newString = `-2 H ${parseFloat(matchedString.split(' ')[2])+(draggableLength)*direction}`;
            let newString = `-2 H ${65+name.length*8+58}`;
            d = d.replace(matchedString, newString);
        }
        foreignObject.attr('visibility', 'visible');
        foreignObject.children('path:first').attr("d", d);

        setBlock()
    });
    $('.make-var').keydown(function(event){
        if(event.keyCode === 13){
            $('.make-var').attr('visibility', 'hidden')
            const var_name = $('.make-var').find('input:first').val();
            $('.operation-var').append('<p>'+var_name+'</p>')
        }
    });
    
   $('image').click(function(){
       var prev = $(this).prev();
        if(!prev.is(('g')))
            prev = $(this).next();
        var Fchildren = prev.find("foreignObject:first");
        if (Fchildren.attr('visibility') === 'visible') {
            Fchildren.attr('visibility', 'hidden');
        } else {
            Fchildren.attr('visibility', 'visible');
        }
    });

    clones.getBlocks().click(function() {
        gClicked = $(this)
        
    });
 
    $('.select').click(function(){
        var foreignObject = $(this).find('foreignObject');
        if (foreignObject.attr('visibility') === 'visible') {
            foreignObject.attr('visibility', 'hidden');
        } else {
            foreignObject.attr('visibility', 'visible');
        }
    });
    $('.operation-var p').click(function(){
        var text = $(this).parent().parent().parent().parent().find('text:first');
        var currentText = $(this).text();
        text.text(currentText)
    });
    $('.operation-list p').click(function(){
        var text = $(this).parent().parent().parent().parent().find('text:first');
        var currentText = $(this).text();
        text.text(currentText)
    });


    $('.draggable').click(function(){
        var clone = $(this).clone();
        if (!clone.parent().is("#Am-workspace")) { 
            clone.appendTo('#Am-workspace');
            translateAndSet();
        }   
        clones.addBlock(clone);
        $('.Am-edit').on('click', function(event) {
            event.stopPropagation();
            edit= $(this);
                var leftValue = $(this).position().left;
                var topValue = $(this).position().top;
                $('#flex').css('left', leftValue + 'px');
                $('#flex').css('top',  topValue  + 'px');
                $('#inner').text($(this).children().last().text());
                if($('#flex').css('display')=='none'){
                    $('#flex').css('display','block');
                }
        });
        $('#inner').on("blur", function() {
            $('#flex').css('display','none');
        });

        ////////////////////// LIST /////////////////////////
        $('.drop_content').click(function(){
            var foreignObject = $(this).parent().children('svg');
            if (foreignObject.attr('visibility') === 'visible') {
                foreignObject.attr('visibility', 'hidden');
            } else {
                foreignObject.attr('visibility', 'visible');
    
            }
        });

        $('.clickable').click(function(){
            var clone = $(this).clone();
            const appendto = $(this).parent().parent();
            console.log(clones.blocks.find('.op'));
            clones.blocks = clones.blocks.not('.op');
            $('.op').remove();
            clone.addClass('op')
            clone.appendTo(appendto);
            clones.addBlock(clone);
            const length = findLength(appendto.children('path:first').attr('d'))
            clone.attr('transform', 'translate(' + parseFloat(length) + ',' + 3 + ')');
            $(this).parent().attr('visibility', 'hidden');
            translateAndSet();
        })

        clones.getBlocks().draggable({
            zIndex: 0,
            start: function(event, ui) {
                
                translateAndSet();
                const clone = $(this);
           
            },
            drag: function(event, ui) {
                translateAndSet();
                
                const draggable = $(this);
                if (!draggable.parent().is("#Am-workspace")) { 
                    draggable.appendTo('#Am-workspace');
                } 
                const workspaceOffset = $("#Am-workspace").offset();
                const left = ui.offset.left - workspaceOffset.left;
                const top = ui.offset.top - workspaceOffset.top;
                draggable.attr('transform', 'translate(' + left + ',' + top + ')');


                $('.drobable').each(function() {
                    if(draggable.attr('class').indexOf('operation-logic')!==-1 && !$(this).closest(draggable).length){
                        const droppable = $(this);
                        var distance = findDistance(draggable, droppable); 
                        if (distance <= 50) { 
                            if(!droppable.attr('id'))
                                droppable.attr('id', 'close');
                            droppable.css({"stroke": "white", "stroke-width": "2" });
                        }
                        else{
                            droppable.css({"stroke": "none", "stroke-width": "none"});
                        }
                        if(droppable.attr('id')=='closed' && droppable.css('stroke')=='none'){
                            droppable.removeAttr('id');
                            clones.addBlock(draggable);
                        let d = draggable.find('path').attr("d");
                        let dlength =  parseFloat(d.match(H_REGEX)[1]);
                        if(droppable.parent().attr('id') == 'multiConditionBlock')
                            alterParentsLength(droppable, dlength, H_REGEX, -1);
                        else
                            alterParentsLength(droppable, dlength, IF_LK_REGEX, -1);
                        }
                    }
                });
                $('.draggable').each(function() {
                    translateAndSet();
                    if(draggable.attr('id')!='function'){
                        
                        if(!$(this).closest(draggable).length){
                            const path = draggable.children('path:first');
                            let stringPath = path.attr('d');
                            stringPath+=' '+draggable.find('.draggable').find('path:first').attr('d');
                            const paths = $(this).children('path:first');
                            const height = parseFloat(findHeight(V_REGEX, paths.attr('d')))+ ($(this).attr('class').indexOf('container')==-1 ? 8 :25);
                            const selfHeight = parseFloat(findHeight(V_REGEX, stringPath)) + (draggable.attr('class').indexOf('container')==-1 ? 8 :25);
                            let direction=[1, -1, 2];
                            let index = 0;
                            if($(this).attr('id')=='function')
                                index = 2;
                            for (; index < direction.length; index++) {
                                const element = direction[index];
                                let distance = findCustomeDistance(draggable, $(this), V_REGEX, paths, element); 
                                if (distance <= 120 && $('#newpath').length==0) { 
                                     

                                    ch = $(this);
                                    chdrag = draggable;
                                    chdirection = element
                                    var newPath = document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create a path in SVG's namespace
                                    newPath.setAttribute('d', path.attr('d'));
                                    newPath.setAttribute('id', 'newpath');
                                    newPath.setAttribute('fill', '#868686');
                                    newPath.setAttribute('visibility', 'visible');
                                    if(element==2){
                                        $(this).append(newPath);
                                        clones.setBlocks(clones.getBlocks().not(draggable));
        
                                        newPath.setAttribute('transform', 'translate('+17+','+ 50+')');
                                        alterVerticalLength($(this), path.attr('d'), selfHeight, 1, 'm')
                                    }else{
                                        //const traslate =  ($(this).attr('transform').match(TRANS_REGEX)[1].split(","));  
                                        //let transform = 'translate('+traslate[0]+','+((element==-1 ? selfHeight: parseFloat(traslate[1])+height+25 )*element)+')';
                                       
                                        if(!visited){ 
                                            alterVerticalLength($(this).parent(), path.attr('d'), selfHeight, 1, 'l')
                                            visited = true;
                                        }
                                    }
                                    if(element==-1){
                                        $(this).prepend(newPath);
                                        let transform = 'translate( 0'+','+(-height) +')';
                                        newPath.setAttribute('transform',  transform);
                                        
                                    }
                                    if(element==1){ 
                                        $(this).append(newPath);
                                        let transform = 'translate( 0'+','+(height) +')';
                                        newPath.setAttribute('transform',  transform);
                                    }
                                }
                            }
                            if(ch){
                                let distance = 0;
                                let parents = [];
                                parents.push(ch.parent())
                                parents.push(ch);
                                for (let index = 0; index < parents.length; index++) {
                                    const element = parents[index];
                                    if($(element).prop("tagName")=='svg')
                                        continue;
                                    distance = findCustomeDistance(chdrag, element, V_REGEX, paths, chdirection);
                                    
                                    if(distance > 190 ){
                                    
                                        if(chdirection == 2)
                                            alterVerticalLength(element, path.attr('d'), selfHeight, -1, 'm')
                                        chdirection = 0
                                        $('#newpath').remove();
                                        ch = null;
                                    }
                                } 
                            }
                        }
                    }

                });
    
            },
            stop: function(event, ui) {
                const clone = $(this);
                $('#Am-workspace').removeClass('dragging')
                if (!clone.parent().is("#Am-workspace")) { 
                    clone.appendTo('#Am-workspace');
                }   
                /// 
    
                ///
                visited = false;
                var draggable = $(this);
                if(event.pageX<sidebarWidth){
                    //clones.setBlocks(clones.getBlocks().not(draggable));
                    //draggable.animate({opacity: 0}, 500, function() {draggable.remove(); });
                }else if(draggable.offset().left<sidebarWidth){
                   // draggable.attr('transform', 'translate(' + sidebarWidth+',' + ui.offset.top + ')');
                }
                let d = draggable.find('path').attr("d");
    
                $('.draggable').each(function() {
                    let droppable = $(this);
                    if($('#newpath').length){
                        ch.append(draggable);
                        draggable.attr('transform', $('#newpath').attr('transform'));
                        $('#newpath').remove();
                    }
                });
                $('.drobable').each(function() {
                    let droppable = $(this);
                    if(droppable.attr('id')=='close' && droppable.css('stroke')==='rgb(255, 255, 255)'){
                        let d = draggable.find('path').attr("d");
                        let dlength =  parseFloat(d.match(H_REGEX)[1]);
                        if(droppable.next().length!=0){
                            droppable.next().attr('transform','translate('+(dlength+45) +',10)')
                          //  droppable.next().next().attr('transform','translate('+(dlength+80) +',4)')
                        }
                        droppable.after(draggable)
            
                        if(droppable.parent().attr('id') == 'multiConditionBlock'){
                         
                            alterParentsLength(droppable, dlength, H_REGEX, 1);
                        }
                        else
                            alterParentsLength(droppable, dlength, IF_LK_REGEX, 1);
                        const traslate =  (droppable.attr('transform').match(TRANS_REGEX)[1].split(","));  
                        draggable.attr('transform', 'translate('+ traslate[0]+','+(parseFloat(traslate[1])-4)+')');
                        droppable.attr("id", 'closed');
                        clones.setBlocks(clones.getBlocks().not(draggable));
    
                    }
                   
                });
            }
          });
          clones.getBlocks().filter('.clickable').each(function(){
              
              $(this).click(function(){
                  console.log("$(this)")
                   var clone = $(this).clone();
                   clone.appendTo($(this).parent().parent());
                   translateAndSet();
                   clones.addBlock(clone);
                   clone.attr('transform', 'translate(' + 150 + ',' + 0 + ')');
           })
        });

    });
  
        /*
        start: function(e, ui){
            var clone = ui.helper;
            clone.attr('transform', 'translate('  + e.clientX + ',' + e.clientY + ')');
            $('svg').addClass('dragging')

            ////////////////////////////

          
      
        },
        stop: function(event, ui) {
            $('svg').removeClass('dragging');
            var clone = ui.helper

          
          

            if(event.pageX<sidebarWidth){
                clone.animate({opacity: 0}, 500, function() {clone.remove();});
            }else if(clone.offset().left<sidebarWidth){
                clone.attr('transform', 'translate(' + sidebarWidth+',' + ui.offset.top + ')');
            }
        } 
        */

    $('#flex').on('keydown', function(event) {
        let direction = 1;
        if(event.keyCode == 8)
            direction=-1;
        var charCode = (event.which) ? event.which : event.keyCode;
            if($(this).width()!=25){
            
                const inputWidth = $(this).width();
                const inputText = edit.children().first();
                inputText.css('width', inputWidth);
                if(edit.next().length!=0)
                    edit.next().attr('transform','translate('+(50+inputWidth+20) +',24)')
                    
                if(edit.parent().attr('id')=='printBlock'){
                    let path = edit.parent().find('path');
                    if(path.length==0)
                        path = edit.parent().parent().find('path')
                    let d = path.attr('d');
                    let match;
                    match = H_REGEX.exec(d) 
                    let matchedString = match[0];
                    let newString = `H ${parseFloat(matchedString.split(' ')[1])+(8*direction)}`;
                    d = d.replace(matchedString, newString);
                    path.attr("d", d);
                }
                alterParentsLength(edit, (50+inputWidth+60), IF_LK_REGEX, direction);
            }  
 
    });
    $('#flex').on('keyup', function(event) {
        let text = $(this).text();
        if (text !== undefined) { 
            text = text.replace(/\n/, ''); 
            edit.children().last().text(text);
            translateAndSet();
        }
    });

});
