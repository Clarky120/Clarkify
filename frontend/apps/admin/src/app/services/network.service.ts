import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);

  // Get Server URL from environment
  private serverUrl = environment.serverUrl;

  /**
   * Performs a GET request to the Server server
   */
  get<T>(
    endpoint: string,
    params?: Record<string, any>,
    headers?: HttpHeaders,
  ): Observable<T> {
    const url = `${this.serverUrl}${endpoint}`;
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    this.logger.debug('NetworkService.get', url, params);
    return this.http.get<T>(url, { params: httpParams, headers });
  }

  /**
   * Performs a POST request to the server
   */
  post<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<T> {
    const url = `${this.serverUrl}${endpoint}`;
    this.logger.debug('NetworkService.post', url, body);
    return this.http.post<T>(url, body, { headers });
  }

  /**
   * Performs a PUT request to the server
   */
  put<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<T> {
    const url = `${this.serverUrl}${endpoint}`;
    this.logger.debug('NetworkService.put', url, body);
    return this.http.put<T>(url, body, { headers });
  }

  /**
   * Performs a DELETE request to the server
   */
  delete<T>(endpoint: string, headers?: HttpHeaders): Observable<T> {
    const url = `${this.serverUrl}${endpoint}`;
    this.logger.debug('NetworkService.delete', url);
    return this.http.delete<T>(url, { headers });
  }

  /**
   * Performs a PATCH request to the server
   */
  patch<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<T> {
    const url = `${this.serverUrl}${endpoint}`;
    this.logger.debug('NetworkService.patch', url, body);
    return this.http.patch<T>(url, body, { headers });
  }
}
