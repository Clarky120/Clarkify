import { Component } from '@angular/core';
import { DropZoneDirective } from '../../../../directives/drop-zone/drop-zone.directive';
import { LoggerService } from '../../../../services/logger.service';

@Component({
  selector: 'app-uploader',
  standalone: true,
  imports: [DropZoneDirective],
  templateUrl: './uploader.component.html',
  styleUrl: './uploader.component.scss',
})
export class UploaderComponent {
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

  private handleFiles(files: FileList): void {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
    }
  }
}
