import { inject, Injectable } from '@angular/core';
import {
  Storage,
  getDownloadURL,
  percentage,
  ref,
  uploadBytesResumable,
} from '@angular/fire/storage';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { NetworkService } from '../../../../services/network.service';
import { ICreateTaskRequest, ICreateTaskResponse } from '@clarkify/types';
import { LoggerService } from '../../../../services/logger.service';

@Injectable()
export class UploaderService {
  private _networkService = inject(NetworkService);

  constructor(
    private _storage: Storage,
    private _logger: LoggerService,
  ) {}

  async uploadFile(file: File) {
    const uploadProgress = new BehaviorSubject<IUploadProgress>({
      state: 'pending',
    });
    const uploadFinished = new Subject<void>();

    const matchId = Math.random().toString(36).substring(2, 10);
    const doc = ref(this._storage, `demos/${matchId}.dem`);
    const uploadTask = uploadBytesResumable(doc, file);

    // Listen to the upload progress
    percentage(uploadTask)
      .pipe(takeUntil(uploadFinished))
      .subscribe((e) => {
        uploadProgress.next({
          state: 'processing',
          progress: e.progress,
        });
      });

    uploadTask.then(
      async (snapshot) => {
        const url = await getDownloadURL(doc);

        try {
          const taskId = await this.createTask(matchId);
          this._logger.info('DemoParseService', 'Task created', matchId);

          uploadProgress.next({
            state: 'done',
            matchId: matchId,
            taskId: taskId,
            progress: 100,
            downloadUrl: url,
          });
        } catch (err) {
          this._logger.error('DemoParseService', 'Error creating task', err);
          uploadProgress.next({
            state: 'error',
            matchId: matchId,
            progress: 0,
            error: 'Failed to create task',
          });
        }

        uploadFinished.complete();
      },
      (error) => {
        this._logger.error('DemoParseService', 'Error uploading file', error);
        uploadProgress.next({
          state: 'error',
          matchId: matchId,
          progress: 0,
          error: error.message,
        });
      },
    );

    return uploadProgress.asObservable();
  }

  private async createTask(matchId: string): Promise<string> {
    const body: ICreateTaskRequest = {
      matchId: matchId,
    };

    return new Promise((resolve, reject) => {
      this._networkService
        .post<ICreateTaskResponse>('/admin/demo-parse/create-task', body)
        .subscribe({
          next: (res) => resolve(res.taskId),
          error: (err) => reject(err),
        });
    });
  }
}

export interface IUploadProgress {
  state: 'pending' | 'processing' | 'done' | 'error';
  matchId?: string;
  taskId?: string;
  progress?: number;
  downloadUrl?: string;
  error?: string;
}
