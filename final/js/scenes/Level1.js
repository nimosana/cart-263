/** Creates the scene for the 1st circle, Limbo.
 * The player must throw bullets towards hostile crowds to avoid getting lapidated.
 * If the player scores higher than 255, they will move into the next circle
 * Runnable after boot */
class Level1 extends Phaser.Scene {

    /** allows the creation of a scene for the limbo game, initializing it with required params */
    constructor() {
        super({ key: `level1` });
        //required variables 
        this.score = this.killTimer = this.kills = this.killCombo = 0;
        this.comboNumber = this.comboTimer = 0;
        this.newCombo = true;
        this.firstSpawn = true;
        this.saidWow = false;
        this.gameLost = false;
        this.seaBlood = 0;
        this.stageName = 'Limbo';
    }

    /** Creates the initial scene and elements for the limbo game */
    create() {
        // interaction setup
        this.cursors = this.input.keyboard.createCursorKeys();
        this.physics.world.setBounds(0, 0, 1000, 1000);// create world
        this.ground = this.add.tileSprite(0, 0, 1800, 1800, 'sand').setScrollFactor(0, 0);
        // create and setup groups, objects, physics, camera
        this.bulletsPlayer = this.add.group();
        this.bulletsEnemies = this.add.group();
        this.healing = this.add.group();
        this.enemies = this.physics.add.group();
        this.user = new Player(this, 0, 0, 'user-1');
        Player.initHealthBar(this);
        this.user.body.angularDrag = 120;
        this.cameras.main.startFollow(this.user);
        this.physics.add.collider(this.enemies, this.bulletsPlayer, this.bulletHitEnemyCollider, null, this);
        this.physics.add.collider(this.bulletsEnemies, this.user, this.bulletHitUserCollider, null, this);
        this.physics.add.overlap(this.healing, this.user, this.pickHeart, null, this);
        // add and set text objects
        Scores.initText(this);
        myVoice.speak("The first circle of hell is depicted in Dante Alighieri's 14th-century poem Inferno, the first part of the Divine Comedy. Inferno tells the story of Dante's journey through a vision of hell ordered into nine circles corresponding to classifications of sin. The first circle is Limbo, the space reserved for those souls who died before baptism and for those who hail from non-Christian cultures. They live eternally in a castle set on a verdant landscape, but forever removed from heaven.");
        // Add event listener for shooting while space is pressed 
        this.input.keyboard.on('keydown-SPACE', () => { this.shootInterval = setInterval(() => { this.userShoot(); }, 200); });
        this.input.keyboard.on('keyup-SPACE', () => { clearInterval(this.shootInterval); });
    }

