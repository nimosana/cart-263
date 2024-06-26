/** initializes the loading of assets for the 9 circles game and starts it once ready. */
class Boot extends Phaser.Scene {
    /** allows the initialization of the asset loading for the game */
    constructor() { super({ key: `boot` }); }
    //loads required assets for the game
    preload() {
        //characters
        this.load.image(`user`, `assets/images/plane2.png`);
        this.load.image(`user-1`, `assets/images/user-1.png`);
        this.load.image(`user-5`, `assets/images/tankPlayer.png`);
        this.load.image(`enemy`, `assets/images/plane1.png`);
        this.load.image(`enemy-5`, `assets/images/tankEnemy.png`);
        this.load.image(`boat`, `assets/images/boat3.png`);
        //backgrounds & images
        this.load.image('intro', `assets/images/intro.png`)
        this.load.image('gluttony', `assets/images/gluttony.png`)
        this.load.image('greed', `assets/images/greed.jpg`)
        this.load.image('heresy', `assets/images/heresy.png`);
        this.load.image('sea', `assets/images/sea.jpg`);
        this.load.image('grass', `assets/images/grass.jpg`);
        this.load.image('sand', `assets/images/sand.png`);
        this.load.image('dirt', `assets/images/dirt.png`);
        this.load.image('roses', 'assets/images/roses.png');
        this.load.image('greedFloor', 'assets/images/greedFloor.png');
        //misc objects
        this.load.image(`bullet`, `assets/images/bullet.png`);
        this.load.image('rock', `assets/images/rock.png`);
        this.load.image('heart', 'assets/images/heart.png');
        this.load.image('cookie', 'assets/images/cookie.png');
        this.load.image('money', 'assets/images/money.png');
        //sounds
        let comboSounds = 11;
        this.load.audio('eat', 'assets/sounds/crunch.mp3');
        this.load.audio('shoot', 'assets/sounds/shoot.mp3');
        this.load.audio('heal', 'assets/sounds/heal.mp3');
        this.load.audio('scream', 'assets/sounds/scream.mp3');
        this.load.audio('impact', 'assets/sounds/impact.mp3');
        this.load.audio('rockSound', `assets/sounds/rock.mp3`);
        this.load.audio('moneySound', `assets/sounds/moneySound.mp3`)

        for (let i = 2; i <= comboSounds; i++) {
            this.load.audio(`combo-${i}`, `assets/sounds/kill-${i}.mp3`);
        }
        this.load.on(`complete`, () => { this.scene.start(`level0`); });
    }
}