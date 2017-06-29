var treeBG;
var ground;
var startLine = 600;
var stopLine = 800;
var savedMonkeyJumpHeight = -500;
// monkeyJumpHeight moved to create() function [Herman]
var itemsSpeed = 0; // Herman: this should be related to the screen moving down when the monkey jumps up
                 //         need this for movement of sprites down the screen
var branchSpeed = 0; //not sure about the speed as it will move with monkey
var branchGap = 200;
var moveBranchGap = 250;
var savedBranchIncreaseSpeed = 250;
var branchIncreaseSpeed;
var byteGap = 10;          // controls how often bytes appear
var virusGap = 800;         // controls how often viruses appear (once every 600px)
var virusSuperGap = 2000;   // controls how often super viruses appear
var beerGap = 1000;         // controls how often beer appears
var coffeeGap = 1200;       // controls how often coffee appears
var bananaGap = 3000;       // controls how often banana appears
var horseGap = 5000;

var scoreKey = {'0':1, '1':100, '10':200, '11':300, '100':400, '101':500, '110':600, '111':700};
var mouseTouchDown = false;

var playgame = function(game) {};
playgame.prototype = {
    create: function(){
  	    treeBG = game.add.tileSprite(0, 0, game.width, game.height, "tree");

        monkeyJumpHeight = savedMonkeyJumpHeight;
        branchIncreaseSpeed = savedBranchIncreaseSpeed;

        bgmusic = game.add.audio("bgmusic");
        bgmusic.play();
        bgmusic.loopFull();

        game.physics.startSystem(Phaser.Physics.ARCADE);

        console.log("playgame started");

        //  The platforms group contains the ground and the 2 ledges we can jump on
        platforms = game.add.group();

        //  We will enable physics for any object that is created in this group
        platforms.enableBody = true;

        // Here we create the ground.
        ground = platforms.create(0, game.height - 50, 'ground');

        //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
        ground.scale.setTo(2, 2);

        //  This stops it from falling away when you jump on it
        ground.body.immovable = true;
        ground.body.velocity.y = 0;
        ground.destroyed = false;

        // The monkey and its settings
        this.monkey = game.add.sprite(200, game.height - 150, 'monkey');
        this.monkey.anchor.set( 0.5 );
        //  We need to enable physics on the monkey
        game.physics.arcade.enable(this.monkey);
        this.monkey.destroyed = false;
        this.monkey.invincible = false;
        this.monkey.drinkingCoffee = false;
        this.monkey.drinkingBeer = false;

        //  monkey physics properties. Give the little guy a slight bounce.
        this.monkey.body.bounce.y = 0.2;
        this.monkey.body.gravity.y = 700;
        this.monkey.body.collideWorldBounds = true;

        this.cursors = this.input.keyboard.createCursorKeys();
        this.monkey.body.checkCollision.up = false;
        this.monkey.body.checkCollision.left = false;
        this.monkey.body.checkCollision.right = false;
        game.world.setBounds(-80, 0, 850, 1000);

        // Bytes score setup
        score = 0;
        this.scoreText = game.add.bitmapText(game.width-20, game.height-65, "font", "0", 48);
        this.scoreText.alpha = 0.75;
        this.scoreText.anchor.set(1,0);


        //create branches
        this.branchGroup = game.add.group();
        this.addBranch(this.branchGroup);
        this.addBranch(this.branchGroup, 200, false);
        this.addBranch(this.branchGroup, 400, false);
        this.addBranch(this.branchGroup, 520, false);
        this.addBranch(this.branchGroup, 600, false);
        this.addBranch(this.branchGroup, 680, false);
        this.addBranch(this.branchGroup, 800, false);
        //fall down branches
        this.moveBranchGroup = game.add.group();
        this.addMoveBranch(this.moveBranchGroup);

        // Create other sprite groups
        this.bytesGroup = game.add.group();
        this.addByte(this.bytesGroup);
        this.virusGroup = game.add.group();
        this.addVirus(this.virusGroup);
        this.virusSuperGroup = game.add.group();
        this.addVirusSuper(this.virusSuperGroup);
        this.beerGroup = game.add.group();
        this.addBeer(this.beerGroup);
        this.coffeeGroup = game.add.group();
        this.addCoffee(this.coffeeGroup);
        this.bananaGroup = game.add.group();
        this.addBanana(this.bananaGroup);
        this.dartsGroup = game.add.group(); // only add dart when mouseTouchDown (see lower down)
        this.horseGroup = game.add.group();
        this.addHorse(this.horseGroup);
        //play on the mobile

        // if (window.DeviceMotionEvent) {
        //     var self = this;
        //     window.addEventListener('devicemotion', function(e) {
        //         var x = e.gamma; // range [-90,90], left-right
        //
        //         self.monkey.body.velocity.x += x;
        //         // Acceleration
        //         console.log(e.acceleration.x);
        //         // Acceleration including gravity
        //         console.log(e.accelerationIncludingGravity.x);
        //         // Rotation rate
        //         console.log(e.rotationRate.gamma);
        //     }, false);
        // }

        // declare audio
        touchVirus = game.add.audio("touchVirus");
        touchHorse = game.add.audio("touchHorse");
        touchBanana = game.add.audio("touchBanana");
        touchCoffee = game.add.audio("touchCoffee");
        touchBeer = game.add.audio("touchBeer");
        touchByte = game.add.audio("touchByte");
        dartHit = game.add.audio("dartHit");
        fallToDeath = game.add.audio("fallToDeath");
        shootDart = game.add.audio("shootDart");
        horseOnScreen = game.add.audio("horseOnScreen");

    },

    update: function() {

        hitPlatform = game.physics.arcade.collide(this.monkey, platforms);
        hitPlatform1 = game.physics.arcade.collide(this.monkey, this.branchGroup);
        hitPlatform2 = game.physics.arcade.collide(this.monkey, this.moveBranchGroup);
        this.monkeyMove();

        selfPlayer = this.monkey;
		window.addEventListener("deviceorientation", this.handleOrientation, true);
        //this.handleOrientation();

        if (this.monkey.y < startLine) {
            this.startScroll();
        } else if (this.monkey.y >= stopLine) {
            this.stopScroll();
        }
        if(this.monkey.y > 960) {
            this.monkey.destroy();
            fallToDeath.play();
            bgmusic.stop();
            game.state.start("GameOverScreen");
        }

        /* Collision conditions - belongs inside the "update" function [Herman] */
        if (!this.monkey.destroyed && this.monkey.alpha == 1){

            game.physics.arcade.overlap(this.monkey, this.bytesGroup, function(m,b){
                // collide action between monkey and byte sprite
                var scoreText = this.scoreText;
                var addScore = scoreKey[b.byteValue];
                if (!b.destroyed & !m.drinkingBeer) {
                    b.destroyed = true;
                    var byteTween = game.add.tween(b).to({
                        alpha: 0
                    }, 500, Phaser.Easing.Linear.None, true);
                    score += addScore;
                    scoreText.text = score.toString();
                    // play audio
                    touchByte.play();
                } else if (!b.destroyed && m.drinkingBeer) {
                    b.destroyed = true;
                    game.add.tween(b).to({
                        angle: 1080
                    }, 600, Phaser.Easing.Linear.None, true);
                    var xDirs = [-900, 900];
                    var yDirs = [-900, 900];
                    b.body.velocity.x = xDirs[game.rnd.between(0,1)];
                    b.body.velocity.y = yDirs[game.rnd.between(0,1)];

                }
            }, null, this);
            game.physics.arcade.overlap(this.monkey, this.virusGroup, function(m,v){
                // collide condition between monkey and a virus sprite
                var scoreText = this.scoreText;
                if (!v.destroyed && !this.monkey.invincible){
                    v.destroyed = true;
                    var virusTween = game.add.tween(v).to({
                        alpha: 0,
                        height: 100,
                        width: 100,
                    }, 500, Phaser.Easing.Linear.None, true);
                    score -= 250;
                    scoreText.text = score.toString(); // update score

                    //monkey emits 0 & 1 on virus
                    this.smokeEmitter = game.add.emitter(this.monkey.x, this.monkey.y, 20);
                    this.smokeEmitter.makeParticles(["0","1"]);
                    this.smokeEmitter.start(false, 600, 50);
                    var smokeEmitter = this.smokeEmitter;
                    setTimeout(function(){
                        smokeEmitter.on = false;
                    }, 300);

                    //monkey blinks on virus
                    this.monkeyTween = game.add.tween(this.monkey).to({
	                      tint: 0xeeeeee,
                    },
                    500, Phaser.Easing.Linear.None, true);
                    // play audio
                    touchVirus.play();
                    console.log("monkey blinks on virus");
                }
            }, null, this);
            game.physics.arcade.overlap(this.dartsGroup, this.virusGroup, function(d,v){
                // collide condition between dart and a virus sprite
                if (!v.destroyed && !this.monkey.invincible){
                    v.destroyed = true;
                    d.kill();
                    v.emitter = game.add.emitter(v.x, v.y, 20);
                    v.emitter.makeParticles('virusParticle');
                    v.emitter.setSize(5,5);
                    v.emitter.setAlpha(0.1,0.5);
                    v.emitter.start(false, 600, 50);
                    var virusEmitter = v.emitter;
                    setTimeout(function(){
                        virusEmitter.on = false;
                    }, 300);
                    var virusTween = game.add.tween(v).to({
                        alpha: 0,
                        height: 100,
                        width: 100,
                    }, 500, "Linear", true);
                    // play audio
                    dartHit.play();
                }
            }, null, this);
            game.physics.arcade.overlap(this.monkey, this.virusSuperGroup, function(m,v){
                // collide condition between monkey and a virus sprite
                var scoreText = this.scoreText;
                if (!v.destroyed && !this.monkey.invincible){
                    v.destroyed = true;
                    var virusTween = game.add.tween(v).to({
                        alpha: 0,
                        height: 125,
                        width: 125,
                    }, 500, "Linear", true);

                    score -= 1000;
                    scoreText.text = score.toString(); // update score

                    //monkey emits 0 & 1 on virus
                    this.smokeEmitter = game.add.emitter(this.monkey.x, this.monkey.y, 20);
                    this.smokeEmitter.makeParticles(["0","1"]);
                    this.smokeEmitter.start(false, 600, 50);
                    var smokeEmitter = this.smokeEmitter;
                    setTimeout(function(){
                        smokeEmitter.on = false;
                    }, 300);

                    //monkey blinks on virus
                    this.monkeyTween = game.add.tween(this.monkey).to({
                          tint: 0xeeeeee,
                    },
                    500, Phaser.Easing.Linear.None, true);
                    // play audio
                    touchVirus.play();
                    console.log("monkey blinks on super virus");
                }
            }, null, this);
            game.physics.arcade.overlap(this.dartsGroup, this.virusSuperGroup, function(d,v){
                // collide condition between dart and a virus sprite
                if (!v.destroyed && !this.monkey.invincible){
                    v.destroyed = true;
                    d.kill();
                    v.emitter = game.add.emitter(v.x, v.y, 20);
                    v.emitter.makeParticles('virusSuperParticle');
                    v.emitter.setSize(5,5);
                    v.emitter.setAlpha(0.1,0.5);
                    v.emitter.start(false, 600, 50);
                    var virusEmitter = v.emitter;
                    setTimeout(function(){
                        virusEmitter.on = false;
                    }, 300);
                    var virusTween = game.add.tween(v).to({
                        alpha: 0,
                        height: 125,
                        width: 125,
                    }, 500, "Linear", true);
                    // play audio
                    dartHit.play();
                }
            }, null, this);
            game.physics.arcade.overlap(this.monkey, this.beerGroup, function(m,b){
                // collide condition between monkey and a beer sprite
                // temporarily make monkey jump lower
                var spinMonkey = this.spinMonkey;
                if (!b.destroyed && !m.invincible && !m.drinkingBeer){
                    m.drinkingBeer = true;
                    b.destroyed = true;
                    b.alpha = 0;
                    spinMonkey(m);
                    // play audio
                    touchBeer.play();
                }
            }, null, this);
            game.physics.arcade.overlap(this.dartsGroup, this.beerGroup, function(d,b){
                // collide condition between dart and a beer sprite
                if (!b.destroyed) {
                    b.destroyed = true;
                    var beerDestroyTween = game.add.tween(b).to({
                        alpha: 0,
                        angle: 360,
                        height: 1,
                        width: 1
                    }, 500, "Linear", true);
                    // play audio
                    dartHit.play();
                }
                d.destroy();
            }, null, this);
            game.physics.arcade.overlap(this.monkey, this.coffeeGroup, function(m,c){
                // collide condition between monkey and a coffee sprite
                // temporarily make monkey jump higher
                if (!c.destroyed && !m.invincible && !m.drinkingCoffee) {
                    m.drinkingCoffee = true;
                    c.destroyed = true;
                    c.alpha = 0;
                    branchIncreaseSpeed *= 1.8;
                    var adjustFallSpeed = this.adjustFallSpeed;
                    m.loadTexture('monkeyBig');
                    setTimeout(function(){
                        adjustFallSpeed();
                        m.drinkingCoffee = false;
                        m.loadTexture('monkey');
                    }, 5000);
                    // play audio
                    touchCoffee.play();
                }
            }, null, this);
            game.physics.arcade.overlap(this.dartsGroup, this.coffeeGroup, function(d,c){
                // collide condition between dart and a beer sprite
                if (!c.destroyed) {
                    c.destroyed = true;
                    var beerDestroyTween = game.add.tween(c).to({
                        alpha: 0,
                        angle: 360,
                        height: 1,
                        width: 1
                    }, 500, "Linear", true);
                }
                d.destroy();
            }, null, this);
            game.physics.arcade.overlap(this.monkey, this.bananaGroup, function(m,b){
                // collide action between monkey and a banana sprite
                if (!b.destroyed) {
                    b.destroyed = true;
                    this.becomeInvincible();
                    b.alpha = 0;
                    // play audio
                    touchBanana.play();
                }
                //monkey emits star on banana (in progress)
                this.smokeEmitter = game.add.emitter(this.monkey.x, this.monkey.y, 20);
                this.smokeEmitter.makeParticles("star");
                this.smokeEmitter.start(false, 600, 50);
                var smokeEmitter = this.smokeEmitter;
                setTimeout(function(){
                   smokeEmitter.on = false;
                }, 600);

                //monkey blinks on banana --> Herman moved to becomeInvincible() function

            }, null, this);
            game.physics.arcade.overlap(this.monkey, this.horseGroup, function(m,h){
                // collide action between monkey and a trojan horse
                //monkey emits 0 & 1 on horse
                if (!this.monkey.invincible){
                    this.smokeEmitter = game.add.emitter(this.monkey.x, this.monkey.y, 500);
                    this.smokeEmitter.makeParticles(["0Particle","1Particle"]);
                    this.smokeEmitter.setSize(10,10);
                    this.smokeEmitter.start(false, 1800, 10);
                    var smokeEmitter = this.smokeEmitter;
                    setTimeout(function(){
                        smokeEmitter.on = false;
                    }, 3000);
                    // play audio
                    touchHorse.play();

                    //monkey disappear
                    this.monkey.visible = false;

                    //velocity becomes zero, otherwise trail of emitters follow
                    this.monkey.body.velocity.x = 0;
                    this.monkey.body.velocity.y = 0;
                    branchSpeed = 0;
                    this.monkey.destroyed = true;

                    console.log("monkey killed");

                    game.time.events.add(Phaser.Timer.SECOND * 3, function(){
    	                   game.state.start("GameOverScreen");
                    });
                }
            }, null, this);
            game.physics.arcade.overlap(this.dartsGroup, this.horseGroup, function(d,h){
                // collide condition between dart and a beer sprite
                // play audio
                dartHit.play();
                d.destroy();
                if (!h.destroyed) {
                    h.destroyed = true;
                    h.emitter = game.add.emitter(h.x, h.y, 20);
                    h.emitter.makeParticles('horseParticle');
                    h.emitter.setSize(2,2);
                    h.emitter.setAlpha(0.1,0.5);
                    h.emitter.start(false, 600, 50);
                    var horseEmitter = h.emitter;
                    setTimeout(function(){
                        horseEmitter.on = false;
                    }, 300);
                    var disappearTween = game.add.tween(h).to({
                        alpha: 0
                    }, 500, "Linear", true);
                }
            }, null, this);

        }

        // Shooting banana darts
        if (game.input.activePointer.isDown) {
            if (!mouseTouchDown) {
                this.touchDown();
            }
        } else {
            if (mouseTouchDown) {
                this.touchUp();
            }
        }

        // Kill banana dart when out of game stage
        this.dartsGroup.forEach(function(item){
            if (item.y < 0) {
                //console.log("A banana dart has been killed.");
                item.destroy();
            }
        }, this);

        // Trojan horse loop along x-axis
        this.horseGroup.forEach(function(horse){
            if (horse.body.velocity.x < 0) {
                if (horse.x < 0) {
                    horse.x += 640;
                }
            } else {
                if (horse.x > 640) {
                    horse.x -= 640;
                }
            }
            // play audio horse on screen
            if (horse.y > -450 && horse.y < game.height){
                horseOnScreen.play();
            }
        }, this);

        // increase falling speed when score gets higher
        if (!this.monkey.drinkingCoffee) {
            if (score / 10000 > 1) {
                this.adjustFallSpeed();
            }
        }
    },
    startScroll: function(){
        treeBG.autoScroll(0,branchIncreaseSpeed);
        if (!ground.destroyed) {
            ground.destroyed = true;
            ground.body.velocity.y = branchIncreaseSpeed;
            setTimeout(function(){
                ground.destroy();
            }, 1000);
        }
        if(branchSpeed === 0){
            branchSpeed = branchIncreaseSpeed;
			for(var i = 0; i < this.branchGroup.length; i++){
				this.branchGroup.getChildAt(i).body.velocity.y = branchSpeed;
			}
            for(var i=0; i<this.moveBranchGroup.length; i++) {
                this.moveBranchGroup.getChildAt(i).body.velocity.y = branchSpeed;
            }
        }
    },
    stopScroll: function() {
        treeBG.autoScroll(0,0);
        branchSpeed = 0;
        for (var i=0; i<this.branchGroup.length; i++) {
            this.branchGroup.getChildAt(i).body.velocity.y = branchSpeed;
        }
        for(var i=0; i<this.moveBranchGroup.length; i++) {
            this.moveBranchGroup.getChildAt(i).body.velocity.y = branchSpeed;
        }
    },
    adjustFallSpeed: function(){
        branchIncreaseSpeed = savedBranchIncreaseSpeed + 65 * Math.floor(score/10000);
    },

    handleOrientation:function(e){
        var x = e.gamma; // range [-90,90], left-right
        if (x < 0)
        {
            //image turn left
            selfPlayer.scale.x = 1;
            //  Move to the left
            selfPlayer.body.velocity.x += x-300;
            if (selfPlayer.x < 0) {
                selfPlayer.x += 640;
            }
        }
        else if (x > 0)
        {
            //image turn right
            selfPlayer.scale.x = -1;
            //  Move to the right
            selfPlayer.body.velocity.x += x+300;
            if (selfPlayer.x > 640) {
                selfPlayer.x -= 640;
            }
        }
    },

    monkeyMove: function() {
        //  Reset the monkeys velocity (movement)
            this.monkey.body.velocity.x = 0;

            if (this.cursors.left.isDown)
            {
                //image turn left
                this.monkey.scale.x = 1;
                //  Move to the left
                this.monkey.body.velocity.x = -500;
                if (this.monkey.x < 0) {
                    this.monkey.x += 640;
                }

            }
            else if (this.cursors.right.isDown)
            {
                //image turn right
                this.monkey.scale.x = -1;
                //  Move to the right
                this.monkey.body.velocity.x = 500;
                if (this.monkey.x > 640) {
                    this.monkey.x -= 640;
                }

            }

            //  Allow the monkey to jump if they are touching the ground.
            if (hitPlatform || hitPlatform1 || hitPlatform2)
            {
                this.monkey.body.velocity.y = monkeyJumpHeight;
            }
    },

    addBranch: function(group, positionY=0, placement=true){
        var branch = new Branch(game, branchSpeed, positionY, placement);
        game.add.existing(branch);
        group.add(branch);
    },
    addMoveBranch: function(group, positionY=0, placement=true){
        var moveBranch = new MoveBranch(game, branchSpeed, positionY, placement);
        game.add.existing(moveBranch);
        group.add(moveBranch);
    },

    addByte: function(group) {
        var byte = new Bytes(game, itemsSpeed);
        game.add.existing(byte);
        group.add(byte);
    },
    addVirus: function(group) {
        var virus = new Virus(game, itemsSpeed);
        game.add.existing(virus);
        group.add(virus);
    },
    addVirusSuper: function(group) {
        var virusSuper = new VirusSuper(game, itemsSpeed);
        game.add.existing(virusSuper);
        group.add(virusSuper);
    },
    addBeer: function(group) {
        var beer = new Beer(game, itemsSpeed);
        game.add.existing(beer);
        group.add(beer);
    },
    addCoffee: function(group) {
        var coffee = new Coffee(game, itemsSpeed);
        game.add.existing(coffee);
        group.add(coffee);
    },
    addBanana: function(group) {
        var banana = new Banana(game, itemsSpeed);
        game.add.existing(banana);
        group.add(banana);
    },
    addDart: function(group) {
        var dart = new Dart(game, -500, this.monkey.x, this.monkey.y-20);
        game.add.existing(dart);
        group.add(dart);
    },
    addHorse: function(group) {
        var horse = new Horse(game, itemsSpeed);
        game.add.existing(horse);
        group.add(horse);
    },

    // Shooting banana darts

    touchDown: function() {
        mouseTouchDown = true;
        this.fireDart();
        shootDart.play();
    },
    touchUp: function() {
        mouseTouchDown = false;
    },
    fireDart: function() {
        this.addDart(this.dartsGroup);
    },

    spinMonkey: function(m) {
        // effects of colliding into beer
        var monkeyRotateTween = game.add.tween(m).to({
            angle: 1440
        }, 4000, "Linear", true);
        game.time.events.add(Phaser.Timer.SECOND * 4, function(){
            m.angle = 0;
            m.drinkingBeer = false;
        }, this);
    },

    becomeInvincible: function() {
        // effects of colliding into banana
        var monkey = this.monkey;
        monkey.invincible = true;
        console.log("Monkey invincible for 4 seconds after banana collide");
        var monkeyTween = game.add.tween(monkey).to({
             tint: 0x0000ff,
        }, 4000, Phaser.Easing.Bounce.InOut, true);
        monkeyTween.onComplete.add(function(){
            monkey.tint = 0xffffff;
            monkey.invincible = false;
            console.log("Monkey no longer invincible.");
        })
        // game.time.events.add(Phaser.Timer.SECOND * 5, function(){
        //     monkey.invincible = false;console.log("Monkey no longer invincible.");
        //     monkey.tint = 0xffffff;
        // }, this);
    }
};


