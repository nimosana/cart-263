/** Creates the scene for the 4th circle, Greed.
 * The player must collect money until they die.
 * When they die, they go to the next circle.
 * Runnable after boot */
class Level4 extends Phaser.Scene {

    /** allows the creation of a scene for the war game, initializing it with required params */
    constructor() {
        super({ key: `level4` });
        this.score = this.killTimer = this.kills = this.killCombo = 0;
        this.comboNumber = this.comboTimer = 0;
        this.newCombo = true;
        this.firstSpawn = true;
        this.saidWow = false;
        this.gameLost = false;
        this.fatness = 0;
        this.ratio;
        this.stageName = 'Greed';
    }

    /** Creates the initial scene and elements for the war game */
    create() {
        // interaction setup
        this.cursors = this.input.keyboard.createCursorKeys();
        this.physics.world.setBounds(0, 0, 1000, 1000);// create world
        this.ground = this.add.tileSprite(0, 0, 1800, 1800, 'greedFloor').setScrollFactor(0, 0);
        // create and setup groups, objects, physics, camera
        this.monies = this.physics.add.group();
        for (let i = 0; i < 3000; i++) {
            let randomX = Phaser.Math.RND.realInRange(-game.config.width * 20, game.config.width * 20);
            let randomY = Phaser.Math.RND.realInRange(-game.config.width * 20, game.config.width * 20);
            this.monies.create(randomX, randomY, 'money');
        }
        this.user = new Player(this, 0, 0, 'user-1');
        Player.initHealthBar(this);
        this.user.body.angularDrag = 120;
        this.cameras.main.startFollow(this.user);
        this.physics.add.overlap(this.monies, this.user, this.userMoneyCollider, null, this);
        // add and set text objects
        this.backgroundImage = this.add.image(0, 0, 'greed')
            .setOrigin(0, 0);
        this.ratio = (this.scale.height / this.backgroundImage.height);
        this.backgroundImage.setScale(this.ratio * 1, this.ratio * 1);
        Scores.initText(this);
        myVoice.speak(`Those whose attitude toward material goods deviated from the appropriate mean are punished in the fourth circle. They include the avaricious or miserly, including many clergymen, and popes and cardinals who hoarded possessions, and the prodigal, who squandered them. The hoarders and spendthrifts joust, using great weights as weapons that they push with their chests`);
    }

    /** Updates the scene/game */
    update() {
        this.userMovement();
        this.textAndCombos(this.cameras.main);
        this.user.healthBar(this);
        // Check enter keypress after loss / Reset the scene and physics
        if (this.gameLost && this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER))) {
            infernoStage++;
            this.scene.start('level5');
        }
        //flash image
        if (Phaser.Math.Between(0, 500) < 1) {
            this.imageVisibility = 1;
        }
        this.backgroundImage.setPosition(this.cameras.main.scrollX - 200, this.cameras.main.scrollY)
        this.backgroundImage.setAlpha(this.imageVisibility);
        this.imageVisibility -= 0.01;
        if (this.imageVisibility <= 0) {
            this.imageVisibility = 0;
        }
    }

    /** hurts the player when picking up money */
    userMoneyCollider = (money, user) => { this.pickMoney(user, money); }

    /** moves the user using the arrow keys */
    userMovement() {
        const { left, right, up, down } = this.cursors;
        let keyboard = this.input.keyboard.addKeys({ 'up': Phaser.Input.Keyboard.KeyCodes.W, 'down': Phaser.Input.Keyboard.KeyCodes.S, 'left': Phaser.Input.Keyboard.KeyCodes.A, 'right': Phaser.Input.Keyboard.KeyCodes.D });
        const cam = this.cameras.main;
        const body = this.user.body;
        this.ground.setTilePosition(cam.scrollX, cam.scrollY);
        body.setAngularAcceleration(0);
        this.physics.velocityFromRotation(body.rotation, 0, body.acceleration);
        // rotate if left/right arrow keys are down
        let speedRatio = 3 - (Math.sqrt(Math.pow(this.user.body.velocity.x, 2) + Math.pow(this.user.body.velocity.y, 2)) / 1000) * 2;
        if ((left.isDown || keyboard.left.isDown) && (!right.isDown && !keyboard.right.isDown)) {
            body.setAngularVelocity(-75 * speedRatio);
        } else if ((right.isDown || keyboard.right.isDown) && (!left.isDown && !keyboard.left.isDown)) {
            body.setAngularVelocity(75 * speedRatio);
        } else { // slow rotation when not pressing keys
            this.user.setAngularVelocity(body.angularVelocity / 1.05);
        } // move forward/backward with up/down
        body.setAngularAcceleration(body.angularAcceleration / 2);
        // ((!up.isDown || !keyboard.up.isDown) && (!down.isDown || !keyboard.down.isDown)) && this.physics.velocityFromRotation(this.user.rotation, 1500, body.acceleration);
        ((up.isDown || keyboard.up.isDown) && (!down.isDown && !keyboard.down.isDown)) && this.physics.velocityFromRotation(this.user.rotation, 500 - this.fatness, body.acceleration);
        ((down.isDown || keyboard.down.isDown) && (!up.isDown && !keyboard.up.isDown)) && this.physics.velocityFromRotation(this.user.rotation, -600, body.acceleration);
        this.user.setVelocity(body.velocity.x / 1.05, body.velocity.y / 1.05); // lower speed always
    }


    /** hurts and kills the user depending on their health*/
    bulletHit(bullet) {
        this.bulletsmonies.remove(bullet);
        General.removeObj(bullet);
        if (this.hp < 1) {
            this.gameLost = true;
            this.diedText.setAlpha(1);
            this.sound.add('scream').play({ volume: 1 });
            General.removeObj(this);
        }
    }

    /** displays stage title */
    textAndCombos(cam) {
        this.stageText.setText(this.stageName)
            .setPosition(cam.scrollX + this.scale.width * 0.8, cam.scrollY + this.scale.height * 0.05)
            .setAlpha(1);
        this.diedText.setPosition(cam.scrollX + this.scale.width / 2, cam.scrollY + this.scale.height / 6);
        this.scoreText.setText([``]);
    }

    /** hurts the user as they pick up the money */
    pickMoney(cookie, user) {
        this.user.hp -= 10;
        this.fatness += 15;
        this.sound.add('moneySound').play({ volume: 0.5 });
        if (this.user.hp <= 0) {
            this.gameLost = true;
            this.diedText.setAlpha(1);
            General.removeObj(this.user);
        }
        this.monies.remove(cookie);
        General.removeObj(cookie);
    }
}