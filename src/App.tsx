import React, { FC, useEffect, useState } from "react";
import { fromEvent, interval } from "rxjs";
import {
  map,
  buffer,
  debounceTime,
  filter,
  takeUntil,
  startWith,
  scan,
  tap,
  repeatWhen,
} from "rxjs/operators";

const App: FC = () => {
  const [time, setTime] = useState(0);
  const [count, setCount] = useState(0);
  const [isStart, setIsStart] = useState(false);
  const [isWait, setIsWait] = useState(false);

  const seconds = time % 60;
  const minute = Math.floor((time / 60) % 60);
  const hour = Math.floor(time / 60 / 60);

  useEffect(() => {
    if (isWait) {
      setCount(time);
    }
  }, [isWait, time]);

  useEffect(() => {
    const clickWait$ = fromEvent(
      document.getElementsByClassName("wait"),
      "click"
    );
    const clickStart$ = fromEvent(
      document.getElementsByClassName("start"),
      "click"
    );
    const clickReset$ = fromEvent(
      document.getElementsByClassName("reset"),
      "click"
    );

    const doubleClickWait$ = clickWait$.pipe(
      buffer(clickWait$.pipe(debounceTime(300))),
      map((arrClicks) => {
        return arrClicks.length;
      }),
      filter((clicks) => clicks === 2),
      tap(() => {
        setIsWait(true);
      })
    );

    const $timer = interval(1000).pipe(
      startWith(count),
      scan((sec) => sec + 1),
      takeUntil(clickStart$),
      takeUntil(doubleClickWait$),
      takeUntil(clickReset$),
      repeatWhen(() => clickReset$)
    );

    if (isWait && !isStart) {
      setIsWait(false);
      setIsStart(true);
      $timer.subscribe(setTime);
    } else if (!isWait && isStart) {
      $timer.subscribe(setTime);
    } else if (!isStart && !isWait) {
      setCount(0);
      setTime(0);
    }
  }, [isStart, isWait, count]);

  const round = (num: number) => (num < 10 ? `0${num}` : num);

  return (
    <div className="App">
      <button type="button" className="wait">
        Wait
      </button>
      <button
        type="button"
        className="start"
        onClick={() => setIsStart(!isStart)}
      >
        Start/Stop
      </button>
      <button type="button" className="reset" onClick={() => setTime(0)}>
        Reset
      </button>
      <p>
        Time {round(hour)}:{round(minute)}:{round(seconds)}
      </p>
    </div>
  );
};

export default App;
