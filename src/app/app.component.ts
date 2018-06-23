import { Component } from '@angular/core';
import { BehaviorSubject, never, Observable, Subject, timer } from 'rxjs';
import { finalize, map, switchMap, takeUntil, takeWhile } from 'rxjs/operators';
import * as screenfull from 'screenfull';

interface TimeArray {
  hh: string[];
  mm: string[];
  ss: string[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  counter$: Observable<TimeArray>;
  paused$ = new BehaviorSubject<boolean>(false);
  stop$ = new Subject();
  running = false;
  timeStr = '1h 30m 50s';

  get time() {
    const [, h, m, s] = this.timeStr.match(/(\d*\.?\d*h\s*)?(\d*\.?\d*m\s*)?(\d*\.?\d*s\s*)?/);
    const strToNumber = (str) => Number((str || '0').match(/\d*\.?\d+/)[0]);
    return 3600 * strToNumber(h) + 60 * strToNumber(m) + strToNumber(s);
  }

  start() {
    this.running = true;
    this.paused$.next(false);

    const format = n => {
      const floor = Math.floor(n);
      return ((floor < 10) ? '0' + floor : String(floor))
        .split('');
    };
    let currentNumber = this.time;
    const numbers$ = timer(0, 1000).pipe(
      map(s => currentNumber--),
      takeWhile(n => n >= 0),
      finalize(() => this.running = currentNumber >= 0),
    );
    this.counter$ = this.paused$.pipe(
      switchMap(paused => paused ? never() : numbers$),
      map(s => ({ hh: format(s / 3600), mm: format((s % 3600) / 60), ss: format(s % 60) })),
      takeUntil(this.stop$),
      finalize(() => setTimeout(() => this.running = false)),
    );
  }

  stop() {
    this.stop$.next();
  }

  pauseOrContinue() {
    this.paused$.next(!this.paused$.value);
  }

  toogleFullScreen({ checked }) {
    if (!screenfull.enabled) {
      return;
    }
    return checked ? screenfull.request() : screenfull.exit();
  }

}