// Generate branches
var Branch = function (game, speed, currentBranchPosition=0, placement=true) {

    var xpositions = [Math.random()*(220-40)+40, Math.random()*(540-360)+360];
	var xposition = game.rnd.between(0, 1);
    // var ypositions = Math.random()*(this.monkey.y + this.monkey.body.velocity.y)-200;

    Phaser.Sprite.call(this, game, xpositions[xposition], currentBranchPosition, "branch");

	game.physics.enable(this, Phaser.Physics.ARCADE);

	this.anchor.set(0, 0);
	this.body.velocity.y = speed;
	this.placeBranch = placement;
    this.body.immovable = true;
};
Branch.prototype = Object.create(Phaser.Sprite.prototype);
Branch.prototype.constructor = Branch;
Branch.prototype.update = function(){
    if(this.placeBranch && this.y > branchGap){
        this.placeBranch = false;
        playgame.prototype.addBranch(this.parent);
	}
    if (branchSpeed > 0) {
        this.body.velocity.y = branchIncreaseSpeed;;
    } else {
        this.body.velocity.y = 0;
    }
	if(this.y > game.height){
		this.destroy();
	}
};

// fall down branches
var MoveBranch = function (game, speed, currentBranchPosition=0, placement=true) {

    var xpositions = [Math.random()*(220-40)+40, Math.random()*(540-360)+360];
	var xposition = game.rnd.between(0, 1);

    Phaser.Sprite.call(this, game, xpositions[xposition], currentBranchPosition, "branch");

	game.physics.enable(this, Phaser.Physics.ARCADE);

	this.anchor.set(0, 0);
	this.body.velocity.y = speed;
	this.placeMoveBranch = placement;
    //this.body.immovable = true;
};
MoveBranch.prototype = Object.create(Phaser.Sprite.prototype);
MoveBranch.prototype.constructor = MoveBranch;
MoveBranch.prototype.update = function(){
    if(this.placeMoveBranch && this.y > moveBranchGap){
        this.placeMoveBranch = false;
        playgame.prototype.addMoveBranch(this.parent);
	}
    if (branchSpeed > 0) {
        this.body.velocity.y = branchIncreaseSpeed;;
    } else {
        this.body.velocity.y = 0;
    }
	if(this.y > game.height){
		this.destroy();
	}
};

