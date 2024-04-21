/** Creates the scene for the 2nd circle, Lust.
 * The player must throw hearts towards loving crowds to avoid getting blown away by their love.
 * Picking up hearts hurts the player, when they die, they go to the next circle.
 * Runnable after boot */
class Level2 extends Phaser.Scene {

    /** allows the creation of a scene for the lust game, initializing it with required params */
    constructor() {
        super({ key: `level2` });
        this.score = this.killTimer = this.kills = this.killCombo = 0;
        this.comboNumber = this.comboTimer = 0;
        this.newCombo = true;
        this.firstSpawn = true;
        this.gameLost = false;
        this.seaBlood = 0;
        this.stageName = 'Lust';
        this.bloodTint = (`0x` + Phaser.Display.Color.RGBToString(this.seaBlood, (255 / 2) - this.seaBlood / 2, 255 - this.seaBlood).substring(1));
    }

    /** Creates the initial scene and elements for the lust game */
    create() {
        // interaction setup
        this.cursors = this.input.keyboard.createCursorKeys();
        this.physics.world.setBounds(0, 0, 1000, 1000);// create world
        this.ground = this.add.tileSprite(0, 0, 1800, 1800, 'roses').setScrollFactor(0, 0);
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
        this.physics.add.overlap(this.healing, this.user, this.userHeartCollider, null, this);
        // add and set text objects
        Scores.initText(this);
        myVoice.speak("The second circle of hell represents the sin of lust. Dante and his companion Virgil find people who were overcome by lust, where the they are punished by being buffeted within an endless tempest, preventing them from finding peace and rest.");
        // Add event listener for shooting while space is pressed down
        this.input.keyboard.on('keydown-SPACE', () => { this.shootInterval = setInterval(() => { this.userShoot(); }, 200); });
        this.input.keyboard.on('keyup-SPACE', () => { clearInterval(this.shootInterval); });
    }

    /** Updates the scene/game */
    update() {
        this.userMovement();
        this.bulletsPlayer.children.each(bullet => { this.removeBullets(bullet, this.bulletsPlayer) });
        this.bulletsEnemies.children.each(bullet => { this.removeBullets(bullet, this.bulletsEnemies) });
        this.enemies.children.each(enemy => { this.enemyMove(enemy); });
        this.spawnEnemies();
        this.textAndCombos(this.cameras.main);
        this.user.healthBar(this);
        // Check enter keypress after loss / Reset the scene and physics
        if (this.gameLost && this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER))) {
            infernoStage++;
            this.scene.start('level3');
        }
    }

    /** removes bullet and hurts/kills enemies when colliding with a user bullet */
    bulletHitEnemyCollider = (bullet, enemy) => { this.enemyHit(bullet, enemy); }

    /** removes bullet and hurts/kills user when colliding with a enemy bullet */
    bulletHitUserCollider = (bullet, user) => { this.bulletHit(bullet); }

    /** heals the player when picking up a heart */
    userHeartCollider = (heal, user) => { this.pickHeart(heal); }

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
            this.enemies.add(new Enemy(this, this.user.x + Math.sign(randomizer) * this.scale.width / 2, this.user.y + Math.sign(randomizer) * this.scale.height / 2, `user-1`))
                .setTint(`0xFF69B4`);
        }
    }

    /** moves an enemy, targeting the user, and shooting at random */
    enemyMove(enemy) {
        let chance = Phaser.Math.Between(0, 1000);
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
            speed = -50;
        }
        this.physics.velocityFromRotation(enemy.rotation, speed, enemy.body.acceleration);
        enemy.setVelocity(enemy.body.velocity.x / 1.05, enemy.body.velocity.y / 1.05); // lower speed always
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
            this.user.setAngularVelocity(body.angularVelocity / 1.05);
        } // move forward/backward with up/down
        body.setAngularAcceleration(body.angularAcceleration / 2);
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

    /** hurts and kills the user depending on their health*/
    bulletHit(bullet) {
        this.bulletsEnemies.remove(bullet);
        this.removeObj(bullet);
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

    enemyHit(bullet, enemy) {
        enemy.hp -= 50;
        this.bulletsPlayer.remove(bullet);
        this.removeObj(bullet);
        if (enemy.hp < 1) {
            this.killCombo++;
            this.kills++;
            this.comboNumber++;
            this.score += this.killCombo;
            this.killTimer = 0;
            let soundDist = Phaser.Math.Distance.Between(this.user.x, this.user.y, enemy.x, enemy.y);
            soundDist = (((Phaser.Math.Clamp(soundDist / 700, 0, 1)) - 1) * -1);
            this.murderText.setAlpha(1);
            (Phaser.Math.Between(0, 100) < 50) && this.healing.add(this.physics.add.sprite(enemy.x, enemy.y, "heart"));
            this.enemies.remove(enemy);
            this.removeObj(enemy);
        }
    }

    /** displays scores and combos keeping track of them */
    textAndCombos(cam) {
        this.stageText.setText(this.stageName)
            .setPosition(cam.scrollX + this.scale.width * 0.8, cam.scrollY + this.scale.height * 0.05)
            .setAlpha(1);
        this.diedText.setPosition(cam.scrollX + this.scale.width / 2, cam.scrollY + this.scale.height / 6);
        this.scoreText.setText([`Kills: ${this.kills}`, `Score: ${this.score}`])
            .setPosition(cam.scrollX + 50, cam.scrollY + 500)
            .setAlpha(0);
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