/** Hard Waterz
 * @author Nicolas Morales-Sanabria
 * 
 * Tank game using the Phaser 3 library, the user controls a tank through the arrow keys, shooting with SPACE/Click.
 * The user kills endlessly increasing amounts of enemies, trying to survive. Combo mechanics and voices keep track
 * of killstreaks and the player gets more points by having larger combos. The game contains sound effects and an 
 * announcer for an epic fighting experience. */

"use strict";
setInterval(moveBackground, 50);
let backgroundPos = 0;
let myVoice = new p5.Speech();

let config = {
    type: Phaser.AUTO,
    width: 900,
    height: 900,
    physics: {
        default: 'arcade', arcade: {
            gravity: { y: 0 }
        }
    },
    scene: [Boot, Level1, Level2, Level3, Level4, Level5, Level7]
};
myVoice.setPitch(0.1);
let game = new Phaser.Game(config);
let infernoStage = 1;
let bulletTypes = ['nothin', 'rock', `heart`, 'nothin', 'nothin', `bullet`, `bullet`, `bullet`];

/** move the background of the html site */
function moveBackground() {
    backgroundPos++;
    document.getElementById("body").style.backgroundPosition = `${backgroundPos}px ${backgroundPos}px`;
}