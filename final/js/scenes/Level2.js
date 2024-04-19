/** Creates the scene for the war game and every element it contains, run after Boot */
class Level2 extends Phaser.Scene {

    /** allows the creation of a scene for the war game, initializing it with required params */
    constructor() {
        super({ key: `level2` });
        this.score = this.killTimer = this.kills = this.killCombo = 0;
        this.comboNumber = this.comboTimer = 0;
        this.newCombo = true;
        this.firstSpawn = true;
        this.saidWow = false;
        this.gameLost = false;
        this.myVoice = new p5.Speech();
        this.seaBlood = 0;
        this.stageName = 'Lust';
        this.bloodTint = (`0x` + Phaser.Display.Color.RGBToString(this.seaBlood, (255 / 2) - this.seaBlood / 2, 255 - this.seaBlood).substring(1));
    }

    /** Creates the initial scene and elements for the war game */
    create() {
        // interaction setup
        this.cursors = this.input.keyboard.createCursorKeys();
        this.physics.world.setBounds(0, 0, 1000, 1000);// create world
        this.ground = this.add.tileSprite(0, 0, 1800, 1800, 'hearts').setScrollFactor(0, 0);
        // create and setup groups, objects, physics, camera
        this.bulletsPlayer = this.add.group();
        this.bulletsEnemies = this.add.group();
        this.healing = this.add.group();
        this.enemies = this.physics.add.group();
        this.user = new Player(this, 0, 0, 'user-2');
        Player.initHealthBar(this);
        this.user.body.angularDrag = 120;
        this.cameras.main.startFollow(this.user);
        this.physics.add.collider(this.enemies, this.bulletsPlayer, this.bulletHitEnemyCollider, null, this);
        this.physics.add.collider(this.bulletsEnemies, this.user, this.bulletHitUserCollider, null, this);
        this.physics.add.overlap(this.healing, this.user, this.userHealCollider, null, this);
        // add and set text objects
        Scores.initText(this);
        this.myVoice.speak("Watch out! Enemy close");
        // Add event listener for shooting while space is pressed down
        this.input.keyboard.on('keydown-SPACE', () => { this.shootInterval = setInterval(() => { this.userShoot(); }, 200); });
        this.input.keyboard.on('keyup-SPACE', () => { clearInterval(this.shootInterval); });
    }

