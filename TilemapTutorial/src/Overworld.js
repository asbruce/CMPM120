class Overworld extends Phaser.Scene{
    constructor(){
        super({key: 'overworldScene'})
        this.velocity = 100
    }
    preload(){
        this.load.path='./assets/'
        this.load.spritesheet('slime', 'slime.png', {
            frameWidth: 16,
            frameHeight: 16
        })
        this.load.image('tilesetImage', 'tileset.png')
        this.load.tilemapTiledJSON('tilemapJSON','area01.JSON')
    }
    create(){
        const map = this.add.tilemap('tilemapJSON')
        const tileset = map.addTilesetImage('tileset', 'tilesetImage')

        const bgLayer = map.createLayer('Background', tileset, 0, 0)
        const layer2 = map.createLayer('Tile Layer 2', tileset, 0, 0)
        const layer3 = map.createLayer('Tile Layer 3', tileset, 0, 0).setDepth(100)

        this.slime = this.physics.add.sprite(32, 32, 'slime', 0)
        this.anims.create({
            key: 'jiggle',
            frameRate: 8,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('slime', {
                start: 0,
                end: 1
            })
        })
        this.slime.play('jiggle')
        this.slime.body.setCollideWorldBounds(true)
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
        this.cameras.main.startFollow(this.slime, true, 0.25, 0.25)
        this.physics.world.bounds.setTo(0, 0, map.widthInPixels, map.heightInPixels)
        this.physics.add.collider(this.slime, layer2)
        this.physics.add.collider(this.slime, layer3)
        layer2.setCollisionByProperty({collides: true})
        layer3.setCollisionByProperty({collides: true})
        this.cursors = this.input.keyboard.createCursorKeys()
    }
    update(){
        this.direction = new Phaser.Math.Vector2(0)
        if(this.cursors.left.isDown){
            this.direction.x = -1
        }else if (this.cursors.right.isDown){
            this.direction.x = 1
        }
        if(this.cursors.up.isDown){
            this.direction.y = -1
        }else if(this.cursors.down.isDown){
            this.direction.y = 1
        }
        this.direction.normalize()
        this.slime.setVelocity(this.velocity * this.direction.x, this.velocity * this.direction.y)
    }
}