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
  initialSpeed: number;
  dx: number;
  dy: number;

  constructor(params: Omit<Fruit, 'id' | 'getBounds'>) {
    Object.assign(this, params);
    this.id = randomUUID();
  }

  getBounds(): { x: number; y: number }[] {
    const cells: { x: number; y: number }[] = [];
    cells.push({ x: Math.round(this.x), y: Math.round(this.y) });
    return cells;
  }
}
