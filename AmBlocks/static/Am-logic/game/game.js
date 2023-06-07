$('.home.Am-workspace').attr('height', 1)

///////////// *Draw Lines and the main character* //////////////
const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
// Circle properties
let circleX = 250;
let circleY = 250;
const circleRadius = 20;
const circleColor = 'black';

// Triangle properties
const triangleSize = 10;
const triangleColor = 'white';
let triangleAngle = 0;
let wdraw = true;
// Line properties


let lineStartX = circleX;
let lineStartY = circleY - circleRadius;
let lineEndX = circleX;
let lineEndY = circleY - circleRadius;
const lineWidth = 1;
let lineColor = 'white';
let lines =[{
    startX: lineStartX,
    startY: lineStartY,
    endX: lineEndX,
    endY: lineEndY,
    color: lineColor
}];

function restoreDefaults(){
    circleX = 250;
    circleY = 250;
    triangleAngle = 0;
    lineStartX = circleX;
    lineStartY = circleY - circleRadius;
    lineEndX = circleX;
    lineEndY = circleY - circleRadius;
    drawCanvas()
}

function pen(dirc){
    if(dirc == 'up'){
        wdraw = false;
    }else
        wdraw = true;
}
// Move circle forward
function move(byDistance, direc) {
 

    const angleRadians = triangleAngle * Math.PI / 180;
    const deltaX = Math.sin(angleRadians) * byDistance;
    const deltaY = Math.cos(angleRadians) * byDistance;

    // Update circle position
    if(direc==='forward'){

        circleX += deltaX;
        circleY -= deltaY;
    }else{
        circleX -= deltaX;
        circleY += deltaY;

    }

    // Update line positions
    lineStartX = lineEndX;
    lineStartY = lineEndY;
    lineEndX = circleX;
    lineEndY = circleY;
    
    if(wdraw){

        // Add line to array
        lines.push({
            startX: lineStartX,
            startY: lineStartY,
            endX: lineEndX,
            endY: lineEndY,
            color: lineColor
        });
        
    }

    // Redraw canvas
    drawCanvas();
}

// Turn triangle left
function turn(direc, ang) {
    ang = parseFloat(ang);
    if(direc === 'left')
        triangleAngle -= ang;
    else
        triangleAngle += ang;
    // Redraw canvas
    console.log(triangleAngle)

    drawCanvas();
}

// Draw canvas
function drawCanvas() {
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw lines
    lines.forEach(function(line) {
        context.beginPath();
        context.moveTo(line.startX, line.startY);
        context.lineTo(line.endX, line.endY);
        context.lineWidth = lineWidth;
        context.strokeStyle = line.color;
        context.stroke();
    });

    // Draw circle
    context.beginPath();
    context.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI);
    context.fillStyle = circleColor;
    context.fill();
    context.lineWidth = 3
    context.strokeStyle = '#fff';
    context.stroke();
    // Draw triangle
    context.translate(circleX, circleY);
    context.rotate(triangleAngle * Math.PI / 180);
    context.beginPath();
    context.moveTo(0, -circleRadius - triangleSize);
    context.lineTo(triangleSize, -circleRadius);
    context.lineTo(-triangleSize, -circleRadius);
    context.closePath();
    context.fillStyle = triangleColor;
    context.fill();
    context.rotate(-triangleAngle * Math.PI / 180);
    context.translate(-circleX, -circleY);
}

// Initial canvas draw
drawCanvas();

///////////// *Draw Lines and the main character* //////////////

function tuggle(element){
    
    const table = element.nextElementSibling;
    if ($(table).attr('visibility') === 'visible') {
        $(table).attr('visibility', 'hidden');
    } else {
        $(table).attr('visibility', 'visible');
    }

}

function colorClick(element, event){
    const color = $(element).closest('.draggable').find('.coloring');
    color.attr('fill', event.target.style.backgroundColor);
}

function color(col){
    var color;
    if(col===''){

        var r = Math.floor(Math.random() * 256); // Random value between 0 and 255
        var g = Math.floor(Math.random() * 256);
        var b = Math.floor(Math.random() * 256);
        
        // Create the RGB color string
        color = "rgb(" + r + ", " + g + ", " + b + ")";
    }else
        color = col;

    lineColor = color
}

function colour(colors){
    colors = colors.split(',');
    var r = Math.floor(colors[0]); // Random value between 0 and 255
    var g = Math.floor(colors[1]);
    var b = Math.floor(colors[2]);
    color = "rgb(" + r + ", " + g + ", " + b + ")";
    console.log(color)
    lineColor = color

}
///////////// *Draw Lines and the main character* ////////////// 