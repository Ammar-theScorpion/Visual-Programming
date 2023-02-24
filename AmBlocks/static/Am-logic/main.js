import {Blocks} from "./Am-interperter/front-back.js";

$(document).ready(function() {
    var clones = Blocks.getInstance();

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
    function findCustomeDistance(fElement, Selement, regex, path, direction){
        const d = path.attr('d');
        return findDistance(fElement, Selement, findHeight(regex, d), direction);
    }
    function getAllParentPath(currentElement){
        let pathss = []; //jq container
        let parent = currentElement.parent();
        while(parent.prop("tagName") !== "svg"){
            const path = parent.children('path:first');
            if(path.length > 0)
                pathss.push(path); // return the added element
            parent = parent.parent()
        }return $(pathss);
    }
    function alterVerticalLength(droppable, d, height, direction){
        let paths = getAllParentPath(droppable);
        paths = paths.add(droppable.find('path:first')); // return the added element
        paths.each(function() {
            let dd = $(this).attr("d");
            const re = /v ([0-9.]+)/g
            let match = re.exec(dd);
            match = re.exec(dd);
            let matchedString = match[0];
            let newString = `v ${(height-5)}`;
                if(direction==-1){
                     newString = `v ${ 16}`;
                }
                dd = dd.replace(matchedString, newString);
                $(this).attr("d", dd)
                height+=80;
        });
    }
    function alterParentsLength(droppable, d, regex, direction) {
        let paths = getAllParentPath(droppable); 
        let draggableLength =  parseFloat(d.match(H_REGEX)[1]);
        console.log(paths)

        paths.each(function() {
            let next = $(this).parent().children().last();
            if(next.is('text')){
                next.attr('transform','translate('+(parseFloat(next.attr('transform').match(TRANS_REGEX)[1].split(",")[0]) + (draggableLength*0.75)*direction) +',24)')
            }
            let d = $(this).attr("d");
            let match;
            while(match = regex.exec(d)) {
                let matchedString = match[0];
                let newString = `-2 H ${parseFloat(matchedString.split(' ')[2])+(draggableLength*0.70)*direction}`;
                d = d.replace(matchedString, newString);
          }
          $(this).attr("d", d);
      });
    }
    const H_REGEX      = /H ([0-9.]+)/;
    const V_REGEX      = /v ([0-9.]+)/g;
    const IF_LK_REGEX  = /-2 H [0-9.][0-9.]+/g;
    const TRANS_REGEX  = /translate\(([^)]+)\)/;

    const sidebarWidth = $('.sidebar').width()+38;
    let gClicked=null;
      
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

    $('.draggable').draggable({
        zIndex: 100,
        appendTo: 'svg',
        helper: function() {
            var clone = $(this).clone();
            return clone;
        },
        start: function(){
        },
        drag: function(event, ui){
            var clone = ui.helper;
            clone.attr('transform', 'translate('  + ui.offset.left + ',' + ui.offset.top + ')');
        },
        stop: function(event, ui) {
            var clone = ui.helper.clone();
            if (!clone.parent().is("svg")) { 
                clone.appendTo('svg');
                clone.addClass('clone');
                clones.addBlock(clone);
            }
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
            clones.getBlocks().draggable({
                zIndex: 100,
                start: function(event, ui) {
                    clones.translate();
                },
                drag: function(event, ui) {
                    var draggable =  $(this);
                    if(draggable.parent()!=$('svg')){
                        draggable.appendTo($('svg'));
                    }
                    draggable.attr('transform', 'translate('  + ui.offset.left + ',' + ui.offset.top + ')');
                    $('.drobable').each(function() {
                        if(draggable.attr('class').indexOf('operation-logic')!==-1){
                            droppable = $(this);
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

                                alterParentsLength(droppable, d, IF_LK_REGEX, -1);
                            }
                        }
                    });
                    $('#newpath').remove();
                    $('.draggable').each(function() {
                        if(draggable.attr('class').indexOf('container')!=-1 && $(this).attr('class').indexOf('container')!=-1 &&!$(this).closest(draggable).length){
                            const path = draggable.children('path:first');
                            const paths = $(this).children('path:first');
                            const height = parseFloat(findHeight(V_REGEX, paths.attr('d')));
                            const selfHeight = parseFloat(findHeight(V_REGEX, path.attr('d')))+25;
                            let direction=[1, -1, 2];
                            for (let index = 0; index < direction.length; index++) {
                                const element = direction[index];
                                let distance = findCustomeDistance(draggable, $(this), V_REGEX, paths, element); 
                                if (distance <= 120 && $('#newpath').length==0) { 
                                    var newPath = document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create a path in SVG's namespace
                                    newPath.setAttribute('d', path.attr('d'));
                                    newPath.setAttribute('id', 'newpath');
                                    newPath.setAttribute('fill', '#868686');
                                    newPath.setAttribute('visibility', 'visible');
                                    if(element==2){
                                        $(this).append(newPath);
                                        clones.setBlocks(clones.getBlocks().not(draggable));

                                        newPath.setAttribute('transform', 'translate('+17+','+ 50+')');
                                        alterVerticalLength($(this), path.attr('d'), selfHeight, 1)
                                    }else{
                                        const traslate =  ($(this).attr('transform').match(TRANS_REGEX)[1].split(","));  
                                        //let transform = 'translate('+traslate[0]+','+((element==-1 ? selfHeight: parseFloat(traslate[1])+height+25 )*element)+')';
                                        let transform = 'translate('+traslate[0]+','+(parseFloat(traslate[1])+((height+25)*element))+')';
                                        newPath.setAttribute('transform',  transform);
                                    }
                                    if(element==-1){
                                        $(this).before(newPath);
                                         
                                    }
                                    if(element==1){ 
                                        $(this).after(newPath);
                                    }
                                }
                            }
                        }
                    });

                },
                stop: function(event, ui) {
                    clones.translate();
                    var draggable = $(this);
                    if(event.pageX<sidebarWidth){
                        clones.setBlocks(clones.getBlocks().not(draggable));
                        draggable.animate({opacity: 0}, 500, function() {draggable.remove(); });
                    }else if(draggable.offset().left<sidebarWidth){
                        draggable.attr('transform', 'translate(' + sidebarWidth+',' + ui.offset.top + ')');
                    }
                    let d = draggable.find('path').attr("d");
        
                    $('.draggable').each(function() {
                        let droppable = $(this);
                        if($('#newpath').length){
                            $('#newpath').parent().append(draggable);
                            draggable.attr('transform', $('#newpath').attr('transform'));
                            $('#newpath').remove();
                        }
                    });
                    $('.drobable').each(function() {
                        let droppable = $(this);
                        if(droppable.attr('id')=='close' && droppable.css('stroke')==='rgb(255, 255, 255)'){
                            droppable.after(draggable)
                            let d = draggable.find('path').attr("d");
                            alterParentsLength(droppable, d, IF_LK_REGEX, 1);
                            const traslate =  (droppable.attr('transform').match(TRANS_REGEX)[1].split(","));  
                            draggable.attr('transform', 'translate('+ traslate[0]+','+(parseFloat(traslate[1])-4)+')');
                            droppable.attr("id", 'closed');
                            clones.setBlocks(clones.getBlocks().not(draggable));

                        }
                       
                    });
                }
              });

            if(event.pageX<sidebarWidth){
              
                clone.animate({opacity: 0}, 500, function() {clone.remove();});
            }else if(clone.offset().left<sidebarWidth){
                clone.attr('transform', 'translate(' + sidebarWidth+',' + ui.offset.top + ')');
            }
        } 
    });
    
    $(document).on('keydown', 'input', function(event) {

        const text = $(this).val();
        const width = $(this).width();
        if(text.length*12> 40){ 
            $(this).width(text.length+0.1+'ch');
            let frame = ($('#'+($(this).attr('id').split(' ')[1])));
            const path = frame.find('path');
            let d = path.attr("d");
            let match;
            match = H_REGEX.exec(d)
            let matchedString = match[0];
            let newString = `H ${text.length+6}`;
            d = d.replace(matchedString, newString);
            path.attr('d',d)
            if(frame.parent().next().is($('.move-input'))){
                $('.move-input').attr(
                    'transform','translate('+$(this).width()+',0)'
                );
            }
        }
    });
});