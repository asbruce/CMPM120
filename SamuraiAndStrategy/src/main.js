/*
Adrian Bruce
Samurai & Strategy v1.0
Approx. 42 hours(including time spent making assets)

Major phaser components used: Text objects(for almost everything), Phaser Input Events(for interactable buttons) and objects (for custom cursor), Timer (for Winter countdown), animations manager/animations (for the bandit track), tweens (for winter countdown bar)

*/
let config = {
    type: Phaser.CANVAS,
    width: 1600,
    height: 900,
    autoCenter: true,
    scene: [Menu, Credits, Play, Victory, Survived, Defeat]
}
let game = new Phaser.Game(config);
