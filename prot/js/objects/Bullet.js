class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
    }

    /** makes enemies fire bullets */
    static fireEnemyBullet(scene, enemy) {
        let soundDist = (((Phaser.Math.Clamp(Phaser.Math.Distance.Between(scene.user.x, scene.user.y, enemy.x, enemy.y) / 700, 0, 1)) - 1) * -1);
        scene.sound.add('shoot').play({ volume: soundDist });
        let bullet = new Bullet(scene, enemy.x, enemy.y, 'bullet')
            .setVelocity(scene.user.body.velocity.x + Math.cos(Phaser.Math.DegToRad(enemy.angle)) * 800, scene.user.body.velocity.y + Math.sin(Phaser.Math.DegToRad(enemy.angle)) * 800)
            .setTint(0xff0000);
        bullet.body.setMass(200);
        bullet.angle = enemy.body.rotation + 90;
        scene.bulletsEnemies.add(bullet);
    }
}