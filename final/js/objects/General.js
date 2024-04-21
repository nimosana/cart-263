class General {
    static createShared() {
    }
    static enemyDeathShared(scene) {
        scene.murderText.setAlpha(1);
        scene.killCombo++;
        scene.comboNumber++;
        scene.score += scene.killCombo;
        scene.kills++;
        scene.killTimer = 0;
        scene.newCombo = true;
    }

    /** removes an object from the physics engine */
    static removeObj(obj) {
        obj.body.destroy();
        obj.setActive(false);
        obj.setVisible(false);
    }

    /**  */
    static resetPlayScene(current) {
        // Remove all bullets and enemies
        current.bulletsPlayer.clear(true, true);
        current.bulletsEnemies.clear(true, true);
        current.enemies.clear(true, true);

        // Clear any active timers or intervals
        clearInterval(current.shootInterval);
        clearTimeout(current.killTimer);
        clearInterval(current.comboTimer);

        // Reset scene-specific variables
        current.score = 0;
        current.kills = 0;
        current.killCombo = 0;
        current.comboNumber = 0;
        current.newCombo = true;
        current.firstSpawn = true;
        current.saidWow = false;
        current.gameLost = false;

        // Restart scene
        current.scene.restart();
    }
}