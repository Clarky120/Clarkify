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
import {
  ICreateTaskRequest,
  ICreateTaskResponse,
} from '@clarkify/types/bff/admin/demo-parse';
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

    const doc = ref(this._storage, `demos/${file.name}`);
    const taskId = crypto.randomUUID();
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
          await this.createTask(taskId);
          this._logger.info('DemoParseService', 'Task created', taskId);

          uploadProgress.next({
            state: 'done',
            taskId: taskId,
            progress: 100,
            downloadUrl: url,
          });
        } catch (err) {
          this._logger.error('DemoParseService', 'Error creating task', err);
          uploadProgress.next({
            state: 'error',
            taskId: taskId,
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
          taskId: taskId,
          progress: 0,
          error: error.message,
        });
      },
    );

    return uploadProgress.asObservable();
  }

  private async createTask(demoId: string) {
    const body: ICreateTaskRequest = {
      demoId: demoId,
    };

    this._networkService
      .post<ICreateTaskResponse>('/admin/demo-parse/create-task', body)
      .subscribe((res) => {
        console.log(res);
      });
  }
}

export interface IUploadProgress {
  state: 'pending' | 'processing' | 'done' | 'error';
  taskId?: string;
  progress?: number;
  downloadUrl?: string;
  error?: string;
}
