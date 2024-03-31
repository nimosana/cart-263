class Player extends Phaser.Physics.Arcade.Sprite {
    /** creates an instance of a Player Sprite */
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setMass(1000);
        this.body.angularDrag = 120;
        this.hp = 100;
    }

    /** makes the user shoot bullets in the direction they're going */
    userShoot(scene) {
        if (this.hp > 1) {
            scene.sound.add('shoot').play({ volume: 1 });
            let bullet = new Bullet(scene, this.x, this.y, `bullet`)
                .setVelocity(this.body.velocity.x + Math.cos(Phaser.Math.DegToRad(this.angle)) * 800, this.body.velocity.y + Math.sin(Phaser.Math.DegToRad(this.angle)) * 800)
                .setTint(0x00ff00)
                .setMass(10);
            bullet.angle = this.body.rotation + 90;
            scene.bulletsPlayer.add(bullet);
        }
    }

    /** displays the user's health bar */
    healthBar(scene) {
        let width = Phaser.Math.Clamp((this.hp / 100) * 50, 0, 50);
        scene.rect.setPosition(scene.cameras.main.scrollX + scene.scale.width / 2 - scene.rect.width / 2, scene.scale.height / 2 + scene.cameras.main.scrollY + 20);
        scene.rect.width = width;
        scene.graphics.clear()
            .fillStyle(0x00ff00, 1)
            .fillRectShape(scene.rect);
    }

    /** heals the player when picking up a heart */
    heal(scene, heal) {
        scene.sound.add('heal').play({ volume: 1 });
        (this.hp < 100) && (this.hp = 100);
        scene.healing.remove(heal);
        scene.removeObj(heal);
    }

    /** move user using the arrow keys **/
    userMovement(scene) {
        const { left, right, up, down } = scene.cursors;
        let keyboard = scene.input.keyboard.addKeys({ 'up': Phaser.Input.Keyboard.KeyCodes.W, 'down': Phaser.Input.Keyboard.KeyCodes.S, 'left': Phaser.Input.Keyboard.KeyCodes.A, 'right': Phaser.Input.Keyboard.KeyCodes.D });
        const cam = scene.cameras.main;
        const body = this.body;
        scene.ground.setTilePosition(cam.scrollX, cam.scrollY);
        body.setAngularAcceleration(0);
        scene.physics.velocityFromRotation(body.rotation, 0, body.acceleration);
        // rotate if left/right arrow keys are down
        let speedRatio = 3 - (Math.sqrt(Math.pow(this.body.velocity.x, 2) + Math.pow(this.body.velocity.y, 2)) / 1000) * 2;
        if ((left.isDown || keyboard.left.isDown) && (!right.isDown && !keyboard.right.isDown)) {
            body.setAngularVelocity(-75 * speedRatio);
        } else if ((right.isDown || keyboard.right.isDown) && (!left.isDown && !keyboard.left.isDown)) {
            body.setAngularVelocity(75 * speedRatio);
        } else { // slow rotation when not pressing keys
            body.setAngularAcceleration(0);
            this.setAngularVelocity(body.angularVelocity / 1.05);
        } // move forward/backward with up/down
        ((!up.isDown || !keyboard.up.isDown) && (!down.isDown || !keyboard.down.isDown)) && scene.physics.velocityFromRotation(this.rotation, 1500, body.acceleration);
        ((up.isDown || keyboard.up.isDown) && (!down.isDown && !keyboard.down.isDown)) && scene.physics.velocityFromRotation(this.rotation, 3000, body.acceleration);
        ((down.isDown || keyboard.down.isDown) && (!up.isDown && !keyboard.up.isDown)) && scene.physics.velocityFromRotation(this.rotation, 750, body.acceleration);
        this.setVelocity(body.velocity.x / 1.05, body.velocity.y / 1.05); // lower speed always
    }

    /** hurts and kills the user depending on their health*/
    bulletHit(scene, bullet) {
        this.hp -= 10;
        scene.bulletsEnemies.remove(bullet);
        scene.removeObj(bullet);
        if (this.hp < 1) {
            scene.gameLost = true;
            scene.diedText.setAlpha(1);
            scene.sound.add('scream').play({ volume: 1 });
            scene.removeObj(this);
        }
    }

    /** randomly rotates and makes the boat move */
    static moveBoat(scene) {
        let chance = Phaser.Math.Between(0, 1000); //randomly move the boat
        ((chance > 800) && scene.boat.setAngularAcceleration(0)) || (chance < 30) && scene.boat.setAngularAcceleration(Phaser.Math.Between(-10, 10));
        scene.physics.velocityFromRotation(scene.boat.rotation, scene.boat.speed, scene.boat.body.acceleration);
        scene.boat.setVelocity(scene.boat.body.velocity.x / 1.05, scene.boat.body.velocity.y / 1.05); // lower speed always
    }

    /** initializes the health bar for the user */
    static initHealthBar(scene) {
        scene.rect = new Phaser.Geom.Rectangle(100, 100, 200, 5);
        scene.graphics = scene.add.graphics();
        scene.graphics.fillStyle(0x00ff00, 1);
    }
}