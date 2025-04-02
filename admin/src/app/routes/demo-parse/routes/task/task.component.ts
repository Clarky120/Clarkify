import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TaskService } from '../../services/task/task.service';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss',
  providers: [TaskService],
})
export class TaskComponent {
  public _task = inject(TaskService);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);

  ngOnInit() {
    const params = this._route.snapshot.paramMap;

    if (!params.has('id')) {
      this._router.navigate(['/demo-parse']);
      return;
    }

    const id = params.get('id') as string;

    this._task.startTaskListener(id);
  }
}
