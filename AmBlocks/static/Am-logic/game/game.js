/*function start(){
    let canvas = document.querySelector('canvas');
    console.log(canvas);
    let context = canvas.getContext('2d');
    context.fillStyle = '#fff'
    context.beginPath();
    //context.moveTo(0,0);
    //context.lineTo(100,100);
    context.strokeStyle = '#fff'
    context.lineWidth = 3
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.moveTo(195, 180);
    context.lineTo(200, 170);
    context.lineTo(205, 180);
    context.stroke();

}   
 
document.onload =  start();*/
// Assuming you have a canvas element with id "myCanvas"
class Point{
    constructor(x, y){
        this.x = x
        this.y = y
    }
}
const canvas = document.querySelector('canvas');
const context = canvas.getContext("2d");
context.strokeStyle='#fff'
context.lineWidth = 3

function drawArc(x, y) {
    context.beginPath();
    context.arc(x, y, 15, 0, 2 * Math.PI);
    context.save();
    context.rotate(0);
    
    context.translate(x, y);
    context.moveTo(-5, -20);
    context.lineTo(0, -30);
    context.lineTo(5, -20);
    context.closePath();
    context.stroke();
}

function animate(newX, newY) {

    drawArc(newX, newY);
    //let inNewXDir = Math.sqrt(Math.pow((x-newX), 2) + Math.pow((y-newY), 2));
    //x += inNewXDir/x;
    //y += inNewXDir/y;
    console.log(newX)
}

function move_at(newx, newy){
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.beginPath();
    for (let index = 0; index < points.length; index+=2) {
        const element = points[index];
        context.moveTo(element.x, element.y)
        const element1 = points[index+1];
        context.lineTo(element1.x, element1.y)
    }
    context.closePath();
    context.stroke();

    context.save()
    context.beginPath();
    context.arc(newx, newy, 15, 0, 2 * Math.PI);
    context.translate(newx, newy);
    context.moveTo(-5, -20);
    context.lineTo(0, -30);
    context.lineTo(5, -20);
    context.closePath();
    context.stroke();
    context.restore()
    

}
let x = 200;
let y = 200;
let newx=x+100;
let newy=y+100;
let points = [];
points.push(new Point(x, y)); 
points.push(new Point(newx, newy)); 
move_at(x, newy);
y=newy
points.push(new Point(x, y)); 
points.push(new Point(newx, newy)); 
move_at(newx, y);
x=newx
newy=newy-100;
points.push(new Point(x, y)); 
points.push(new Point(newx, newy)); 
 
move_at(x, newy);
newx=x-100
points.push(new Point(x, y)); 
points.push(new Point(newx, newy)); 
move_at(newx, newy);

//context.translate(0, 0);
//context.rotate(Math.PI/2)
//move_at(0, 0);
