import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkService } from '../../services/network.service';
import { Subscription, interval } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './health.component.html',
  styleUrl: './health.component.scss',
})
export class HealthComponent implements OnInit, OnDestroy {
  private networkService = inject(NetworkService);

  isBffRunning = false;
  lastChecked: Date | null = null;
  errorMessage: string | null = null;
  private healthCheckSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.startHealthCheck();
  }

  ngOnDestroy(): void {
    this.stopHealthCheck();
  }

  private startHealthCheck(): void {
    // Ping the /health endpoint every 5 seconds
    this.healthCheckSubscription = interval(5000)
      .pipe(
        switchMap(() => {
          return this.networkService.get<any>('/health').pipe(
            catchError((error) => {
              this.isBffRunning = false;
              this.errorMessage = `Error: ${error.message || 'Unknown error'}`;
              return of(null);
            })
          );
        })
      )
      .subscribe((response) => {
        this.lastChecked = new Date();

        if (response) {
          this.isBffRunning = true;
          this.errorMessage = null;
        }
      });

    // Also check immediately on startup
    this.checkHealth();
  }

  private checkHealth(): void {
    this.networkService
      .get<any>('/health')
      .pipe(
        catchError((error) => {
          this.isBffRunning = false;
          this.errorMessage = `Error: ${error.message || 'Unknown error'}`;
          return of(null);
        })
      )
      .subscribe((response) => {
        this.lastChecked = new Date();

        if (response) {
          this.isBffRunning = true;
          this.errorMessage = null;
        }
      });
  }

  private stopHealthCheck(): void {
    if (this.healthCheckSubscription) {
      this.healthCheckSubscription.unsubscribe();
      this.healthCheckSubscription = null;
    }
  }
}
