class Menu extends Phaser.Scene{
    constructor(){
        super("menuScene");
    }
    preload(){
        this.load.audio('transition', './assets/transition.wav');
        this.load.image('menuBg', './assets/SamuraiGameMenu.png');
        this.load.spritesheet('playButton', './assets/SamuraiGamePlay.png', {frameWidth: 203, frameHeight: 88});
        this.load.spritesheet('credButton', './assets/SamuraiGameCredits.png', {frameWidth: 286, frameHeight: 107});
        this.load.image('bcursor', './assets/brushcursor.png');
        this.load.image('bcursorselect', './assets/brushcursorselect.png');
        this.input.setDefaultCursor('url(./assets/brushcursor.cur), pointer');
    }
    create() {
        this.add.sprite(game.config.width/2, game.config.height/2, 'menuBg').setOrigin(0.5, 0.5);
        this.clickCred = new Buttons(this, game.config.width*(12/16), game.config.height*(6/16), 'credButton', 0, credEffect).setOrigin(0, 1);
        function playEffect(x){
            x.sound.play('transition');
            x.scene.start('playScene');
            
        }
        function credEffect(x){
            x.sound.play('transition');
            x.scene.start('creditsScene');
        }
        this.clickPlay = new Buttons(this, game.config.width*(12/16), game.config.height*(3/16), 'playButton', 0, playEffect).setOrigin(0, 1);
    
    }
    update(){
        
    }
}