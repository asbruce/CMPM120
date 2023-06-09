class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }
    preload() {
        this.load.image('map', './assets/SamuraiGameMap.png');
        this.load.atlas('banditTrack', './assets/BanditTrack.png', 'assets/BanditTrack.json');
    }
    create() {
        this.textConfig = {
            fontFamily: 'EastSea',
            fontSize: '28px',
            color: '#1e1e1e',
            strokeThickness: 0,
            align: 'left',
            padding: {
                top: 0,
                bottom: 0,
            },
            fixedWidth: 0
        }
        this.lonelyConfig = {
            fontFamily: 'EastSea',
            fontSize: '28px',
            color: '#1e1e1e',
            stroke: '#1e1e1e',
            strokeThickness: 1,
            align: 'left',
            padding: {
                top: 2,
                bottom: 2,
            },
            fixedWidth: 0
        }
        let subtitleConfig = {
            fontFamily: 'EastSea',
            fontSize: '36px',
            color: '#1e1e1e',
            align: 'left',
            padding: {
                top: 5,
                bottom: 0,
            },
            fixedWidth: 0
        }
        let titleConfig = {
            fontFamily: 'EastSea',
            fontSize: '64px',
            color: '#1e1e1e',
            align: 'left',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 0
        }
        let menuConfig = {
            fontFamily: 'EastSea',
            fontSize: '22px',
            color: '#bfbfbf',
            align: 'left',
            padding: {
                top: 0,
                bottom: 2,
            },
            fixedWidth: 0
        }
        //Set initial number values
        //I wasn't able to find an exact estimate of the number of villagers who got trained to fight
        //but there is a scene where one villager gathers up the others in training who live in the three houses past the bridge
        //there are 6 of them, according to the script, so I'm assuming roughly 2 trainable villagers per house. That would be 76, which I am rounding to 75
        this.totVillagers = 75;
        //they say there are ~40 bandits, but the battle plan they use to track the bandits they kill has 33 spaces to track the deaths. 
        //I'm assuming, therefore, that killing 33 bandits is a victory.
        this.totBandits = 33;

        this.deadBandits = 0;
        this.deadVillagers = 0;

        this.t1Villagers = 0;
        this.t2Villagers = 0;

        //It was unclear when exactly the events in the movie took place, because they talk about the harvest, but refer to both rice and barley
        //as far as I learned from my research, these are often harvested at different times
        //I decided that the fighting with bandits should be in Winter, since from what I was able to find online, that's when most of that sequence was filmed
        //Plus, that would definitely put the bandits arriving after the harvest.
        //We start in Spring for the recruiting, then you have two seasons to prepare before the fighting begins.
        this.season = ['Spring', 'Summer', 'Fall', 'Winter'];
        this.seasonInd = 0;
        this.week = 1;

        //these are all just the starting values for the different resources
        this.buildingSupplies = 10;
        this.rice = 100;

        this.maxWarriors = 7;
        this.warriors = 0;
        this.warriorIndex = 0;
        this.warriorlist = new Array(7);
        this.deadWarriors = 0;
        this.samSt = 0;
        this.samSw = 0;
        this.samTe = 0;
        this.samStu = 0;
        this.merc = 0;

        //initializing variables for later actions
        this.vilsBuilding = 0;
        this.vilsTraining = 0;
        this.buildLoc = 0;
        this.locList = ['North', 'East', 'South', 'West'];
        this.vilsGathering = 0;
        this.advancedTrain = false;
        this.samTaskMults = [0, 1, 0, 1, 1, 1, 1, 1];
        this.vilsDefending = [0, 0, 0, 0];

        //adding background and text
        this.add.sprite(game.config.width / 2, game.config.height / 2, 'map').setOrigin(0.5, 0.5);

        this.toMenu = new Buttont(this, game.config.width * (1 / 40), -5, "Menu", "Menu (WARNING: may RESET progress)", menuConfig, menuConfig);
        this.toMenu.on('pointerdown', () => this.scene.start("menuScene"));

        //report bar (top middle)
        this.report1 = this.add.text(game.config.width * (2 / 8)-15, 18, 'Your scouts have reported bandits in the area.', this.textConfig);
        this.report2 = this.add.text(game.config.width * (2 / 8)-15, 18+game.config.height / 40, 'To defend your village, you will need to get some help.', this.textConfig);
        this.report3 = this.add.text(game.config.width * (2 / 8)-15, 18+game.config.height * (2/40), 'Try recruiting a samurai.', this.textConfig);

        //Bandits (right)
        this.add.text(game.config.width * (7 / 8), game.config.height / 40, 'Bandits:', titleConfig);
        this.anims.create({
            key: 'killBandits',
            frames: this.anims.generateFrameNames('banditTrack', {prefix: 'B', start:1, end: 32}),
            frameRate: 6
        });

        //Time (top left)
        this.add.text(game.config.width * (1 / 40), game.config.height / 40, 'Time: ', titleConfig);
        this.calndr = this.add.text(game.config.width * (3.65 / 40), game.config.height * (2 / 40), 'Spring, Week 1', subtitleConfig);

        //Defenses (Middle left)
        this.add.text(game.config.width * (1 / 40), game.config.height * (4.5 / 40), 'Defenses:', titleConfig);
        this.northDefT = this.add.text(game.config.width * (1 / 40), game.config.height * (8 / 40), 'North:' + '0', this.textConfig);
        this.eastDefT = this.add.text(game.config.width * (1 / 40), game.config.height * (10 / 40), 'East:' + '0', this.textConfig);
        this.southDefT = this.add.text(game.config.width * (1 / 40), game.config.height * (12 / 40), 'South:' + '0', this.textConfig);
        this.westDefT = this.add.text(game.config.width * (1 / 40), game.config.height * (14 / 40), 'West:' + '0', this.textConfig);
        this.northDef = 0;
        this.eastDef = 0;
        this.southDef = 0;
        this.westDef = 0;

        //Resources (bottom left)
        this.add.text(game.config.width * (1 / 40), game.config.height * (17 / 40), 'Resources:', titleConfig);
        this.uVil = this.add.text(game.config.width * (1 / 40), game.config.height * (20 / 40), 'Untrained Villagers: ' + (this.totVillagers - this.deadVillagers - this.t1Villagers - this.t2Villagers), this.textConfig);
        this.t1Vil = this.add.text(game.config.width * (1 / 40), game.config.height * (21 / 40), 'Novice Villagers: ' + (this.t1Villagers), this.textConfig);
        this.t2Vil = this.add.text(game.config.width * (1 / 40), game.config.height * (22 / 40), 'Expert Villagers: ' + (this.t2Villagers), this.textConfig);
        this.add.text(game.config.width * (1 / 40), game.config.height * (23 / 40), 'Warriors: ', this.textConfig);
        this.samStrat = this.add.text(game.config.width * (2 / 40), game.config.height * (24 / 40), 'Samurai (Strategist): ' + (this.samSt), this.textConfig);
        this.samSword = this.add.text(game.config.width * (2 / 40), game.config.height * (25 / 40), 'Samurai (Swordsman): ' + (this.samSw), this.textConfig);
        this.samTeach = this.add.text(game.config.width * (2 / 40), game.config.height * (26 / 40), 'Samurai (Teacher): ' + (this.samTe), this.textConfig);
        this.samStudent = this.add.text(game.config.width * (2 / 40), game.config.height * (27 / 40), 'Samurai (Student): ' + (this.samStu), this.textConfig);
        this.mercenary = this.add.text(game.config.width * (2 / 40), game.config.height * (28 / 40), 'Mercenaries: ' + (this.merc), this.textConfig);
        this.buildingSuppliesT = this.add.text(game.config.width * (1 / 40), game.config.height * (30 / 40), 'Building Materials: ' + (this.buildingSupplies), this.textConfig);
        this.riceLeft = this.add.text(game.config.width * (1 / 40), game.config.height * (32 / 40), 'Rice: ' + (this.rice) + "%", this.textConfig);
    
        //action buttons (bottom middle)
        this.action1 = new Buttont(this, game.config.width * (2 / 8) -15, game.config.height*(31/40) , "o Recruit samurai.", "x Recruit the first samurai who agrees to help.", this.textConfig, this.lonelyConfig);
        this.action2 = new Buttont(this, game.config.width * (2 / 8) -15, game.config.height*(32.25/40) , "o", "", this.textConfig, this.lonelyConfig);
        this.action3 = new Buttont(this, game.config.width * (2 / 8) -15, game.config.height*(33.5/40) , "o", "", this.textConfig, this.lonelyConfig);
        this.action4 = new Buttont(this, game.config.width * (2 / 8) -15, game.config.height*(34.75/40) , "o", "", this.textConfig, this.lonelyConfig);
        this.action5 = new Buttont(this, game.config.width * (2 / 8) -15, game.config.height*(36/40) , "o", "", this.textConfig, this.lonelyConfig);
        this.action6 = new Buttont(this, game.config.width * (2 / 8) -15, game.config.height*(37.25/40) , "o", "", this.textConfig, this.lonelyConfig);
       
        //Interactivity sent to switch statements that determine the effect based on the season/week
        this.action1.on('pointerdown', () => this.action1Handler(this.seasonInd, this.week));
        this.action3.on('pointerdown', () => this.action3Handler(this.seasonInd, this.week));
        this.action2.on('pointerdown', () => this.action2Handler(this.seasonInd, this.week));
        this.action4.on('pointerdown', () => this.action4Handler(this.seasonInd, this.week));
        this.action5.on('pointerdown', () => this.action5Handler(this.seasonInd, this.week));
        this.action6.on('pointerdown', () => this.action6Handler(this.seasonInd, this.week));
        this.action6.disableInteractive();
    }
    
    startRecruitment(){//first action
        this.leader = new Warrior(1);
        this.candidate = new Warrior(4);
        this.recruitWarrior(this.leader);
        this.action1.disableInteractive();
        this.action1.setText("Recruiting:")
        this.report3.setText('The samurai suggests you test the skills of potential recruits');
        
    };
    
    recruitWarrior(trgt){//Recruitment: used in Spring to recruit samurai and mercenaries
        this.canAfford = false;
        if(trgt.getCost()>this.rice){
            this.canAfford=false;
        }else{
            this.rice-=trgt.getCost();
            this.riceLeft.setText('Rice: ' + (this.rice) + "%");
            if(trgt.getType()=="Thief"){
                this.report1.setText('You were stolen from by a thief!.');
                this.report2.setText('You have ' + this.rice + '% of your rice left, and can recruit up to ' + (this.maxWarriors-this.warriors) + ' more warriors.');  
            }else{
                this.canAfford=true;
            }   
        }
        if(this.canAfford&&trgt.recruit()&&this.warriors<this.maxWarriors){
                if(this.warriors == 0){
                    this.warriorlist[this.warriors] = trgt;
                }else{
                    this.warriorlist[this.warriors] = new Warrior(trgt.gettypeNum());
                }
                this.warriors+=1;
                switch(trgt.getType()){
                    case "Samurai(Strategist)":
                        this.samSt +=1;
                        this.samStrat.setText('Samurai (Strategist): ' + (this.samSt));
                        this.report1.setText('You have recruited a samurai skilled in strategy.');
                        this.report2.setText('You have ' + this.rice + '% of your rice left, and can recruit up to ' + (this.maxWarriors-this.warriors) + ' more warriors.');
                        break;
                    case "Samurai(Swordsman)":
                        this.samSw +=1;
                        this.samSword.setText('Samurai (Swordsman): ' + (this.samSw));
                        this.report1.setText('You have recruited a samurai skilled in swordsmanship.');
                        this.report2.setText('You have ' + this.rice + '% of your rice left, and can recruit up to ' + (this.maxWarriors-this.warriors) + ' more warriors.');
                        break;
                    case "Samurai(Teacher)":
                        this.samTe +=1;
                        this.samTeach.setText('Samurai (Teacher): ' + (this.samTe));
                        this.report1.setText('You have recruited a samurai skilled at training others.');
                        this.report2.setText('You have ' + this.rice + '% of your rice left, and can recruit up to ' + (this.maxWarriors-this.warriors) + ' more warriors.');
                        break;
                    case "Samurai(Student)":
                        this.samStu +=1;
                        this.samStudent.setText('Samurai (Student): ' + (this.samStu));
                        this.report1.setText('You have recruited a samurai student. They can help the more experienced warriors with basic tasks.');
                        this.report2.setText('You have ' + this.rice + '% of your rice left, and can recruit up to ' + (this.maxWarriors-this.warriors) + ' more warriors.');
                        break;
                    case "Mercenary":
                        this.merc +=1;
                        this.mercenary.setText('Mercenaries: ' + (this.merc));
                        this.report1.setText('You have recruited a mercenary.');
                        this.report2.setText('You have ' + this.rice + '% of your rice left, and can recruit up to ' + (this.maxWarriors-this.warriors) + ' more warriors.');
                        break;
                    default:
                        break;
                }
        }
        if(this.warriors>1){
            this.candidate.remake(Phaser.Math.Between(0, 5));
        }
        this.nextWeek();
    };
    
    
    nextWeek(){//progresses time
        this.week += 1;
        if(this.week >12){
            this.nextSeason();

        }
        this.calndr.setText(this.season[this.seasonInd] + ', Week ' + this.week);
        if(this.seasonInd == 0 && this.week >1){
            this.action3.setText("o Recruit the candidate");
            this.action2.setText("o Test the candidate");
            this.action3.txt = "o Recruit the candidate";
            this.action3.txt2 = "x Recruit Cost: " + this.candidate.getCost() +"% of rice.";
            this.action2.txt = "o Test the candidate";
            this.action2.txt2 = "x Discover their skills, reveal thieves (WARNING: May cause offense, increasing price)"
            this.action3.setInteractive();
            this.action2.setInteractive();
            if(this.warriors >= this.maxWarriors){
                this.action3.setText("You cannot recruit any more warriors.");
                this.action3.disableInteractive();
                this.action6.setInteractive();
                this.action6.setText("o Return to village");
                this.action6.txt="o Return to village";
                this.action6.txt2="x Return to the village (time passes...)"
            }
        }
        if((this.seasonInd==1 && this.week > 1) || (this.seasonInd==2) || (this.seasonInd == 3 && this.week == 1)){
            this.buildingSupplies+=this.vilsGathering;
            if(this.buildingSupplies>=this.vilsBuilding){
                this.buildingSupplies -= this.vilsBuilding;
                switch(this.buildLoc){
                    case 0: 
                        this.northDef += Math.floor(this.vilsBuilding*this.samTaskMults[0]*this.samTaskMults[1]);
                        break;
                    case 1:
                        this.eastDef += Math.floor(this.vilsBuilding*this.samTaskMults[0]*this.samTaskMults[1]);
                        break;
                    case 2:
                        this.southDef += Math.floor(this.vilsBuilding*this.samTaskMults[0]*this.samTaskMults[1]);
                        break;
                    case 3:
                        this.westDef += Math.floor(this.vilsBuilding*this.samTaskMults[0]*this.samTaskMults[1]);
                        break;
                }
            }else{
                switch(this.buildLoc){
                    case 0: 
                        this.northDef += Math.floor(this.buildingSupplies*this.samTaskMults[0]*this.samTaskMults[1]);
                        break;
                    case 1:
                        this.eastDef += Math.floor(this.buildingSupplies*this.samTaskMults[0]*this.samTaskMults[1]);
                        break;
                    case 2:
                        this.southDef += Math.floor(this.buildingSupplies*this.samTaskMults[0]*this.samTaskMults[1]);
                        break;
                    case 3:
                        this.westDef += Math.floor(this.buildingSupplies*this.samTaskMults[0]*this.samTaskMults[1]);
                        break;
                }
                this.buildingSupplies = 0;
            }
            if(!this.advancedTrain){
                this.temp = Phaser.Math.FloatBetween(0.1, 0.5);
                this.temp = this.temp * this.vilsTraining*this.samTaskMults[2]*this.samTaskMults[3];
                if(Math.ceil(this.temp)<=(this.totVillagers-this.deadVillagers-this.t1Villagers-this.t2Villagers)){
                    this.t1Villagers += Math.ceil(this.temp);
                }else{
                    this.t1Villagers+=(this.totVillagers-this.deadVillagers-this.t1Villagers-this.t2Villagers);
                }
            }else{
                this.temp = Phaser.Math.FloatBetween(0.01, 0.25);
                this.temp = this.temp * this.vilsTraining*this.samTaskMults[2]*this.samTaskMults[3];
                if(Math.ceil(this.temp)<=(this.t1Villagers)){
                    this.t1Villagers -= Math.ceil(this.temp);
                    this.t2Villagers += Math.ceil(this.temp);
                }else{
                    this.t2Villagers+=(this.t1Villagers);
                    this.t1Villagers-=this.t1Villagers;
                }
            }
            this.updateDefAndRes();
            this.warriorIndex = 0;
            this.samuraiAssignable=true;
            this.samTaskMults[0] = 0;
            this.samTaskMults[1] = 1;
            this.samTaskMults[2] = 0;
            this.samTaskMults[3] = 1;
            this.action1.setText("Assign " + this.warriorlist[this.warriorIndex].getType());
            this.action2.setInteractive();
            this.action2.txt2 = "x Building Defenses";
            this.action3.txt2 = "x Training Villagers";
            this.action3.setInteractive();
            this.action5.setInteractive();
            this.action6.setInteractive();
        }
        if(this.seasonInd == 2){
            if(this.week==1){
                this.track = this.add.sprite(game.config.width/2, game.config.y/2, 'banditTrack').setOrigin(0, 0);
                this.deadBandits=1;
                this.temp = Math.floor(this.northDef/50) + Math.floor(this.southDef/50) + Math.floor(this.eastDef/50) + Math.floor(this.westDef/50);
                this.killBandits(this.track, this.temp);
            }else{
                this.temp = Math.floor(this.northDef/50) + Math.floor(this.southDef/50) + Math.floor(this.eastDef/50) + Math.floor(this.westDef/50);
                this.killBandits(this.track, this.temp);
            }
            
        }
    }

    
    nextSeason(){//progresses seasons
        this.seasonInd +=1;
        this.week = 1;
        this.sound.play('transition');
        if(this.seasonInd == 1){
            this.summerSetup();
        }
        if(this.seasonInd ==2){
            this.report1.setText("The bandits have begun to attack.");
            this.report2.setText("For now, your defenses are holding them off.");
            this.report3.setText("If any survive at the start of winter, there will be a final attack.");
        }
        if(this.seasonInd == 3){
            this.winterSetup();
        }
    }
    
    testWarrior(trgt){//test the warriors before recruiting them (referencing how, in the movie, Kambei had his student try to hit the potential recruits with a stick as they entered the room, to test their skills and temperament)
        this.action2.disableInteractive();
        this.action2.setText(trgt.test());
        this.action3.txt2 = "x Recruit Cost: " + this.candidate.getCost() +"% of rice.";
        this.action4.setText("o Dismiss the candidate");
        this.action4.txt = "o Dismiss the candidate";
        this.action4.txt2 = "x Dismiss the current candidate, but it may take time to find another.";
    }


    summerSetup(){ //sets up the needed text and buttons for summer and fall
        this.report1.setText("You have brought the samurai back to your village.");
        this.report2.setText("You must decide who should work on defenses and who should train.");
        this.report3.setText("The bandits will start attacking in Fall, when the harvest is complete.");

        this.action1.disableInteractive();
        this.action1.setText("Assign " + this.warriorlist[this.warriorIndex].getType());

        this.action2.setInteractive();
        this.action2.setText("o Building Defenses");
        this.action2.txt = "o Building Defenses";
        this.action2.txt2 = "x Building Defenses";
        
        this.action3.setInteractive();
        this.action3.setText("o Training Villagers");
        this.action3.txt = "o Training Villagers";
        this.action3.txt2 = "x Training Villagers";

        this.action4.disableInteractive();
        this.action4.setText("o");
        this.action4.txt = "";
        this.action4.txt2 = "";

        this.action5.setInteractive();
        this.action5.setText("o Auto Assign");
        this.action5.txt = "o Auto Assign";
        this.action5.txt2 = "x Auto Assign";

        this.action6.disableInteractive();
        this.action6.setText("o");
        this.action6.txt = "";
        this.action6.txt2 = "";

        //setting up the new buttons
        this.label7 = this.add.text(game.config.width * (8.5 / 16), game.config.height * (31 / 40), 'Gathering: 0/75', this.textConfig);
        this.label8 = this.add.text(game.config.width * (8.5 / 16), game.config.height * (32.25 / 40), 'Building: North, 0/75', this.textConfig);
        this.label9 = this.add.text(game.config.width * (8.5 / 16), game.config.height * (33.5 / 40), 'Training: 0/75', this.textConfig);
        this.labelA = this.add.text(game.config.width * (8.5 / 16), game.config.height * (34.75 / 40), 'Waiting: 75/75', this.textConfig);

        
        this.action7 = new Buttont(this, game.config.width * (10.5/16), game.config.height*(31/40) , " + ", "(+)", this.textConfig, this.lonelyConfig);
        this.action7B = new Buttont(this, game.config.width * (11.5/16), game.config.height*(31/40) , " - ", "(-)", this.textConfig, this.lonelyConfig);
        this.action7C = new Buttont(this, game.config.width * (12.5/16), game.config.height*(31/40) , " ", " ", this.textConfig, this.lonelyConfig);
        this.action7C.disableInteractive();

        this.action8 = new Buttont(this, game.config.width * (10.5/16), game.config.height*(32.25/40) , " + ", "(+)", this.textConfig, this.lonelyConfig);
        this.action8B = new Buttont(this, game.config.width * (11.5/16), game.config.height*(32.25/40) , " - ", "(-)", this.textConfig, this.lonelyConfig);
        this.action8C = new Buttont(this, game.config.width * (12.5/16), game.config.height*(32.25/40) , "Move", "(Move)", this.textConfig, this.lonelyConfig);

        this.action9 = new Buttont(this, game.config.width * (10.5/16), game.config.height*(33.5/40) , " + ", "(+)", this.textConfig, this.lonelyConfig);
        this.action9B = new Buttont(this, game.config.width * (11.5/16), game.config.height*(33.5/40) , " - ", "(-)", this.textConfig, this.lonelyConfig);
        this.action9C = new Buttont(this, game.config.width * (12.5/16), game.config.height*(33.5/40) , "Basic", "Advanced", this.textConfig, this.lonelyConfig);

        this.actionA = new Buttont(this, game.config.width * (10.5/16), game.config.height*(34.75/40) , "Auto Assign", "(Auto Assign)", this.textConfig, this.lonelyConfig);
        this.actionAB = new Buttont(this, game.config.width * (11.5/16), game.config.height*(34.75/40) , "", "", this.textConfig, this.lonelyConfig);
        this.actionAC = new Buttont(this, game.config.width * (12.5/16), game.config.height*(34.75/40) , " ", " ", this.textConfig, this.lonelyConfig);
        this.actionAC.disableInteractive();

        this.actionB = new Buttont(this, game.config.width * (12/16), game.config.height*(37/40) , "Next Week", "Time passes...", this.textConfig, this.lonelyConfig);

        this.action7.on('pointerdown', () => this.action7Handler(this.seasonInd, this.week, 0));
        this.action7B.on('pointerdown', () => this.action7Handler(this.seasonInd, this.week, 1));

        this.action8.on('pointerdown', () => this.action8Handler(this.seasonInd, this.week, 0));
        this.action8B.on('pointerdown', () => this.action8Handler(this.seasonInd, this.week, 1));
        this.action8C.on('pointerdown', () => this.action8Handler(this.seasonInd, this.week, 2));

        this.action9.on('pointerdown', () => this.action9Handler(this.seasonInd, this.week, 0));
        this.action9B.on('pointerdown', () => this.action9Handler(this.seasonInd, this.week, 1));
        this.action9C.on('pointerdown', () => this.action9Handler(this.seasonInd, this.week, 2));


        this.actionA.on('pointerdown', () => this.actionAHandler(this.seasonInd, this.week, 0));
        this.actionAB.on('pointerdown', () => this.actionAHandler(this.seasonInd, this.week, 1));

        this.actionB.on('pointerdown', () => this.actionBHandler(this.seasonInd, this.week));

    }
    updateDefAndRes(){ //updates the defense and resource menus
        this.buildingSuppliesT.setText('Building Materials: ' + (this.buildingSupplies));
        this.northDefT.setText('North: ' + this.northDef);
        this.eastDefT.setText('East: ' + this.eastDef);
        this.southDefT.setText('South: ' + this.southDef);
        this.westDefT.setText('West: ' + this.westDef);
        this.uVil.setText('Untrained Villagers: ' + (this.totVillagers - this.deadVillagers - this.t1Villagers - this.t2Villagers));
        this.t1Vil.setText('Novice Villagers: ' + (this.t1Villagers));
        this.t2Vil.setText('Expert Villagers: ' + (this.t2Villagers));
    }
    updateLabelsSumFal(){//updates the labels for the summer and fall actions
        this.label7.setText('Gathering: ' + this.vilsGathering + '/75');
        this.label8.setText('Building: ' + this.locList[this.buildLoc] + ', ' + this.vilsBuilding +'/75');
        this.label9.setText('Training: ' + this.vilsTraining + '/75');
        this.labelA.setText('Waiting: ' + (this.totVillagers-this.vilsBuilding-this.vilsGathering-this.vilsTraining) + '/75');
    }
    updateLabelsWint(){//updates the labels for the winter actions
        this.label7.setText('North: ' + this.vilsDefending[0] + '/75, STR  ' +this.vilStrCalc(0));
        this.label8.setText('East: ' + this.vilsDefending[1]+ '/75, STR ' +this.vilStrCalc(1));
        this.label9.setText('South: ' + this.vilsDefending[2] + '/75, STR ' +this.vilStrCalc(2));
        this.labelA.setText('West: ' + this.vilsDefending[3] + '/75, STR ' +this.vilStrCalc(3));
    }
    villagersAvailable(x){//checks to make sure there are enough villagers available for the desired action
        if(this.seasonInd<3){
            if((this.totVillagers-this.vilsBuilding-this.vilsGathering-this.vilsTraining-this.deadVillagers)>=x){
                return true;
            }else{
                return false;
            }  
        }else{
            if((this.totVillagers-this.vilsDefending[0]-this.vilsDefending[1]-this.vilsDefending[2]-this.vilsDefending[3])>=x){
                return true;
            }else{
                return false;
            }
        }
        
    }
    gatherNum(c){ //updates the number of villagers gathering materials
        if(c==0){
            if(this.villagersAvailable(5)){
                this.vilsGathering+=5;
            }
        }else{
            if(this.vilsGathering>=5){
                this.vilsGathering -=5;
            }
        }
        this.updateLabelsSumFal();
    }
    buildNum(c){ //updates the number of villagers building defenses and the location of the defenses
        if(c==0){
            if(this.villagersAvailable(5)){
                this.vilsBuilding+=5;
            }
        }else{
            if(c==1){
                if(this.vilsBuilding>=5){
                   this.vilsBuilding-=5; 
                }
            }else{
                if(this.buildLoc<3){
                    this.buildLoc+=1;
                }else{
                    this.buildLoc=0;
                }
            }
        }
        this.updateLabelsSumFal();
    }
    trainNum(c){ //updates the number of villagers training and the type of training
        if(c==0){
            if(this.villagersAvailable(5)){
                this.vilsTraining+=5;
            }
        }else{
            if(c==1){
                if(this.vilsTraining>=5){
                    this.vilsTraining-=5;
                }
            }else{
                if(this.advancedTrain==false){
                    this.advancedTrain=true;
                    this.action9C.setText("Advanced");
                    this.action9C.txt = "Advanced";
                    this.action9C.txt2 = "Basic";
                }else{
                    this.advancedTrain=false;
                    this.action9C.setText("Basic");
                    this.action9C.txt = "Basic";
                    this.action9C.txt2 = "Advanced";
                }
            }
        }
        this.updateLabelsSumFal();
    }
    defendingNum(a, c){
        if(c==0){
            if(this.villagersAvailable(5)){
                this.vilsDefending[a]+=5;
            }
        }else{
            if(this.vilsGathering>=5){
                this.vilsDefending[a] -=5;
            }
        }
        this.updateLabelsWint();
    }
    assign(sam, task){//assigns a samurai to a task
        if(task == 'build'){
            this.samTaskMults[0]+=sam.getPlan();
            this.samTaskMults[1]*=sam.getStudentBonus();
        }else{
            if(task == 'train'){
                this.samTaskMults[2]+=sam.getTrainR();
                this.samTaskMults[3]*=sam.getStudentBonus();
            }else{
                if(task == 'n'){
                    sam.setLocation(1);
                    this.samTaskMults[4]*=sam.attack();
                }else{
                    if(task == 'e'){
                        sam.setLocation(2);
                        this.samTaskMults[5]*=sam.attack();
                    }else{
                        if(task == 's'){
                            sam.setLocation(3);
                            this.samTaskMults[6]*=sam.attack();
                        }else{
                            if(task == 'w'){
                                sam.setLocation(4);
                                this.samTaskMults[7]*=sam.attack();
                            }
                        }
                    }
                }
            }
        }
        if(this.warriorIndex<(this.warriors-1)){
            this.warriorIndex+=1;
            this.action1.setText("Assign " + this.warriorlist[this.warriorIndex].getType());
        }else{
            this.samuraiAssignable=false;
            this.action1.setText("All warriors assigned for the week");
            this.action2.disableInteractive();
            this.action3.disableInteractive();
            this.action5.disableInteractive();
            this.action6.disableInteractive();
        }
    }
    autoAssignSam(sam){
        if(sam.getType()=="Samurai(Strategist)"){
            this.assign(sam, 'build');
        }else{
            if(sam.getType()=="Samurai(Teacher)"){
                this.assign(sam, 'train');
            }else{
                if(this.samTaskMults[0]<this.samTaskMults[3]){
                    this.assign(sam, 'build');
                }else{
                    this.assign(sam, 'train');
                }
            }
        }
    }
    finalAttack(){
        this.sound.play('transition');
        this.temp = 100*(this.totBandits-this.deadBandits);
        if(((this.northDef+this.vilStrCalc(0))>=this.temp)&&((this.eastDef+this.vilStrCalc(1))>=this.temp)&&((this.southDef+this.vilStrCalc(2))>=this.temp)&&((this.westDef+this.vilStrCalc(3))>=this.temp)){
            this.scene.start("victoryScene");
        }else{
            if(((this.northDef+this.vilStrCalc(0))<this.temp)&&((this.eastDef+this.vilStrCalc(1))<this.temp)&&((this.southDef+this.vilStrCalc(2))<this.temp)&&((this.westDef+this.vilStrCalc(3))<this.temp)){
                this.scene.start("defeatScene");
            }else{
                this.scene.start("survivedScene");
            }
        }
    }
    winterSetup(){
        this.countdown = this.time.delayedCall(20000, () => {
            this.finalAttack();
        }, null, this);

        this.report1.setText("The bandits are attacking!");
        this.report2.setText("Quick! Assign everyone to one of the defense points!");
        this.report3.setText("Time remaining:");
        this.timeBar = this.add.rectangle(game.config.width * (3 / 8) - 80, 32+game.config.height * (2/40), 200, 12, '#1e1e1e', 0.75).setOrigin(0,0);
        this.tweens.add({
            targets: this.timeBar,
            duration: 20000,
            scaleX: 0
        });
        this.label7.setText('North: 0/75');
        this.label8.setText('East: 0/75');
        this.label9.setText('South: 0/75');
        this.labelA.setText('West: 0/75');

        this.action8C.disableInteractive();
        this.action8C.setText(' ');

        this.action9C.disableInteractive();
        this.action9C.setText(' ');

        this.actionA.setText(" + ");
        this.actionA.txt = " + ";
        this.actionA.txt2 = "(+)";
        this.actionAB.setText(" - ");
        this.actionAB.txt = " - ";
        this.actionAB.txt2 = "(-)";
        this.actionB.disableInteractive();
        this.actionB.setText(" ");
        
        this.action2.setInteractive();
        this.action2.setText("o North");
        this.action2.txt = "o North";
        this.action2.txt2 = "x North";
        
        this.action3.setInteractive();
        this.action3.setText("o East");
        this.action3.txt = "o East";
        this.action3.txt2 = "x East";

        this.action4.setInteractive();
        this.action4.setText("o South");
        this.action4.txt = "o South";
        this.action4.txt2 = "x South";

        this.action5.setInteractive();
        this.action5.setText("o West");
        this.action5.txt = "o West";
        this.action5.txt2 = "x West";
    }
    killBandits(trgt, totKilled){
        if(totKilled>this.deadBandits){
            trgt.anims.play({ key: 'killBandits', startFrame: this.deadBandits-1}, true);
            trgt.anims.stopOnFrame(trgt.anims.currentAnim.frames[(totKilled-1)]);
            this.deadBandits=totKilled;
            if(this.deadBandits>=33){
                this.scene.start("victoryScene");
            }
        }
    }
    vilStrCalc(x){
        return Math.floor(this.samTaskMults[x+4] * this.vilsDefending[x]*(((this.totVillagers-this.t1Villagers-this.t2Villagers)+(this.t1Villagers*1.5)+(this.t2Villagers*2))/75));
    }
    //Below this are the functions that determine what each button does. I started structuring it like this when there were fewer buttons, but it was working well and I wanted to keep things consistent, so I decided to stick with it.
    action1Handler(a, b){
        switch(a){
            case 0:
                switch(b){
                    case 1:
                        this.startRecruitment();
                        break;
                    default:
                        break;
                }
                break;
            case 1:
            case 2:
                 switch(b){
                    case 1:
                        break;
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                    case 10:
                    case 11:
                    case 12:
                        this.recruitWarrior(this.candidate);
                    default:
                        break;
                    }
                    break;
            default:
                break;
        }
    }
    action2Handler(a, b){
        switch(a){
            case 0:
                switch(b){
                    case 1:
                        break;
                    case 2: //I could have skipped several lines here and just put the effect under the default statement, but I wrote out each case so that it would be easy to change effects while working
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                    case 10:
                    case 11:
                    case 12:
                        this.testWarrior(this.candidate);
                    default:
                        break;
                }
                break;
            case 1: //summer and fall the actions are the same
            case 2:
                switch(b){
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                    case 10:
                    case 11:
                    case 12: this.assign(this.warriorlist[this.warriorIndex], 'build')
                    default:
                        break;
                }
                break;
            case 3:
                this.assign(this.warriorlist[this.warriorIndex], 'n');
            default:
                break;
        }
    }
    action3Handler(a, b){
        switch(a){
            case 0:
                switch(b){
                    case 1:
                        break;
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                    case 10:
                    case 11:
                    case 12:
                        this.recruitWarrior(this.candidate);
                    default:
                        break;
                }
                break;
            case 1:
            case 2:
                switch(b){
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                    case 10:
                    case 11:
                    case 12: 
                        this.assign(this.warriorlist[this.warriorIndex], 'train')
                    default:
                        break;
                }
                break;
            case 3:
                this.assign(this.warriorlist[this.warriorIndex], 'e');
            default:
                break;
        }
    }
    action4Handler(a, b){
        switch(a){
            case 0:
                switch(b){
                    case 1:
                        break;
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                    case 10:
                    case 11:
                        this.candidate.remake(Phaser.Math.Between(0, 5));
                        this.action3.txt2 = "x Recruit Cost: " + this.candidate.getCost() +"% of rice.";
                    case 12:
                        this.nextWeek();
                    default:
                        break;
                }
                break;
            case 1:
            case 2:
                switch(b){
                    case 1:
                        break;
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                    case 10:
                    case 11:
                    case 12:
                    default:
                        break;
                }
                break;
            case 3:
                this.assign(this.warriorlist[this.warriorIndex], 's');
            default:
                break;
        }
    }
    action5Handler(a, b){
        switch(a){
            case 0:
                break;
            case 1:
            case 2:
                switch(b){
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                    case 10:
                    case 11:
                    case 12:
                       this.autoAssignSam(this.warriorlist[this.warriorIndex]);
                       break;
                    default:
                        break;
                }
                break;
            case 3:
                this.assign(this.warriorlist[this.warriorIndex], 'w');
            default:
                break;
        }
    }
    action6Handler(a, b){
        switch(a){
            case 0:
                switch(b){
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                    case 10:
                    case 11:
                    case 12:
                        if(this.warriors == 7){
                            while(this.week<12){
                                this.nextWeek();
                            }
                            this.nextWeek();
                        }
                        break;
                    default:
                        break;
                }
                break;
            case 1:
            case 2:
                switch(b){
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                    case 10:
                    case 11:
                    case 12:
                        break;
                    default:
                        break;
                }
                break;
            case 3:
            default:
                break;
        }
    }
    action7Handler(a, b, c){
        switch(a){
            case 0:
                break;
            case 1:
            case 2:
                switch(b){
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                    case 10:
                    case 11:
                    case 12:
                        this.gatherNum(c);
                    default:
                        break;
                }
                break;
            case 3:
                this.defendingNum(0, c);
            default:
                break;
        }
    }
    action8Handler(a, b, c){
        switch(a){
            case 0:
                break;
            case 1:
            case 2:
                switch(b){
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                    case 10:
                    case 11:
                    case 12:
                        this.buildNum(c);
                    default:
                        break;
                }
                break;
            case 3:
                this.defendingNum(1, c);
            default:
                break;
        }
    }
    action9Handler(a, b, c){
        switch(a){
            case 0:
                break;
            case 1:
            case 2:
                switch(b){
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                    case 10:
                    case 11:
                    case 12:
                        this.trainNum(c);
                    default:
                        break;
                }
                break;
            case 3:
                this.defendingNum(2, c);
            default:
                break;
        }
    }
    actionAHandler(a, b, c){
        switch(a){
            case 0:
                break;
            case 1:
            case 2:
                switch(b){
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                    case 10:
                    case 11:
                    case 12:
                        while(this.villagersAvailable(5)){
                            this.trainNum(0);
                            this.gatherNum(0);
                            this.buildNum(0);
                        }
                        break;
                    default:
                        break;
                }
                break;
            case 3:
                this.defendingNum(3, c);
            default:
                break;
        }
    }
    actionBHandler(a, b){
        switch(a){
            case 0:
                break;
            case 1:
            case 2:
                switch(b){
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                    case 10:
                    case 11:
                    case 12:
                        if(this.villagersAvailable(5)||this.samuraiAssignable==true){
                            this.actionB.setText("Finish assigning!");
                        }else{
                            this.nextWeek();
                        }
                        break;
                    default:
                        break;
                }
                break;
            case 3:
            default:
                break;
        }
    }
}