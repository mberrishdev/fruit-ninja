import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

export interface MatrixUpdate {
  matrix: any;
  fruits: any[];
}

export interface ScoreUpdate {
  score: number;
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

  broadcastScore(score: number) {
    this.scoreUpdate.next({ score });
  }
}
