import { FruitSymbol } from './fruit.types';
export declare class Fruit {
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
    constructor(params: Omit<Fruit, 'id' | 'getBounds'>);
    getBounds(): {
        x: number;
        y: number;
    }[];
}
