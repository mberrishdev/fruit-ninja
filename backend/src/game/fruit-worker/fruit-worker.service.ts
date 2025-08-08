/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { MatrixService } from '../matrix/matrix.service';
import { GameEventsService } from '../events/game-events.service';
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
  private gameRooms: Map<
    string,
    {
      fruits: Fruit[];
      intervalId: NodeJS.Timeout;
    }
  > = new Map();

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
      radius: 10,
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
      radius: 5,
      rarity: 0.7, // Fast and small = harder to catch
    },
    {
      name: 'Watermelon',
      symbol: '🍉',
      speed: 0.4,
      score: 20,
      radius: 10,
      rarity: 0.9, // Rare, slow, big
    },
  ];

  constructor(
    private readonly matrix: MatrixService,
    private readonly events: GameEventsService,
  ) {}

  onModuleInit() {
    // Remove the auto-start loop
  }

  startGameForRoom(roomCode: string) {
    if (this.gameRooms.has(roomCode)) {
      return; // Game already running for this room
    }

    this.gameRooms.set(roomCode, {
      fruits: [],
      intervalId: setInterval(() => {
        this.moveFruitsForRoom(roomCode);
      }, 42), // 24 FPS: 1000ms / 24 = ~42ms per frame
    });
  }

  stopGameForRoom(roomCode: string) {
    const room = this.gameRooms.get(roomCode);
    if (room) {
      clearInterval(room.intervalId);
      this.gameRooms.delete(roomCode);
    }
  }

  spawnFruitForRoom(roomCode: string) {
    const room = this.gameRooms.get(roomCode);
    if (!room) return;

    // Select fruit type based on rarity
    const fruitConfig = this.selectFruitType();

    const baseRadius = fruitConfig.radius;
    const variation = baseRadius * 0.3;
    const randomRadius =
      baseRadius + (Math.random() * variation * 2 - variation);

    const fruit = new Fruit({
      name: fruitConfig.name,
      symbol: fruitConfig.symbol,
      radius: Math.max(0.5, randomRadius), // Ensure minimum size of 0.5
      score: fruitConfig.score,
      speed: fruitConfig.speed,
      x:
        Math.floor(Math.random() * (100 - fruitConfig.radius * 2)) +
        fruitConfig.radius,
      y: 0,
      dx: (Math.random() - 0.5) * 0.5, // Smaller horizontal drift (-0.25 to 0.25)
      dy: 1, // Always falling down
    });

    room.fruits.push(fruit);
  }

  private selectFruitType(): FruitConfig {
    const probs = this.fruitTypes.map((f) => 1 - f.rarity);
    const sum = probs.reduce((a, b) => a + b, 0);
    const r = Math.random() * sum;

    let acc = 0;
    for (let i = 0; i < this.fruitTypes.length; i++) {
      acc += probs[i];
      if (r < acc) return this.fruitTypes[i];
    }
    return this.fruitTypes[0];
  }

  private applyGravityForRoom(roomCode: string) {
    const room = this.gameRooms.get(roomCode);
    if (!room) return;

    for (const fruit of room.fruits) {
      fruit.speed = Math.min(fruit.speed + 0.01, 3.0); // Max speed of 3.0
    }
  }

  // Speed boost for specific fruit types
  boostFruitTypeForRoom(
    roomCode: string,
    fruitName: string,
    speedMultiplier: number,
  ) {
    const room = this.gameRooms.get(roomCode);
    if (!room) return 0;

    const boostedCount = room.fruits
      .filter((f) => f.name === fruitName)
      .map((f) => {
        f.speed *= speedMultiplier;
        return f;
      }).length;

    return boostedCount;
  }

  moveFruitsForRoom(roomCode: string) {
    const room = this.gameRooms.get(roomCode);
    if (!room) return;

    // Spawn new fruits occasionally
    if (Math.random() < 0.05) this.spawnFruitForRoom(roomCode);

    // Apply only gravity effect (no wind or boundary effects)
    this.applyGravityForRoom(roomCode);

    // Clear old positions
    for (const f of room.fruits) {
      this.matrix.clearFruit(f);
    }

    // Move and redraw with speed-based movement
    for (const f of room.fruits) {
      // Use speed property for varied movement - direction stays constant
      f.x = Math.round(f.x + f.dx * f.speed);
      f.y = Math.round(f.y + f.dy * f.speed);

      // Remove if center position is out of bounds
      if (!this.matrix.isInBounds(f.x, f.y)) {
        room.fruits = room.fruits.filter((ff) => ff.id !== f.id);
        continue;
      }

      this.matrix.drawFruit(f);
    }

    this.events.broadcastMatrix({
      roomCode, // Add roomCode to the broadcast
      matrix: this.matrix.getMatrix(),
      fruits: room.fruits.map((f) => ({
        id: f.id,
        name: f.name,
        symbol: f.symbol,
        x: f.x,
        y: f.y,
        speed: f.speed,
        score: f.score,
        radius: f.radius,
      })),
    });
  }

  // Utility methods for game control
  setGlobalSpeedMultiplierForRoom(roomCode: string, multiplier: number) {
    const room = this.gameRooms.get(roomCode);
    if (!room) return;

    for (const fruit of room.fruits) {
      fruit.speed *= multiplier;
    }
  }

  getFruitStatsForRoom(roomCode: string) {
    const room = this.gameRooms.get(roomCode);
    if (!room) return null;

    return {
      totalFruits: room.fruits.length,
      fruitsByType: room.fruits.reduce(
        (acc, fruit) => {
          acc[fruit.name] = (acc[fruit.name] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
      averageSpeed:
        room.fruits.reduce((sum, f) => sum + f.speed, 0) / room.fruits.length ||
        0,
    };
  }

  sliceFruit(roomCode: string, fruitId: string): number {
    const room = this.gameRooms.get(roomCode);
    if (!room) return 0;

    const fruitIndex = room.fruits.findIndex((f) => f.id === fruitId);
    if (fruitIndex === -1) return 0;

    const fruit = room.fruits[fruitIndex];

    this.matrix.clearFruit(fruit);

    room.fruits.splice(fruitIndex, 1);

    return fruit.score;
  }
}
