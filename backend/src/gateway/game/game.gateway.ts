import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomService } from '../../game/room/room.service';
import { FruitWorkerService } from '../../game/fruit-worker/fruit-worker.service';
import { GameEventsService } from '../../game/events/game-events.service';
import { OnModuleInit } from '@nestjs/common';

interface CreateRoomDto {
  username: string;
}

interface JoinRoomDto {
  roomCode: string;
  username: string;
  isRejoin?: boolean;
}

@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayDisconnect, OnModuleInit {
  constructor(
    private readonly events: GameEventsService,
    private readonly fruitWorker: FruitWorkerService,
    private readonly roomService: RoomService,
  ) {}

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.events.matrixUpdate$.subscribe((update) => {
      this.server.to(update.roomCode).emit('matrix:update', update);
    });

    this.events.scoreUpdate$.subscribe((update) => {
      this.server.to(update.roomCode).emit('score:update', update);
    });
  }

  handleDisconnect(client: Socket) {
    setTimeout(() => {
      const room = this.roomService.getRoomBySocket(client);
      if (room) {
        if (room.players.has(client.id)) {
          const players = Array.from(room.players.values())
            .filter((p) => p.id !== client.id)
            .map((p) => ({
              id: p.id,
              username: p.username,
              isOwner: p.isOwner,
            }));

          this.roomService.leaveRoom(client);

          // Notify remaining players about the disconnection
          if (players.length > 0) {
            console.log('player_joined', players);
            this.server.to(room.code).emit('player_joined', { players });
          }
        } else {
          console.log(`Player ${client.id} has already reconnected`);
        }
      }
    }, 500);
  }

  @SubscribeMessage('create_room')
  handleCreateRoom(client: Socket, data: CreateRoomDto) {
    const result = this.roomService.createRoom(client, data.username);
    if (result.success) {
      return { success: true, roomCode: result.roomCode };
    }
    return { success: false, error: 'Failed to create room' };
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(client: Socket, data: JoinRoomDto) {
    const result = this.roomService.joinRoom(
      client,
      data.roomCode,
      data.username,
    );

    if (result.success && result.players) {
      // Only broadcast for new joins, not rejoin attempts
      if (!data.isRejoin) {
        this.server.to(data.roomCode).emit('player_joined', {
          players: result.players,
        });
      }
      return { success: true, players: result.players };
    }

    return { success: false, error: result.error };
  }

  @SubscribeMessage('start_game')
  handleStartGame(client: Socket) {
    const room = this.roomService.getRoomBySocket(client);
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    const result = this.roomService.startGame(client, room.code);
    if (result.success) {
      // Start the fruit worker for this room
      this.fruitWorker.startGameForRoom(room.code);

      // Notify all players in the room
      this.server.to(room.code).emit('game_started');
      return { success: true };
    }

    return { success: false, error: result.error };
  }

  @SubscribeMessage('slice')
  handleSlice(client: Socket, payload: { fruitId: string; roomCode: string }) {
    const room = this.roomService.getRoomBySocket(client);
    if (!room || !room.isGameStarted || room.code !== payload.roomCode) return;

    const score = this.fruitWorker.sliceFruit(room.code, payload.fruitId);
    if (score > 0) {
      // Broadcast score through events service
      this.events.broadcastScore(score, room.code);
    }
  }
}
