// Rocket prefab
class Rocket extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
      super(scene, x, y, texture, frame);
  
      // add object to existing scene
      scene.add.existing(this);
      this.isFiring = false;
      this.moveSpeed = 2;
      this.sfxRocket = scene.sound.add('sfx_rocket'); // add rocket sfx
      this.moveL=false;
      this.moveR=false;
      this.home=game.config.height - borderUISize - 2*borderPadding;
    }
    moveLeft(){
        this.moveL=true;
    }
    moveRight(){
        this.moveR=true;
    }
    fire(){
        if(!this.isFiring){
            this.isFiring=true;
            this.sfxRocket.play();
            } 
    }
    grow(){
        this.home += borderPadding;
    }
    update(){
        //left/right movement
        if(!this.isFiring){
            if(this.moveL && this.x >= borderUISize + this.width){
                this.x-=this.moveSpeed;
                this.moveL=false;
            } else if(this.moveR && this.x <= game.config.width - borderUISize - this.width){
                this.x += this.moveSpeed;
                this.moveR=false;
            }
        }
        //fire button

        //if fired, move up
        if(this.isFiring && this.y >= borderUISize * 3 + borderPadding){
            this.y -= this.moveSpeed;
        }
        //reset on miss
        if(this.y<=borderUISize * 3 + borderPadding){
            this.reset();
        }
    }

    //reset rocket placement
    reset(){
        this.isFiring = false;
        this.y = this.home;
    }
}