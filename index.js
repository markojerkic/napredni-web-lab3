/**
    * @type Asteroid[]
    */
const gamePieces = []
/**
    * @type Player
    */
let player = null;
let eventListener = null;

var myGameArea = {
    // @type HTMLCanvasElement
    canvas: document.createElement("canvas"),
    start: function() {
        this.canvas.id = "myGameCanvas";
        this.canvas.width = window.innerWidth - 10;
        this.canvas.height = window.innerHeight - 10;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 20);
        this.canvas.focus();
    },
    stop: function() {
        clearInterval(this.interval);
        removeEventListener("keydown", eventListener);
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function hanldeKeypress(e) {
    switch (e.code) {
        case "ArrowDown":
            player.speed_x = 0;
            player.speed_y = -3
            break;
        case "ArrowUp":
            player.speed_x = 0;
            player.speed_y = 3
            break;
        case "ArrowRight":
            player.speed_x = 3
            player.speed_y = 0;
            break;
        case "ArrowLeft":
            player.speed_x = -3
            player.speed_y = 0;
            break;
        default:
            break;
    }
    console.log("sx, sy", player.speed_x, player.speed_y);
}

function startGame() {
    player = new Player(myGameArea);
    eventListener = window.addEventListener("keydown", hanldeKeypress)

    for (let i = 0; i < Math.floor(Math.random() * 10) + 5; i++) {
        gamePieces.push(new Asteroid(myGameArea));
    }

    myGameArea.start();
}

function randomSpeed() {
    return (3) * (Math.floor(Math.random() * 2) === 0 ? -1 : 1);
}

class Component {
    /**
        * Asteroid
        *
        * @param {typeof myGameArea} gameArea
        */
    constructor(gameArea) {
        this.gameArea = gameArea;
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
            this.speed_x = Math.abs(this.speed_x);
        else if ((this.x + this.width / 2) >= myGameArea.context.canvas.width)
            this.speed_x = -Math.abs(this.speed_x);
        if (this.y - this.height / 2 < 0)
            this.speed_y = -Math.abs(this.speed_x);
        else if ((this.y + this.height / 2) >= myGameArea.context.canvas.height)
            this.speed_y = Math.abs(this.speed_x);
        this.x += this.speed_x;
        this.y -= this.speed_y;
    };
}

class Asteroid extends Component {
    /**
        * Asteroid
        *
        * @param {typeof myGameArea} gameArea
        */
    constructor(gameArea) {
        super(gameArea)
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
            this.y = Math.random() * (window.innerWidth * 2);
        } else {
            this.x = Math.random() * (window.innerHeight * 2);
            this.y = 0;
        }
    }

}

class Player extends Component {
    /**
        * Player
        *
        * @param {typeof myGameArea} gameArea
        */
    constructor(myGameArea) {
        super(myGameArea);
        this.x = window.innerWidth / 2;
        this.y = window.innerHeight / 2;
        this.color = "red";
        this.height = 30;
        this.width = 30;

        this.speed_x = 0;
        this.speed_y = 0;

    }


}

function updateGameArea() {
    myGameArea.clear();

    for (let gamePiece of gamePieces) {
        gamePiece.newPos();
        gamePiece.update();
    }

    player.newPos();
    player.update();

    let quit = gamePieces.some(piece => {
        const playerLeftEdgeX = player.x - player.width / 2;
        const playerLeftEdgeWithOffsetX = player.x + player.width / 2;
        const playerTopEdgeY = player.y - player.height / 2;
        const playerTopEdgeWithOffsetY = player.y + player.height / 2;

        const pieceLeftEdgeX = piece.x - piece.width / 2;
        const pieceLeftEdgeWithOffsetX = piece.x + piece.width / 2;
        const pieceTopEdgeY = piece.y - piece.height / 2;
        const pieceTopEdgeWithOffsetY = piece.y + piece.height / 2;


        // Gorni lijevi kut je unutar jednog pieca
        if ((playerLeftEdgeX >= pieceLeftEdgeX && playerLeftEdgeX <= pieceLeftEdgeWithOffsetX) &&
            (playerTopEdgeY >= pieceTopEdgeY && playerTopEdgeY <= pieceTopEdgeWithOffsetY)) {
            return true;
        }

        // Gorni desni kut je unutar jednog pieca
        if ((playerLeftEdgeWithOffsetX >= pieceLeftEdgeX && playerLeftEdgeWithOffsetX <= pieceLeftEdgeWithOffsetX) &&
            (playerTopEdgeY >= pieceTopEdgeY && playerTopEdgeY <= pieceTopEdgeWithOffsetY)) {
            return true;
        }

        // Donji lijevi kut je unutar jednog pieca
        if ((playerLeftEdgeX >= pieceLeftEdgeX && playerLeftEdgeX <= pieceLeftEdgeWithOffsetX) &&
            (playerTopEdgeWithOffsetY >= pieceTopEdgeY && playerTopEdgeWithOffsetY <= pieceTopEdgeWithOffsetY)) {
            return true;
        }

        // Donji desni kut je unutar jednog pieca
        if ((playerLeftEdgeWithOffsetX >= pieceLeftEdgeX && playerLeftEdgeWithOffsetX <= pieceLeftEdgeWithOffsetX) &&
            (playerTopEdgeWithOffsetY >= pieceTopEdgeY && playerTopEdgeWithOffsetY <= pieceTopEdgeWithOffsetY)) {
            return true;
        }

        return false;
    });


    if (quit) {
        myGameArea.stop();
        alert("Gotov si");
    }
}

startGame();
