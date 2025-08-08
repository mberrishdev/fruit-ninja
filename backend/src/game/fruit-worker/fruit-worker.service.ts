/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { MatrixService } from '../matrix/matrix.service';
import { GameGateway } from 'src/gateway/game/game.gateway';
import { Fruit } from '../fruit.entity';
import { FruitSymbol } from '../fruit.types';

interface FruitConfig {
  name: string;
  symbol: FruitSymbol;
  speed: number;
  score: number;
  radius: number;
  rarity: number; // 0-1, higher = more rare
}

@Injectable()
export class FruitWorkerService implements OnModuleInit {
  private fruits: Fruit[] = [];

  // Different fruit types with varying speeds
  private fruitTypes: FruitConfig[] = [
    {
      name: 'Apple',
      symbol: '🍎',
      speed: 0.8,
      score: 5,
      radius: 2,
      rarity: 0.1, // Common
    },
    {
      name: 'Orange',
      symbol: '🍊',
      speed: 1.0,
      score: 8,
      radius: 2,
      rarity: 0.3,
    },
    {
      name: 'Banana',
      symbol: '🍌',
      speed: 1.2,
      score: 10,
      radius: 3,
      rarity: 0.5,
    },
    {
      name: 'Cherry',
      symbol: '🍒',
      speed: 1.8,
      score: 15,
      radius: 1,
      rarity: 0.7, // Fast and small = harder to catch
    },
    {
      name: 'Watermelon',
      symbol: '🍉',
      speed: 0.4,
      score: 20,
      radius: 4,
      rarity: 0.9, // Rare, slow, big
    },
  ];

  constructor(
    private readonly matrix: MatrixService,
    private readonly gateway: GameGateway,
  ) {}

  onModuleInit() {
    this.loop();
  }

  loop() {
    setInterval(() => {
      this.moveFruits();
    }, 42); // 24 FPS: 1000ms / 24 = ~42ms per frame
  }

  spawnFruit() {
    // Select fruit type based on rarity
    const fruitConfig = this.selectFruitType();

    const fruit = new Fruit({
      name: fruitConfig.name,
      symbol: fruitConfig.symbol,
      radius: fruitConfig.radius,
      score: fruitConfig.score,
      speed: fruitConfig.speed,
      x:
        Math.floor(Math.random() * (100 - fruitConfig.radius * 2)) +
        fruitConfig.radius,
      y: 0,
      dx: (Math.random() - 0.5) * 0.5, // Smaller horizontal drift (-0.25 to 0.25)
      dy: 1, // Always falling down
    });

    this.fruits.push(fruit);
  }

  private selectFruitType(): FruitConfig {
    const random = Math.random();

    // Select fruit based on rarity (higher rarity = less likely to spawn)
    for (const fruitType of this.fruitTypes) {
      if (random < 1 - fruitType.rarity) {
        return fruitType;
      }
    }

    // Fallback to first fruit type (most common)
    return this.fruitTypes[0];
  }

  // Advanced speed control methods

  // Apply gravity effect - fruits accelerate as they fall
  private applyGravity() {
    for (const fruit of this.fruits) {
      // Increase speed gradually as fruit falls
      fruit.speed = Math.min(fruit.speed + 0.01, 3.0); // Max speed of 3.0
    }
  }

  // Speed boost for specific fruit types
  boostFruitType(fruitName: string, speedMultiplier: number) {
    const boostedCount = this.fruits
      .filter((f) => f.name === fruitName)
      .map((f) => {
        f.speed *= speedMultiplier;
        return f;
      }).length;

    return boostedCount;
  }

  moveFruits() {
    // Spawn new fruits occasionally
    if (Math.random() < 0.05) this.spawnFruit();

    // Apply only gravity effect (no wind or boundary effects)
    this.applyGravity();

    // Clear old positions
    for (const f of this.fruits) {
      this.matrix.clearFruit(f);
    }

    // Move and redraw with speed-based movement
    for (const f of this.fruits) {
      // Use speed property for varied movement - direction stays constant
      f.x = Math.round(f.x + f.dx * f.speed);
      f.y = Math.round(f.y + f.dy * f.speed);

      // Remove if center position is out of bounds
      if (!this.matrix.isInBounds(f.x, f.y)) {
        this.fruits = this.fruits.filter((ff) => ff.id !== f.id);
        continue;
      }

      this.matrix.drawFruit(f);
    }

    this.gateway.broadcastMatrix({
      matrix: this.matrix.getMatrix(),
      fruits: this.fruits.map((f) => ({
        id: f.id,
        name: f.name,
        symbol: f.symbol,
        x: f.x,
        y: f.y,
        speed: f.speed,
        score: f.score,
      })),
    });
  }

  // Utility methods for game control
  setGlobalSpeedMultiplier(multiplier: number) {
    for (const fruit of this.fruits) {
      fruit.speed *= multiplier;
    }
  }

  getFruitStats() {
    return {
      totalFruits: this.fruits.length,
      fruitsByType: this.fruits.reduce(
        (acc, fruit) => {
          acc[fruit.name] = (acc[fruit.name] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
      averageSpeed:
        this.fruits.reduce((sum, f) => sum + f.speed, 0) / this.fruits.length,
    };
  }
}
