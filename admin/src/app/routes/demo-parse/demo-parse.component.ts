import { Component } from '@angular/core';
import { UploaderComponent } from './components/uploader/uploader.component';
import { PreviousListComponent } from './components/previous-list/previous-list.component';

@Component({
  selector: 'app-demo-parse',
  standalone: true,
  imports: [UploaderComponent, PreviousListComponent],
  templateUrl: './demo-parse.component.html',
  styleUrl: './demo-parse.component.scss',
})
export class DemoParseComponent {}
