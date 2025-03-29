import { Component, inject } from '@angular/core';
import { DropZoneDirective } from '../../../../directives/drop-zone/drop-zone.directive';
import { LoggerService } from '../../../../services/logger.service';
import {
  DemoParseService,
  IUploadProgress,
} from '../../services/demo-parse/demo-parse.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-uploader',
  standalone: true,
  imports: [CommonModule, DropZoneDirective],
  templateUrl: './uploader.component.html',
  styleUrl: './uploader.component.scss',
})
export class UploaderComponent {
  private _demoParseService = inject(DemoParseService);

  public currentUpload!: Observable<IUploadProgress>;

  constructor(private _logger: LoggerService) {}

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

  private async handleFiles(files: FileList): Promise<void> {
    if (files.length > 1) return;

    this.currentUpload = await this._demoParseService.uploadFile(files[0]);
  }
}
