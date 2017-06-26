
var monkeySpeed; // Herman: this should be related to the screen moving down when the monkey jumps up
                 //         need this for movement of sprites down the screen
var branchSpeed = 0; //not sure about the speed as it will move with monkey
var branchGap = 60;

var byteGap = 120;          // controls how often bytes appear
var virusGap = 600;         // controls how often viruses appear (once every 500px)
var beerGap = 1000;         // controls how often beer appears
var coffeeGap = 1000;         // controls how often coffee appears
var bananaGap = 2000;       // controls how often banana appears

var scoreKey = {'0':1, '1':100, '10':200, '11':300, '100':400, '101':500, '110':600, '111':700};



var playgame = function(game) {};
playgame.prototype = {
    create: function(){
      		//game.stage.backgroundColor = "#4488AA";

      	    var treeBG = game.add.tileSprite(0, 0, game.width, game.height, "tree");
            treeBG.autoScroll(0,50);
            game.physics.startSystem(Phaser.Physics.ARCADE);
            //this.physics.startSystem( Phaser.Physics.ARCADE );
            console.log("playgame started");

            //  The platforms group contains the ground and the 2 ledges we can jump on
            platforms = game.add.group();

            //  We will enable physics for any object that is created in this group
            platforms.enableBody = true;
            //ground.enableBody = true;

            // Here we create the ground.
            var ground = platforms.create(0, game.world.height - 50, 'ground');

            //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
            ground.scale.setTo(2, 2);

            //  This stops it from falling away when you jump on it
            ground.body.immovable = true;

            //  Now let's create two ledges
            var ledge = platforms.create(370, 500, 'branch');

            ledge.body.immovable = true;

            ledge = platforms.create(50, 700, 'branch');

            ledge.body.immovable = true;

            // The monkey and its settings
            this.monkey = game.add.sprite(200, game.world.height - 150, 'monkey');
            this.monkey.anchor.set( 0.5 );
            //  We need to enable physics on the monkey
            game.physics.arcade.enable(this.monkey);
            this.monkey.destroyed = false;
            this.monkey.invincible = false;

            //  monkey physics properties. Give the little guy a slight bounce.
            this.monkey.body.bounce.y = 0.2;
            this.monkey.body.gravity.y = 1000;
            this.monkey.body.collideWorldBounds = true;

            this.cursors = this.input.keyboard.createCursorKeys();
            this.monkey.body.checkCollision.up = false;
            this.monkey.body.checkCollision.left = false;
            this.monkey.body.checkCollision.right = false;
            game.world.setBounds(-80, 0, 850, 960);


            // Bytes score setup
            score = 0;
            this.scoreText = game.add.bitmapText(game.width-20, game.height-65, "font", "0", 48);
            this.scoreText.alpha = 0.75;
            this.scoreText.anchor.set(1,0);

            /* Herman: Just for visualization -- can delete later
            this.byte = game.add.sprite(Math.round(Math.random()*(game.width-100))+50, 100, "101");
            this.byte.anchor.set(0.5);
            this.virus = game.add.sprite(Math.round(Math.random()*(game.width-100))+50, 150, "virus");
            this.virus.anchor.set(0.5);
            this.banana = game.add.sprite(Math.round(Math.random()*(game.width-100))+50, 200, "banana");
            this.banana.anchor.set(0.5);
            this.beer = game.add.sprite(Math.round(Math.random()*(game.width-100))+50, 400, "beer");
            this.beer.anchor.set(0.5);
            this.coffee = game.add.sprite(Math.round(Math.random()*(game.width-100))+50, 300, "coffee");
            this.coffee.anchor.set(0.5);
            this.byte2 = game.add.sprite(Math.round(Math.random()*(game.width-100))+50, 350, "10");
            this.byte2.anchor.set(0.5);
            this.byte3 = game.add.sprite(Math.round(Math.random()*(game.width-100))+50, 250, "110");
            this.byte3.anchor.set(0.5);
            this.byte4 = game.add.sprite(Math.round(Math.random()*(game.width-100))+50, 450, "1");
            this.byte4.anchor.set(0.5);
            */

            // //create branches
            // this.branchGroup = game.add.group();
            // var branch = new Branch(game, branchSpeed);
            // game.add.existing(branch);
            // this.branchGroup.add(branch);
            this.branchGroup = game.add.group();
            this.addBranch(this.branchGroup);




            // Create sprite groups
            this.bytesGroup = game.add.group();
            this.addByte(this.bytesGroup);
            this.virusGroup = game.add.group();
            this.addVirus(this.virusGroup);
            this.beerGroup = game.add.group();
            this.addBeer(this.beerGroup);
            this.coffeeGroup = game.add.group();
            this.addCoffee(this.coffeeGroup);
            this.bananaGroup = game.add.group();
            this.addBanana(this.bananaGroup);
    },

    update: function() {

            hitPlatform = game.physics.arcade.collide(this.monkey, platforms);
            hitPlatform1 = game.physics.arcade.collide(this.monkey, this.branchGroup);
            this.monkeyMove();

            /* Collision conditions - belongs inside the "update" function [Herman] */
            if (!this.monkey.destroyed && this.monkey.alpha == 1){

                game.physics.arcade.collide(this.monkey, this.bytesGroup, function(m,b){
                    // collide action between monkey and byte sprite
                    var addScore = scoreKey[b.byteValue];
                    score += addScore;
                    this.scoreText.text = score.toString(); // update score
                    if (b.alpha === 1){ // make byte disappear to alpha 0
                        var byteTween = game.add.tween(b).to({
                            alpha: 0
                        }, 200, Phaser.Easing.Bounce.Out, true);
                    }
                }, null, this);
                game.physics.arcade.collide(this.monkey, this.virusGroup, function(m,v){
                    // collide condition between monkey and a virus sprite
                    score -= 250;
                    this.scoreText.text = score.toString(); // update score
                    if (v.alpha === 1){
                        var virusTween = game.add.tween(v).to({
                            alpha: 0,
                            height: 75,
                            width: 75,
                        }, 500, Phaser.Easing.Bounce.Out, true);
                    }
                }, null, this);
                game.physics.arcade.collide(this.monkey, this.beerGroup, function(m,b){
                    // collide condition between monkey and a beer sprite
                    // temporarily make monkey jump lower
                }, null, this);
                game.physics.arcade.collide(this.monkey, this.coffeeGroup, function(m,c){
                    // collide condition between monkey and a coffee sprite
                    // temporarily make monkey jump higher
                }, null, this);
                game.physics.arcade.collide(this.monkey, this.bananaGroup, function(m,b){
                    // collide action between monkey and a banana sprite
                    m.invincible = true;
                }, null, this);

            }

    },
    monkeyMove: function() {
        //  Reset the monkeys velocity (movement)
            this.monkey.body.velocity.x = 0;

            if (this.cursors.left.isDown)
            {
                //  Move to the left
                this.monkey.scale.x = 1;
                this.monkey.body.velocity.x = -500;
                if (this.monkey.x < 0) {
                    this.monkey.x += 640;
                }

                //monkey.animations.play('left');
            }
            else if (this.cursors.right.isDown)
            {
                //  Move to the right
                this.monkey.scale.x = -1;
                this.monkey.body.velocity.x = 500;
                if (this.monkey.x > 640) {
                    this.monkey.x -= 640;
                }

                //monkey.animations.play('right');
            }
            else
            {
                //  Stand still
                this.monkey.animations.stop();

                this.monkey.frame = 4;
            }

            //  Allow the monkey to jump if they are touching the ground.
            if (hitPlatform || hitPlatform1)
            {
                this.monkey.body.velocity.y = -700;
            }
    },

    addBranch: function(group){
        if(!this.currentBranchPosition){
            this.currentBranchPosition = 800;
        }
      var branch = new Branch(game, branchSpeed, this.currentBranchPosition);
      game.add.existing(branch);
      group.add(branch);
    },

    addByte: function(group) {
        var byte = new Bytes(game, monkeySpeed);
        game.add.existing(byte);
        group.add(byte);
    },
    addVirus: function(group) {
        var virus = new Virus(game, monkeySpeed);
        game.add.existing(virus);
        group.add(virus);
    },
    addBeer: function(group) {
        var beer = new Beer(game, monkeySpeed);
        game.add.existing(beer);
        group.add(beer);
    },
    addCoffee: function(group) {
        var coffee = new Coffee(game, monkeySpeed);
        game.add.existing(coffee);
        group.add(coffee);
    },
    addBanana: function(group) {
        var banana = new Banana(game, monkeySpeed);
        game.add.existing(banana);
        group.add(banana);
    },
    setCurrentBranchPosition: function(currentBranchPosition){
        this.currentBranchPosition = currentBranchPosition;
    }

};


