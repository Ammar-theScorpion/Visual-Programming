import {Blocks} from "./Am-interperter/front-back.js";

$(document).ready(function() {
    
    /**************ZOOM IN AND OUT ******** */
        var zoomLevel = 1; // Initial zoom level
        var svgElement = $('svg.Am-workspace'); 
        var workspaceGroup = svgElement.find('.Am-workspace.main');
        var isDragging = false;
        var lastX, lastY;
        var translateX = 0;
        var translateY = 0;
      
        // Zoom In button click event handler
        $('#zoomInButton').click(function() {
          zoomLevel += 0.05; // Increase the zoom level
          zoomWorkspace();
        });
      
        // Zoom Out button click event handler
        $('#zoomOutButton').click(function() {
          zoomLevel -= 0.05; // Decrease the zoom level
          zoomWorkspace();
        });
      
        // Mouse wheel event handler
       /* svgElement.on('mousewheel', function(event) {
          event.preventDefault();
      
          if (event.originalEvent.wheelDelta > 0) {
            zoomLevel = Math.min(zoomLevel + 0.05, 2.0);
          } else {
            zoomLevel = Math.max(zoomLevel - 0.05, 0.3);
          }
      
          zoomWorkspace();
        });
      
        // Mouse down event handler
        svgElement.mousedown(function(event) {
          isDragging = true;
          lastX = event.clientX;
          lastY = event.clientY;
        });*/
      
        // Mouse move event handler
       /* $(document).mousemove(function(event) {
          if (isDragging) {
            var deltaX = event.clientX - lastX;
            var deltaY = event.clientY - lastY;
      
            translateX += deltaX;
            translateY += deltaY;
      
            workspaceGroup.attr('transform', 'translate(' + translateX + ' ' + translateY + ')');
      
            lastX = event.clientX;
            lastY = event.clientY;
          }
        });
      
        // Mouse up event handler
        $(document).mouseup(function() {
          isDragging = false;
        });*/
      
        // Function to apply zoom to the SVG workspace
        function zoomWorkspace() {
          workspaceGroup.attr('transform', 'scale(' + zoomLevel + ') translate(' + translateX + ' ' + translateY + ')');
        }
      
    var scripts = document.getElementsByTagName('script');
    var index = scripts.length - 1;
    var myScript = scripts[index];
    var clones = Blocks.getInstance();
    let currentElement =0;
    setBlock()


    function findDistance(on_mouse, on_ground, on_mouseh, on_groundh, direction=0){
        try{

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
        }catch(e){return 1000;}
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
    function alterVerticalLength(droppable, d, height, direction, at, q=true, where){
        if(droppable.prop("tagName")!=='svg' && height >16){ 
            let paths =$();
            if(q)
                paths= getAllParentPath(droppable);
            let dp = droppable.find('path:first');
            paths = paths.add(dp); // return the added element
            let traslate =  where

            paths.each(function() {
                const traslate2 = $(this).parent().position().top;  
                    if(traslate-traslate2<100 || $(this).parent().prop("tagName")==='svg'){
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
                        traslate = traslate2;
                }
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

  
    let workspaceOffset = $(".codesspace .Am-workspace").offset();
    const G_C_L        = 20;   // oval size in any circle width
    const H_REGEX      = /H ([0-9.]+)/;
    const V_REGEX      = /v ([0-9.]+)/g;
    const IF_LK_REGEX  = /-2 H [0-9.][0-9.]+/g;
    const TRANS_REGEX  = /translate\(([^)]+)\)/;
    let VARAIBLES = [1,2,3,4,5,6,7,8,9,10];
    const VARAIBLES_ = ['a', 'b', 'd', 'e', 'f', 'g', 'h'];
    const sidebarWidth = $('.left-section').width()+38;
    const STRING_OP = [
        'Length',
        'toUpperCase',
        'toLowerCase',
        'Concatenate',
        'count',
        'split',
        'index',
        'substr',
        'Replace',
    ]


    const MATH_OP = [
        'abs',
        'floor',
        'ceiling',
        'sqrt',
        'sin',
        'cos',
        'tan',
        'asin',
        'acos',
        'atan',
        'ln',
        'log',
        'e^'
    ]

    const LIST_OP = [
        'initialize',
        'append',
        'insert',
        'pop',
        'delete',
        'clear',
        'find',
        'length',
        'replace',
    ]
    const STRING_OPMAP = {
        'Length':'Len',
        'length':'len',
        'toUpperCase':'up',
        'toLowerCase':'low',
        'Concatenate':'cat',
        'count':'cnt',//:(
        'split':'spt',//:(
        'index':'idx',//:(
        'substr':'sub',//:(
        'initialize':'init',//:(
        'insert':'int',//:(
        'clear':'cel',//:(
        'isempty':'iem',//:(
        'append':'apd',//:(
        'delete':'del',//:(
        'pop':'pop',//:(
        'find':'fin',//:(s
        'Replace':'repl',//:(
        'replace':'rep',//:(
    }
    const SET_OP = [
        'initialize',
        'insert',
        'pop',
        'find',
        'length',
        'clear',
        'isempty',
        'union',
        'intersection',
        'difference'
    ]


    const HASH_OP = [
        'initialize',
        'insert',
        'pop',
        'clear',
        'at',
        'length',
        'isempty',
        'find',
    ]

    const MOVE_OP = [
        'forward',
        'backward',
    ]
    
    const TURN_OP = [
        'right',
        'left',
    ]

    let gClicked=null;
    let ch= null;
    let chdrag= null;
    let chdirection=0;
    var edit = null;  
    var on_mouseHeight = 0
    let onImage = null;
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
      function setVar(){
        let all_list_vars = $('.make-list')
        let vars = [];
        for (let index = 1; index < all_list_vars.length; index++) {
            const element = $(all_list_vars[index]).find('.name').text();
            vars.push(element);
        }   
         all_list_vars = $('.make-set')

        for (let index = 1; index < all_list_vars.length; index++) {
            const element = $(all_list_vars[index]).find('.name').text();
            vars.push(element);
        }   
        $('.dataStructureName').text(vars[all_list_vars.length-1])
        return vars;
      }
      function generate_menu(op){
        $('.goog-option-selected').remove()
        for (let index = 0; index < op.length; index++) {
            var div = $('<div/>', {
               'class': 'goog-menuitem goog-option goog-option-selected',
               'role': 'menuitemcheckbox',
               'aria-checked': 'true',
               'id': ':c',
             });
             
             var divContent = $('<div/>', {
               'class': 'goog-menuitem-content',
             });
             
             var divCheckbox = $('<div/>', {
               'class': 'goog-menuitem-checkbox',
             });
             
             divCheckbox.appendTo(divContent);
             divContent.appendTo(div);
             
           const element = op[index];
             div.append('<p>'+element+'</p>');
           $('.goog-menu').append(div);
       }
      }
      function setDropDown(block, on='string'){
        let parent = block.closest('.draggable');
        if(parent.length===0)
            parent = block.closest('.ops');

        let find_type = parent.attr('id');
        let find_fill = parent.find('path:first').attr('fill');
        let op;
        switch(find_type){
            case'math':
                op = MATH_OP; break;
            case'set':
                op = SET_OP; break;
            case'hash':
                op = HASH_OP; break;
            case'list':
                op = LIST_OP; break;
            case'string':
                op = STRING_OP; break;
            case'move':
                op = MOVE_OP; break;
            case'turn':
                op = TURN_OP; break;
            default:
                // get list vars    
                op = setVar();
                break;
               
        }
        generate_menu(op);
        return find_fill;
      }
      $(document).on('click', '.goog-menuitem', function(event) {
        //check if parent is of type string
        let operation = $(this).find('p').text();
        let on = $(onImage).prev('.operation').first();
        const parent = on.parent().parent();
        if(parent.attr('id')!=='math'){
            operation = STRING_OPMAP[operation];
            if(operation == 'cat'|| operation == 'spt' || operation=='sub' || operation=='len' || operation=='idx'|| operation=='cnt' || operation=='repl'){
                let re = on.parent().parent();
                clones.blocks = clones.getBlocks().not(re);
                re.remove();
            }
        }
        on.text(operation)
        if(on.length===0){
            on = $(onImage).prev('.dataStructureName').first();


        }else{

            let orign = on.find('.Am-text:first').text()
            on.click()
            $('#flex').keydown()
            let opBlock = $(`#${on.text()}`); 
            if(opBlock.length!==0){
                let parent = on.closest('.draggable');
                if(parent.length===0)
                    parent = on.closest('.ops');
                parent = parent.find('path');
                
                setVar()
                let find_fill = parent.attr('fill');
                let find_stroke = parent.attr('stroke');
                opBlock.find('path:first').attr('fill',  find_fill).attr('stroke', find_stroke)
                opBlock.find('rect:first').attr('fill',  find_fill).attr('stroke', find_stroke)
                opBlock.click()
            }
        }
        $('.DropDownDiv').css('visibility', 'hidden')

      })
      
      function create_function_class(thing_name, ask=true){
        var foreignObject = $(`#${thing_name}`);
        let n =foreignObject.find('.name').text();
        let name = 'do something';
        foreignObject.draggable({ disabled: true });
        if(ask){
            name = window.prompt(`${thing_name} Name` )
            if(name===""){
                name = 'do something';
            }
        }
        
        foreignObject.find('.name').text(name)
        foreignObject.find('.fname rect').attr('width', (name.length+1.5)*8);
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
        foreignObject.click();
        return name;
    }
    $('.create-var').click(function(){
        const name = window.prompt('varaible Name')
        const clone = $('.make-var:first');
        clone.find('.name').text(name);
        if($(this).parent().hasClass('cloneal')){
           let parent = $('.cloneal').parent().parent();
           // if class, append to the selected access_modifiers
           let radio = parent.find('input');
           if(parent.find('.access_modifiers').length !== 0){
                radio.each(function(){
                   if(this.checked){
                        parent.find(this.value).after(clone);
                   } 
                });
           }else
                parent.append(clone);
        }
        else{
            
            clone.click(); // global var
        }
        translateAndSet();
        /*
        var foreignObject = $('.make-var');
        if (foreignObject.attr('visibility') === 'visible') {
            foreignObject.attr('visibility', 'hidden');
        } else {
            foreignObject.attr('visibility', 'visible');
        }*/
    });


    $('.create-list, .create-set, .create-hash').click(function(){

        /////////////////////////////////////////////////////////
                ////////// declare operations  //////////
                let op = $(this).attr('class').split('-')[1];
                if ($(`#${op}`).attr('visibility') !== 'visible') {
                    $(`#${op}`).attr('visibility', 'visible');
                    $(`#${op}`).click();
                }
                
                
                ////////// declare operations  //////////
        /////////////////////////////////////////////////////////


        const name = window.prompt('Name')
        const clone = $(`.make-${op}:first`);
        clone.find('.name').text(name);
        let d = clone.children('path:first').attr("d");
        clone.find('.listname').text(name)
        let match = ''
        while(match=IF_LK_REGEX.exec(d)){

            let matchedString = match[0];
            //let newString = `-2 H ${parseFloat(matchedString.split(' ')[2])+(draggableLength)*direction}`;
            let newString = `-2 H ${65+name.length*8+75}`;
            d = d.replace(matchedString, newString);
        }
        clone.children('path:first').attr("d", d);
        clone.click();
        // get operations if not there
        $(`#${op}`).attr('visibility','visible')
        // get operations if not there

        translateAndSet();
    });
    $('.create-function').click(function(){
        let name = create_function_class('function');

        var call = $('#caller');
    
        call.find('.name').text(name)
        console.log(call.attr('class'))

        let d = call.children('path:first').attr("d");
        let match = H_REGEX.exec(d)
            let matchedString = match[0];
            //let newString = `-2 H ${parseFloat(matchedString.split(' ')[2])+(draggableLength)*direction}`;
            let newString = `H ${name.length*12+30}`;
            d = d.replace(matchedString, newString);
        call.children('path:first').attr("d", d)
        call.attr('transform','translate(1, 350)')
        call.click()
    });
    $('.create-class').click(function(){
        create_function_class('class');
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
    });
 
    $('.button-30').click(function(){
        let block = $(this).text().split(' ');
        if(block.length>1)
            block = block[1];
        if(block == 'create_list')
            $('.create-list').click()
        else if(block == 'create_set')
            $('.create-set').click()
        else if(block == 'make_var')
            $('.create-var').click()
        else if(block == 'function')
            $('.create-function').click()
        else if(block!=='list' && block!=='create_function')
            $(`.draggable#${block}`).click();
    });
    
    function append_onList(obj){
        var clone = obj.clone(true);
   
        let appendto = obj.parent().next().children('svg');
        if(appendto.length===1){

            clone.appendTo(appendto);
        let children = appendto.children('#inputs');

            clone.attr('transform', 'translate('+16+','+ 48*children.length+')');
            const varaible = clone.find('.Am-edit .Am-text').text(); 
        }else{
            appendto = obj.parent();
            obj.remove();
        }

        let children = appendto.children('#inputs');

        let current_function =  appendto.parent().parent().parent('.draggable');
        ////

        let wrapper = current_function.find('.inputs-wrapper-container');
        let w_path = wrapper.find('path:first').attr('d');
        alterVerticalLength(wrapper, w_path, children.length*46, 1, 'm', false)

        const rects = current_function.find('.parameters').find('rect:lt(3)');
        rects.each(function(){
            $(this).attr('height', 200+children.length*45)
        })
        current_function.find('svg').attr('height',  200+children.length*40)

        return children;
    }
    $(document).on('click', 'image', function(event) {
        onImage = $(this);
        const fill = setDropDown(onImage);
        var foreignObject = $('.DropDownDiv');
        if (foreignObject.css('visibility') === 'visible') {
            foreignObject.css('visibility', 'hidden');
        } else {
            
            const traslate =  $(this).offset()
            foreignObject.css('transform', 'translate('+(parseFloat(traslate.left)-workspaceOffset.left-10)+'px,'+ (parseFloat(traslate.top)-20)+ 'px)');
            foreignObject.css('box-shadow', '6px 4px 4px rgba(0, 0, 0, 0.3)');
            foreignObject.css({'visibility': 'visible', 'background-color':fill });
        }

    });
    $(document).on('click', '.Am-edit', function(event) {
        event.stopPropagation();
        var leftValue = $(this).position().left;
        var topValue = $(this).position().top;
        $('#flex').css('left', leftValue + 'px');
        $('#flex').css('top',  topValue  + 'px');
        $('#inner').text($(this).children().last().text());
        if ($('#flex').css('display') == 'none') {
            $('#flex').css('display', 'block');
        }
        edit = $(this);
    });
//

    $('.draggable').click(function(event){
         

        var clone = $(this).clone();
        if (!clone.parent().is(".Am-workspace.main")){
            let appendto = $(".Am-workspace.main");
            if(appendto.attr('visibility') !== 'visible')
                appendto = $(".Am-workspace.main");
            clone.attr('visibility', 'visible');
            clone.addClass('clone');
            clone.appendTo(appendto);
            clones.addBlock(clone);
            translateAndSet();

            //// * FUNCTION * /////
            clone.find('.prompt').click(function(){
                const assignement = $(this).parent();
                const pos =  parseFloat(($(this).next().attr('transform').match(TRANS_REGEX)[1].split(","))[0]);  
                let path = assignement.find('path:first').attr('d');
                let match = /-2 H [0-9.][0-9.]+/g.exec(path)
                let newLength;
                if(assignement.children('.pr').length === 0){
                    newLength = '-2 H '+ (parseFloat(match[0].split(' ')[2])+115);
                    var text = $(document.createElementNS("http://www.w3.org/2000/svg", 'text')); 
                    text.attr('class', 'Am-text pr');
                    text.text('prompt uesr with ');
                    text.attr('transform', 'translate('+(95)+',25)')
                    $(this).next().attr('transform', 'translate('+(pos+115)+',11)')
                    $(this).after(text);
                    
                }else{
                    $(this).next().attr('transform', 'translate('+(pos-115)+',11)')
                    $('.pr').remove();
                    newLength = '-2 H '+ (parseFloat(match[0].split(' ')[2]) - 115);
                }
                path = path.replace(match, newLength);
                assignement.find('path:first').attr("d", path);    
            })

            clone.find('.drop_params').click(function(){
                var foreignObject = $(this).parent().find('.parameters');
                if (foreignObject.attr('visibility') === 'visible') {
                    foreignObject.attr('visibility', 'hidden');
                } else {
                    foreignObject.attr('visibility', 'visible');
                }
            });

            //////////////////  circleOps  //////////////////////////
            
       
        /////////////////  circleOps  ///////////////
            
            clone.find('.-inputs').on('click', function(event) {
                
                var clone = $(this).clone(true);
                let appendto = $(this).parent().next().children('svg');
                if(appendto.length===1){

                    clone.appendTo(appendto);
                let children = appendto.children('#inputs');

                    clone.attr('transform', 'translate('+16+','+ 48*children.length+')');
                    const varaible = clone.find('.Am-edit .Am-text').text(); 
                    $(this).find('.Am-edit .Am-text').text(VARAIBLES_[VARAIBLES_.indexOf(varaible)+1]);
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
                })
                current_function.find('svg').attr('height',  200+children.length*40)

                // Modifiy Call
                let callFunction = $('.Am-workspace.main').find('.call').filter(function(){
                    return $(this).find('.name:first').text() == current_function.find('.name').text();
                }) 
                callFunction.children('.name:first').nextAll().remove().empty();

                let parameter_names = var_names.split(', ');
                let start_x = current_function.find('.name').text().length*19+50;
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
                    
                    const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");

                        pathElement.setAttribute("stroke", "#389438");
                        pathElement.setAttribute("transform", 'translate('+(start_x-3)+', 6)');
                        pathElement.setAttribute("fill", "#FFFFFF");
                        pathElement.setAttribute("fill-opacity", "1");
                        pathElement.setAttribute("d", "m 0,0 m 16,0 H 24 a 16 16 0 0 1 0 32 H 16 a 16 16 0 0 1 0 -32 z");
                        pathElement.setAttribute("class", "circleOps");
                    let clonetext = $('.Am-edit.global:first').clone();
                    clonetext.attr('visibility','visible')
                    clonetext.attr('transform', 'translate('+(start_x+2)+',8)')
                    start_x+=50;
                    callFunction.append(pathElement);
                    callFunction.append(clonetext);
                    
                }
                path = callFunction.find('path:first').attr('d');
                match = H_REGEX.exec(path)
                let newLength = 'H '+ (start_x);
                path = path.replace(match[0], newLength);
                callFunction.find('path:first').attr("d", path);    

            });
            //// * FUNCTION * /////
            }

            ////////////////////// LIST /////////////////////////
            
            $(document).on('click', '.drop_list', function(event) {
                event.stopPropagation();

                let send = $(this);
                if($(this).attr('class').indexOf('counter')!==-1){
                     ///////////////////////////////////// FOR LOOP COUNTER ////////////////////////
                    send = send.parent().find('.change');
                    send.attr('visibility', 'visible')
                    let children = append_onList(send);
                    send.attr('visibility', 'hidden')

                    let parent = $(this).closest('#counter').first();

                    parent.children('.conuter').remove().empty()
                    let name = [];
                    let to = [];
                    for (let index = 0; index < children.length; index++) {
                        const element = children[index];
                        name.push($(element).find('.varname').text());
                        to.push($(element).find('.by').text()); 
                    }
                    let alltext = name.join(', ') + ' to ' + to.join(', ');
                    parent.find('.ecounter').text(alltext)
                    let match
                    let d = parent.find('path:first').attr('d');
                    while(match = IF_LK_REGEX.exec(d)) {
                        let matchedString = match[0];
                        //let newString = `-2 H ${parseFloat(matchedString.split(' ')[2])+(draggableLength)*direction}`;
                        let newString = `-2 H ${alltext.length*4+140}`;
                        d = d.replace(matchedString, newString);
                    }
                    parent.find('path:first').attr('d', d);
                     ///////////////////////////////////// FOR LOOP COUNTER ////////////////////////

                }else{
                    let parent = $(this).closest('.draggable').first();

                    let children = append_onList(send);
                    let d = parent.find('path:first').attr('d');
                    const parent_length = /-2 H [0-9.][0-9.]+/.exec(d)[0].split(' ')[2];
                    let fill_path = 'v ';
                    let match ;
                    let re = /v ([0-9.]+)/g
                    match =  re.exec(d)
                    let newLength = fill_path + ((children.length*30+10) );
                    d = d.replace(match[0], newLength);
                    d = d.replace(match[0], newLength);
                    parent.find('path:first').attr('d',d);
                    let text = parent.children('.list_create').find('.Am-text');
                    for (let index = 0; index < text.length; index++) {
                        const element = $(text[index]).text();
                        VARAIBLES[index] = element;
                    }
                    parent.children('.list_create').remove().empty();
                    for (let index = 0; index < children.length; index++) {

                        // create the main group element
                        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
                        group.setAttribute("class", "list_create");
                        group.setAttribute("transform", "translate(8,35)");

                        // create the path element
                        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                        path.setAttribute("fill", "#FFAB19");
                        path.setAttribute("d", "m 0,0 H 65 v 16 c 0,10 0,0 0,10 s 0,10  0,7.5 v 4 H 0 V 20 c 0,-10 -8,8 -8,-7.5 s 8,2.5 8,-7.5 z");
                        group.appendChild(path);

                        // create the nested group element
                        const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");

                        pathElement.setAttribute("stroke", "#389438");
                        pathElement.setAttribute("transform", "translate(6, 3)");
                        pathElement.setAttribute("fill", "#FFFFFF");
                        pathElement.setAttribute("fill-opacity", "1");
                        pathElement.setAttribute("d", "m 0,0 m 16,0 H 24 a 16 16 0 0 1 0 32 H 16 a 16 16 0 0 1 0 -32 z");
                        pathElement.setAttribute("class", "circleOps");
                        group.appendChild(pathElement);

                        const nestedGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
                        nestedGroup.setAttribute("class", "op Am-edit");
                        nestedGroup.setAttribute("transform", "translate(10,0)");
                        nestedGroup.setAttribute("style", "display: block;");
                        group.appendChild(nestedGroup);

                        // create the rectangle element
                        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                        rect.setAttribute("rx", "4");
                        rect.setAttribute("ry", "4");
                        rect.setAttribute("fill", "#fff");
                        rect.setAttribute("x", "10");
                        rect.setAttribute("y", "10");
                        rect.setAttribute("height", "20");
                        rect.setAttribute("width", "20");
                        nestedGroup.appendChild(rect);

                        // create the text element

                        let var_name = VARAIBLES[(index)%VARAIBLES.length];

                        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                        text.setAttribute("class", "Am-text");
                        text.setAttribute("fill", "#000");
                        text.setAttribute("x", "8");
                        text.setAttribute("y", "20");
                        text.textContent =  var_name;
                        nestedGroup.appendChild(text);

                        $(group).attr('transform', 'translate('+(parseFloat((parent_length)))+', '+((index)*40)+')');
                        
                        parent.append(group);
                        
                    }
                }
                
            });
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
                    $(this).parent().find('svg:first').append(clone);
                }
                else{
                    $('.cloneal').remove();
                }
            });
            ////////////////////// LIST /////////////////////////
            
            ////////////////////// operations /////////////////////////
            clone.find('.select').click(function(){
                var foreignObject = $(this).find('foreignObject');
                if (foreignObject.attr('visibility') === 'visible') {
                    foreignObject.attr('visibility', 'hidden');
                } else {
                    foreignObject.attr('visibility', 'visible');
                }
            });
            clone.find('.operation-var p').click(function(){
                var text = $(this).parent().parent().parent().parent().find('text:first');
                var currentText = $(this).text();
                text.text(currentText)
            });
            clone.find('.operation-list p').click(function(){
                var text = $(this).parent().parent().parent().parent().find('text:first');
                var currentText = $(this).text();
                text.text(currentText)
            });
 
            ////////////////////// operations /////////////////////////


        $('#inner').on("blur", function() {
            $('#flex').css('display','none');
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
                isDragging = false;

                translateAndSet();
                let draggable = $(this);
                let appendto = $('.Am-workspace');
                if(appendto.attr('visibility') !== 'visible')
                    appendto = $(".Am-workspace.main");
                ///////////////////////// MOVEMENT //////////////////////

        
                workspaceOffset =  $('.codesspace .Am-workspace').offset();
                const left = (ui.offset.left - workspaceOffset.left - translateX) / zoomLevel;
                const top = (ui.offset.top - workspaceOffset.top - translateY) / zoomLevel;
                
                draggable.attr('transform', 'translate(' + left + ',' + top + ')');
                draggable.addClass('shadow')
                ///////////////////////// MOVEMENT //////////////////////
                clones.getBlocks().filter('.draggable').find('.circleOps').each(function(){
                    if(!$(this).closest(draggable).length && draggable.hasClass('circleOps')){
                        const droppable = $(this);
                        var distance = findDistance(draggable, droppable); 
                        if (distance <= 50) { 
                            if(!droppable.attr('id'))
                                droppable.attr('id', 'close');
                            droppable.css({"stroke": "white", "stroke-width": "2" });
                        }
                        else{
                            /// remove the block by appending again to the global scope
                            if(draggable.parent().is(droppable.parent())){
                                let leftOffset = droppable.offset().left;

                                let droppableX =  parseInt((droppable.attr('transform').match(TRANS_REGEX)[1].split(","))[0])+parseFloat(leftOffset);  
        
                                let oparent = getAllParentPath(draggable);
                                let dlength =  parseFloat(draggable.find('path').attr("d").match(H_REGEX)[1]);

                                oparent.each(function(){
                                    ////****** *alter HLength **** */
                                    let desired_path = $(this).attr("d");
                                    
                                    //////////// check parent type first ///////////////
                                    let type = H_REGEX;
                                    let st = 'H ';
                                    let olength;
                                    if($(this).parent().hasClass('iflike')){
                                        type = IF_LK_REGEX;
                                        st = '-2 H ';
                                    }
                                    let match = desired_path.match(type);
                                    
                                    if(type == IF_LK_REGEX)
                                        olength =  parseFloat(match[0].split(' ')[2]);
                                    else
                                        olength =  parseFloat(match[1]);
                                    let newLength = parseInt(olength) - parseInt(dlength)+G_C_L ;
                                    
                                    // sub into orignal one
                                    desired_path = desired_path.replace(match[0], st+newLength);
                                    
                                    $(this).attr("d", desired_path);
                                    ////****** *alter HLength **** */
        
                                    /////**** for each block push (moveit) forward ***** */
                                    let moveIt = $(this).parent().find('> .moveit');
        
                                    moveIt.each(function(){
                                        let t = $(this).attr('transform').match(TRANS_REGEX)[1].split(",");  
                                        let leftOffset = parseFloat($(this).parent().offset().left);
                                        let x = parseFloat(t[0]);  
                                        let y = t[1];  
                                        if(droppableX < x+ leftOffset){
                                            let g = x-parseInt(dlength) + G_C_L;
                                            $(this).attr('transform', `translate(${g}, ${y})`);
                                        }
        
                                    });
                                    /////**** for each block push (moveit) forward ***** */
                                });
                                $('.Am-workspace.main').append(draggable)
        
                            }
                            /// remove the block by appending again to the global scope
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

                clones.getBlocks().filter('.draggable').each(function() {
                    if( !draggable.hasClass('circleOps') && draggable.attr('id')!='function' && draggable.attr('id')!='condition' && $(this).attr('id')!='condition'){
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
                                let distance = findCustomeDistance(draggable, $(this), onmouse_height+all_height, onground_height ,element); 
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
                                        let transform = 'translate( 0'+','+(-(onmouse_height+all_height)) +')';
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
                                            const traslate2 = $(this).position().top;  
                                            if(traslate==traslate2){
                                                transform = 'translate( 0'+','+(onground_height+onmouse_height) +')';
                                                $(this).attr('transform',  transform);
                                                $(this).addClass('affected');
                                            }
                                        });
                                        const gppos =  $(this).position().top;  
                                        const ppos =  $(this).parent().position().top;  
                                        if(gppos-ppos<100){
                                            alterVerticalLength($(this).parent(), onground_path, onground_height+onmouse_height+all_height, 1, 'm',true, gppos)
                                        }
                                    } 
                                     if(element==2 && $(this).attr('class').indexOf('container')!==-1){
                                        $(this).append(newPath);
                                        let x = 16;
                                        if($(this).attr('class').indexOf('thick')!==-1)
                                            x = 22;
                                        newPath.setAttribute('transform', 'translate('+x+','+ 50+')');
                                        const traslate =  $(newPath).position().top;  
                                        alterVerticalLength($(this), onground_path, onmouse_height+all_height, 1, 'm',true, traslate)
                                        
                                        $(this).children('.draggable').each(function(){
                                            const traslate2 = $(this).position().top;  
                                            if(traslate<traslate2){
                                                let transform = 'translate( 0'+','+(onground_height+onmouse_height+all_height-20) +')';
                                                $(this).attr('transform',  transform);
                                                $(this).addClass('affected');
                                            }
                                        });
                                    }
                                }
                                else if(distance>onmouse_height && $('#newpath').length && draggable.is(chdrag) && $(this).is(ch) && element == chdirection ){
                                    const traslate =  $('#newpath').position().top;  
                                    $(this).children('.draggable').each(function(){
                                        const traslate2 = $(this).position().top;  
                                        if(traslate==traslate2){
                                            let transform = 'translate( 0'+','+(onground_height) +')';
                                            $(this).attr('transform',  transform);
                                            $(this).addClass('affected');
                                        }
                                    });
                                    if(chdirection==2){
                                        alterVerticalLength($(this), onground_path, onmouse_height+all_height, -1, 'm')
                                    }
                                    chdirection = 0
                                    $('#newpath').remove();
                                    ch = null;
                                }
                            }
                         
                        }
                        translateAndSet();
           
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
                var draggable = $(this);
                if(event.pageX<sidebarWidth){
                    clones.setBlocks(clones.getBlocks().not(draggable));
                    draggable.animate({opacity: 0}, 500, function() {draggable.remove(); });
                }else if(draggable.offset().left<sidebarWidth){
                   draggable.attr('transform', 'translate(' + sidebarWidth+',' + ui.offset.top + ')');
                }
                let d = draggable.find('path').attr("d");
    
                let droppable = $(this);
                    if($('#newpath').length){
                        const traslate = draggable.position().top;  
                        let appendon = draggable;
                        if(chdirection==1){
                            draggable.addClass('selected');
                        }
                      
                        if(chdirection==-1){
                                droppable.addClass('selected');
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
              

                $('.circleOps').each(function() {  //////// drop a block into () 
                    let droppable = $(this); /// 
                    
                    if(droppable.attr('id')=='close' && droppable.css('stroke')==='rgb(255, 255, 255)'){
                        // calculate new length
                        let dlength =  parseFloat(d.match(H_REGEX)[1]);
                        let leftOffset = droppable.offset().left;

                        let droppableX =  parseInt((droppable.attr('transform').match(TRANS_REGEX)[1].split(","))[0])+parseFloat(leftOffset);  

                        let parant = droppable.parent();
                        
                        droppable.parent().append(draggable)
                        const traslate =  (droppable.attr('transform').match(TRANS_REGEX)[1].split(","));  
                        draggable.attr('transform', 'translate('+ traslate[0]+','+(parseFloat(traslate[1])-4)+')');
                        droppable.attr("id", 'closed');
                        clones.setBlocks(clones.getBlocks().not(draggable));


                        let oparent = getAllParentPath(droppable);
                        oparent.each(function(){
                            ////****** *alter HLength **** */
                            let desired_path = $(this).attr("d");
                            
                            //////////// check parent type first ///////////////
                            let type = H_REGEX;
                            let st = 'H ';
                            let olength;
                            if($(this).parent().hasClass('iflike')){
                                type = IF_LK_REGEX;
                                st = '-2 H ';
                            }
                            let match = desired_path.match(type);
                            
                            if(type == IF_LK_REGEX)
                                olength =  parseFloat(match[0].split(' ')[2]);
                            else
                                olength =  parseFloat(match[1]);
                            let newLength = parseInt(dlength) + parseInt(olength) - G_C_L;
                            
                            // sub into orignal one
                            desired_path = desired_path.replace(match[0], st+newLength);
                            
                            $(this).attr("d", desired_path);
                            ////****** *alter HLength **** */

                            /////**** for each block push (moveit) forward ***** */
                            let moveIt = $(this).parent().find('> .moveit');

                            moveIt.each(function(){
                                let t = $(this).attr('transform').match(TRANS_REGEX)[1].split(",");  
                                let leftOffset = parseFloat($(this).parent().offset().left);
                                let x = parseFloat(t[0]);  
                                let y = t[1];  
                                if(droppableX < x+ leftOffset){
                                    let g = x+parseInt(dlength) - G_C_L;
                                    $(this).attr('transform', `translate(${g}, ${y})`);
                                }

                            });
                            /////**** for each block push (moveit) forward ***** */
                        });


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
        let direction = 1;
        if(event.keyCode == 8)
            direction=-1;
            var charCode = (event.which) ? event.which : event.keyCode;
            if($(this).width()!=25){
            
                const inputWidth = $(this).width();
                const inputText = edit.children().first();
                inputText.css('width', inputWidth);
                let prev_cri = null;
                if(edit.prev().hasClass('circleOps')){ 
                    let d = edit.prev().attr("d");
                    let match = d.match(H_REGEX);
                    let length = parseFloat(match[1]);
                    d= d.replace(match[0], 'H '+((8*direction)+length));

                    edit.prev().attr("d", d);
                }

                let droppable =  edit;
                let droppableX =  (droppable.attr('transform').match(TRANS_REGEX)[1].split(","))[0];  
                // calculate new length

                let oparent = getAllParentPath(droppable);
                oparent.each(function(){
                    ////****** *alter HLength **** */
                    let desired_path = $(this).attr("d");
                    
                    //////////// check parent type first ///////////////
                    let type = H_REGEX;
                    let st = 'H ';
                    let dlength = inputWidth;
                    let olength =  parseFloat($(this).attr("d").match(H_REGEX)[1]);

                    if($(this).parent().hasClass('iflike')){
                        type = IF_LK_REGEX;
                        st = '-2 H ';
                    }
                    let match = desired_path.match(type);
                    
                    if(type == IF_LK_REGEX)
                        olength =  parseFloat(match[0].split(' ')[2]);
                    let newLength = (8*direction) + parseInt(olength);
                    
                    // sub into orignal one
                    desired_path = desired_path.replace(match[0], st+newLength);
                    
                    $(this).attr("d", desired_path);
                    ////****** *alter HLength **** */

                    /////**** for each block push (moveit) forward ***** */
                    let moveIt = $(this).parent().find('.moveit');

                    moveIt.each(function(){
                        let t = $(this).attr('transform').match(TRANS_REGEX)[1].split(",");  
                        let x = parseFloat(t[0]);  
                        let y = t[1];  
                        if(droppableX < x){
                            let g = x+8*direction;
                            $(this).attr('transform', `translate(${g}, ${y})`);
                        }

                    });
                    /////**** for each block push (moveit) forward ***** */
                });
        }

      
 
    });
    function generate_error_msg(on, errmsg){
        //let at =  (on.attr('transform').match(TRANS_REGEX)[1].split(",")); 
        const clone_msg = $('.DropDownDiv')
        if (clone_msg.css('visibility') === 'visible') {
            clone_msg.css('visibility', 'hidden');
        } else {
            
            const traslate =  on.offset();
            clone_msg.css('transform', 'translate('+(parseFloat(traslate.left)-workspaceOffset.left+50)+'px,'+ (parseFloat(traslate.top)-40)+ 'px)');
            clone_msg.css('box-shadow', '6px 4px 4px rgba(0, 0, 0, 0.3)');
            clone_msg.css({'visibility': 'visible'});
            let op=[errmsg]
            generate_menu(op);
        }


    }
    $('#flex').on('keyup', function(event) {
        let text = $(this).text();
        if (text !== undefined) { 
            text = text.replace(/\n/, ''); 
            if(edit.closest('.draggable').attr('class').indexOf('function')!==-1){
                let callFunction = $('svg').find('.call').filter(function(){
                    return $(this).find('.name').text() == edit.closest('.draggable').find('.name').text();

                }) 
                callFunction.find('.name').text(text);
                let path = callFunction.find('path:first').attr('d');
                let match =  /H [0-9.]+/g.exec(path)
                let newLength = 'H '+ (parseFloat(match[0].split(' ')[1]) + 8);
                path = path.replace(match, newLength);
                callFunction.find('path:first').attr("d", path);
            }
            edit.find('.Am-text').text(text);
            translateAndSet();
        }
        /////////////////////////////////////////////////////////
                /////////////change for para////////////
                if(edit.hasClass('for')){

                    let prev_text = edit.closest('.parameters').parent().find('.ecounter').text().split('to')[1];
                    edit.closest('.parameters').parent().find('.ecounter').text( $(this).text() +' to ' + prev_text);
                }else if(edit.hasClass('to')){
                        let prev_text = edit.closest('.parameters').parent().find('.ecounter').text().split('to')[0];
                        edit.closest('.parameters').parent().find('.ecounter').text( prev_text +' to ' + $(this).text() );
                }
                /////////////change for para////////////
                /////////////check condition////////////
                let edit_parent = edit.parent();
                let from = parseInt(edit_parent.find('.Am-edit.from').find('.Am-text').text());
                let to =   parseInt(edit_parent.find('.Am-edit.to')  .find('.Am-text').text());
                let by =   parseInt(edit_parent.find('.Am-edit.by')  .find('.Am-text').text());

                if(to>from){
                    if(by<0) 
                       generate_error_msg(edit.closest('.parameters').parent(), 'infinte loop: Consider changing the condition or incremental');
                }else{
                    if(by>0)
                        generate_error_msg(edit.closest('.parameters').parent(), 'infinte loop: Consider changing the condition or incremental');
                }
                    
                        //disply error
                /////////////check condition////////////
        /////////////////////////////////////////////////////////

    });
    // set up the main function
    

////////// *Get and Translate Blocks* //////////

    window.translateDrawingBlocks = function (){
        const runButton = document.querySelector('#runButton');
        if(runButton.textContent == 'Reset'){
            runButton.textContent = 'Run Program'
            clones.clean();
            lines = [];
            restoreDefaults()
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
                    case 'set':
                        setTimeout(function() {
                            setColor(element[element.length - 1].textContent);
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
    var lang='C++';
    var code = '{{prev_code|safe}}';
    let stepped = false
	  window.translateAndSet =function(){
		  if(window.step!='no translation'){
			let C_Code_List = ['',''];
			let code = '';
            if(window.lang_id == 1)
                lang = 'Python'
            else
                lang = 'C++'
			if(window.step==1 && stepped){
				C_Code_List = clones.translateSteps(lang, currentElement);
				if(currentElement+1<clones.blocks.length)
					currentElement++;
				else
					currentElement=0;
			}
			else if(window.step!=1){
				C_Code_List = clones.translate(lang);
			}

            code = C_Code_List[0];
			if(code!=='``'){
				language = code;
				language_type();
			}
			const error = C_Code_List[1];
			document.getElementById('error').innerHTML = error;
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
        document.getElementById('user_code_input').value = language; // fill djano's form
        
        let tname = document.querySelector('.header').textContent;
          if(event.target.innerHTML.indexOf('step')!==-1){
             stepped = true;
             window.translateAndSet()
          }
          event.preventDefault();
          let text = language.replace(/input/g, 'custom_input');
          //text = '\nprint(0)\nv=custom_input("enter v1")\nprint(v)\nprint(0)\nv=custom_input("enter v2")\n\nhv=custom_input("enter v3")\n'
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
                'tname': tname,
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
          var socket = new WebSocket('ws://127.0.0.1:8080');
          socket.addEventListener('open', function (event) {
            console.log('Socket connected!');
          });
      
          socket.addEventListener('message', function (event) {
                console.log('Message received: ' + event.data);
                socket.send(window.prompt(event.data)) 
          });
      
          socket.addEventListener('close', function (event) {
              console.log('Socket closed!');
          });
        
  
       });
       window.language_type=function (){
          /*const button = event.target;
          lang = button.innerHTML;*/

          var code = language
          var codeNode = document.createElement("pre");
          codeNode.style.whiteSpace = "pre-wrap";
          codeNode.textContent = code;
          document.getElementById("user_code").innerHTML = "";
          document.getElementById("user_code").appendChild(codeNode);
       }


//*************** check the calling script for not setting the initial func in case 'game' ***************** */

   
    console.log(window.calling_script)
    /*if(window.calling_script!=undefined){

        const name = create_function_class('function', false);
        var call = $('#caller');
    
        call.find('.name').text(name)
        console.log(call.attr('class'))

        let d = call.children('path:first').attr("d");
        let match = H_REGEX.exec(d)
            let matchedString = match[0];
            //let newString = `-2 H ${parseFloat(matchedString.split(' ')[2])+(draggableLength)*direction}`;
            let newString = `H ${name.length*12+10}`;
            d = d.replace(matchedString, newString);
        call.children('path:first').attr("d", d)
        call.attr('transform','translate(1, 350)')
        call.click();//set up main function
    }*/
    //$(".call.draggable").off("mousedown mousemove mouseup").removeClass("draggable");

//*************** check the calling script for not setting the initial func in case 'game' ***************** */
});
