import { Component, inject } from '@angular/core';
import { DropZoneDirective } from '../../../../directives/drop-zone/drop-zone.directive';
import { LoggerService } from '../../../../services/logger.service';
import {
  IUploadProgress,
  UploaderService,
} from '../../services/demo-parse/uploader.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-uploader',
  standalone: true,
  imports: [CommonModule, DropZoneDirective],
  templateUrl: './uploader.component.html',
  styleUrl: './uploader.component.scss',
  providers: [UploaderService],
})
export class UploaderComponent {
  private _demoParseService = inject(UploaderService);
  private _router = inject(Router);

  public currentUpload$!: Observable<IUploadProgress>;

  constructor(private _logger: LoggerService) {}

  protected ngUnsubscribe = new Subject<void>();
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onFileDropped(files: FileList): void {
    this._logger.info('UploaderComponent', 'Files dropped:', files);
    this.handleFiles(files);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this._logger.info('UploaderComponent', 'Files selected:', input.files);
      this.handleFiles(input.files);
    }
  }

  retry(): void {
    //@ts-ignore
    this.currentUpload$ = null;
  }

  private async handleFiles(files: FileList): Promise<void> {
    if (files.length > 1) return;

    this.currentUpload$ = await this._demoParseService.uploadFile(files[0]);

    this.currentUpload$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((upload) => {
        switch (upload.state) {
          case 'pending':
            break;
          case 'processing':
            break;
          case 'done':
            this._router.navigate(['/demo-parse/task', upload.taskId]);
            break;
          case 'error':
            this.ngUnsubscribe.next();
            break;
        }
      });
  }
}
