import { Component } from '@angular/core';
import { UploaderComponent } from './components/uploader/uploader.component';
import { PreviousListComponent } from './components/previous-list/previous-list.component';
import { DemoParseService } from './services/demo-parse/demo-parse.service';
@Component({
  selector: 'app-demo-parse',
  standalone: true,
  imports: [UploaderComponent, PreviousListComponent],
  templateUrl: './demo-parse.component.html',
  styleUrl: './demo-parse.component.scss',
  providers: [DemoParseService],
})
export class DemoParseComponent {}
