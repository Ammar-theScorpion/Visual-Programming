import {Blocks} from "./Am-interperter/front-back.js";

$(document).ready(function() {
    var clones = Blocks.getInstance();
    let currentElement =0;
    setBlock()

    class BlockInfo{
        constructor(){
            this.block=null;
            this.direction=0;
        }
    }
    function findDistance(on_mouse, on_ground, on_mouseh, on_groundh, direction=0){
        let mouse=0, ground=0;
        if(direction==-1){
            mouse=on_mouseh;
        }else if(direction==1){
            ground=on_groundh;
        }
        let ftop = on_mouse.offset().top + mouse
        let stop = on_ground.offset().top + ground
        return Math.sqrt(Math.pow(on_mouse.offset().left - on_ground.offset().left, 2) +
            Math.pow(ftop - stop, 2));
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
    function findCustomeDistance(fElement, Selement, sheight, height, direction){
        return findDistance(fElement, Selement, sheight, height, direction);
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
    function alterVerticalLength(droppable, d, height, direction, at, q=true){
        if(droppable.prop("tagName")!=='svg' && height >16){ 
            let paths =$();
            if(q)
                paths= getAllParentPath(droppable);
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
        const droppableLeft = droppable.position().left;
 
        paths.each(function() {
            let d = $(this).attr("d");
            const droppable_pos =  (droppable.attr('transform').match(TRANS_REGEX)[1].split(",")); 
            let next = $(this);
            next= next.next().next();
            if(droppable.parent().children('.Am-text.move').length!=0){
                droppable.parent().children('.Am-text.move').attr('transform','translate('+((draggableLength-23)*direction) +',24)')
              //  droppable.next().next().attr('transform','translate('+(dlength+80) +',4)')
            } else{
                if(next.length!=0 && parseFloat(droppableLeft) < parseFloat(next.position().left)){
                    let dlength =  parseFloat(d.match(H_REGEX)[1]);
                    let move = 20;
                    let traslate =  (next.attr('transform').match(TRANS_REGEX)[1].split(","));  
                    let first = (parseFloat(dlength)+23+move)*direction;
                    next.attr('transform','translate('+(first) +','+traslate[1]+')')
                    next = next.next();
                    traslate =  (next.attr('transform').match(TRANS_REGEX)[1].split(","));  
                    next.attr('transform','translate('+(first+32) +','+traslate[1]+')')
                }
            }

            /*if(next.is('text')){
                next.attr('transform','translate('+(parseFloat(next.attr('transform').match(TRANS_REGEX)[1].split(",")[0]) + (draggableLength*0.72)*direction) +',24)')
            }*/
            let match;
            if($(this).parent().attr('class').indexOf('if-like')!==-1){

                while(match = IF_LK_REGEX.exec(d)) {
                    let matchedString = match[0];
                    //let newString = `-2 H ${parseFloat(matchedString.split(' ')[2])+(draggableLength)*direction}`;
                    let newString = `-2 H ${parseFloat(draggableLength)+156}`;
                    d = d.replace(matchedString, newString);
                }
            }else{
                match = regex.exec(d)
                let matchedString = match[0];
                let newString = `H ${parseFloat(matchedString.split(' ')[1])+(156*0.75)*direction}`;
                d = d.replace(matchedString, newString);
            }
          $(this).attr("d", d);
      });
    }

  

    const H_REGEX      = /H ([0-9.]+)/;
    const V_REGEX      = /v ([0-9.]+)/g;
    const IF_LK_REGEX  = /-2 H [0-9.][0-9.]+/g;
    const TRANS_REGEX  = /translate\(([^)]+)\)/;
    const VARAIBLES = ['a', 'b', 'c', 'd', 'f', 'g'];
    const sidebarWidth = $('.left-section').width()+38;
    let gClicked=null;
    let ch= null;
    let chdrag= null;
    let chdirection=0;
    var edit = null;  
    var visited = false;
    var on_mouseHeight = 0
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
        const name = window.prompt('varaible Name')
        const clone = $('.make-var:first').clone();
        clone.children('text').text('allfather '+name);
        if($(this).parent().hasClass('cloneal'))
            $('.cloneal').parent().parent().append(clone);
        else
            clones.addBlock(clone.clone());
        translateAndSet();
        /*
        var foreignObject = $('.make-var');
        if (foreignObject.attr('visibility') === 'visible') {
            foreignObject.attr('visibility', 'hidden');
        } else {
            foreignObject.attr('visibility', 'visible');
        }*/
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

        const clone = ($('.make-var'));
        clone.children('text').text('allfatherL '+name);
        if($(this).parent().hasClass('cloneal'))
            $('.cloneal').parent().parent().append(clone);
        else
            clones.addBlock(clone.clone());
        setBlock()
        translateAndSet();
    });
    $('.create-function').click(function(){
        var foreignObject = $('#function');
        foreignObject = foreignObject.clone(true);
        const name = window.prompt('Function Name')
 
      
        foreignObject.attr('visibility', 'visible');
        foreignObject.find('.name').text(name)
        console.log(name.length)
        foreignObject.find('.Am-edit:first rect').attr('width', (name.length+1.5)*8);
        foreignObject.find('.Am-text:nth-of-type(2)').attr('transform', 'translate('+(name.length*8+65)+',24)')

        let d = foreignObject.children('path:first').attr("d");
        let match = ''
        while(match=IF_LK_REGEX.exec(d)){

            let matchedString = match[0];
            //let newString = `-2 H ${parseFloat(matchedString.split(' ')[2])+(draggableLength)*direction}`;
            let newString = `-2 H ${name.length*8+67+40}`;
            d = d.replace(matchedString, newString);
        }
        foreignObject.children('path:first').attr("d", d);

        var call = $('#caller');
        call = call.clone(true);
        call.find('.name').text(name)
        call.attr('visibility', 'visible');


        d = call.children('path:first').attr("d");
        match = ''
        while(match=IF_LK_REGEX.exec(d)){

            let matchedString = match[0];
            //let newString = `-2 H ${parseFloat(matchedString.split(' ')[2])+(draggableLength)*direction}`;
            let newString = `-2 H ${name.length*8+60}`;
            d = d.replace(matchedString, newString);
        }
        call.children('path:first').attr("d", d)
        $('svg:first').append(foreignObject)
        $('svg:first').append(call)
    });
    $('.make-var').keydown(function(event){
        if(event.keyCode === 13){
            $('.make-var').attr('visibility', 'hidden')
            const var_name = $('.make-var').find('input:first').val();
            $('.operation-var').append('<p>'+var_name+'</p>')
        }
    });
    
    clones.getBlocks().click(function() {
        gClicked = $(this)
        console.log(2)
    });
 


    $('.draggable').click(function(){
        var clone = $(this).clone();
        if (!clone.parent().is(".Am-workspace")){
            let appendto = $(".Am-workspace:first");
            if(appendto.attr('visibility') !== 'visible')
                appendto = $(".Am-workspace.main");
            clone.appendTo(appendto);
            clones.addBlock(clone);
            translateAndSet();

            //// * FUNCTION * /////

            clone.find('.drop_params').click(function(){
                var foreignObject = $(this).parent().find('.parameters');
                if (foreignObject.attr('visibility') === 'visible') {
                    foreignObject.attr('visibility', 'hidden');
                } else {
                    foreignObject.attr('visibility', 'visible');
    
                }
            });
      
            clone.find('.-inputs').on('click', function(event) {
                var clone = $(this).clone(true);
                let appendto = $(this).parent().next().children('svg');
                if(appendto.length===1){

                    clone.appendTo(appendto);
                let children = appendto.children('#inputs');

                    clone.attr('transform', 'translate('+16+','+ 48*children.length+')');
                    const varaible = clone.find('.Am-edit .Am-text').text(); 
                    $(this).find('.Am-edit .Am-text').text(VARAIBLES[VARAIBLES.indexOf(varaible)+1]);
                }else{
                    appendto = $(this).parent();
                    $(this).remove();
                }
                
                let var_names = ''
                let children = appendto.children('#inputs');
                children.each(function(index){
                    var_names += $(this).find('.Am-edit .Am-text').text();
                    if (index < children.length - 1) {
                        var_names += ', ';
                    }
                });
                /// Horizntal        
                let current_function =  appendto.parent().parent().parent('.function-container');
                current_function.children('.Am-text:nth-of-type(2)').text('with:'+var_names);

                let path = current_function.find('path:first').attr('d');
                let match;
                while(match = IF_LK_REGEX.exec(path)){
                    let newLength = '-2 H '+ (parseFloat(match[0].split(' ')[2])+16);
                    path = path.replace(match, newLength);
                }
                current_function.find('path:first').attr("d", path);    
                ////

                let wrapper = current_function.find('.inputs-wrapper-container');
                let w_path = wrapper.find('path:first').attr('d');
                alterVerticalLength(wrapper, w_path, children.length*46, 1, 'm', false)

                const rects = current_function.find('.parameters').find('rect:lt(3)');
                rects.each(function(){
                    $(this).attr('height', 200+children.length*45)
                    console.log(parseFloat($(this).attr('height')))
                })
                current_function.find('svg').attr('height',  200+children.length*40)

                // Modifiy Call
                let callFunction = $('svg').find('.call').filter(function(){
                    console.log($(this).find('.name').text() , current_function.find('.name').text())
                    return $(this).find('.name').text() == current_function.find('.name').text();
                }) 
                console.log($('svg'))
                callFunction.children('.name').nextAll().remove();

                let parameter_names = var_names.split(', ');
                match = IF_LK_REGEX.exec(path)
                let start_x =90;
                for (let index = 0; index < parameter_names.length; index++) {
                    const element = parameter_names[index];

                    //Create anew text in SVG's namespace
                    var text = $(document.createElementNS("http://www.w3.org/2000/svg", 'text')); 
                    text.attr('class', 'Am-text');
                    text.text(element);
                    text.attr('transform', 'translate('+(start_x)+',24)')
                    callFunction.append(text)

                    start_x += element.length*13;
                    //Create anew text in SVG's namespace
                    
                    let clonetext = $('.Am-edit.global').clone();
                    clonetext.attr('visibility','visible')
                    clonetext.attr('transform', 'translate('+(start_x)+',12)')
                    start_x+=30;
                    callFunction.append(clonetext);
                    
                }
                path = callFunction.find('path:first').attr('d');
                match = IF_LK_REGEX.exec(path)
                let newLength = '-2 H '+ (start_x);
                path = path.replace(match, newLength);
                callFunction.find('path:first').attr("d", path);    

            });
            //// * FUNCTION * /////
            }

            ////////////////////// LIST /////////////////////////
            clone.find('.drop_content').click(function(){
                var foreignObject = $(this).parent().find('svg:first');
                if (foreignObject.attr('visibility') === 'visible') {
                    foreignObject.attr('visibility', 'hidden');
                    
                } else {
                    foreignObject.attr('visibility', 'visible');
                }
            });
            clone.find('.drop_content.create').click(function(){
                
                if ($('.cloneal').length==0) {
                    let clone = $('.al').clone(true);
                    clone.addClass('cloneal');
                    clone.attr('visibility', 'visible');
                    console.log($(this).parent())
                    $(this).parent().find('svg:first').append(clone);
                }
                else{
                    $('.cloneal').remove();
                }
            });
            ////////////////////// LIST /////////////////////////


        $('.Am-edit').on('click', function(event) {
            event.stopPropagation();
                 var leftValue = $(this).position().left;
                var topValue = $(this).position().top;
                $('#flex').css('left', leftValue + 'px');
                $('#flex').css('top',  topValue  + 'px');
                $('#inner').text($(this).children().last().text());
                if($('#flex').css('display')=='none'){
                    $('#flex').css('display','block');
                }
                edit = $(this);
        });
        $('#inner').on("blur", function() {
            $('#flex').css('display','none');
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
    
  
        $('.clickable').click(function(){
            var clone = $(this).clone(true);
            let appendto = $(this).parent().parent();
            if(appendto.children('.op').length>0){
                let re = appendto.children('.op').remove();
                clones.blocks = clones.blocks.not(re);
            }
            clone.addClass('op')
            clone.appendTo(appendto);
            clones.addBlock(clone);
            const length = findLength(appendto.children('path:first').attr('d'))
            clone.attr('transform', 'translate(' + parseFloat(length) + ',' + 3 + ')');
            $(this).parent().attr('visibility', 'hidden');
            translateAndSet();
        })



        clones.getBlocks().draggable({
            start: function(event, ui) {
                
                translateAndSet();
                const clone = $(this);
           
            },
            drag: function(event, ui) {
                translateAndSet();
                const draggable = $(this);
                let appendto = $(this).find('.Am-workspace');
                if(appendto.attr('visibility') !== 'visible')
                    appendto = $(".codesspace .Am-workspace");
                console.log(appendto)
                ///////////////////////// MOVEMENT //////////////////////

                /*const draggab = $("#Am-workspace");
                const workspaceOffset = draggab.offset();
                const scale = parseFloat(draggab.attr("transform").match(/scale\((\d+\.\d+)\)/)[1]);
                const left = (ui.offset.left - workspaceOffset.left) / scale;
                const top = (ui.offset.top - workspaceOffset.top) / scale;
                draggab.attr("transform", `translate(${left},${top}) scale(${scale})`);
                draggable.attr('transform', 'translate(' + left + ',' + top + ')');*/
                const workspaceOffset = appendto.offset();
                const left = ui.offset.left - workspaceOffset.left;
                const top = ui.offset.top - workspaceOffset.top;
                draggable.attr('transform', 'translate(' + left + ',' + top + ')');
                draggable.addClass('shadow')
                ///////////////////////// MOVEMENT //////////////////////

                
                $('.drobable').each(function() {
                    if(draggable.attr('class').indexOf('operation-logic')!==-1 && !$(this).closest(draggable).length){
                        const droppable = $(this);
                        var distance = findDistance(draggable, droppable); 
                        if (distance <= 50) { 
                            if(!droppable.attr('id'))
                                droppable.attr('id', 'close');
                            droppable.css({"stroke": "white", "stroke-width": "2" });``
                        }
                        else{
                            droppable.css({"stroke": "none", "stroke-width": "none"});
                        }
                        if(droppable.attr('id')=='closed' && droppable.css('stroke')=='none'){
                            droppable.removeAttr('id');
                            clones.addBlock(draggable);

                            let d = draggable.find('path').attr("d");
                            let dlength =  parseFloat(d.match(H_REGEX)[1]);
                            /*if(droppable.parent().attr('id') == 'multiConditionBlock')
                                alterParentsLength(droppable, dlength, H_REGEX, -1);
                            else
                                alterParentsLength(droppable, (dlength+18), IF_LK_REGEX, 1);*/
                        }
                    }
                });
                $('.draggable').each(function() {
                    translateAndSet();
                    if(draggable.attr('id')!='function' && draggable.attr('id')!='condition' && $(this).attr('id')!='condition'){
                        if(!$(this).closest(draggable).length){
                            const onground_path   = $(this).children('path:first').attr('d');
                            const onground_height = parseFloat(findHeight(V_REGEX, onground_path))+($(this).attr('class').indexOf('container')==-1 ? 8 :25);
                            const onmouse_path    = draggable.find('path:first').attr('d');
                            const onmouse_height  = parseFloat(findHeight(V_REGEX, onmouse_path))+(draggable.attr('class').indexOf('container')==-1 ? 8 :25);
                            const on_mouse_children = draggable.find('.draggable')
                            let all_height = 0;
                            on_mouse_children.each(function(){
                                const d = $(this).find('path:first').attr('d');
                                all_height+=parseFloat(findHeight(V_REGEX, d))+(draggable.attr('class').indexOf('container')==-1 ? 8 :25);
                            });
                            on_mouseHeight = onmouse_height;
                            let direction=[1, -1, 2];
                            let index = 0;
                            if($(this).attr('id')=='function')
                                index = 2;
                            for (; index < direction.length; index++) {
                                const element = direction[index];
                                let distance = findCustomeDistance(draggable, $(this), onmouse_height, onground_height ,element); 
                                if (distance <= onmouse_height && $('#newpath').length==0) { 
                                    ch = $(this);
                                    chdrag = draggable;
                                    chdirection = element
                                    
                                    var newPath = document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create a path in SVG's namespace
                                    newPath.setAttribute('d', onmouse_path);
                                    newPath.setAttribute('id', 'newpath');
                                    newPath.setAttribute('fill', '#868686');
                                    newPath.setAttribute('visibility', 'visible');
                                    
                                    if(element==-1){
                                        $(this).append(newPath);
                                        let transform = 'translate( 0'+','+(-(onmouse_height)) +')';
                                        newPath.setAttribute('transform',  transform);
                                    } 
                                    else if(element==1){
                                        $(this).append(newPath);
                                        let transform = 'translate( 0'+','+(onground_height) +')';
                                        newPath.setAttribute('transform',  transform);
                                        if($(this).parents('.if-container')!==-1){
                                            alterVerticalLength($(this).parents('.if-container'), $(this).parents('.if-container').find('path:first').attr('d'), onmouse_height*2+all_height, 1, 'm')
                                        }
                                        const traslate =  $(newPath).position().top;  
                                        $(this).find('.chain').each(function(){
                                            console.log($(this))
                                            const traslate2 = $(this).position().top;  
                                            if(traslate==traslate2){
                                                transform = 'translate( 0'+','+(onground_height+onmouse_height) +')';
                                                $(this).attr('transform',  transform);
                                                $(this).addClass('affected');
                                            }
                                        });
                                    } 
                                    else if(element==2 && $(this).attr('class').indexOf('container')!==-1){
                                        $(this).append(newPath);
                                        let x = 16;
                                        if($(this).attr('class').indexOf('thick')!==-1)
                                            x = 22;
                                        newPath.setAttribute('transform', 'translate('+x+','+ 50+')');
                                        alterVerticalLength($(this), onground_path, onmouse_height+all_height, 1, 'm')
                                        
                                        const traslate =  $(newPath).position().top;  
                                        $('.chain').each(function(){
                                            const traslate2 = $(this).position().top;  
                                            if(traslate==traslate2){
                                                transform = 'translate( 0'+','+(onground_height+onmouse_height) +')';
                                                $(this).attr('transform',  transform);
                                                $(this).addClass('affected');
                                            }
                                        });
                                    }
                                }
                                else if(distance>onmouse_height && $('#newpath').length && draggable.is(chdrag) && $(this).is(ch) && element == chdirection ){
                                    const traslate =  $('#newpath').position().top;  
                                    $('.chain').each(function(){
                                        const traslate2 = $(this).position().top;  
                                        if(traslate<traslate2){
                                            let transform = 'translate( 0'+','+(onground_height) +')';
                                            $(this).attr('transform',  transform);
                                            $(this).addClass('affected');
                                        }
                                    });
                                    if(chdirection==2){
                                        console.log('in')
                                        alterVerticalLength($(this), onground_path, onmouse_height+all_height, -1, 'm')
                                    }
                                    chdirection = 0
                                    $('#newpath').remove();
                                    ch = null;
                                }
                            }
                         
                        }
                       /* 
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
                    }*/

                }
            });
    
            },
            stop: function(event, ui) {
                const clone = $(this);
                clone.attr('z-index', 1)
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
    
                    let droppable = $(this);
                    if($('#newpath').length){
                        const traslate = draggable.position().top;  
                        let appendon = draggable;
                        $(this).find('.chain').each(function(){
                            const traslate2 = $(this).position().top;  
                            if(traslate<traslate2){
                                appendon.append($(this))
                                let transform = 'translate( 0'+','+(on_mouseHeight) +')';
                                $(this).attr('transform',  transform);
                                appendon = $(this)
                            }
                        });
                        if(chdirection==-1){
                                draggable.append(ch);
                                const traslate =  ($('#newpath').attr('transform').match(TRANS_REGEX)[1].split(","));  
                                ch.attr('transform', 'translate(0,'+parseFloat(traslate[1])*-1+')');
                        }
                        else{
                            ch.append(draggable);
                            draggable.attr('transform', $('#newpath').attr('transform'));
                        }if(chdirection==2){
                            draggable.addClass('in')
                        }
                        draggable.addClass('chain')
                        $('#newpath').remove();
                    }
                $('.drobable').each(function() {
                    let droppable = $(this);
                    if(droppable.attr('id')=='close' && droppable.css('stroke')==='rgb(255, 255, 255)'){
       
                        let dlength =  parseFloat(d.match(H_REGEX)[1]);

            
                        if(droppable.parent().attr('id') == 'multiConditionBlock'){
                         
                            alterParentsLength(droppable, dlength, H_REGEX, 1);
                        }
                        else
                            alterParentsLength(droppable, (dlength), IF_LK_REGEX, 1);
                        droppable.parent().append(draggable)

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
        console.log($(this).width())
        let direction = 1;
        if(event.keyCode == 8)
            direction=-1;
        var charCode = (event.which) ? event.which : event.keyCode;
            if($(this).width()!=25){
            
                const inputWidth = $(this).width();
                const inputText = edit.children().first();
                inputText.css('width', inputWidth);

                let path = edit.parent().find('path').attr('d');
                let fill_path = '-2 H ';
                let match = IF_LK_REGEX.exec(path);
                if(match===null){
                    match = H_REGEX.exec(path);
                    fill_path = ' H ';
                }
                let newLength = fill_path + (parseFloat(inputWidth)-35 + parseFloat(edit.parent().attr('transform').match(TRANS_REGEX)[1].split(',')[0]));
                path = path.replace(match[0], newLength);
                console.log(edit.parent())
                edit.parent().find('path').attr("d", path);    

                let next = edit.next();
                let distance = 30;
                while(edit.next().length!=0){
                    const position = (next.attr('transform').match(TRANS_REGEX)[1].split(",")); 
                    console.log(distance)
                    next.attr('transform','translate('+ (distance+inputWidth) +','+position[1]+')')
                    next = next.next();
                    distance = parseFloat((next.attr('transform').match(TRANS_REGEX)[1].split(","))[0]);
                }
                    
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

////////// *Get and Translate Blocks* //////////

    window.translateDrawingBlocks = function (){
        const runButton = document.querySelector('#runButton');
        if(runButton.textContent == 'Reset'){
            runButton.textContent = 'Run Program'
            clones.clean();
            lines = [];
            restoreDefaults()
            console.log(lines)
        }else{
            runButton.textContent = 'Reset';
            const blocks = clones.getBlocks();
            for (let index = 0; index < blocks.length; index++) {
                const element = blocks[index].querySelectorAll('.Am-text');
                switch(element[0].textContent){
                    case 'move':
                        setTimeout(function() {
                            moveForward(element[element.length - 1].textContent);
                            $(blocks[index]).attr('filter','url(#my-filter)')
                            setTimeout(function() {
                                $(blocks[index]).attr('filter','none')
                            }, (1000));

                        }, (index + 1) * 1000); // add delay of 1 second after each call
                        break
                    case 'turn':
                        setTimeout(function() {
                            turnLeft(element[element.length - 1].textContent);
                        }, (index + 1) * 200); // add delay of 1 second after each call
                        break
                }

            }
        }
    }
////////// *Get and Translate Blocks* //////////


    //////////////////// *New Section* ////////////////////
    // *this section handels code submission and ordering the blocks* //

    let language = '';
    let lang_id=0;
    var lang='C++';
    var code = '{{prev_code|safe}}';
    let stepped = false
    let step = 2;
	  window.translateAndSet =function(){
		  if(step!='no translation'){
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
		}else{
           
        }
    }
    
    const blocks = $('.draggable');
 
    function setBlock(){
       let space = 0;
       const blocks = $('.draggable');
       
       blocks.each(function(){
            if($(this).attr('transform')==-1){
                $(this).attr('transform', 'translate('  + 0 + ',' + space + ')');
                space+=130;
            }
       });
    }
       $('form button').click(function(event){
          console.log(event.target.innerHTML)
          if(event.target.innerHTML.indexOf('step')!==-1){
             stepped = true;
             window.translateAndSet()
          }
          event.preventDefault();
          const userCodeInput = document.getElementById('user_code_input');
          document.getElementById("setcode").innerHTML = language.split('`')[1];
          let text =  document.getElementById('setcode').innerHTML;
          text = text.replace(/<br>/g, '\n').replace(/&nbsp;/g, ' ').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
          console.log(text)
          var csrftoken = $("input[name='csrfmiddlewaretoken']").val();
          $.ajaxSetup({
             beforeSend: function(xhr, settings) {
                if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                   xhr.setRequestHeader('X-CSRFToken', csrftoken);
             }
          }
       });
       $.ajax({
          url: 'http://127.0.0.1:8000/test_code/',
             method:'POST',
             contentType: 'text/plain', // to prevent Django from treating the ajax as a form form the Query
             data: {
                text,
                'tname':'44',
             },
             success: function(response){
                let inner =  document.querySelector('#error').innerHTML;
                if (inner=="undefined")
                document.querySelector('#error').innerHTML = response;
                else
                document.querySelector('#error').innerHTML+=response;
                if(response[response.length-1] == 't'){
                   $('form button').html('Submit');
                   $('form button').unbind('click');
                }
             }
          })
       });
       function language_type(){
          /*const button = event.target;
          lang = button.innerHTML;*/
          var code = language.split('`')[lang_id];
          var codeNode = document.createElement("pre");
          codeNode.style.whiteSpace = "pre-wrap";
          codeNode.textContent = code;
          document.getElementById("setcode").innerHTML = "";
          document.getElementById("setcode").appendChild(codeNode);
       }
       function toggleSidebar() {
       var sidebar = document.getElementById("sidebar1");
       var arrow = document.querySelector(".arrow");
       console.log(sidebar.style.left)
       if (sidebar.style.left == "0px") {
          sidebar.style.left = "-400px";
          arrow.style.transform = "rotate(0deg)";
          arrow.style.left="0"
 
       } else {
          sidebar.style.left = "0";
          arrow.style.transform = "rotate(180deg)";
          arrow.style.left="400px"
       }
       }
 
});
