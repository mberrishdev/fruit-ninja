/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameEventsService } from '../../game/events/game-events.service';
import { FruitWorkerService } from '../../game/fruit-worker/fruit-worker.service';
import { OnModuleInit } from '@nestjs/common';

@WebSocketGateway({ cors: false })
export class GameGateway implements OnModuleInit {
  constructor(
    private readonly events: GameEventsService,
    private readonly fruitWorker: FruitWorkerService,
  ) {}

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    // Subscribe to events and broadcast them to clients
    this.events.matrixUpdate$.subscribe(update => {
      this.server.emit('matrix:update', update);
    });

    this.events.scoreUpdate$.subscribe(update => {
      this.server.emit('score:update', update);
    });
  }

  @SubscribeMessage('slice')
  handleSlice(client: Socket, payload: { fruitId: string }) {
    const score = this.fruitWorker.sliceFruit(payload.fruitId);
    if (score > 0) {
      this.events.broadcastScore(score);
    }
  }
}
