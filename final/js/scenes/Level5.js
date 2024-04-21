/** Creates the scene for the 5th circle, Wrath.
 * The player must murder its enemies.
 * If they score higher than 255, they go to the next circle.
 * Runnable after boot */
class Level5 extends Phaser.Scene {

    /** allows the creation of a scene for the war game, initializing it with required params */
    constructor() {
        super({ key: `level5` });
        this.score = this.killTimer = this.kills = this.killCombo = 0;
        this.comboNumber = this.comboTimer = 0;
        this.newCombo = true;
        this.firstSpawn = true;
        this.saidWow = false;
        this.gameLost = false;
        this.seaBlood = 0;
        this.stageName = 'Wrath';
        this.bloodTint = (`0x` + Phaser.Display.Color.RGBToString(this.seaBlood, (255 / 2) - this.seaBlood / 2, 255 - this.seaBlood).substring(1));
    }

    /** Creates the initial scene and elements for the war game */
    create() {
        // interaction setup
        this.cursors = this.input.keyboard.createCursorKeys();
        this.physics.world.setBounds(0, 0, 1000, 1000); // create world
        this.ground = this.add.tileSprite(0, 0, 1800, 1800, 'sea').setScrollFactor(0, 0);
        // create and setup groups, objects, physics, camera
        this.bulletsPlayer = this.add.group();
        this.bulletsEnemies = this.add.group();
        this.healing = this.add.group();
        this.enemies = this.physics.add.group();
        this.boat = this.physics.add.sprite(0, 0, `boat`);
        this.user = new Player(this, 0, 0, 'user');
        Player.initHealthBar(this);
        this.user.body.angularDrag = 120;
        this.cameras.main.startFollow(this.user);
        this.physics.add.collider(this.enemies, this.bulletsPlayer, this.bulletHitEnemyCollider, null, this);
        this.physics.add.collider(this.bulletsEnemies, this.user, this.bulletHitUserCollider, null, this);
        this.physics.add.overlap(this.healing, this.user, this.userHealCollider, null, this);
        // add and set text objects
        Scores.initText(this);
        myVoice.speak(`The Fifth Circle of Hell is where the wrathful and sullen are punished for their sins. Transported on a boat by Phlegyas, Dante and Virgil see the furious fighting each other on the surface of the river Styx and the sullen gurgling beneath the surface of the water.`);
        // Add event listener for shooting while space is pressed down
        this.input.keyboard.on('keydown-SPACE', () => { this.shootInterval = setInterval(() => { this.userShoot(); }, 200); });
        this.input.keyboard.on('keyup-SPACE', () => { clearInterval(this.shootInterval); });
    }

