import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

export interface MatrixUpdate {
  matrix: any;
  fruits: any[];
  roomCode: string;
}

export interface ScoreUpdate {
  score: number;
  roomCode: string;
}

@Injectable()
export class GameEventsService {
  private matrixUpdate = new Subject<MatrixUpdate>();
  private scoreUpdate = new Subject<ScoreUpdate>();

  matrixUpdate$ = this.matrixUpdate.asObservable();
  scoreUpdate$ = this.scoreUpdate.asObservable();

  broadcastMatrix(data: MatrixUpdate) {
    this.matrixUpdate.next(data);
  }

  broadcastScore(score: number, roomCode: string) {
    this.scoreUpdate.next({ score, roomCode });
  }
}
