var width, height;

if (document.body.offsetWidth < document.body.offsetHeight) {
    width = document.body.offsetWidth;
    height = document.body.offsetHeight;
} else {
    height = document.body.offsetHeight;
    width = height/(160/44);
}

var config = {
    type: Phaser.AUTO,
    width: width,
    height: height,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { },
            debug: false
        }
    },
};

document.ontouchstart = () => {
    var game = new Phaser.Game(config);
    document.ontouchstart = null;
};

function preload ()
{
    this.load.image("background", "assets/bg.png");
    this.load.image("obstacle", "assets/obstacle.png");
    this.load.image("restart", "assets/restart.png");
    this.load.image("restart_1", "assets/restart/1.png");
    this.load.image("restart_2", "assets/restart/2.png");
    this.load.image("restart_3", "assets/restart/3.png");
    this.load.image("restart_4", "assets/restart/4.png");
    this.load.image("restart_5", "assets/restart/5.png");
    this.load.spritesheet('player', 'assets/player.png', { frameWidth: 15, frameHeight: 22 });
}

scaleX = width/44;
scaleY = height/160;
freq = 3;
velocity = 320;
timeout = null;
points = 0;
gameOver = false;

function create ()
{
    freq = 3;
    velocity = 320;
    gameOver = false;
    points = 0;
    background = this.add.tileSprite(22 * scaleX, 4 * scaleY, 44 * scaleX, 320 * scaleY, "background");
    background._tileScale.x = scaleX;
    background._tileScale.y = scaleY;

    player = this.physics.add.sprite(width/2, height-200, 'player');
    player.setScale(scaleX/2, scaleY/2).update();
    player.setCollideWorldBounds(true);
    this.anims.create({
        key: 'cycling',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    cursors = this.input.keyboard.createCursorKeys();
    this.input.addPointer();

    obstacles = this.physics.add.group();
    createObstacle(obstacles);

    scoreText = this.add.text(16,16, 'score: 0', {fontSize: '32px', fill: '#333'})

    this.physics.add.collider(player, obstacles, hitObstacle, null, this);
}

function update ()
{
    obstacles.children.iterate(child => {
        if (child && child.y > height) {
            obstacles.remove(child);
            points++;
            scoreText.setText('score: ' + points);
            if (points % 5 === 0) {
                velocity += 100;
            }
        }
    });
    if (!gameOver) {
        background._tilePosition.y -= 0.5;
    }
    player.anims.play('cycling', true);

    if (cursors.left.isDown) {
        player.setVelocityX(-1000);
    } else if (cursors.right.isDown) {
        player.setVelocityX(1000);
    } else {
        player.setVelocityX(0);
    }

    if (this.input.pointer1.active) {
        if (this.input.pointer1.x < width/2) {
            player.setVelocityX(-1000);
        } else {
            player.setVelocityX(1000);
        }
    }

}

function createObstacle(obstacles) {
    let posX = Math.floor(Math.random() * width);
    var obstacle = obstacles.create(posX, -10, 'obstacle');
    obstacle.setVelocity(0, velocity);
    obstacle.setScale(scaleX, scaleY);

    if (freq > 0.1) {
        freq *= 0.95;
    }
    timeout = setTimeout(() => {
        if (!gameOver) {
            createObstacle(obstacles);
        }
    }, freq * 1000);
}

function hitObstacle(player, obstacle) {
    this.physics.pause();
    player.setTint(0xff0000);
    gameOver = true;

    restart = this.physics.add.image(width/2, height - height/3, 'restart');
    this.physics.add.image(width/2, height/3, 'restart_' + Math.floor(Math.random()*5)).setScale(3);
    restart.setScale(3);
    document.ontouchstart = () => {
        this.scene.restart();
        document.ontouchstart = null;
    }
}