// Bytes
var Bytes = function(game, speed, positionY=-50) {  // speed = moving of the screen elements when monkey jumps up
    var bytesArr = ["0", "0", "0",          // 1 byte   // value 0
                    "1", "1", "1", "1", "1",            // value 1
                    "10", "10", "10", "10", // 2 bytes  // value 2
                    "11", "11", "11",                   // value 3
                    "100", "100",                       // value 4
                    "101", "101",           // 3 bytes  // value 5
                    "110",                              // value 6
                    "111"];                             // value 7

    var byte = bytesArr[game.rnd.between(0,bytesArr.length-1)]; // randomized byte value
    Phaser.Sprite.call(this, game, Math.round(Math.random()*(game.width-100))+50, positionY, byte);
                                   // randomized x position
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.anchor.set(0.5);
    this.body.immovable = true;
    this.body.velocity.y = speed;
    this.placeByte = true;
    this.byteValue = byte;
    this.destroyed = false;
};
Bytes.prototype = Object.create(Phaser.Sprite.prototype);
Bytes.prototype.constructor = Bytes;
Bytes.prototype.update = function() {
    if (this.placeByte && this.y > byteGap) {
        this.placeByte = false;
        playgame.prototype.addByte(this.parent);
    }
    if (branchSpeed > 0) {
        itemsSpeed = branchIncreaseSpeed;
        this.body.velocity.y = itemsSpeed;
    } else {
        itemsSpeed = 0;
        this.body.velocity.y = 0;
    }
    if (this.y > Math.max(game.height, byteGap)) {
        this.destroy();
    }
};