// Generate branches
var Branch = function (game, speed,currentBranchPosition) {

    var xpositions = [Math.random()*(220-40)+40, Math.random()*(540-360)+360];
	var xposition = game.rnd.between(0, 1);
    // var ypositions = Math.random()*(this.monkey.y + this.monkey.body.velocity.y)-200;

    Phaser.Sprite.call(this, game, xpositions[xposition], currentBranchPosition, "branch");
    playgame.prototype.setCurrentBranchPosition( currentBranchPosition-180);

	game.physics.enable(this, Phaser.Physics.ARCADE);

	this.anchor.set(0, 0);
	this.body.velocity.y = speed;
    this.body.velocity.y = speed;
	this.placeBranch = true;
};
Branch.prototype = Object.create(Phaser.Sprite.prototype);
Branch.prototype.constructor = Branch;
Branch.prototype.update = function(){
	if(this.y > game.height){
		this.destroy();
	}
    if(this.placeBranch && this.y > branchGap){
        this.placeBranch = false;
        playgame.prototype.addBranch(this.parent);
	}
}

// Bytes
var Bytes = function(game, speed) {  // speed = moving of the screen elements when monkey jumps up
    var bytesArr = ["0", "0", "0",          // 1 byte   // value 0
                    "1", "1", "1", "1", "1",            // value 1
                    "10", "10", "10", "10", // 2 bytes  // value 2
                    "11", "11", "11",                   // value 3
                    "100", "100",                       // value 4
                    "101", "101",           // 3 bytes  // value 5
                    "110",                              // value 6
                    "111"];                             // value 7

    var byte = bytesArr[game.rnd.between(0,bytesArr.length)]; // randomized byte value
    Phaser.Sprite.call(this, game, Math.round(Math.random()*(game.width-100))+50, -50, byte);
                                   // randomized x position
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.anchor.set(0.5);
    this.body.immovable = true;
    this.body.velocity.y = speed;
    this.placeByte = true;
    this.byteValue = byte;
};
Bytes.prototype = Object.create(Phaser.Sprite.prototype);
Bytes.prototype.constructor = Bytes;
Bytes.prototype.update = function() {
    if (this.placeByte && this.y > byteGap) {
        this.placeByte = false;
        playgame.prototype.addByte(this.parent);
    }
    if (this.y > game.height) {
        this.destroy();
    }
};

