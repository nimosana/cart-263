/** allows the use of general, shared functions */
class General {
    /** default actions when an enemy dies */
    static enemyDeathShared(scene) {
        scene.murderText.setAlpha(1);
        scene.killCombo++;
        scene.comboNumber++;
        scene.score += scene.killCombo;
        scene.kills++;
        scene.killTimer = 0;
        scene.newCombo = true;
    }

    /** default actions to remove a physics object */
    static removeObj(obj) {
        obj.body.destroy();
        obj.setActive(false);
        obj.setVisible(false);
    }

    /** default actions to reset a scene */
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

    /** default functionality of the combo counter & announcer */
    static comboAnnouncer(scene) {
        scene.killTimer++;
        scene.comboTimer++;
        (scene.killTimer > 250) && (scene.killCombo = 0);
        if (scene.comboTimer < 250) {
            if (scene.comboNumber >= 2 && scene.newCombo) {
                scene.newCombo = false;
                scene.comboTimer = 0;
                if (scene.comboNumber < 11) {
                    scene.sound.add(`combo-${scene.comboNumber}`).play({ volume: 5 });
                } else if (scene.comboNumber >= 11 && !scene.saidWow) {
                    scene.saidWow = true;
                    scene.sound.add(`combo-${scene.comboNumber}`).play({ volume: 10 });
                }
            }
        } else {
            scene.saidWow = false;
            scene.comboTimer = scene.comboNumber = 0;
        }
    }
}