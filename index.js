
/**
    * Središnji kontroler tijeka igre
*/
class Game {
    /**
        * @type Asteroid[]
    */
    gamePieces = [];
    /**
        * @type Player
    */
    player = null;
    eventListener = null;

    constructor() {
        // Stvaranje canvas elementa
        this.canvas = document.createElement("canvas")
        this.canvas.id = "myGameCanvas";
        this.canvas.width = window.innerWidth - 10;
        this.canvas.height = window.innerHeight - 10;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);

        // Učitavanje drugih potrebnih elemenata
        this.restartButton = document.getElementById("restart");
        if (!this.restartButton) throw Error("No restart button");

        // Dohvat najboljeg rezultata
        this.topScore = localStorage.getItem("topScore");
    }

    start() {
        this.restartButton.style.display = "none";
        // Interval za ponovno crtanje po canvasu
        this.interval = setInterval(() => this.updateGameArea(), 20);
        // Prebacimo fokus na canvas, da se odmah može koristiti tipkovnica i upravljati igrom
        this.canvas.focus();

        // Event listener koji sluša kada je pritisnuta tipka
        this.eventListener = window.addEventListener("keydown", (e) => this.hanldeKeypress(e))

        // Inicijalizacija igrača i slučajan broj asteroida (pet do petnaest)
        this.player = new Player(this);
        for (let i = 0; i < Math.floor(Math.random() * 10) + 5; i++) {
            this.gamePieces.push(new Asteroid(this));
        }

        // Postavljamo tekst najboljeg i trenutnog vremena, i bilježimo vrijeme početka igre
        this.setHeaderText();
        this.startTime = new Date().getTime();
    }

    /**
        * @param {number} duration
    */
    formatTime(duration) {
        const ms = duration % 1000;
        const s = (duration - ms) / 1000 % 60;
        const m = ((duration - ms) / 1000 - s) / 60;

        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}:${ms < 10 ? '00' : (ms < 100 ? '0' : '')}${ms}`;
    }

    setHeaderText() {
        // Postavljanje najbolje i trenutno vrijeme u gornji deni kut
        let ctx = this.canvas.getContext('2d');
        ctx.fillStyle = 'rgb(0,0,0)';
        ctx.font = "1.5rem Arial";
        if (this.topScore) {
            ctx.textAlign = 'right';
            ctx.fillText(`Najbolje vrijeme: ${this.formatTime(Number(this.topScore))}`, this.canvas.width, 30);
        }
        ctx.textAlign = 'right';
        ctx.fillText(`Trenutno vrijeme: ${this.formatTime(new Date().getTime() - this.startTime)}`, this.canvas.width, 60);

    }

    stop() {
        // Po zavšetku igre, očistimo interval, uklonimo event listener, i spremimo novo najbolje vrijeme ako je to potrenbno
        clearInterval(this.interval);
        removeEventListener("keydown", this.eventListener);

        let topScore = Number(localStorage.getItem("topScore") ?? 0);
        const newTime = new Date().getTime() - this.startTime;
        if (!topScore || newTime > topScore) {
            localStorage.setItem("topScore", newTime);
        }
    }

    clear() {
        // Očistimo canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    hanldeKeypress(e) {
        // Provjera unosa s tipkovnice
        switch (e.code) {
            case "ArrowDown":
                this.player.speed_x = 0;
                this.player.speed_y = -3
                break;
            case "ArrowUp":
                this.player.speed_x = 0;
                this.player.speed_y = 3
                break;
            case "ArrowRight":
                this.player.speed_x = 3
                this.player.speed_y = 0;
                break;
            case "ArrowLeft":
                this.player.speed_x = -3
                this.player.speed_y = 0;
                break;
            default:
                break;
        }
    }

    updateGameArea() {
        this.clear();

        for (let gamePiece of this.gamePieces) {
            gamePiece.newPos();
            gamePiece.update();
        }

        this.player.newPos();
        this.player.update();

        // Računamo jeli igrač se sudatio s asteroidom
        let quit = this.gamePieces.some(piece => {
            const playerLeftEdgeX = this.player.x - this.player.width / 2;
            const playerLeftEdgeWithOffsetX = this.player.x + this.player.width / 2;
            const playerTopEdgeY = this.player.y - this.player.height / 2;
            const playerTopEdgeWithOffsetY = this.player.y + this.player.height / 2;

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

        this.setHeaderText();

        if (quit) {
            // Ako je došlo do sudara onda zaustavimo igru, otkrijemo tipku za restart i pošaljemo poruku o završetku igre
            this.stop();
            this.restartButton.style.display = "block";
            alert(`Igra zavrsena s vremenom ${this.formatTime(new Date().getTime() - this.startTime)}`);
        }
    }
}


function randomSpeed() {
    return (3) * (Math.floor(Math.random() * 2) === 0 ? -1 : 1);
}

/**
    * Abstraktna klasa koju nasljeđuje igrač i asteroid
    * Izvodi logiku računanja nove pozicije i crtanje komponente
*/
class Component {
    /**
        * @param {typeof game} gameArea
    */
    constructor(gameArea) {
        this.gameArea = gameArea;
    }

    update() {
        this.ctx = this.gameArea.context;
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        this.ctx.fillStyle = this.color;
        this.ctx.shadowBlur = 5;
        this.ctx.shadowColor = "black";
        this.ctx.fillRect(this.width / -2, this.height / -2, this.width, this.height);
        this.ctx.restore();
    };

    newPos() {
        if (this.x - this.width / 2 < 0)
            this.speed_x = Math.abs(this.speed_x);
        else if ((this.x + this.width / 2) >= game.context.canvas.width)
            this.speed_x = -Math.abs(this.speed_x);
        if (this.y - this.height / 2 < 0)
            this.speed_y = -Math.abs(this.speed_x);
        else if ((this.y + this.height / 2) >= game.context.canvas.height)
            this.speed_y = Math.abs(this.speed_x);
        this.x += this.speed_x;
        this.y -= this.speed_y;
    };
}

/**
    * Asteroid započinje s nasumičnim vektorom brzine, ima nasumičnu nijansu sive boje i nasumičnu veličinu
    * Uvijek ulazi s ruba canvasa
*/
class Asteroid extends Component {
    /**
        * Asteroid
        *
        * @param {Game} gameArea
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

/**
    * Igrač započinje bez kretnje s centra canvasa, crvene je boje i ima veličinu 30/30
    * Uvijek ulazi s ruba canvasa
*/
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

// Inicijalizira se instanca igre.
let game = new Game();

// Funkcija koja restarta igru
function restartGame() {
    game.gamePieces = [];
    game.start();
}

game.start();
