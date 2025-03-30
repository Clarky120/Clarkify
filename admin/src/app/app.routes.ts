import { Routes } from '@angular/router';
import { DemoParseComponent } from './routes/demo-parse/demo-parse.component';
import { HealthComponent } from './routes/health/health.component';
import { TaskComponent } from './routes/demo-parse/routes/task/task.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'health',
    pathMatch: 'full',
  },
  {
    path: 'health',
    component: HealthComponent,
  },
  {
    path: 'demo-parse',
    component: DemoParseComponent,
  },
  {
    path: 'demo-parse/task/:id',
    component: TaskComponent,
  },
];
