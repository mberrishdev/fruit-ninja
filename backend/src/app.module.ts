import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MatrixService } from './game/matrix/matrix.service';
import { FruitWorkerService } from './game/fruit-worker/fruit-worker.service';
import { GameGateway } from './gateway/game/game.gateway';
import { GameEventsService } from './game/events/game-events.service';
import { RoomService } from './game/room/room.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, MatrixService, FruitWorkerService, GameGateway, GameEventsService, RoomService],
})
export class AppModule {}
