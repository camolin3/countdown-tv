import { Component } from '@angular/core';
import { Observable, Subject, interval } from 'rxjs';
import { finalize, map, startWith, take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  counter$: Observable<string>;
  stop$ = new Subject();
  running = false;
  /**
   * Time, in seconds, of the current countdown.
   */
  time = 90;

  start() {
    const format = n => {
      const floor = Math.floor(n);
      return (floor < 10) ? '0' + floor : String(floor);
    };
    this.running = true;
    const el = document.getElementById('countdown');
    el.mozRequestFullScreen();
    this.counter$ = interval(1000).pipe(
      startWith(-1),
      map(s => this.time - s - 1),
      map(s => [format(s / 3600), format(s / 60), format(s % 60)].join(':')),
      take(1 + this.time),
      takeUntil(this.stop$),
      finalize(() => this.running = false),
    );
  }

  stop() {
    document.mozCancelFullScreen();
    this.stop$.next();
  }

}
