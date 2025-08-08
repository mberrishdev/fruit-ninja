import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

interface Player {
  id: string;
  username: string;
  socket: Socket;
  isOwner: boolean;
}

interface Room {
  code: string;
  players: Map<string, Player>;
  isGameStarted: boolean;
}

@Injectable()
export class RoomService {
  private static instance: RoomService;
  private rooms: Map<string, Room>;

  constructor() {
    console.log("RoomService constructor called");
    if (!RoomService.instance) {
      this.rooms = new Map();
      RoomService.instance = this;
      console.log("New RoomService instance created");
    } else {
      this.rooms = RoomService.instance.rooms;
      console.log("Using existing RoomService instance");
    }
  }

  generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code: string;
    
    do {
      code = Array.from({ length: 6 }, () => 
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join('');
    } while (this.rooms.has(code));

    return code;
  }

  createRoom(socket: Socket, username: string): { success: boolean; roomCode: string } {
    const roomCode = this.generateRoomCode();
    
    const room: Room = {
      code: roomCode,
      players: new Map(),
      isGameStarted: false
    };

    const player: Player = {
      id: socket.id,
      username,
      socket,
      isOwner: true
    };

    room.players.set(socket.id, player);
    this.rooms.set(roomCode, room);

    socket.join(roomCode);

    return { success: true, roomCode };
  }

  joinRoom(socket: Socket, roomCode: string, username: string): { 
    success: boolean; 
    error?: string;
    players?: { id: string; username: string; isOwner: boolean }[];
  } {
    const room = this.rooms.get(roomCode);
    
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.isGameStarted) {
      return { success: false, error: 'Game already started' };
    }

    const player: Player = {
      id: socket.id,
      username,
      socket,
      isOwner: false
    };

    room.players.set(socket.id, player);
    socket.join(roomCode);

    // Return list of players in room
    const players = Array.from(room.players.values()).map(p => ({
      id: p.id,
      username: p.username,
      isOwner: p.isOwner
    }));

    return { success: true, players };
  }

  startGame(socket: Socket, roomCode: string): { 
    success: boolean; 
    error?: string 
  } {
    const room = this.rooms.get(roomCode);
    
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    const player = room.players.get(socket.id);
    if (!player?.isOwner) {
      return { success: false, error: 'Only room owner can start the game' };
    }

    room.isGameStarted = true;
    return { success: true };
  }

  leaveRoom(socket: Socket): void {
    console.log("Before leaveRoom", this.rooms);
    for (const [roomCode, room] of this.rooms.entries()) {
      if (room.players.has(socket.id)) {
        const player = room.players.get(socket.id);
        const wasOwner = player?.isOwner || false;
        
        room.players.delete(socket.id);
        socket.leave(roomCode);

        console.log(`Player ${socket.id} left room ${roomCode}`);
        console.log("Players remaining:", room.players.size);
        console.log("Game started:", room.isGameStarted);

        // Only delete room if it's empty and game hasn't started
        if (room.players.size === 0 && !room.isGameStarted) {
          this.rooms.delete(roomCode);
          console.log(`Room ${roomCode} deleted`);
        }
        // If leaving player was owner, assign new owner
        else if (wasOwner && room.players.size > 0) {
          const newOwner = room.players.values().next().value;
          if (newOwner) {
            newOwner.isOwner = true;
            console.log(`New owner assigned in room ${roomCode}: ${newOwner.username}`);
          }
        }
        break;
      }
    }
    console.log("After leaveRoom", this.rooms);
  }

  getRoomByCode(roomCode: string): Room | undefined {
    return this.rooms.get(roomCode);
  }

  getRoomBySocket(socket: Socket): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.players.has(socket.id)) {
        return room;
      }
    }
    return undefined;
  }
}
