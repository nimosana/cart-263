/** Creates the scene for the 6th circle, Heresy.
 * The player must listen and wait.
 * Runnable after boot */
class Level6 extends Phaser.Scene {

    /** allows the creation of a scene for the Heresy scene, initializing it with required params */
    constructor() {
        super({ key: `level6` });
        this.imageVisibility = 0;
        this.backgroundImage;
        this.starting = true;
        this.ending = false;
        this.talking = false;
        this.stageName = 'Heresy';
    }

    /** Creates the initial scene and elements for the Heresy scene */
    create() {
        // interaction setup
        this.backgroundImage = this.add.image(0, 0, 'heresy')
            .setOrigin(0, 0);
        this.backgroundImage.setScale((this.scale.width / this.backgroundImage.width) * 1.2, (this.scale.height / this.backgroundImage.height) * 1.2);
        setInterval(this.startFading, 8000);
        this.stageText = this.add.text(0, 0, 'Stage', { fontSize: '64px', fontFamily: 'IMPACT', fill: '#ffffff' })
            .setAlign('center')
            .setOrigin(0, 0.5)
            .setAlpha(0);
    }

    /** Updates the scene */
    update() {
        /** makes the image fade in and starts the dialogue */
        this.fadeIn();
        this.fadeAway();
        this.backgroundImage.setAlpha(this.imageVisibility);
        this.stageText.setText(this.stageName)
            .setPosition(this.scale.width * 0.5, this.scale.height * 0.25)
            .setAlpha(this.imageVisibility);
    }

    /** starts the fading animation */
    startFading = () => { this.ending = true };

    /** starts the initial animation */
    fadeIn() {
        if (this.starting && this.imageVisibility <= 1) {
            this.imageVisibility += 0.01;
            if (this.imageVisibility >= 1) {
                this.starting = false;
                this.imageVisibility = 1;
                if (!this.talking) {
                    this.talking = true;
                    myVoice.speak("When reaching the Sixth Circle of Hell, Dante and Virgil see heretics who are condemned to eternity in flaming tombs.");
                }
            }
        }
    }

    /** makes the image fade away and starts the next scene */
    fadeAway() {
        if (this.ending) {
            this.imageVisibility -= 0.01;
        }
        if (this.imageVisibility <= 0) {
            this.imageVisibility = 0;
            this.scene.start('level7');
        }
    }
}