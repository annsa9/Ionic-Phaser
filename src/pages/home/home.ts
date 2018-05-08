import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import "pixi";
import "p2";
import * as Phaser from "phaser-ce";
//import { Game } from '../../game/game';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  /**
   * Game instance
   * @public
   * @type {Phaser.Game}
   * @memberof HomePage
   */
  public game: Phaser.Game;
  public state: any;

  public simon;
  public N = 1;
  public userCount = 0;
  public currentCount = 0;
  public sequenceCount = 20;
  public sequenceList = [];
  public simonSez: boolean = false;
  public timeCheck;
  public litSquare;
  public winner;
  public loser;
  public intro;

  constructor(public navCtrl: NavController) {

  }

  ionViewDidLoad = () => {
    // Put here the code you want to execute
    this.state = {
      init: this.init,
      preload: this.preload,
      create: this.create,
      update: this.update,
      render: this.render,
      resize: this.resize
    };
    this.game = new Phaser.Game("100%", "100%", Phaser.CANVAS, "game", this.state);
    console.log(this.game);
  }

  resize = () => {

  }

  init = () => {
    let text = "Phaser Version " + Phaser.VERSION + " works!";
    console.log(text);
  }

  preload = () => {
    this.game.load.spritesheet('item', 'assets/buttons/number-buttons.png', 160, 160);
  }

  create = () => {
    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true;
    // using RESIZE scale mode
    this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    //this.game.scale.setGameSize(200, 200);
    //this.game.scale.forceOrientation(false, true);    
    
    this.simon = this.game.add.group();
    let item;

    for (let i = 0; i < 3; i++) {
      item = this.simon.create(50 + 168 * i, 150, 'item', i);
      // Enable input.
      item.inputEnabled = true;
      item.input.start(0, true);
      item.events.onInputDown.add(this.select);
      item.events.onInputUp.add(this.release);
      item.events.onInputOut.add(this.moveOff);
      this.simon.getAt(i).alpha = 0;
    }

    for (let i = 0; i < 3; i++) {
      item = this.simon.create(50 + 168 * i, 318, 'item', i + 3);
      // Enable input.
      item.inputEnabled = true;
      item.input.start(0, true);
      item.events.onInputDown.add(this.select);
      item.events.onInputUp.add(this.release);
      item.events.onInputOut.add(this.moveOff);
      this.simon.getAt(i + 3).alpha = 0;
    }

    this.introTween();
    this.setUp();
    setTimeout(() => { this.simonSequence(); this.intro = false; }, 1000);
    this.positionControls(this.game.width, this.game.height);
  }

  update = () => {
    if (this.simonSez) {
      if (this.game.time.now - this.timeCheck > 700 - this.N * 40) {
        this.simon.getAt(this.litSquare).alpha = .25;
        this.game.paused = true;

        setTimeout(() => {
          if (this.currentCount < this.N) {
            this.game.paused = false;
            this.simonSequence();
          }
          else {
            this.simonSez = false;
            this.game.paused = false;
          }
        }, 400 - this.N * 20);
      }
    }
  }

  render = () => {
    if (!this.intro) {
      if (this.simonSez) {
       this.game.debug.text('Simon Sez', 360, 96, 'rgb(255,255,255)');
       // new Phaser.Text(this.game, 360, 96, 'Simon Sez', { fontSize: 15, fill: 'white'});
       // this.game.add.text(360, 96, 'Simon Sez', { fontSize: 15, fill: 'white' });
      }
      else {
        this.game.debug.text('Your Turn', 360, 96, 'rgb(255,255,255)');
      }
    }
    else {
      this.game.debug.text('Get Ready', 360, 96, 'rgb(255,255,255)');
    }

    if (this.winner) {
      this.game.debug.text('You Win!', 360, 32, 'rgb(255,255,255)');
    }
    else if (this.loser) {
      this.game.debug.text('You Lose!', 360, 32, 'rgb(255,255,255)');
    }
  }

  select = (item, pointer) => {
    if (!this.simonSez && !this.intro && !this.loser && !this.winner) {
      item.alpha = 1;
    }
  }

  release = (item, pointer) => {
    if (!this.simonSez && !this.intro && !this.loser && !this.winner) {
      item.alpha = .25;
      this.playerSequence(item);
    }
  }

  moveOff = (item, pointer) => {
    if (!this.simonSez && !this.intro && !this.loser && !this.winner) {
      item.alpha = .25;
    }
  }

  introTween = () => {
    console.log('hello');
    this.intro = true;
    for (let i = 0; i < 6; i++) {
      let flashing = this.game.add.tween(this.simon.getAt(i)).to({ alpha: 1 }, 10, Phaser.Easing.Linear.None, true, 0, 4, true);
      let final = this.game.add.tween(this.simon.getAt(i)).to({ alpha: .25 }, 10, Phaser.Easing.Linear.None, true);

      flashing.chain(final);
      flashing.start();
    }
  }

  setUp = () => {
    for (let i = 0; i < this.sequenceCount; i++) {
      let thisSquare = this.game.rnd.integerInRange(0, 5);
      this.sequenceList.push(thisSquare);
    }
  }

  simonSequence = () => {
    this.simonSez = true;
    this.litSquare = this.sequenceList[this.currentCount];
    this.simon.getAt(this.litSquare).alpha = 1;
    this.timeCheck = this.game.time.now;
    this.currentCount++;
  }

  playerSequence = (selected) => {
    let correctSquare = this.sequenceList[this.userCount];
    this.userCount++;
    let thisSquare = this.simon.getIndex(selected);

    if (thisSquare == correctSquare) {
      if (this.userCount == this.N) {
        if (this.N == this.sequenceCount) {
          this.winner = true;
          setTimeout(() => { this.restart(); }, 2000);
        }
        else {
          this.userCount = 0;
          this.currentCount = 0;
          this.N++;
          this.simonSez = true;
        }
      }
    }
    else {
      this.loser = true;
      setTimeout(() => { this.restart(); }, 2000);
    }
  }

  restart = () => {
    this.N = 1;
    this.userCount = 0;
    this.currentCount = 0;
    this.sequenceList = [];
    this.winner = false;
    this.loser = false;
    this.introTween();
    this.setUp();
    setTimeout( () => { this.simonSequence(); this.intro = false; }, 1000);
  }

  scaleSprite = (sprite, availableSpaceWidth, availableSpaceHeight, padding, scaleMultiplier, isFullScale) => {
    var scale = this.getSpriteScale(sprite._frame.width, sprite._frame.height, availableSpaceWidth, availableSpaceHeight, padding, isFullScale);
    sprite.scale.x = scale * scaleMultiplier;
    sprite.scale.y = scale * scaleMultiplier;
  }

  getSpriteScale = (spriteWidth, spriteHeight, availableSpaceWidth, availableSpaceHeight, minPadding, 
    isFullScale) => {
    var ratio = 1;
    var currentDevicePixelRatio = window.devicePixelRatio;
    // Sprite needs to fit in either width or height
    var widthRatio = (spriteWidth * currentDevicePixelRatio + 2 * minPadding) / availableSpaceWidth;
    var heightRatio = (spriteHeight * currentDevicePixelRatio + 2 * minPadding) / availableSpaceHeight;
    if(widthRatio > 1 || heightRatio > 1) {
      ratio = 1 / Math.max(widthRatio, heightRatio);
    } else {
      if(isFullScale)
				ratio = 1 / Math.max(widthRatio, heightRatio);
    }
		return ratio * currentDevicePixelRatio;
  }

  positionControls = (width, height) => {
    // We would consider landscape orientation if height to width ratio is less than 1.3.
    // Pick any value you like if you have a different preference for landscape or portrait orientation
    let isLandscape = height / width < 1.3 ? true : false;
    console.log("isLandscape" + isLandscape + width+ height); 
    if(isLandscape) {
      let availableGridSpace = Math.min(width * 2 / 3, height);
      let calculatedTileSize = (availableGridSpace * 0.9) / 6;
      let verticalMargin = 1;
      let horizontalMargin = 1;

      this.simon.x = horizontalMargin;
      this.simon.y = verticalMargin;

      var calculatedSettingsVerticalSpace = height - 2 * verticalMargin - 2 * 50 - this.simon.height;

      this.scaleSprite(this.simon, width / 3, calculatedSettingsVerticalSpace / 3, 20, 1, true);
      this.simon.x = width * 2 / 3 + width / 6;
      this.simon.y = height - verticalMargin - this.simon.height / 2;
    }	
	}

}