    /** Updates the scene/game */
    update() {
        this.seaBlood = Math.min(Math.max(this.score, 0), 255);
        this.bloodTint = (`0x` + Phaser.Display.Color.RGBToString(this.seaBlood, (255 / 2) - this.seaBlood / 2, 255 - this.seaBlood).substring(1));
        // this.ground.setTint(this.bloodTint);
        this.userMovement();
        this.bulletsPlayer.children.each(bullet => { this.removeBullets(bullet, this.bulletsPlayer) });
        this.bulletsEnemies.children.each(bullet => { this.removeBullets(bullet, this.bulletsEnemies) });
        this.enemies.children.each(enemy => { this.enemyMove(enemy); });
        this.spawnEnemies();
        Scores.textAndCombos(this, this.cameras.main);
        this.user.healthBar(this);
        // Check enter keypress after loss / Reset the scene and physics
        if (this.gameLost && this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER))) {
            this.scene.start('level7');
            this.infernoStage++;
        }
    }

    /** removes bullet and hurts/kills enemies when colliding with a user bullet */
    bulletHitEnemyCollider = (bullet, enemy) => { enemy.enemyHit(this, bullet); }

    /** removes bullet and hurts/kills user when colliding with a enemy bullet */
    bulletHitUserCollider = (bullet, user) => { this.bulletHit(bullet); }

    /** heals the player when picking up a heart */
    userHealCollider = (heal, user) => { this.pickHeart(heal); }

    /** removes an object from the physics engine */
    removeObj(obj) {
        obj.body.destroy();
        obj.setActive(false);
        obj.setVisible(false);
    }

    /** removes bullets that are outside the viewable zone */
    removeBullets(bullet, group) {
        if (Phaser.Math.Distance.Between(bullet.x, bullet.y, this.user.x, this.user.y) > 600) {
            group.remove(bullet);
            this.removeObj(bullet);
        }
    }

    spawnEnemies() {
        if (this.enemies.getLength() < this.kills || this.firstSpawn) {
            this.firstSpawn = false;
            let randomizer = Phaser.Math.Between(-1000, 1000);
            this.enemies.add(new Enemy(this, this.user.x + Math.sign(randomizer) * this.scale.width / 2, this.user.y + Math.sign(randomizer) * this.scale.height / 2, `enemy-2`));
        }
    }

    /** moves an enemy, targeting the user, and shooting at random */
    enemyMove(enemy) {
        let chance = Phaser.Math.Between(0, 500);
        (chance < 1) && this.fireEnemyBullet(enemy);
        let angleToTarget = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.user.x, this.user.y);
        let rotationDelta = Phaser.Math.Angle.RotateTo(enemy.rotation, angleToTarget, 0.03);
        enemy.setRotation(rotationDelta);
        let speed = 1500;
        //slow or accelerate movement depending on angle vs user
        if (Math.abs(enemy.rotation - angleToTarget) > Math.PI / 2) {
            speed = 400;
        } else if (Math.abs(enemy.rotation - angleToTarget) > Math.PI / 4) {
            speed = 800;
        }
        if (Phaser.Math.Distance.Between(enemy.x, enemy.y, this.user.x, this.user.y) < this.scale.width / 4) {
            speed = 0;
        }
        this.physics.velocityFromRotation(enemy.rotation, speed, enemy.body.acceleration);
        enemy.setVelocity(enemy.body.velocity.x / 1.05, enemy.body.velocity.y / 1.05); // lower speed always
    }

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
        ((up.isDown || keyboard.up.isDown) && (!down.isDown && !keyboard.down.isDown)) && this.physics.velocityFromRotation(this.user.rotation, 300, body.acceleration);
        ((down.isDown || keyboard.down.isDown) && (!up.isDown && !keyboard.up.isDown)) && this.physics.velocityFromRotation(this.user.rotation, -600, body.acceleration);
        this.user.setVelocity(body.velocity.x / 1.05, body.velocity.y / 1.05); // lower speed always
    }

    fireEnemyBullet(enemy) {
        let bullet = new Bullet(this, enemy.x, enemy.y, bulletTypes[infernoStage])
            .setVelocity(enemy.body.velocity.x + Math.cos(Phaser.Math.DegToRad(enemy.angle)) * 800, enemy.body.velocity.y + Math.sin(Phaser.Math.DegToRad(enemy.angle)) * 800);
        bullet.body.setMass(200);
        bullet.angle = enemy.body.rotation + 90;
        this.bulletsEnemies.add(bullet);
    }

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

    /** hurts and kills the user depending on their health*/
    bulletHit(bullet) {
        // this.hp -= 10;
        this.bulletsEnemies.remove(bullet);
        this.removeObj(bullet);
        if (this.hp < 1) {
            this.myVoice.speak(`Thank you for your service`);
            this.gameLost = true;
            this.diedText.setAlpha(1);
            this.sound.add('scream').play({ volume: 1 });
            this.removeObj(this);
        }
    }

    /** makes the user shoot bullets in the direction they're going */
    userShoot() {
        if (this.user.hp > 1) {
            let bullet = new Bullet(this, this.user.x, this.user.y, bulletTypes[infernoStage])
                .setVelocity(this.user.body.velocity.x + Math.cos(Phaser.Math.DegToRad(this.user.angle)) * 800, this.user.body.velocity.y + Math.sin(Phaser.Math.DegToRad(this.user.angle)) * 800)
                .setMass(10);
            bullet.angle = this.user.body.rotation + 90;
            this.bulletsPlayer.add(bullet);
        }
    }

    pickHeart(heal) {
        this.user.hp -= 10;
        if (this.user.hp <= 0) {
            this.gameLost = true;
            this.diedText.setAlpha(1);
            this.removeObj(this.user);
        }
        this.healing.remove(heal);
        this.removeObj(heal);
    }
}