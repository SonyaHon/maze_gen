var remote = require('electron').remote;
var closeGame = remote.require('./app.js').closeGame;

var rows;
var cols;
var w = 100;

var grid = [];
var stack = [];
var current;

var isGame = false;
var start = true;

var salute = [];

function index(j, i) {
    if(i < 0 || i > rows - 1 || j < 0 || j > cols - 1) return -1;
    else return i + j * cols;
}

var playerPath = {
    cells: [],
    addCell: function(c) {
        this.cells.push(c);
    },
    show: function() {
        if(this.cells.length > 1) {
            var j = 0;
            for(var i = 0; i < this.cells.length - 1; i++) {
                   j++;
                   noStroke();
                   fill(0, 255, 0);

                   rect(this.cells[i].x * w + 2 * (w / 5), this.cells[i].y * w + 2 * (w / 5), (w / 5), (w / 5));

                   rect(this.cells[j].x * w + 2 * (w / 5), this.cells[j].y * w + 2 * (w / 5), (w / 5), (w / 5));

                   rect(this.cells[i].x * w + 2 * (w / 5), this.cells[i].y * w + 2 * (w / 5), //(w / 5), (w / 5));
                        (this.cells[j].x * w + 3 * (w / 5)) - (this.cells[i].x * w + 2 * (w / 5)), 
                        (this.cells[j].y * w + 3 * (w / 5)) - (this.cells[i].y * w + 2 * (w / 5))); 
            }
        }
    }
}

var player = {
    x: 0,
    y: 0,
    show: function() {
        noStroke();
        fill(255, 0, 0);
        rect(this.x * w + (w / 2) / 2, this.y * w + (w / 2) / 2, w - (w / 2), w - (w / 2));
    }
}

function setup() {
    createCanvas(600, 600);
    unloadScrollBars();

    rows = height/w;
    cols = width/w;

    for(var i = 0; i < rows; i++) {
        for(var j = 0; j < cols; j++) {
            grid.push(new Cell(j, i));
        }
    }

    current = grid[0];
    playerPath.addCell(current);

    do{
        current.visited = true;
        next = current.checkNeighbors();


        if(next) {
            stack.push(current);
            next.visited = true;
            removeWalls(current, next);
            current = next;
        }
     } while(stack.length > 0); 

     repairWalls(); 

     angleMode(DEGREES);
     randomSeed();

     for(var i = 0; i < 5; i++) {
        salute.push(new Salute(random(10, width - 10), random(10, height - 10)));
     }
}

function draw() {
    background(24, 36, 56);

    if(start) {
        textSize(32);
        fill(255);
        text('ARE YOU READY',  width / 2 - 130, height / 2 - 40);
        text('FOR THE POWER OF', width / 2 - 160, height / 2);
        fill(100, 10, 10);
        text('THE MAZE_THE_RATOR!?', width / 2 - 200, height / 2 + 40);

        if(keyIsDown(ENTER)) {
            start = false;
            isGame = true;
        }
    }

    if(isGame) {
        for(var i = 0; i < grid.length; i++) {
            grid[i].show();
        }
        playerPath.show();
        player.show();

        noStroke();
        fill(255, 0, 0);
        rect(grid[grid.length - 1].x * w + (w / 2) / 2, grid[grid.length - 1].y * w + (w / 2) / 2, w - (w / 2), w - (w / 2));
    }
    
    if(checkGameOver()) {
        isGame = false;
        
    }
            
    if(!isGame && !start) {
        textSize(32);
        fill(255);
        text('YOU WON!!!', width / 2 - 80, height / 2);

        //TODO DRAW SALUTE
       
        for(var i = 0; i < salute.length; i++) {
            salute[i].show();
            salute[i].update();
        }

        if(keyIsDown(ENTER)) {
            closeGame();
        }
    }
}

function keyPressed(evt) {
    if (evt.code == "ArrowRight") {
        if(player.x + 1 < cols && canGo(player.x, player.y, player.x + 1, player.y)) {
            player.x += 1;
            playerPath.addCell(grid[index(player.y, player.x)]);
        }
    } else if (evt.code == "ArrowLeft") {
        if(player.x - 1 >= 0 && canGo(player.x, player.y, player.x - 1, player.y)) {
            player.x -= 1;
            playerPath.addCell(grid[index(player.y, player.x)]);
        }
    } else if (evt.code == "ArrowUp") {
        if(player.y - 1 >= 0 && canGo(player.x, player.y, player.x, player.y - 1)) {
            player.y -= 1;
            playerPath.addCell(grid[index(player.y, player.x)]);
        }
    } else if (evt.code == "ArrowDown") {
        if(player.y + 1 < rows && canGo(player.x, player.y, player.x, player.y + 1)) {
            player.y += 1;
            playerPath.addCell(grid[index(player.y, player.x)]);
        }
    }
}

