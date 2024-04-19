class Scores {
    /** creates the text objects required to display the score, kills or death of the user  */
    static initText(scene) {
        scene.scoreText = scene.add.text(0, 0, '', { fontSize: '32px', fontFamily: 'IMPACT', fill: '#ffffff' })
            .setAlign('left')
            .setOrigin(0, 6.7);
        scene.murderText = scene.add.text(0, 0, '', { fontSize: '32px', fontFamily: 'IMPACT', fill: '#ffffff' })
            .setAlign('center')
            .setOrigin(0.5, 0)
            .setAlpha(0);
        scene.diedText = scene.add.text(0, 0, 'YOU DIED\nEnter to restart', { fontSize: '64px', fontFamily: 'IMPACT', fill: '#ffffff' })
            .setAlign('center')
            .setOrigin(0.5, 0)
            .setAlpha(0);
        scene.stageText = scene.add.text(0, 0, 'Stage', { fontSize: '64px', fontFamily: 'IMPACT', fill: '#ffffff' })
            .setAlign('center')
            .setOrigin(0.5, 0.5)
            .setAlpha(0);
    }

    // /** displays scores and combos keeping track of them */
    // static textAndCombos(scene, cam) {
    //     scene.killTimer++;
    //     scene.comboTimer++;
    //     (scene.killTimer > 250) && (scene.killCombo = 0);
    //     if (scene.comboTimer < 250) {
    //         if (scene.comboNumber >= 2 && scene.newCombo) {
    //             scene.newCombo = false;
    //             scene.comboTimer = 0;
    //             if (scene.comboNumber < 11) {
    //                 scene.sound.add(`combo-${scene.comboNumber}`).play({ volume: 5 });
    //             } else if (scene.comboNumber >= 11 && !scene.saidWow) {
    //                 scene.saidWow = true;
    //                 scene.sound.add(`combo-${scene.comboNumber}`).play({ volume: 10 });
    //             }
    //         }
    //     } else {
    //         scene.saidWow = false;
    //         scene.comboTimer = scene.comboNumber = 0;
    //     }
    //     scene.stageText.setText(scene.stageName)
    //         .setPosition(cam.scrollX + scene.scale.width * 0.8, cam.scrollY + scene.scale.height * 0.05)
    //         .setAlpha(1);
    //     scene.murderText.setText(['MURDER COMBO: ' + scene.killCombo])
    //         .setPosition(cam.scrollX + scene.scale.width / 2, cam.scrollY + scene.scale.height / 3)
    //         .setAlpha(scene.murderText.alpha - 0.01);
    //     scene.diedText.setPosition(cam.scrollX + scene.scale.width / 2, cam.scrollY + scene.scale.height / 6);
    //     scene.scoreText.setText([`Kills: ${scene.kills}`, `Score: ${scene.score}`])
    //         .setPosition(cam.scrollX + 50, cam.scrollY + 500);
    // }
}