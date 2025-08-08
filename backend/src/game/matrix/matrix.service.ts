import { Injectable } from '@nestjs/common';
import { Fruit } from '../fruit.entity';

type Cell = string | 0;

@Injectable()
export class MatrixService {
  private size = 100;
  private matrix: Cell[][] = [];

  constructor() {
    this.matrix = Array.from({ length: this.size }, () =>
      Array.from({ length: this.size }, () => 0),
    );
  }

  clear() {
    for (const row of this.matrix) row.fill(0);
  }

  setCell(x: number, y: number, value: Cell) {
    const ix = Math.round(x);
    const iy = Math.round(y);

    if (this.isInBounds(ix, iy)) {
      this.matrix[iy][ix] = value;
    } else {
      // console.warn(`Attempted to set cell out of bounds: (${ix}, ${iy})`);
    }
  }

  clearFruit(fruit: Fruit) {
    try {
      for (const { x, y } of fruit.getBounds()) {
        this.setCell(x, y, 0);
      }
    } catch (error) {
      console.error(`Error clearing fruit ${fruit.id}:`, error);
    }
  }

  drawFruit(fruit: Fruit) {
    try {
      for (const { x, y } of fruit.getBounds()) {
        this.setCell(x, y, fruit.id);
      }
    } catch (error) {
      console.error(`Error drawing fruit ${fruit.id}:`, error);
    }
  }

  isInBounds(x: number, y: number): boolean {
    // Add padding (10 units) to all sides for boundary check
    return x >= 10 && y >= -10 && x < this.size - 10 && y < this.size - 10;
  }

  getMatrix(): Cell[][] {
    return this.matrix;
  }
}
