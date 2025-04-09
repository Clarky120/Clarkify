import { Component, inject } from '@angular/core';
import { TaskListService } from '../../services/task-list/task-list.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
  providers: [TaskListService],
})
export class TaskListComponent {
  public _taskList = inject(TaskListService);

  ngOnInit() {
    this._taskList.startListener();
  }
}
