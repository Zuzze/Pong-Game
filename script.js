var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

//========== SETTINGS ==========
//ball settings
var x = canvas.width/2; //ball x start position 
var y = canvas.height - 30; //ball y start position
const BALL_RADIUS = 10;
var delta_x = 2; //change between ball x position (px) between frames
var delta_y = -2;  //change between ball x position (px) between frames

//paddle settings
const PADDLE_HEIGHT = 10;
const PADDLE_WIDTH = 75;
var paddlePosX = (canvas.width - PADDLE_WIDTH)/2;//paddle starting position
const PADDLE_DELTA = 7; //amount of pixels that paddle moves when key pressed

//brick settings
const BRICK_ROW_COUNT = 3;
const BRICK_COL_COUNT = 5;
const BRICK_WIDTH = 75;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 30;
const BRICK_OFFSET_LEFT = 30;
var bricks = [];
createBricks();

//events
var rightPressed = false;
var leftPressed = false;

//score and lives
var score = 0;
var lives = 3;

//========== FUNCTIONS ==========
function drawBall() {
    ctx.beginPath();
    //circle: x center, y center, radius, start angle (rad), end angle (rad), ?direction
    ctx.arc(x, y, BALL_RADIUS, 0, Math.PI*2);
    ctx.fillStyle = "green";
   
    ctx.fill();
    ctx.closePath();
}

function drawPaddle(){
    ctx.beginPath();
    ctx.rect(paddlePosX, canvas.height - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawLives() {
    ctx.font = "16px Courier New";
    ctx.fillStyle = "#0095DD";
    ctx.fillText(`Lives: ${lives}`, canvas.width - 90, 20);
} 

function checkCollisionToWalls(){
    // y values start from zero on top left (x,0) and bottom edge is where canvas ends (x, canvasHeight)
    // if ball collides with bottom edge --> game over
    if(y + delta_y < BALL_RADIUS) {
        delta_y = -delta_y;
    } else if(y + delta_y > canvas.height - BALL_RADIUS) {
        if(x > paddlePosX && x < paddlePosX + PADDLE_WIDTH) {
            delta_y = -delta_y;
        } else {
            lives--;
            if(!lives) {
                alert("GAME OVER");
                document.location.reload();
            }
            else {
                x = canvas.width/2;
                y = canvas.height-30;
                dx = 2;
                dy = -2;
                paddlePosX = (canvas.width - PADDLE_WIDTH)/2;
            }
        }
    }
    // x values start from top left and grow to the right
    if(x + delta_x > canvas.width - BALL_RADIUS || x + delta_x < BALL_RADIUS) {
        delta_x = -delta_x;
    }
}

function createBricks(){
    for(var c = 0; c < BRICK_COL_COUNT; c++) {
        bricks[c] = [];
        for(var r = 0; r < BRICK_ROW_COUNT; r++) {
            //if status === 1 --> draw brick to canvas
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

function drawBricks() {
    for(var c = 0; c < BRICK_COL_COUNT; c++) {
        for(var r = 0; r < BRICK_ROW_COUNT; r++) {
            if(bricks[c][r].status == 1) {
                var brickPosX = (c * (BRICK_WIDTH + BRICK_PADDING)) + BRICK_OFFSET_LEFT;
                var brickPosY = (r * (BRICK_HEIGHT + BRICK_PADDING)) + BRICK_OFFSET_TOP;
                bricks[c][r].x = brickPosX;
                bricks[c][r].y = brickPosY;
                ctx.beginPath();
                ctx.rect(brickPosX, brickPosY, BRICK_WIDTH, BRICK_HEIGHT);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawScore() {
    ctx.font = "16px Courier New";
    ctx.fillStyle = "#0095DD";
    ctx.fillText(`Score: ${score}`, 8, 20);
}

function checkKeyPresses(){
    if(rightPressed && paddlePosX < canvas.width - PADDLE_WIDTH) {
        paddlePosX += PADDLE_DELTA;
    } else if(leftPressed && paddlePosX > 0) {
        paddlePosX -= PADDLE_DELTA;
    }
}

function moveBall() {
    x += delta_x;
    y += delta_y;
}

//========== MAIN ==========
function draw() {
    //clear possible previous content on canvas within given rectangle
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();

    checkCollisionToBricks();
    checkCollisionToWalls();
    checkKeyPresses();
    moveBall();

    requestAnimationFrame(draw);//loop function
}

//========== EVENTS ==========
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function keyDownHandler(e) {
    if(e.keyCode == 39) {
        rightPressed = true;
    }
    else if(e.keyCode == 37) {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if(e.keyCode == 39) {
        rightPressed = false;
    }
    else if(e.keyCode == 37) {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX > 0 && relativeX < canvas.width) {
        paddlePosX = relativeX - PADDLE_WIDTH/2;
        if (paddlePosX < 0){
            paddlePosX = 0;
        } else if (paddlePosX > canvas.width - PADDLE_WIDTH){
            paddlePosX = canvas.width - PADDLE_WIDTH
        }        
    }
}

function checkCollisionToBricks(){
    for(var c = 0; c < BRICK_COL_COUNT; c++) {
        for(var r = 0; r < BRICK_ROW_COUNT; r++) {
            var b = bricks[c][r];
            if(b.status == 1) {
                // change direction when brick hit
                if(x > b.x && x < b.x + BRICK_WIDTH && y > b.y - BALL_RADIUS && y < b.y + BRICK_HEIGHT + BALL_RADIUS) {
                    delta_y = -delta_y;
                    b.status = 0 //make brick invisible after it is hit
                    score++;
                    //if all bricks destroyed, game won
                    if(score == BRICK_ROW_COUNT * BRICK_COL_COUNT) {
                        alert("YOU WIN, CONGRATULATIONS!");
                        document.location.reload();
                    }
                }
            }
        }
    }
}

//========== GAME LOOP ==========
//setInterval(draw, 10);
draw();


//mini tutorial:
// when drawing, put code of one element between beginPath() and closePath()

//rectangle: top left x coord, top left y coord, width, height
// ctx.rect(20, 40, 50, 50); 

//circle: x center, y center, radius, start angle (rad), end angle (rad), ?direction
//ctx.arc(240, 160, 20, 0, Math.PI*2, false);