    /** Updates the scene/game */
    update() {
        console.log(`infstage ` + infernoStage)
        this.seaBlood = Math.min(Math.max(this.score, 0), 255);
        this.bloodTint = (`0x` + Phaser.Display.Color.RGBToString(this.seaBlood, (255 / 2) - this.seaBlood / 2, 255 - this.seaBlood).substring(1));
        this.ground.setTint(this.bloodTint);
        this.userMovement();
        this.bulletsPlayer.children.each(bullet => { this.removeBullets(bullet, this.bulletsPlayer) });
        this.bulletsEnemies.children.each(bullet => { this.removeBullets(bullet, this.bulletsEnemies) });
        this.enemies.children.each(enemy => { this.enemyMove(enemy); });
        Player.moveBoat(this);
        this.spawnEnemies();
        this.textAndCombos(this.cameras.main);
        this.user.healthBar(this);
        // Check enter keypress after loss / Reset the scene and physics
        if (this.gameLost && this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER))) {
            // this.score = this.kills = 0;
            if (this.score < 255) {
                General.resetPlayScene();
            } else {
                this.scene.start('level6');
            }
        }
    }

    /** removes bullet and hurts/kills enemies when colliding with a user bullet */
    bulletHitEnemyCollider = (bullet, enemy) => { this.enemyHit(bullet, enemy); }

    /** removes bullet and hurts/kills user when colliding with a enemy bullet */
    bulletHitUserCollider = (bullet, user) => { this.bulletHit(bullet, user); }

    /** heals the player when picking up a heart */
    userHealCollider = (heal, user) => { this.user.heal(this, heal); }

    /** removes bullets that are outside the viewable zone */
    removeBullets(bullet, group) {
        if (Phaser.Math.Distance.Between(bullet.x, bullet.y, this.user.x, this.user.y) > 600) {
            group.remove(bullet);
            General.removeObj(bullet);
        }
    }

    spawnEnemies() {
        if (this.enemies.getLength() < this.kills || this.firstSpawn) {
            this.firstSpawn = false;
            let randomizer = Phaser.Math.Between(-1000, 1000);
            this.enemies.add(new Enemy(this, this.user.x + Math.sign(randomizer) * this.scale.width / 2, this.user.y + Math.sign(randomizer) * this.scale.height / 2, `user`)
                .setTint(this.bloodTint));
        }
    }

    /** moves an enemy, targeting the user, and shooting at random */
    enemyMove(enemy) {
        (Phaser.Math.Between(0, 500) < 1) && this.fireEnemyBullet(enemy);
        let angleToTarget = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.user.x, this.user.y);
        let rotationDelta = Phaser.Math.Angle.RotateTo(enemy.rotation, angleToTarget, 0.03);
        enemy.setRotation(rotationDelta);
        let speed = 3000;
        //slow or accelerate movement depending on angle vs user
        if (Math.abs(enemy.rotation - angleToTarget) > Math.PI / 2) {
            speed = 750;
        } else if (Math.abs(enemy.rotation - angleToTarget) > Math.PI / 4) {
            speed = 1000;
        }
        if (Phaser.Math.Distance.Between(enemy.x, enemy.y, this.user.x, this.user.y) < this.scale.width / 4) {
            speed = 1500;
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
        ((!up.isDown || !keyboard.up.isDown) && (!down.isDown || !keyboard.down.isDown)) && this.physics.velocityFromRotation(this.user.rotation, 1500, body.acceleration);
        ((up.isDown || keyboard.up.isDown) && (!down.isDown && !keyboard.down.isDown)) && this.physics.velocityFromRotation(this.user.rotation, 3000, body.acceleration);
        ((down.isDown || keyboard.down.isDown) && (!up.isDown && !keyboard.up.isDown)) && this.physics.velocityFromRotation(this.user.rotation, 750, body.acceleration);
        this.user.setVelocity(body.velocity.x / 1.05, body.velocity.y / 1.05); // lower speed always
    }

    /** makes the user shoot bullets in the direction they're going */
    userShoot() {
        if (this.user.hp > 1) {
            this.sound.add('shoot').play({ volume: 1 });
            let bullet = new Bullet(this, this.user.x, this.user.y, bulletTypes[infernoStage])
                .setVelocity(this.user.body.velocity.x + Math.cos(Phaser.Math.DegToRad(this.user.angle)) * 800, this.user.body.velocity.y + Math.sin(Phaser.Math.DegToRad(this.user.angle)) * 800)
                .setMass(10);
            bullet.angle = this.user.body.rotation + 90;
            this.bulletsPlayer.add(bullet);
        }
    }

    fireEnemyBullet(enemy) {
        let bullet = new Bullet(this, enemy.x, enemy.y, bulletTypes[infernoStage])
            .setVelocity(this.user.body.velocity.x + Math.cos(Phaser.Math.DegToRad(enemy.angle)) * 800, this.user.body.velocity.y + Math.sin(Phaser.Math.DegToRad(enemy.angle)) * 800)
        // .setTint(0xff0000);
        let soundDist = (((Phaser.Math.Clamp(Phaser.Math.Distance.Between(this.user.x, this.user.y, enemy.x, enemy.y) / 700, 0, 1)) - 1) * -1);
        this.sound.add('shoot').play({ volume: soundDist });
        bullet.body.setMass(200);
        bullet.angle = enemy.body.rotation + 90;
        this.bulletsEnemies.add(bullet);
    }

    enemyHit(bullet, enemy) {
        enemy.hp -= 50;
        this.bulletsPlayer.remove(bullet);
        General.removeObj(bullet);
        if (enemy.hp < 1) {
            let soundDist = Phaser.Math.Distance.Between(this.user.x, this.user.y, enemy.x, enemy.y);
            soundDist = (((Phaser.Math.Clamp(soundDist / 700, 0, 1)) - 1) * -1);
            this.sound.add('scream').play({ volume: soundDist });
            General.enemyDeathShared(this);
            (Phaser.Math.Between(0, 100) < 50) && this.healing.add(this.physics.add.sprite(enemy.x, enemy.y, "heart"));
            this.enemies.remove(enemy);
            General.removeObj(enemy);
        }
    }

    /** hurts and kills the user depending on their health*/
    bulletHit(bullet, user) {
        this.user.hp -= 10;
        this.bulletsEnemies.remove(bullet);
        General.removeObj(bullet);
        if (this.user.hp < 1) {
            myVoice.speak(`Thank you for your service`);
            this.gameLost = true;
            this.diedText.setAlpha(1);
            this.sound.add('scream').play({ volume: 1 });
            General.removeObj(user);
        }
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
                if (this.comboNumber < 11) {
                    this.sound.add(`combo-${this.comboNumber}`).play({ volume: 5 });
                } else if (this.comboNumber >= 11 && !this.saidWow) {
                    this.saidWow = true;
                    this.sound.add(`combo-${this.comboNumber}`).play({ volume: 10 });
                }
            }
        } else {
            this.saidWow = false;
            this.comboTimer = this.comboNumber = 0;
        }
        this.stageText.setText(this.stageName)
            .setPosition(cam.scrollX + this.scale.width * 0.8, cam.scrollY + this.scale.height * 0.05)
            .setAlpha(1);
        this.murderText.setText(['MURDER COMBO: ' + this.killCombo])
            .setPosition(cam.scrollX + this.scale.width / 2, cam.scrollY + this.scale.height / 3)
            .setAlpha(this.murderText.alpha - 0.01);
        this.diedText.setPosition(cam.scrollX + this.scale.width / 2, cam.scrollY + this.scale.height / 6);
        this.scoreText.setText([`Kills: ${this.kills}`, `Score: ${this.score}`])
            .setPosition(cam.scrollX + 50, cam.scrollY + 500);
    }
}