    /** Updates the scene/game */
    update() {
        this.userMovement();
        this.bulletsPlayer.children.each(bullet => { this.removeBullets(bullet, this.bulletsPlayer) });
        this.bulletsEnemies.children.each(bullet => { this.removeBullets(bullet, this.bulletsEnemies) });
        this.enemies.children.each(enemy => { this.enemyMove(enemy); });
        this.spawnEnemies(this);
        this.textAndCombos(this.cameras.main);
        this.user.healthBar(this);
        // Check enter keypress after loss / Reset the scene and physics
        if (this.gameLost && this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER))) {
            if (this.score < 255) {
                this.resetPlayScene();
            } else {
                this.scene.start('level2');
                infernoStage++;
            }
        }
    }

    /** removes rock and hurts/kills enemies when colliding with a user rock */
    bulletHitEnemyCollider = (rock, enemy) => { this.enemyHit(enemy, rock); }

    /** removes rock and hurts/kills user when colliding with a enemy rock */
    bulletHitUserCollider = (rock, user) => { this.bulletHit(rock); }

    /** heals the player when picking up a heart */
    userHealCollider = (heal, user) => { this.user.heal(this, heal); }

    /** removes an object from the physics engine */
    removeObj(obj) {
        obj.body.destroy();
        obj.setActive(false);
        obj.setVisible(false);
    }

    /** removes rock that are outside the viewable zone */
    removeBullets(bullet, group) {
        if (Phaser.Math.Distance.Between(bullet.x, bullet.y, this.user.x, this.user.y) > 600) {
            group.remove(bullet);
            this.removeObj(bullet);
        }
    }

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
            body.setAngularAcceleration(body.angularAcceleration / 2);
            this.user.setAngularVelocity(0);
        } // move forward/backward with up/down
        body.setAngularAcceleration(body.angularAcceleration / 2);
        //key up & down acceleration
        ((!up.isDown || !keyboard.up.isDown) && (!down.isDown || !keyboard.down.isDown)) && this.physics.velocityFromRotation(this.user.rotation, 0, body.acceleration);
        ((up.isDown || keyboard.up.isDown) && (!down.isDown && !keyboard.down.isDown)) && this.physics.velocityFromRotation(this.user.rotation, 750, body.acceleration);
        ((down.isDown || keyboard.down.isDown) && (!up.isDown && !keyboard.up.isDown)) && this.physics.velocityFromRotation(this.user.rotation, -200, body.acceleration);
        this.user.setVelocity(body.velocity.x / 1.05, body.velocity.y / 1.05); // lower speed always
    }

    /** moves an enemy, targeting the user, and shooting at random */
    enemyMove(enemy) {
        (Phaser.Math.Between(0, 500) < 1) && this.fireEnemyBullet(enemy);
        let angleToTarget = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.user.x, this.user.y);
        let rotationDelta = Phaser.Math.Angle.RotateTo(enemy.rotation, angleToTarget, 0.03);
        enemy.setRotation(rotationDelta);
        let speed = 750;
        //slow or accelerate movement depending on angle vs user
        if (Math.abs(enemy.rotation - angleToTarget) > Math.PI / 2) {
            speed = 500;
        } else if (Math.abs(enemy.rotation - angleToTarget) > Math.PI / 4) {
            speed = 750;
        }
        if (Phaser.Math.Distance.Between(enemy.x, enemy.y, this.user.x, this.user.y) < this.scale.width / 4) {
            speed = 0;
        }
        this.physics.velocityFromRotation(enemy.rotation, speed, enemy.body.acceleration);
        enemy.setVelocity(enemy.body.velocity.x / 1.05, enemy.body.velocity.y / 1.05); // lower speed always
    }

    /** spawns increasingly more enemies near the player's position as they kill more. */
    spawnEnemies() {
        if (this.enemies.getLength() < this.kills || this.firstSpawn) {
            this.firstSpawn = false;
            let randomizer = Phaser.Math.Between(-1000, 1000);
            this.enemies.add(new Enemy(this, this.user.x + Math.sign(randomizer) * this.scale.width / 2, this.user.y + Math.sign(randomizer) * this.scale.height / 2, `user-1`)
                .setTint(`0xFF8800`));
        }
    }

    /** Heals the player, plays healing sound & removes the heart */
    pickHeart(heal) {
        this.user.hp = 100;
        this.sound.add('heal').play({ volume: 0.5 });
        this.healing.remove(heal);
        this.removeObj(heal);
    }

    /** makes the user shoot rocks in the direction they're going */
    userShoot() {
        if (this.user.hp > 1) {
            let bullet = new Bullet(this, this.user.x, this.user.y, bulletTypes[infernoStage])
                .setVelocity(this.user.body.velocity.x + Math.cos(Phaser.Math.DegToRad(this.user.angle)) * 800, this.user.body.velocity.y + Math.sin(Phaser.Math.DegToRad(this.user.angle)) * 800)
                .setMass(10);
            bullet.angle = this.user.body.rotation + 90;
            this.bulletsPlayer.add(bullet);
        }
    }

    /** Fires a rock from an enemy towards the player. */
    fireEnemyBullet(enemy) {
        let bullet = new Bullet(this, enemy.x, enemy.y, bulletTypes[infernoStage])
            .setVelocity(this.user.body.velocity.x + Math.cos(Phaser.Math.DegToRad(enemy.angle)) * 800, this.user.body.velocity.y + Math.sin(Phaser.Math.DegToRad(enemy.angle)) * 800)
        // .setTint(0xff0000);
        bullet.body.setMass(200);
        bullet.angle = enemy.body.rotation + 90;
        this.bulletsEnemies.add(bullet);
    }

    /** Updates enemy health, removes rock, plays sounds, increments kills, and adds potential healing item on death. */
    enemyHit(enemy, bullet) {
        enemy.hp -= 50;
        this.bulletsPlayer.remove(bullet);
        this.removeObj(bullet);
        let soundDist = Phaser.Math.Distance.Between(this.user.x, this.user.y, enemy.x, enemy.y);
        soundDist = (((Phaser.Math.Clamp(soundDist / 1000, 0, 1)) - 1) * -1);
        this.sound.add('rockSound').play({ volume: soundDist });
        if (enemy.hp < 1) {
            this.sound.add('scream').play({ volume: soundDist });
            this.murderText.setAlpha(1);
            this.killCombo++;
            this.kills++;
            this.comboNumber++;
            this.score += this.killCombo;
            this.killTimer = 0;
            (Phaser.Math.Between(0, 100) < 50) && this.healing.add(this.physics.add.sprite(enemy.x, enemy.y, "heart"));
            this.newCombo = true;
            this.enemies.remove(enemy);
            this.removeObj(enemy);
        }
    }

    /** hurts and kills the user depending on their health*/
    bulletHit(bullet) {
        this.user.hp -= 10;
        this.bulletsEnemies.remove(bullet);
        this.removeObj(bullet);
        this.sound.add('rockSound').play({ volume: 1 });
        if (this.user.hp < 1) {
            this.gameLost = true;
            this.diedText.setAlpha(1);
            this.sound.add('scream').play({ volume: 1 });
            this.removeObj(this.user);
        }
    }

    /** Resets scene variables, removes objects, and restarts scene. */
    resetPlayScene() {
        // Remove all bullets and enemies
        this.bulletsPlayer.clear(true, true);
        this.bulletsEnemies.clear(true, true);
        this.enemies.clear(true, true);

        // Clear any active timers or intervals
        clearInterval(this.shootInterval);
        clearTimeout(this.killTimer);
        clearInterval(this.comboTimer);

        // Reset scene-specific variables
        this.score = 0;
        this.kills = 0;
        this.killCombo = 0;
        this.comboNumber = 0;
        this.newCombo = true;
        this.firstSpawn = true;
        this.saidWow = false;
        this.gameLost = false;

        // Restart scene
        this.scene.restart();
    }

    /** displays scores and combos keeping track of them */
    textAndCombos(cam) {
        this.killTimer++;
        this.comboTimer++;
        (this.killTimer > 250) && (this.killCombo = 0);
        if (this.comboTimer < 250) {
            if (this.comboNumber >= 2 && this.newCombo) {
                this.newCombo = false;
                this.comboTimer = 0;
            }
        } else {
            this.saidWow = false;
            this.comboTimer = this.comboNumber = 0;
        }
        this.stageText.setText(this.stageName)
            .setPosition(cam.scrollX + this.scale.width * 0.8, cam.scrollY + this.scale.height * 0.05)
            .setAlpha(1);
        this.diedText.setPosition(cam.scrollX + this.scale.width / 2, cam.scrollY + this.scale.height / 6);
        this.scoreText.setText([`Kills: ${this.kills}`, `Score: ${this.score}`])
            .setPosition(cam.scrollX + 50, cam.scrollY + 500);
    }
}