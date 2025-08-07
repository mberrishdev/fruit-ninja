import { FruitSymbol } from './fruit.types';
import { randomUUID } from 'crypto';

export class Fruit {
  id: string;
  name: string;
  symbol: FruitSymbol;
  score: number;
  radius: number;
  x: number;
  y: number;
  speed: number;
  dx: number;
  dy: number;

  constructor(params: Omit<Fruit, 'id' | 'getBounds'>) {
    Object.assign(this, params);
    this.id = randomUUID();
  }

  getBounds(): { x: number; y: number }[] {
    const cells: { x: number; y: number }[] = [];
    for (let dy = -this.radius; dy <= this.radius; dy++) {
      for (let dx = -this.radius; dx <= this.radius; dx++) {
        const cx = this.x + dx;
        const cy = this.y + dy;
        if (dx * dx + dy * dy <= this.radius * this.radius) {
          cells.push({ x: cx, y: cy });
        }
      }
    }
    return cells;
  }
}
