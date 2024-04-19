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

    // /** makes the user shoot bullets in the direction they're going */
    // userShoot(scene) {
    //     if (this.hp > 1) {
    //         scene.sound.add('shoot').play({ volume: 1 });
    //         let bullet = new Bullet(scene, this.x, this.y, bulletTypes[infernoStage])
    //             .setVelocity(this.body.velocity.x + Math.cos(Phaser.Math.DegToRad(this.angle)) * 800, this.body.velocity.y + Math.sin(Phaser.Math.DegToRad(this.angle)) * 800)
    //             // .setTint(0x00ff00)
    //             .setMass(10);
    //         bullet.angle = this.body.rotation + 90;
    //         scene.bulletsPlayer.add(bullet);
    //     }
    // }

    /** displays the user's health bar */
    healthBar(scene) {
        let width = Phaser.Math.Clamp((this.hp / 100) * 50, 0, 50);
        scene.rect.setPosition(scene.cameras.main.scrollX + scene.scale.width / 2 - scene.rect.width / 2, scene.scale.height / 2 + scene.cameras.main.scrollY + 40);
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

    // /** hurts and kills the user depending on their health*/
    // bulletHit(scene, bullet) {
    //     this.hp -= 10;
    //     scene.bulletsEnemies.remove(bullet);
    //     scene.removeObj(bullet);
    //     if (this.hp < 1) {
    //         scene.myVoice.speak(`Thank you for your service`);
    //         scene.gameLost = true;
    //         scene.diedText.setAlpha(1);
    //         scene.sound.add('scream').play({ volume: 1 });
    //         scene.removeObj(this);
    //     }
    // }

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