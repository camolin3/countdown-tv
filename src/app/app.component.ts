import { Component } from '@angular/core';
import { Observable, Subject, interval, never, BehaviorSubject } from 'rxjs';
import { finalize, map, startWith, take, takeUntil, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  counter$: Observable<{ hh: string[], mm: string[], ss: string[] }>;
  paused$ = new BehaviorSubject<boolean>(false);
  stop$ = new Subject();
  running = false;
  timeStr = '1h 30m';
  /**
   * Time, in seconds, of the current countdown.
   */
  get time() {
    const [, h, m, s] = this.timeStr.match(/(\d*\.?\d*h\s*)?(\d*\.?\d*m\s*)?(\d*\.?\d*s\s*)?/);
    const strToNumber = (str) => Number((str || '0').match(/\d*\.?\d+/)[0]);
    return 3600 * strToNumber(h) + 60 * strToNumber(m) + strToNumber(s);
  }

  start() {
    const format = n => {
      const floor = Math.floor(n);
      return ((floor < 10) ? '0' + floor : String(floor))
        .split('');
    };
    this.running = true;
    /* const el = document.getElementById('countdown');
    el.mozRequestFullScreen(); */
    const numbers$ = interval(1000).pipe(
      startWith(-1),
      map(s => this.time - s - 1),
      take(1 + this.time),
      finalize(() => console.log('why?')),
    );
    this.counter$ = this.paused$.pipe(
      switchMap(paused => paused ? never() : numbers$),
      map(s => ({ hh: format(s / 3600), mm: format((s % 3600) / 60), ss: format(s % 60) })),
      takeUntil(this.stop$),
      finalize(() => this.running = false),
    );
  }

  stop() {
    /* document.mozCancelFullScreen(); */
    this.stop$.next();
  }

  pause() {
    this.paused$.next(true);
  }

  continue() {
    this.paused$.next(false);
  }

}
