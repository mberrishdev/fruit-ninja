import { Fruit } from '../fruit.entity';
type Cell = string | 0;
export declare class MatrixService {
    private size;
    private matrix;
    constructor();
    clear(): void;
    setCell(x: number, y: number, value: Cell): void;
    clearFruit(fruit: Fruit): void;
    drawFruit(fruit: Fruit): void;
    isInBounds(x: number, y: number): boolean;
    getMatrix(): Cell[][];
}
export {};
