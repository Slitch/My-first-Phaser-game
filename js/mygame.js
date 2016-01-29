// Poul Lynge Larsen

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {

	// sky background image
	game.load.image('sky', 'assets/sky.png');
	// Ground platform just like in Mario game
	game.load.image('ground', 'assets/platform.png');
	// Falling star - get score/points when collid
	game.load.image('star', 'assets/star.png');
	// spikes are dangerous - When you hit this you die
	game.load.image('spike', 'assets/spike.png');
	// Player Character - You can control the character
	game.load.spritesheet('dude', 'assets/dude.png', 32, 48);

	game.load.audio('starsfx', 'assets/audio/SoundEffects/eatstar.mp3');
	game.load.audio('diefx', 'assets/audio/SoundEffects/playerDie.mp3');
	game.load.audio('jumpfx', 'assets/audio/SoundEffects/jump.mp3');
}

var platforms;
var player;
var cursors;
var stars;
var spikes;
var score = 0
var scoreText;
var starsound;
var dieSound;
var jumpSound;

// game.load.audio('sfx', 'assets/audio/SoundEffects/fx_mixdown.ogg');
// var fx;
// fx = game.add.audio('sfx');
// fx.play();

function create() {

	/* =============================================================================
	Create: Start and platform
	============================================================================= */
	//  We're going to be using physics, so enable the Arcade Physics system
	game.physics.startSystem(Phaser.Physics.ARCADE);
	//  Star sound
	starsound = game.add.audio('starsfx');
	dieSound = game.add.audio('diefx');
	jumpSound = game.add.audio('jumpfx');

	//  A simple background for our game
	game.add.sprite(0, 0, 'sky');
	//  The platforms group contains the ground and the 2 ledges we can jump on
	platforms = game.add.group();
	//  We will enable physics for any object that is created in this group
	platforms.enableBody = true;
	// Here we create the ground.
	var ground = platforms.create(0, game.world.height - 64, 'ground');
	//  Scale it to fit the width of the game (the original sprite is 400x32 in size)
	ground.scale.setTo(2, 2);
	//  This stops it from falling away when you jump on it
	ground.body.immovable = true;
	//  Now let's create two ledges
	var ledge = platforms.create(400, 400, 'ground');
	ledge.body.immovable = true;

	ledge = platforms.create(-150, 250, 'ground');
	ledge.body.immovable = true;

	/* =============================================================================
	Create: Player
	============================================================================= */

	// The player and its settings
	player = game.add.sprite(32, game.world.height - 150, 'dude');
	//  We need to enable physics on the player
	game.physics.arcade.enable(player);
	//  Player physics properties. Give the little guy a slight bounce.
	player.body.bounce.y = 0.2;
	player.body.gravity.y = 300;
	player.body.collideWorldBounds = true;

	//  Our two animations, walking left and right.
	player.animations.add('left', [0, 1, 2, 3], 10, true);
	player.animations.add('right', [5, 6, 7, 8], 10, true);

	/* =============================================================================
	Create: stars
	============================================================================= */

	//  Finally some stars to collect
	stars = game.add.group();
	//  We will enable physics for any star that is created in this group
    stars.enableBody = true;
    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 10; i++)
    {
    	//  Create a star inside of the 'stars' group
    	var star = stars.create(i * 120, 0, 'star');
    	//  Let gravity do its thing
    	star.body.gravity.y = 600;
    	//  This just gives each star a slightly random bounce value
    	star.body.bounce.y = 0.3 + Math.random() * 0.2;
    }

    /* =============================================================================
	Create: spikes
	============================================================================= */

	//  Finally some stars to collect
	spikes = game.add.group();
	//  We will enable physics for any star that is created in this group
    spikes.enableBody = true;
    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 3; i++)
    {
    	//  Create a star inside of the 'stars' group
    	var spike = spikes.create(i * 200, 0, 'spike');
    	//  Let gravity do its thing
    	spike.body.gravity.y = 600;
    	//  This just gives each star a slightly random bounce value
    	// spike.body.bounce.y = 0.3 + Math.random() * 0.2;
    }

    /* =============================================================================
	Create: Cursor - Control
	============================================================================= */
	//  Our controls
	cursors = game.input.keyboard.createCursorKeys();

	/* =============================================================================
	Create: Score
	============================================================================= */
	//  The score
	scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
}

function update() {

	/* =============================================================================
	UPDATE: player, platform - stars, platform
	============================================================================= */

    //  Collide the player and the stars with the platforms
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);
    game.physics.arcade.collide(spikes, platforms);
    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    game.physics.arcade.overlap(player, stars, collectStar, null, this);
	//  Checks to see if the player overlaps with any of the spike, if he does call the playerKill function
    game.physics.arcade.overlap(player, spikes, playerKill, null, this);
    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;

    /* =============================================================================
	UPDATE: player movement
	============================================================================= */

    if (cursors.left.isDown) 
    {
    	//  Move to the left
    	player.body.velocity.x = -150;
    	player.animations.play('left');
    } 
    else if (cursors.right.isDown) 
    {
    	//  Move to the right
    	player.body.velocity.x = 150;
    	player.animations.play('right');
    }
    else 
    {
    	//  Stand still
    	player.animations.stop();
    	// Show frame 4 when player dosen't move from dude.png
    	player.frame = 4;
    }

    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.touching.down) 
    {
    	player.body.velocity.y = -340;
    	jumpSound.volume = 0.2;
    	jumpSound.play();
    }

}

/* =============================================================================
SCORE: kill star when player collid with it
============================================================================= */
function collectStar (player, star) {
	// Removes the stars from the screen
	star.kill();
	// Add an update the score
	score += 10;
	scoreText.text = 'Score: ' + score;

	// sound
	starsound.play();
}
/* =============================================================================
DIE: kill PLAYER when player collid with spike
============================================================================= */

function playerKill (player, spike) {
	// Removes the player from the screen
	player.kill();

	// SOUND - player killed
	dieSound.volume = 0.2;
	dieSound.play();
}