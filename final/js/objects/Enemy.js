class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setMass(1000);
        this.body.angularDrag = 120;
        this.hp = 100;
    }

    /** spawns an enemy in a random corner */
    static spawnEnemies(scene) {
        if (scene.enemies.getLength() < scene.kills || scene.firstSpawn) {
            scene.firstSpawn = false;
            let randomizer = Phaser.Math.Between(-1000, 1000);
            scene.enemies.add(new Enemy(scene, scene.user.x + Math.sign(randomizer) * scene.scale.width / 2, scene.user.y + Math.sign(randomizer) * scene.scale.height / 2, `enemy`));
        }
    }

    /** moves an enemy, targeting the user, and shooting at random */
    static enemyMove(enemy, scene) {
        (Phaser.Math.Between(0, 500) < 1) && enemy.fireEnemyBullet(scene);
        let angleToTarget = Phaser.Math.Angle.Between(enemy.x, enemy.y, scene.user.x, scene.user.y);
        let rotationDelta = Phaser.Math.Angle.RotateTo(enemy.rotation, angleToTarget, 0.03);
        enemy.setRotation(rotationDelta); let speed = 3000;
        //slow or accelerate movement depending on angle vs user
        if (Math.abs(enemy.rotation - angleToTarget) > Math.PI / 2) {
            speed = 750;
        } else if (Math.abs(enemy.rotation - angleToTarget) > Math.PI / 4) {
            speed = 1000;
        }
        if (Phaser.Math.Distance.Between(enemy.x, enemy.y, scene.user.x, scene.user.y) < scene.scale.width / 4) {
            speed = 1500;
        }
        scene.physics.velocityFromRotation(enemy.rotation, speed, enemy.body.acceleration);
        enemy.setVelocity(enemy.body.velocity.x / 1.05, enemy.body.velocity.y / 1.05); // lower speed always
    }

    /** makes enemies fire bullets */
    fireEnemyBullet(scene) {
        let soundDist = (((Phaser.Math.Clamp(Phaser.Math.Distance.Between(scene.user.x, scene.user.y, this.x, this.y) / 700, 0, 1)) - 1) * -1);
        scene.sound.add('shoot').play({ volume: soundDist });
        let bullet = new Bullet(scene, this.x, this.y, 'bullet')
            .setVelocity(scene.user.body.velocity.x + Math.cos(Phaser.Math.DegToRad(this.angle)) * 800, scene.user.body.velocity.y + Math.sin(Phaser.Math.DegToRad(this.angle)) * 800)
            .setTint(0xff0000);
        bullet.body.setMass(200);
        bullet.angle = this.body.rotation + 90;
        scene.bulletsEnemies.add(bullet);
    }

    enemyHit(scene, bullet) {
        this.hp -= 50;
        scene.bulletsPlayer.remove(bullet);
        scene.removeObj(bullet);
        if (this.hp < 1) {
            let soundDist = Phaser.Math.Distance.Between(scene.user.x, scene.user.y, this.x, this.y);
            soundDist = (((Phaser.Math.Clamp(soundDist / 700, 0, 1)) - 1) * -1);
            scene.sound.add('scream').play({ volume: soundDist });
            scene.murderText.setAlpha(1);
            scene.killCombo++;
            scene.kills++;
            scene.comboNumber++;
            scene.score += scene.killCombo;
            scene.killTimer = 0;
            (Phaser.Math.Between(0, 100) < 50) && scene.healing.add(scene.physics.add.sprite(this.x, this.y, "heart"));
            scene.newCombo = true;
            scene.enemies.remove(this);
            scene.removeObj(this);
        }
    }
}