// Viruses
var Virus = function(game, speed, positionY=-100) { // speed = moving of the screen elements when monkey jumps up
    // var virusArr = [] // for future development of different types of viruses
    Phaser.Sprite.call(this, game, Math.round(Math.random()*(game.width-100))+50, positionY, "virus");
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.anchor.set(0.5);
    this.body.immovable = true;
    this.body.velocity.y = speed;
    this.placeVirus = true;
    this.destroyed = false;
};
Virus.prototype = Object.create(Phaser.Sprite.prototype);
Virus.prototype.constructor = Virus;
Virus.prototype.update = function() {
    if (this.placeVirus && this.y > virusGap) {
        this.placeVirus = false;
        playgame.prototype.addVirus(this.parent);
    }
    if (branchSpeed > 0) {
        itemsSpeed = branchIncreaseSpeed;
        this.body.velocity.y = itemsSpeed;
    } else {
        itemsSpeed = 0;
        this.body.velocity.y = 0;
    }
    if (this.y > Math.max(game.height, virusGap)) {
        this.destroy();
    }
};

// Super Viruses
var VirusSuper = function(game, speed, positionY=-500) { // speed = moving of the screen elements when monkey jumps up
    // var virusArr = [] // for future development of different types of viruses
    Phaser.Sprite.call(this, game, Math.round(Math.random()*(game.width-100))+50, positionY, "virusSuper");
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.anchor.set(0.5);
    this.body.immovable = true;
    this.body.velocity.y = speed;
    this.placeVirusSuper = true;
    this.destroyed = false;
};
VirusSuper.prototype = Object.create(Phaser.Sprite.prototype);
VirusSuper.prototype.constructor = VirusSuper;
VirusSuper.prototype.update = function() {
    if (this.placeVirusSuper && this.y > virusSuperGap) {
        this.placeVirusSuper = false;
        playgame.prototype.addVirusSuper(this.parent);
    }
    if (branchSpeed > 0) {
        itemsSpeed = branchIncreaseSpeed;
        this.body.velocity.y = itemsSpeed;
    } else {
        itemsSpeed = 0;
        this.body.velocity.y = 0;
    }
    if (this.y > Math.max(game.height, virusSuperGap)) {
        this.destroy();
    }
};

