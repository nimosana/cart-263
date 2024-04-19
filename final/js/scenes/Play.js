/** Creates the scene for the war game and every element it contains, run after Boot */
class Play extends Phaser.Scene {

    /** allows the creation of a scene for the war game, initializing it with required params */
    constructor() {
        super({ key: `play` });
        this.score = this.killTimer = this.kills = this.killCombo = 0;
        this.comboNumber = this.comboTimer = 0;
        this.newCombo = true;
        this.firstSpawn = true;
        this.saidWow = false;
        this.gameLost = false;
        this.myVoice = new p5.Speech();
        this.seaBlood = 0;
    }

    /** Creates the initial scene and elements for the war game */
    create() {
        // interaction setup
        this.cursors = this.input.keyboard.createCursorKeys();
        this.physics.world.setBounds(0, 0, 1000, 1000);// create world
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
        this.myVoice.speak("Watch out! Enemy close");
        // Add event listener for shooting while space is pressed down
        this.input.keyboard.on('keydown-SPACE', () => { this.shootInterval = setInterval(() => { this.user.userShoot(this); }, 200); });
        this.input.keyboard.on('keyup-SPACE', () => { clearInterval(this.shootInterval); });
    }

    /** Updates the scene/game */
    update() {
        this.seaBlood = Math.min(Math.max(this.score, 0), 255);
        console.log(this.seaBlood)
        this.ground.setTint((`0x` + Phaser.Display.Color.RGBToString(this.seaBlood, (255 / 2) - this.seaBlood / 2, 255 - this.seaBlood).substring(1)));
        this.user.userMovement(this);
        this.bulletsPlayer.children.each(bullet => { this.removeBullets(bullet, this.bulletsPlayer) });
        this.bulletsEnemies.children.each(bullet => { this.removeBullets(bullet, this.bulletsEnemies) });
        this.enemies.children.each(enemy => { Enemy.enemyMove(enemy, this); });
        Player.moveBoat(this);
        Enemy.spawnEnemies(this);
        Scores.textAndCombos(this, this.cameras.main);
        this.user.healthBar(this);
        // Check enter keypress after loss / Reset the scene and physics
        if (this.gameLost && this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER))) {
            this.score = this.kills = 0;
            this.scene.restart();
            this.gameLost = false;
        }
    }

    /** removes bullet and hurts/kills enemies when colliding with a user bullet */
    bulletHitEnemyCollider = (bullet, enemy) => { enemy.enemyHit(this, bullet); }

    /** removes bullet and hurts/kills user when colliding with a enemy bullet */
    bulletHitUserCollider = (bullet, user) => { user.bulletHit(this, bullet); }

    /** heals the player when picking up a heart */
    userHealCollider = (heal, user) => { this.user.heal(this, heal); }

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
}