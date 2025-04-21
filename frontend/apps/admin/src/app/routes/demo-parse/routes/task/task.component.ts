import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TaskService } from '../../services/task/task.service';
import { MatchService } from '../../services/match/match.service';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { Scoreboard } from 'scoreboard';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxJsonViewerModule, Scoreboard],
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss',
  providers: [TaskService, MatchService],
})
export class TaskComponent {
  public _task = inject(TaskService);
  public _match = inject(MatchService);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  protected readonly Object = Object;

  ngOnInit() {
    const params = this._route.snapshot.paramMap;

    if (!params.has('id')) {
      this._router.navigate(['/demo-parse']);
      return;
    }

    const id = params.get('id') as string;

    this._task.startTaskListener(id);

    this._task.task$.subscribe((task) => {
      if (task?.status === 'completed') {
        this._match.startMatchListener(task.matchId);
      }
    });
  }
}
