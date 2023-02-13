var clones = $();
$(document).ready(function() {
 
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
        return height+25;
    }
    function findCustomeDistance(fElement, Selement, regex, path, direction){
        const d = path.attr('d');
        return findDistance(fElement, Selement, findHeight(regex, d), direction);
    }
    function getAllParentPath(currentElement){
        let paths = $(); //jq container
        let parent = currentElement.parent();
        while(parent.prop("tagName") !== "svg"){
            const path = parent.find('path:first');
            if(path.length > 0){ 
                paths = paths.add(path); // return the added element
            }
            parent = parent.parent()
        }return paths;
    }
    function alterVerticalLength(droppable, d, direction){
        let draggableLength = (V_REGEX.exec(d));
        draggableLength =  (V_REGEX.exec(d));
        let paths = getAllParentPath(droppable);
        paths = paths.add(droppable.find('path:first')); // return the added element
        paths.each(function() {
            let dd = $(this).attr("d");
            const re = /v ([0-9.]+)/g
            let match = re.exec(dd);
            match = re.exec(dd);
            let matchedString = match[0];
            console.log(matchedString)
            let newString = `v ${parseFloat(matchedString.split(' ')[1])+(draggableLength[1])}`;
            dd = dd.replace(matchedString, newString);
            $(this).attr("d", dd)
        });
    }
    function alterParentsLength(d, regex, direction) {
        let paths = getAllParentPath(droppable);
        let draggableLength =  parseFloat(d.match(H_REGEX)[1]);
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
                clones = clones.add($(clone));
            }
        }
      });

    $('.create-var').click(function(){
        var foreignObject = $('.make-var');
        console.log(foreignObject)
        if (foreignObject.attr('visibility') === 'visible') {
            foreignObject.attr('visibility', 'hidden');
        } else {
            foreignObject.attr('visibility', 'visible');
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
                clones = clones.add($(clone));
            }
            clones.click(function() {
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
            $('.operation-list p').click(function(){
                var text = $(this).parent().parent().parent().parent().find('text:first');
                var currentText = $(this).text();
                text.text(currentText)
            });
            clones.draggable({
                zIndex: 100,
                start: function(event, ui) {
                },
                drag: function(event, ui) {
                    var draggable =  $(this);
                    if(draggable.parent()!=$('svg')){
                        draggable.appendTo($('svg'));
                    }
                    draggable.attr('transform', 'translate('  + ui.offset.left + ',' + ui.offset.top + ')');
                    $('.drobable').each(function() {
                        if(draggable.attr('class').indexOf('operation-logic')!==-1){
                            draggable.attr('id', 'close');
                            droppable = $(this);
                            var distance = findDistance(draggable, droppable); 
                            if (distance <= 50) 
                                droppable.css({"stroke": "white", "stroke-width": "2" });
                            else 
                                $(droppable).css({"stroke": "none", "stroke-width": "none"});
                        }
                    });
                    $('#newpath').remove();
                    $('.draggable').each(function() {
                        let into =false;
                        if(draggable.attr('class').indexOf('container')!==-1 && !$(this).closest(draggable).length){
                            const path = draggable.find('path:first');
                            const height = parseFloat(findHeight(V_REGEX, path.attr('d')));
                            let direction=[1, -1, 2];

                            for (let index = 0; index < direction.length; index++) {
                                const element = direction[index];
                                let distance = findCustomeDistance(draggable, $(this), V_REGEX, path, element); 
                                if (distance <= height && $('#newpath').length==0) { 
                                    var newPath = document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create a path in SVG's namespace
                                    newPath.setAttribute('d', path.attr('d'));
                                    newPath.setAttribute('id', 'newpath');
                                    newPath.setAttribute('fill', '#868686');
                                    console.log(2)
                                    newPath.setAttribute('visibility', 'visible');
                                    if(element==2){
                                        newPath.setAttribute('transform', 'translate('+14+','+ height/element+')');
                                        alterVerticalLength($(this), $(this).find('path').attr("d"), 1);
                                    }else{
                                        newPath.setAttribute('transform', 'translate(0,'+ height*element+')');
                                    }
                                    $(this).prepend(newPath);
                                    into = true;
                                }
                            }
                        }
                    });

                },
                stop: function(event, ui) {
                    var draggable = $(this);
                    if(event.pageX<sidebarWidth){
                        draggable.animate({opacity: 0}, 500, function() {draggable.remove(); });
                    }else if(draggable.offset().left<sidebarWidth){
                        draggable.attr('transform', 'translate(' + sidebarWidth+',' + ui.offset.top + ')');
                    }
                    let d = draggable.find('path').attr("d");
        
                    $('.draggable').each(function() {
                        let droppable = $(this);
                        if($('#newpath').length){
                            $('#newpath').parent().prepend(draggable);
                            draggable.attr('transform', $('#newpath').attr('transform'));
                            $('#newpath').remove();
                        }
                    });
                    $('.drobable').each(function() {
                        let droppable = $(this);
                        if(draggable.attr('id')=='close' && droppable.css('stroke')==='rgb(255, 255, 255)'){
                            alterParentsLength(d, IF_LK_REGEX, 1);
                            droppable.after(draggable)
                            draggable.attr('transform', droppable.attr('transform'));
                            $(this).attr("id", 'closed');
                        }
                        else if($(this).attr('id')=='closed' && droppable.css('stroke')==='none'){
                            draggable.removeAttr('id');
                            $(this).removeAttr('id');
                            alterParentsLength(d, IF_LK_REGEX, -1);
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
        if(text.length*13> width){ 
            $(this).width( text.length+1 +  "ch");
            let path = $(this).parent().parent().parent();
            let d = path.parent().find("path").attr("d");
            d = d.replace(/H [0-9.]+/, `H ${text.length+1 + parseFloat(d.match(/H ([0-9.]+)/)[1])}`);
            path.parent().find("path").attr("d", d);
            let next = path.next();
            while(next.is('g')){
                next.attr('transform','translate(' + text.length+1+')');
                next = next.next();
                console.log(next)
            }

        }
         
    });
});
