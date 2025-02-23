import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import Phaser from 'phaser';

// Custom Scene for the Platformer
class GameScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Sprite;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // Load assets. Ensure these files exist in your assets folder.
    this.load.image('sky', 'sky.png');
    this.load.image('ground', 'platform.png');
    this.load.spritesheet('dude', 'dude.png', {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    // Add background image centered at (400, 300)
    this.add.image(400, 300, 'sky');

    // Create static platforms group
    const platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    // Create the player and enable physics
    this.player = this.physics.add.sprite(100, 450, 'dude');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // Create animations for the player sprite
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'turn',
      frames: [{ key: 'dude', frame: 4 }],
      frameRate: 20,
    });
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    // Set collision between the player and the platforms
    this.physics.add.collider(this.player, platforms);

    // Safely initialize the cursor keys (check if this.input is available)
    if (this.input && this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    } else {
      console.error('Keyboard input not available.');
    }
  }

  override update(time: number, delta: number): void {
    if (this.cursors) {
      if (this.cursors.left?.isDown) {
        this.player.setVelocityX(-160);
        this.player.anims.play('left', true);
      } else if (this.cursors.right?.isDown) {
        this.player.setVelocityX(160);
        this.player.anims.play('right', true);
      } else {
        this.player.setVelocityX(0);
        this.player.anims.play('turn');
      }

      // Allow the player to jump if touching the ground.
      // Cast the player's body to Phaser.Physics.Arcade.Body to access touching properties.
      if (
        this.cursors.up?.isDown &&
        (this.player.body as Phaser.Physics.Arcade.Body).touching.down
      ) {
        this.player.setVelocityY(-330);
      }
    }
  }
}

@Component({
  selector: 'app-game',
  template: `<div #gameContainer></div>`,
  styles: [':host { display: block; width: 100%; height: 100%; }'],
})
export class GameComponent implements OnInit, OnDestroy {
  @ViewChild('gameContainer', { static: true }) gameContainer!: ElementRef;
  private game!: Phaser.Game;

  ngOnInit(): void {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: this.gameContainer.nativeElement,
      physics: {
        default: 'arcade',
        arcade: {
          // Specify both x and y values for gravity.
          gravity: { x: 0, y: 300 },
          debug: false,
        },
      },
      scene: GameScene, // Use our custom platformer scene
    };

    this.game = new Phaser.Game(config);
  }

  ngOnDestroy(): void {
    if (this.game) {
      this.game.destroy(true);
    }
  }
}
