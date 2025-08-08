import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { FruitWorkerService } from './game/fruit-worker/fruit-worker.service';
import { RoomService } from './game/room/room.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly fruitWorker: FruitWorkerService,
    private readonly roomService: RoomService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): Record<string, any> {
    const now = new Date();
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    return {
      status: 'ok',
      timestamp: now.toISOString(),
      uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
      uptimeSeconds: uptime,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
      },
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      platform: process.platform,
      game: {
        gameRooms: this.roomService.getGameRooms(),
        gameStatus: 'running',
        lastUpdate: now.toISOString(),
      },
      endpoints: {
        websocket: 'ws://localhost:3000',
        api: 'http://localhost:3000',
        health: 'http://localhost:3000/health',
      },
    };
  }
}
