var step = 'no translation';
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

// Line properties
let lines = [];
let lineStartX = circleX;
let lineStartY = circleY - circleRadius;
let lineEndX = circleX;
let lineEndY = circleY - circleRadius;
const lineWidth = 5;
let lineColor = 'white';


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
// Move circle forward
function moveForward(byDistance) {
    const angleRadians = triangleAngle * Math.PI / 180;
    const deltaX = Math.sin(angleRadians) * byDistance;
    const deltaY = Math.cos(angleRadians) * byDistance;

    // Update circle position
    circleX += deltaX;
    circleY -= deltaY;

    // Update line positions
    lineStartX = lineEndX;
    lineStartY = lineEndY;
    lineEndX = circleX;
    lineEndY = circleY;
    
    // Add line to array
    lines.push({
        startX: lineStartX,
        startY: lineStartY,
        endX: lineEndX,
        endY: lineEndY,
        color: lineColor
    });


    // Redraw canvas
    drawCanvas();
}

// Turn triangle left
function turnLeft() {
    triangleAngle -= 45;


    // Redraw canvas
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

function tuggle(){
    const table = document.getElementsByClassName('table');
    if ($(table).attr('visibility') === 'visible') {
        $(table).attr('visibility', 'hidden');
    } else {
        $(table).attr('visibility', 'visible');
    }

}

function setColor(event){
    lineColor = event.target.style.backgroundColor;
    $('.coloring').attr('fill', lineColor);

}

///////////// *Draw Lines and the main character* //////////////

