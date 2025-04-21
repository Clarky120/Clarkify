import { Component } from '@angular/core';
import { UploaderComponent } from './components/uploader/uploader.component';
import { TaskListComponent } from './components/task-list/task-list.component';

@Component({
  selector: 'app-demo-parse',
  standalone: true,
  imports: [UploaderComponent, TaskListComponent],
  templateUrl: './demo-parse.component.html',
  styleUrl: './demo-parse.component.scss',
})
export class DemoParseComponent {}
