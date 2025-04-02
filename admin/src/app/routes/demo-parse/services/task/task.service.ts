import { inject, Injectable } from '@angular/core';
import {
  doc,
  docSnapshots,
  Firestore,
  onSnapshot,
  Unsubscribe,
} from '@angular/fire/firestore';
import { IDemoParseTask } from '@clarkify/types/demo-parse';
import { BehaviorSubject } from 'rxjs';
import { LoggerService } from '../../../../services/logger.service';

@Injectable()
export class TaskService {
  private _firestore = inject(Firestore);
  private _logger = inject(LoggerService);
  public task$ = new BehaviorSubject<IDemoParseTask | null>(null);
  private taskUnsub!: Unsubscribe;

  constructor() {}

  startTaskListener(id: string) {
    const ref = doc(this._firestore, 'parseTask', id);

    this.taskUnsub = onSnapshot(ref, (snapshot) => {
      if (snapshot.exists()) {
        this.task$.next(snapshot.data() as IDemoParseTask);
      } else {
        this.task$.next(null);
      }

      this._logger.info(
        'TaskService',
        'Task snapshot recieved',
        snapshot.data(),
      );
    });
  }

  ngOnDestroy() {
    this.task$.unsubscribe();

    if (this.taskUnsub) {
      this.taskUnsub();
    }
  }
}
