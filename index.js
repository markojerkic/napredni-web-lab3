/**
    * @type Asteroid[]
    */
const gamePieces = []

var myGameArea = {
    // @type HTMLCanvasElement
    canvas: document.createElement("canvas"),
    start: function() {
        this.canvas.id = "myGameCanvas";
        this.canvas.width = 700;
        this.canvas.height = 700;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 20);
    },
    stop: function() {
        clearInterval(this.interval);
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function startGame() {
    gamePieces.push(new Asteroid(myGameArea));
    gamePieces.push(new Asteroid(myGameArea));
    gamePieces.push(new Asteroid(myGameArea));

    myGameArea.start();
}

function randomSpeed() {
    return (Math.random() * 3 + 1) * (Math.floor(Math.random() * 2) === 0 ? -1 : 1);
}

class Asteroid {
    /**
        * Asteroid
        *
        * @param {typeof myGameArea} gameArea
        */
    constructor(gameArea) {
        this.gameArea = gameArea;
        this.speed_x = randomSpeed();
        this.speed_y = randomSpeed();
        this.randomStart();
        this.randomShadeOfGrey();
        this.randomSize()
    }

    randomSize() {
        const rand = 30 + Math.floor(Math.random() * 60);
        this.height = rand;
        this.width = rand;
    }

    randomShadeOfGrey() {
        const rand = Math.max(Math.floor(Math.random() * 230) + 10, 0);
        this.color = `rgb(${rand}, ${rand}, ${rand})`
    }

    randomStart() {
        const xOrY = Math.floor(Math.random() * 2);
        if (xOrY === 0) {
            this.x = 0;
            this.y = Math.random() * 700;
        } else {
            this.x = Math.random() * 700;
            this.y = 0;
        }
    }

    update() {
        this.ctx = this.gameArea.context;
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.width / -2, this.height / -2, this.width, this.height);
        this.ctx.restore();
    };

    newPos() {
        if (this.x - this.width / 2 < 0)
            this.speed_x = 2;
        else if ((this.x + this.width / 2) >= myGameArea.context.canvas.width)
            this.speed_x = -2;
        if (this.y - this.height / 2 < 0)
            this.speed_y = -2;
        else if ((this.y + this.height / 2) >= myGameArea.context.canvas.height)
            this.speed_y = 2;
        this.x += this.speed_x;
        this.y -= this.speed_y;
    };
}

function updateGameArea() {
    myGameArea.clear();

    for (let gamePiece of gamePieces) {
        gamePiece.newPos();
        gamePiece.update();
    }
}

startGame();
