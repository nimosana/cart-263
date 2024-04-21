/** allows the creation of bullets as physics sprite objects */
class Bullet extends Phaser.Physics.Arcade.Sprite {
    /** instantiates a bullet */
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
    }
}