// Viruses
var Virus = function(game, speed) { // speed = moving of the screen elements when monkey jumps up
    // var virusArr = [] // for future development of different types of viruses
    Phaser.Sprite.call(this, game, Math.round(Math.random()*(game.width-100))+50, -100, "virus");
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.anchor.set(0.5);
    this.body.immovable = true;
    this.body.velocity.y = speed;
    this.placeVirus = true;
};
Virus.prototype = Object.create(Phaser.Sprite.prototype);
Virus.prototype.constructor = Virus;
Virus.prototype.update = function() {
    if (this.placeVirus && this.y > virusGap) {
        this.placeVirus = false;
        playgame.prototype.addVirus(this.parent);
    }
    if (this.y > game.height) {
        this.destroy();
    }
};

// Beer
var Beer = function(game, speed) { // speed = moving of the screen elements when monkey jumps up
    Phaser.Sprite.call(this, game, Math.round(Math.random()*(game.width-100))+50, -150, "beer");
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.anchor.set(0.5);
    this.body.immovable = true;
    this.body.velocity.y = speed;
    this.placeBeer = true;
};
Beer.prototype = Object.create(Phaser.Sprite.prototype);
Beer.prototype.constructor = Beer;
Beer.prototype.update = function() {
    if (this.placeBeer && this.y > beerGap) {
        this.placeBeer = false;
        playgame.prototype.addBeer(this.parent);
    }
    if (this.y > game.height) {
        this.destroy();
    }
};

// Coffee
var Coffee = function(game, speed) { // speed = moving of the screen elements when monkey jumps up
    Phaser.Sprite.call(this, game, Math.round(Math.random()*(game.width-100))+50, -125, "coffee");
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.anchor.set(0.5);
    this.body.immovable = true;
    this.body.velocity.y = speed;
    this.placeCoffee = true;
};
Coffee.prototype = Object.create(Phaser.Sprite.prototype);
Coffee.prototype.constructor = Coffee;
Coffee.prototype.update = function() {
    if (this.placeCoffee && this.y > coffeeGap) {
        this.placeCoffee = false;
        playgame.prototype.addCoffee(this.parent);
    }
    if (this.y > game.height) {
        this.destroy();
    }
};

// Bananas
var Banana = function(game, speed) { // speed = moving of the screen elements when monkey jumps up
    Phaser.Sprite.call(this, game, Math.round(Math.random()*(game.width-100))+50, -150, "banana");
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.anchor.set(0.5);
    this.body.immovable = true;
    this.body.velocity.y = speed;
    this.placeBanana = true;
};
Banana.prototype = Object.create(Phaser.Sprite.prototype);
Banana.prototype.constructor = Banana;
Banana.prototype.update = function() {
    if (this.placeBanana && this.y > bananaGap) {
        this.placeBanana = false;
        playgame.prototype.addBanana(this.parent);
    }
    if (this.y > game.height) {
        this.destroy();
    }
};
