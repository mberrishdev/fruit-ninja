import { OnModuleInit } from '@nestjs/common';
import { MatrixService } from '../matrix/matrix.service';
import { GameGateway } from 'src/gateway/game/game.gateway';
export declare class FruitWorkerService implements OnModuleInit {
    private readonly matrix;
    private readonly gateway;
    private fruits;
    private fruitTypes;
    constructor(matrix: MatrixService, gateway: GameGateway);
    onModuleInit(): void;
    loop(): void;
    spawnFruit(): void;
    private selectFruitType;
    private applyGravity;
    boostFruitType(fruitName: string, speedMultiplier: number): number;
    moveFruits(): void;
    setGlobalSpeedMultiplier(multiplier: number): void;
    getFruitStats(): {
        totalFruits: number;
        fruitsByType: Record<string, number>;
        averageSpeed: number;
    };
}