// Beer
var Beer = function(game, speed, positionY=-250) { // speed = moving of the screen elements when monkey jumps up
    Phaser.Sprite.call(this, game, Math.round(Math.random()*(game.width-100))+50, positionY, "beer");
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.anchor.set(0.5);
    this.body.immovable = true;
    this.body.velocity.y = speed;
    this.placeBeer = true;
    this.destroyed = false;
};
Beer.prototype = Object.create(Phaser.Sprite.prototype);
Beer.prototype.constructor = Beer;
Beer.prototype.update = function() {
    if (this.placeBeer && this.y > beerGap) {
        this.placeBeer = false;
        playgame.prototype.addBeer(this.parent);
    }
    if (branchSpeed > 0) {
        itemsSpeed = branchIncreaseSpeed;
        this.body.velocity.y = itemsSpeed;
    } else {
        itemsSpeed = 0;
        this.body.velocity.y = 0;
    }
    if (this.y > Math.max(game.height, beerGap)) {
        this.destroy();
    }
};

// Coffee
var Coffee = function(game, speed, positionY=-800) { // speed = moving of the screen elements when monkey jumps up
    Phaser.Sprite.call(this, game, Math.round(Math.random()*(game.width-100))+50, positionY, "coffee");
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.anchor.set(0.5);
    this.body.immovable = true;
    this.body.velocity.y = speed;
    this.placeCoffee = true;
    this.destroyed = false;
};
Coffee.prototype = Object.create(Phaser.Sprite.prototype);
Coffee.prototype.constructor = Coffee;
Coffee.prototype.update = function() {
    if (this.placeCoffee && this.y > coffeeGap) {
        this.placeCoffee = false;
        playgame.prototype.addCoffee(this.parent);
    }
    if (branchSpeed > 0) {
        itemsSpeed = branchIncreaseSpeed;
        this.body.velocity.y = itemsSpeed;
    } else {
        itemsSpeed = 0;
        this.body.velocity.y = 0;
    }
    if (this.y > Math.max(game.height, coffeeGap)) {
        this.destroy();
    }
};

