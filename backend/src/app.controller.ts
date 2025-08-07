import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { FruitWorkerService } from './game/fruit-worker/fruit-worker.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly fruitWorker: FruitWorkerService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('fruits/stats')
  getFruitStats() {
    return this.fruitWorker.getFruitStats();
  }

  @Post('fruits/speed/global')
  setGlobalSpeed(@Body() body: { multiplier: number }) {
    this.fruitWorker.setGlobalSpeedMultiplier(body.multiplier);
    return { message: `Global speed multiplier set to ${body.multiplier}` };
  }

  @Post('fruits/speed/boost')
  boostFruitType(@Body() body: { fruitName: string; multiplier: number }) {
    const count = this.fruitWorker.boostFruitType(
      body.fruitName,
      body.multiplier,
    );
    return {
      message: `Boosted ${count} ${body.fruitName} fruits by ${body.multiplier}x`,
      boostedCount: count
    };
  }
}
