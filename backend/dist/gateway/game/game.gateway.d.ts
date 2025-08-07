import { Server } from 'socket.io';
export declare class GameGateway {
    server: Server;
    broadcastMatrix(matrix: any): void;
}