// Bananas
var Banana = function(game, speed, positionY=-1000) { // speed = moving of the screen elements when monkey jumps up
    Phaser.Sprite.call(this, game, Math.round(Math.random()*(game.width-100))+50, positionY, "banana");
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.anchor.set(0.5);
    this.body.immovable = true;
    this.body.velocity.y = speed;
    this.placeBanana = true;
    this.destroyed = false;
};
Banana.prototype = Object.create(Phaser.Sprite.prototype);
Banana.prototype.constructor = Banana;
Banana.prototype.update = function() {
    if (this.placeBanana && this.y > bananaGap) {
        this.placeBanana = false;
        playgame.prototype.addBanana(this.parent);
    }
    if (branchSpeed > 0) {
        itemsSpeed = branchIncreaseSpeed;
        this.body.velocity.y = itemsSpeed;
    } else {
        itemsSpeed = 0;
        this.body.velocity.y = 0;
    }
    if (this.y > Math.max(game.height, bananaGap)) {
        this.destroy();
    }
};

// Dart
var Dart = function(game, speed, monkeyX, monkeyY) {
    Phaser.Sprite.call(this, game, monkeyX, monkeyY, "bananaDart");
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.anchor.set(0.5);
    this.body.velocity.y = speed;
    this.originalY = this.y;
};
Dart.prototype = Object.create(Phaser.Sprite.prototype);
Dart.prototype.constructor = Dart;
Dart.prototype.update = function() {
    if (this.y - this.originalY > 1200) {
        this.destroy();
    }
};

var Horse = function(game, speed, positionY=-5000) {
    var directions = [-100, 100];
    Phaser.Sprite.call(this, game, Math.round(Math.random()*(game.width-100))+50, positionY, "horse");
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.anchor.set(0.5);
    this.body.velocity.x = directions[game.rnd.between(0, 1)];
    if (this.body.velocity.x > 0) {
        this.scale.x = -1;
    }
    this.body.velocity.y = speed;
    this.placeHorse = true;
    this.destroyed = false;
};
Horse.prototype = Object.create(Phaser.Sprite.prototype);
Horse.prototype.constructor = Horse;
Horse.prototype.update = function() {
    if (this.placeHorse && this.y > horseGap) {
        this.placeHorse = false;
        playgame.prototype.addHorse(this.parent);
    }
    if (branchSpeed > 0) {
        itemsSpeed = branchIncreaseSpeed;
        this.body.velocity.y = itemsSpeed;
    } else {
        itemsSpeed = 0;
        this.body.velocity.y = 0;
    }
    if (this.y > Math.max(game.height, horseGap)) {
        this.destroy();
    }

};
