/*jslint bitwise:true, es5: true */
(function (window, undefined) {
    'use strict';
    var KEY_ENTER = 13,
    KEY_LEFT = 37,
    KEY_UP = 38,
    KEY_RIGHT = 39,
    KEY_DOWN = 40,
    canvas = null,
    ctx = null,
    lastPress = null,
    pause = false,
    gameover = false,
    currentScene = 0,
    scenes = [],
    mainScene = null,
    gameScene = null,
    highscoresScene = null,
    body = [],
    food = null,
    bonus = null,
    //var wall = [],
    highscores = [],
    posHighscore = 10,
    dir = 0,
    score = 0,
    iBody = new Image(),
    iFood = new Image(),
    aEat = new Audio(),
    aDie = new Audio(),
    iBonus = new Image (),
    aBonus = new Audio ();

document.addEventListener('keydown', function (evt) {
    if (evt.which >= 37 && evt.which <= 40) {
    evt.preventDefault();
    }
    lastPress = evt.which;
}, false);

function Rectangle(x, y, width, height) {
    this.x = (x === undefined) ? 0 : x;
    this.y = (y === undefined) ? 0 : y;
    this.width = (width === undefined) ? 0 : width;
    this.height = (height === undefined) ? this.width : height;
}
Rectangle.prototype = {
    constructor: Rectangle,
    intersects: function (rect) {
        if (rect === undefined) {
            window.console.warn('Missing parameters on function intersects');
        } else {
            return (this.x < rect.x + rect.width &&
                this.x + this.width > rect.x &&
                this.y < rect.y + rect.height &&
                this.y + this.height > rect.y);
        }
    },
    fill: function (ctx) {
        if (ctx === undefined) {
            window.console.warn('Missing parameters on function fill');
        } else {
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    },
    drawImage: function (ctx, img) {
        if (img === undefined) {
            window.console.warn('Missing parameters on function drawImage');
        } else {
            if (img.width) {
            ctx.drawImage(img, this.x, this.y);
            } else {
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            }
        }
    }
};
function Scene() {
    this.id = scenes.length;
    scenes.push(this);
}
Scene.prototype = {
    constructor: Scene,
    load: function () {},
    paint: function (ctx) {},
    act: function () {}
};
function loadScene(scene) {
    currentScene = scene.id;
    scenes[currentScene].load();
}
function random(max) {
    return ~~(Math.random() * max);
}
function addHighscore(score) {
    posHighscore = 0;
    while (highscores[posHighscore] > score && posHighscore < highscores.length) {
        posHighscore += 1;
    }
    highscores.splice(posHighscore, 0, score);
    if (highscores.length > 10) {
        highscores.length = 10;
    }
    localStorage.highscores = highscores.join(',');
}
function repaint() {
    window.requestAnimationFrame(repaint);
    if (scenes.length) {
        scenes[currentScene].paint(ctx);
    }
}
function run() {
    setTimeout(run, 50);
    if (scenes.length) {
        scenes[currentScene].act();
    }
}
function init() {
    // Get canvas and context
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    // Load assets
    iBody.src = 'assets/body.png';
    iFood.src = 'assets/fruit.png';
    iBonus.src = 'assets/fruit2.png';
    aEat.src = 'assets/chomp.mp3';
    aDie.src = 'assets/dies.mp3';
    aBonus.src = 'assets/bonus.mp3';

    // Create food
    food = new Rectangle(80, 80, 10, 10);
    bonus = new Rectangle(80, 80, 10, 10);


    // Load saved highscores
    if (localStorage.highscores) {
        highscores = localStorage.highscores.split(',');
    }

    // Start game
    run();
    repaint();
}

var url = "www.jsonplaceholder.com?score="+score
//asincro call of the bonus score
function sendScore(score){    
    fetch(url)
        .then (function (response){
            return response.json();    
        })
        .catch (function (error) {
            return console.log ("error loading page/n");
        })
}

// Main Scene
mainScene = new Scene();
mainScene.paint = function (ctx) {
// Clean canvas
    ctx.fillStyle = '#FFFF65';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw title
    ctx.fillStyle = '#ff0055';
    ctx.textAlign = 'center';
    ctx.fillText('SNAKE', 150, 60);
    ctx.fillText('Press Enter', 150, 90);
};
mainScene.act = function () {
    // Load next scene
    if (lastPress === KEY_ENTER) {
    loadScene(highscoresScene);
    lastPress = null;
    }
};
// Game Scene
gameScene = new Scene();
gameScene.load = function () {
    score = 0;
    dir = 1;
    body.length = 0;
    body.push(new Rectangle(40, 40, 10, 10));
    body.push(new Rectangle(0, 0, 10, 10));
    body.push(new Rectangle(0, 0, 10, 10));
    food.x = random(canvas.width / 10 - 1) * 10;
    food.y = random(canvas.height / 10 - 1) * 10;
    bonus.x = random(canvas.width / 10 - 1) * 10;
    bonus.y = random(canvas.height / 10 - 1) * 10;
    gameover = false;
};
gameScene.paint = function (ctx) {
    var i = 0,
    l = 0;
    // Clean canvas
    ctx.fillStyle = '#FFFF65';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw player
    ctx.strokeStyle = '#ff0055';
    for (i = 0, l = body.length; i < l; i += 1) {
        body[i].drawImage(ctx, iBody);
    }
    
    // Draw food
    ctx.strokeStyle = '#3FFF00';
    food.drawImage(ctx, iFood);

    //Draw Bonus
     ctx.strokeStyle = '#f00';
     bonus.drawImage(ctx, iBonus);

    // Draw score
    ctx.fillStyle = '#ff0055';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + score, 0, 10);
    
    // Debug last key pressed
    //ctx.fillText('Last Press: '+lastPress,0,20);
    
    // Draw pause
    if (pause) {
        ctx.textAlign = 'center';
        if (gameover) {
            ctx.fillText('GAME OVER', 150, 75);
        } else {
            ctx.fillText('PAUSE', 150, 75);
            }
        }
    };
gameScene.act = function () {
    var i = 0,
    l = 0;
    if (!pause) {
        // GameOver Reset
        if (gameover) {
        loadScene(highscoresScene);
        }
        // Move Body
        for (i = body.length - 1; i > 0; i -= 1) {
            body[i].x = body[i - 1].x;
            body[i].y = body[i - 1].y;
        }
        // Change Direction
        if (lastPress === KEY_UP && dir !== 2) {
            dir = 0;
        }
        if (lastPress === KEY_RIGHT && dir !== 3) {
            dir = 1;
        }
        if (lastPress === KEY_DOWN && dir !== 0) {
            dir = 2;
        }
        if (lastPress === KEY_LEFT && dir !== 1) {
            dir = 3;
        }
        // Move Head
        if (dir === 0) {
            body[0].y -= 10;
        }
        if (dir === 1) {
            body[0].x += 10;
        }
        if (dir === 2) {
            body[0].y += 10;
        }
        if (dir === 3) {
            body[0].x -= 10;
        }
        // Out Screen
        if (body[0].x > canvas.width - body[0].width) {
            body[0].x = 0;
        }
        if (body[0].y > canvas.height - body[0].height) {
            body[0].y = 0;
        }
        if (body[0].x < 0) {
            body[0].x = canvas.width - body[0].width;
        }
        if (body[0].y < 0) {
            body[0].y = canvas.height - body[0].height;
        }
        // Food Intersects
        if (body[0].intersects(food)) {
            body.push(new Rectangle(0, 0, 10, 10));
            score += 1;
            food.x = random(canvas.width / 10 - 1) * 10;
            food.y = random(canvas.height / 10 - 1) * 10;
            aEat.play();
        }
        //Bonus intersects
        if (body[0].intersects(bonus)) {
            score += 5;
            bonus.x = random(canvas.width / 10 - 1) * 10;
            bonus.y = random(canvas.height / 10 - 1) * 10;
            aBonus.play();
            sendScore();
        }       

        // Body Intersects
        for (i = 2, l = body.length; i < l; i += 1) {
            if (body[0].intersects(body[i])) {
                gameover = true;
                pause = true;
                aDie.play();
                addHighscore(score);
            }
        }
    }
    // Pause/Unpause
    if (lastPress === KEY_ENTER) {
        pause = !pause;
        lastPress = null;
    }
};
// Highscore Scene
highscoresScene = new Scene();
highscoresScene.paint = function (ctx) {
    var i = 0,
    l = 0;

    // Clean canvas
    ctx.fillStyle = '#FFFF65';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw title
    ctx.fillStyle = '#ff0055';
    ctx.textAlign = 'center';
    ctx.fillText('HIGH SCORES', 150, 30);

    // Draw high scores
    ctx.textAlign = 'right';
    for (i = 0, l = highscores.length; i < l; i += 1) {
        if (i === posHighscore) {
            ctx.fillText('*' + highscores[i], 180, 40 + i * 10);
        } else {
            ctx.fillText(highscores[i], 180, 40 + i * 10);
        }
    }
};
highscoresScene.act = function () {

    // Load next scene
        if (lastPress === KEY_ENTER) {
            loadScene(gameScene);
            lastPress = null;
        }
};
window.addEventListener('load', init, false);
}(window));