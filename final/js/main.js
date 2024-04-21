/** 9 Circles
 * @author Nicolas Morales-Sanabria
*/

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
    scene: [Boot, Level1, Level2, Level3, Level4, Level5, Level6, Level7]
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