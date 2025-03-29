import { Injectable } from '@angular/core';
import {
  Storage,
  getDownloadURL,
  percentage,
  ref,
  uploadBytesResumable,
} from '@angular/fire/storage';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';

@Injectable()
export class DemoParseService {
  constructor(private _storage: Storage) {}

  async uploadFile(file: File) {
    const uploadProgress = new BehaviorSubject<IUploadProgress>({
      state: 'pending',
    });
    const uploadFinished = new Subject<void>();

    const doc = ref(this._storage, `demos/${file.name}`);
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

        uploadProgress.next({
          state: 'done',
          progress: 100,
          downloadUrl: url,
        });

        uploadFinished.complete();
      },
      (error) => {
        uploadProgress.next({
          state: 'error',
          progress: 0,
          error: error.message,
        });
      }
    );

    return uploadProgress.asObservable();
  }
}

export interface IUploadProgress {
  state: 'pending' | 'processing' | 'done' | 'error';
  progress?: number;
  downloadUrl?: string;
  error?: string;
}
