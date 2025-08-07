export type FruitSymbol =
  | '🍎'
  | '🍌'
  | '🍇'
  | '🍍'
  | '🥝'
  | '🍊'
  | '🍒'
  | '🍑'
  | '🍓'
  | '🍉';

export interface FruitType {
  name: string;
  score: number;
  symbol: FruitSymbol;
}
