/** 9 Circles
 * @author Nicolas Morales-Sanabria
 * 
 * You awake stressing out, was it a bad dream? where are you?
 * As you seem to dive into madness, will you get stuck in violence?
 * The program seeks to take the player through 9 levels, but got stuck on the 7th. Based on the divine comedy by Dante.
 * 
 * Use the arrow keys and spacebar to move and attack enemies, sometimes you must die to progress further.
 * 
 * Attributions:
 * The images featured in this project belong to their respective owners and are used for educational purposes.
 * The music/sounds featured in this project belong to their respective owners and are used for educational purposes.  */
"use strict";
setInterval(moveBackground, 50);
let backgroundPos = 0;
let myVoice = new p5.Speech();
let playlist;
function preload() {
    noCanvas();
    playlist = [{
        sound: loadSound('assets/sounds/Ann-Clue_Roadtrip.mp3'),
        name: `Roadtrip`,
        artist: `Ann Clue & Boris Brejcha`
    }, {
        sound: loadSound('assets/sounds/NTO-Carrousel.mp3'),
        name: `Carrousel`,
        artist: `NTO`
    }, {
        sound: loadSound('assets/sounds/CABLE-Vanisher.mp3'),
        name: `Vanisher`,
        artist: `CABLE`
    }];
}
function setup() {
    let musicPlayer = new PlaylistPlayer(`soundtrack`, playlist);
    musicPlayer.playlistStart();
    musicPlayer.playlistVolume(0.6);
}

let config = {
    type: Phaser.AUTO,
    width: 900,
    height: 900,
    physics: {
        default: 'arcade', arcade: {
            gravity: { y: 0 }
        }
    },
    scene: [Boot, Level0, Level1, Level2, Level3, Level4, Level5, Level6, Level7]
};
myVoice.setPitch(0.1);
let game = new Phaser.Game(config);
let infernoStage = 1;
let bulletTypes = [`bullet`, 'rock', `heart`, `bullet`, `bullet`, `bullet`, `bullet`, `bullet`];

/** move the background of the html site */
function moveBackground() {
    backgroundPos++;
    document.getElementById("body").style.backgroundPosition = `${backgroundPos}px ${backgroundPos}px`;
}