function canGo(px, py, a, b) {
    var curCell = grid[index(py, px)];
    var goCell = grid[index(b, a)];

    var dx = curCell.x - goCell.x;
    var dy = curCell.y - goCell.y;

    if(dx == -1 || dx == 1) {
        if(dx == -1) { // whants to go on the right
            if(curCell.walls[1] == false && goCell.walls[3] == false) return true;
        } else if(dx == 1) {
            if(curCell.walls[3] == false && goCell.walls[1] == false) return true;
        }
    } else if (dy == -1 || dy == 1) {
        if(dy == -1) { // whants to go down
            if(curCell.walls[2] == false && goCell.walls[0] == false) return true;
        } else if (dy == 1) {
            if(curCell.walls[0] == false && goCell.walls[2] == false) return true;
        }
    }
}

function Cell(x, y) {
    this.x = x;
    this.y = y;

    this.walls = [true, true, true, true];
    this.visited = false

    this.checkNeighbors = function() {
        var neighbors = [];

        var top = grid[index(this.y - 1, this.x)];
        var right = grid[index(this.y, this.x + 1)];
        var bottom = grid[index(this.y + 1, this.x)];
        var left = grid[index(this.y, this.x - 1)];

        if(top && !top.visited) {
            neighbors.push(top);
        }

        if(right && !right.visited) {
            neighbors.push(right);
        }

        if(bottom && !bottom.visited) {
            neighbors.push(bottom);
        }

        if(left && !left.visited) {
            neighbors.push(left);
        }

        if(neighbors.length > 0) {
            return neighbors[floor(random(0, neighbors.length) * (neighbors.length - 1))];
        }
        else if (stack.length > 0) {
            stack.pop();
            return stack.pop();
        }
        
    }

    this.show = function() {
        stroke(255);
        if(this.walls[0]) {
            line(this.x * w, this.y * w, this.x * w + w, this.y * w);
        } 
        if(this.walls[1]) {
            line(this.x * w + w, this.y * w, this.x * w + w, this.y * w + w);
        } 
        if(this.walls[2]) {
            line(this.x * w + w, this.y * w + w, this.x * w, this.y * w + w);
        }
        if(this.walls[3]) {
           line(this.x * w, this.y * w + w, this.x * w, this.y * w);
        }
   };

}

function repairWalls() {
    for(var i = 0; i < grid.length; i++) {
        if(grid[i].x == 0) grid[i].walls[3] = true;
        if(grid[i].y == 0) grid[i].walls[0] = true;
        if(grid[i].x == cols - 1) grid[i].walls[1] = true;
        if(grid[i].y == rows - 1) grid[i].walls[2] = true;
    }
}

function removeWalls(a, b) {

    // Wich neighbor is it

    var dx = a.x - b.x;
    var dy = a.y - b.y;

    if(dx == -1 || dx == 1) {
        if(dx == -1) { // b > a => b on the right
            a.walls[1] = false;
            b.walls[3] = false;
        }
        else {
            a.walls[3] = false;
            b.walls[1] = false;
        }
    } else {
        if(dy == -1) { // b > a => b on the bottom
            a.walls[2] = false;
            b.walls[0] = false;
        }
        else {
            a.walls[0] = false;
            b.walls[2] = false;
        }
    }
}

function unloadScrollBars() {
    document.documentElement.style.overflow = 'hidden';  // firefox, chrome
    document.body.scroll = "no"; // ie only
}

function checkGameOver() {
    if(grid[grid.length - 1].x == player.x && grid[grid.length - 1].y == player.y) return true;
    else return false;
}

function sCircle(x, y, rad) {
    this.x = x;
    this.y = y;
    this.rad = rad;
    this.speed = random(5, 8);
    this.maxSpeed = this.speed;

    this.r = random(100, 255);
    this.g = random(100, 255);
    this.b = random(100, 255);
    this.alpha = 100;
    
    this.angle = random(360);

    this.show = function() {
        noStroke();
        fill(this.r, this.g, this.b, this.alpha);
        ellipse(this.x, this.y, this.rad, this.rad);
    };

    this.update = function() {
        if(this.alpha > 0) {
            this.x += this.speed * sin(this.angle);
            this.y += this.speed * cos(this.angle);
            this.speed -= 0.1;
            this.alpha = map(this.speed, 0, this.maxSpeed, 0, 100);
        }
    };

}

function Salute(x, y) {
    this.x = x;
    this.y = y;
    this.balls = [];

    var max = random(50, 70);
    for(var i = 0; i < max; i++) {
        this.balls.push(new sCircle(this.x, this.y, random(8, 12)));
    }

    this.show = function() {
        for(var  i = 0; i < this.balls.length; i++) {
            this.balls[i].show();
        }
    }
    this.update = function() {
        for(var  i = 0; i < this.balls.length; i++) {
            this.balls[i].update();
        }
        if(this.balls[0].alpha <= 0) {
            this.x = random(10, width - 10);
            this.y = random(10, height - 10);
            this.balls = [];
            var max = random(50, 70);
            for(var i = 0; i < max; i++) {
                this.balls.push(new sCircle(this.x, this.y, random(8, 12)));
            }
        }
    }
}