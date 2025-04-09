import { inject, Injectable } from '@angular/core';
import {
  collection,
  doc,
  Firestore,
  onSnapshot,
  orderBy,
  query,
  Unsubscribe,
} from '@angular/fire/firestore';
import { IDemoParseTask } from '@clarkify/types/demo-parse';
import { BehaviorSubject } from 'rxjs';
import { LoggerService } from '../../../../services/logger.service';
@Injectable()
export class TaskListService {
  private _firestore = inject(Firestore);
  private _logger = inject(LoggerService);

  public tasks$ = new BehaviorSubject<IDemoParseTask[] | null>(null);
  private taskUnsub!: Unsubscribe;

  constructor() {}

  startListener() {
    const q = query(
      collection(this._firestore, 'parse-tasks'),
      orderBy('createdAt', 'desc'),
    );

    this.taskUnsub = onSnapshot(q, (snapshot) => {
      this.tasks$.next(
        snapshot.docs.map((doc) => doc.data() as IDemoParseTask),
      );

      this._logger.info(
        'TaskListService',
        'Task list snapshot recieved',
        snapshot.docs.map((doc) => doc.data() as IDemoParseTask),
      );
    });
  }

  ngOnDestroy() {
    this.tasks$.unsubscribe();

    if (this.taskUnsub) {
      this.taskUnsub();
    }
  }
}
