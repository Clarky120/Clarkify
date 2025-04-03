import { TestBed } from '@angular/core/testing';
import { LoggerService, LogLevel } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;
  let consoleSpy: jasmine.SpyObj<Console>;

  beforeEach(() => {
    consoleSpy = jasmine.createSpyObj('console', [
      'debug',
      'info',
      'warn',
      'error',
    ]);
    spyOn(console, 'debug').and.callFake(consoleSpy.debug);
    spyOn(console, 'info').and.callFake(consoleSpy.info);
    spyOn(console, 'warn').and.callFake(consoleSpy.warn);
    spyOn(console, 'error').and.callFake(consoleSpy.error);

    TestBed.configureTestingModule({});
    service = TestBed.inject(LoggerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should log debug messages with proper format', () => {
    service.debug('TestComponent', 'Debug message');
    expect(console.debug).toHaveBeenCalled();
    const args = (console.debug as jasmine.Spy).calls.mostRecent().args;
    expect(args[0]).toContain('[DEBUG][TestComponent] Debug message');
  });

  it('should log info messages with proper format', () => {
    service.info('TestComponent', 'Info message');
    expect(console.info).toHaveBeenCalled();
    const args = (console.info as jasmine.Spy).calls.mostRecent().args;
    expect(args[0]).toContain('[INFO][TestComponent] Info message');
  });

  it('should log warn messages with proper format', () => {
    service.warn('TestComponent', 'Warning message');
    expect(console.warn).toHaveBeenCalled();
    const args = (console.warn as jasmine.Spy).calls.mostRecent().args;
    expect(args[0]).toContain('[WARN][TestComponent] Warning message');
  });

  it('should log error messages with proper format', () => {
    service.error('TestComponent', 'Error message');
    expect(console.error).toHaveBeenCalled();
    const args = (console.error as jasmine.Spy).calls.mostRecent().args;
    expect(args[0]).toContain('[ERROR][TestComponent] Error message');
  });

  it('should respect log level settings', () => {
    service.setLogLevel(LogLevel.WARN);

    service.debug('TestComponent', 'Debug message');
    service.info('TestComponent', 'Info message');
    service.warn('TestComponent', 'Warning message');
    service.error('TestComponent', 'Error message');

    expect(console.debug).not.toHaveBeenCalled();
    expect(console.info).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });
});
