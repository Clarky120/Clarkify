import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoggerService } from './services/logger.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'admin';

  constructor(private logger: LoggerService) {}

  ngOnInit(): void {
    // this.logger.debug('AppComponent', 'Application initialized');
    // this.logger.info('AppComponent', 'Admin application started');
    // this.logger.warn('AppComponent', 'Example warning message');
    // this.logger.error(
    //   'AppComponent',
    //   'Example error message',
    //   new Error('Sample error')
    // );
  }
}
