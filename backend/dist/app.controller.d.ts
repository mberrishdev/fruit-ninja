import { AppService } from './app.service';
import { FruitWorkerService } from './game/fruit-worker/fruit-worker.service';
export declare class AppController {
    private readonly appService;
    private readonly fruitWorker;
    constructor(appService: AppService, fruitWorker: FruitWorkerService);
    getHello(): string;
    getFruitStats(): {
        totalFruits: number;
        fruitsByType: Record<string, number>;
        averageSpeed: number;
    };
    setGlobalSpeed(body: {
        multiplier: number;
    }): {
        message: string;
    };
    boostFruitType(body: {
        fruitName: string;
        multiplier: number;
    }): {
        message: string;
        boostedCount: number;
    };
}
