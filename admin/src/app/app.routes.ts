import { Routes } from '@angular/router';
import { DemoParseComponent } from './routes/demo-parse/demo-parse.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'demo-parse',
    pathMatch: 'full',
  },
  {
    path: 'demo-parse',
    component: DemoParseComponent,
  },
];
