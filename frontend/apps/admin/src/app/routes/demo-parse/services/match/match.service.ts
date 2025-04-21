import { inject, Injectable } from '@angular/core';
import {
  doc,
  Firestore,
  onSnapshot,
  Unsubscribe,
} from '@angular/fire/firestore';
import { IMatch } from '@clarkify/types';
import { BehaviorSubject } from 'rxjs';
import { LoggerService } from '../../../../services/logger.service';

@Injectable()
export class MatchService {
  private _firestore = inject(Firestore);
  private _logger = inject(LoggerService);
  public match$ = new BehaviorSubject<IMatch | null>(null);
  private matchUnsub!: Unsubscribe;

  constructor() {}

  startMatchListener(id: string) {
    if (this.matchUnsub) {
      this.matchUnsub();
    }

    const ref = doc(this._firestore, 'matches', id);

    this.matchUnsub = onSnapshot(ref, (snapshot) => {
      if (snapshot.exists()) {
        this.match$.next(snapshot.data() as IMatch);
      } else {
        this.match$.next(null);
      }

      this._logger.info(
        'MatchService',
        'Match snapshot recieved',
        snapshot.data(),
      );
    });
  }

  ngOnDestroy() {
    this.match$.unsubscribe();

    if (this.matchUnsub) {
      this.matchUnsub();
    }
  }
}
