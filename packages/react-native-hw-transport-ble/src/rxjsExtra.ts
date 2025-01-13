import { Subscriber, Observable, from } from 'rxjs';

/**
 * An error thrown when an Observable or a sequence was queried but has no
 * elements.
 *
 * @see {@link first}
 * @see {@link last}
 * @see {@link single}
 * @see {@link firstValueFrom}
 * @see {@link lastValueFrom}
 */
export class EmptyError extends Error {
    /**
     * @deprecated Internal implementation detail. Do not construct error instances.
     * Cannot be tagged as internal: https://github.com/ReactiveX/rxjs/issues/6269
     */
    constructor() {
      super('no elements in sequence');
      this.name = 'EmptyError';
    }
  }

export interface FirstValueFromConfig<T> {
  defaultValue: T;
}

export function firstValueFrom<T, D>(source: Observable<T>, config: FirstValueFromConfig<D>): Promise<T | D>;
export function firstValueFrom<T>(source: Observable<T>): Promise<T>;

/**
 * Converts an observable to a promise by subscribing to the observable,
 * and returning a promise that will resolve as soon as the first value
 * arrives from the observable. The subscription will then be closed.
 *
 * If the observable stream completes before any values were emitted, the
 * returned promise will reject with {@link EmptyError} or will resolve
 * with the default value if a default was specified.
 *
 * If the observable stream emits an error, the returned promise will reject
 * with that error.
 *
 * **WARNING**: Only use this with observables you *know* will emit at least one value,
 * *OR* complete. If the source observable does not emit one value or complete, you will
 * end up with a promise that is hung up, and potentially all of the state of an
 * async function hanging out in memory. To avoid this situation, look into adding
 * something like {@link timeout}, {@link take}, {@link takeWhile}, or {@link takeUntil}
 * amongst others.
 *
 * ## Example
 *
 * Wait for the first value from a stream and emit it from a promise in
 * an async function
 *
 * ```ts
 * import { interval, firstValueFrom } from 'rxjs';
 *
 * async function execute() {
 *   const source$ = interval(2000);
 *   const firstNumber = await firstValueFrom(source$);
 *   console.log(`The first number is ${ firstNumber }`);
 * }
 *
 * execute();
 *
 * // Expected output:
 * // 'The first number is 0'
 * ```
 *
 * @see {@link lastValueFrom}
 *
 * @param source the observable to convert to a promise
 * @param config a configuration object to define the `defaultValue` to use if the source completes without emitting a value
 */
export function firstValueFrom<T, D>(source: Observable<T>, config?: FirstValueFromConfig<D>): Promise<T | D> {
  const hasConfig = typeof config === 'object';
  return new Promise<T | D>((resolve, reject) => {
    const subscriber = new Subscriber({
      next: (value: T) => {
        resolve(value);
        subscriber.unsubscribe();
      },
      error: reject,
      complete: () => {
        if (hasConfig) {
          resolve(config!.defaultValue);
        } else {
          reject(new EmptyError());
        }
      },
    });
    source.subscribe(subscriber);
  });
}

/**
 * Creates an instance of an `OperatorSubscriber`.
 * @param destination The downstream subscriber.
 * @param onNext Handles next values, only called if this subscriber is not stopped or closed. Any
 * error that occurs in this function is caught and sent to the `error` method of this subscriber.
 * @param onError Handles errors from the subscription, any errors that occur in this handler are caught
 * and send to the `destination` error handler.
 * @param onComplete Handles completion notification from the subscription. Any errors that occur in
 * this handler are sent to the `destination` error handler.
 * @param onFinalize Additional teardown logic here. This will only be called on teardown if the
 * subscriber itself is not already closed. This is called after all other teardown logic is executed.
 */
export function createOperatorSubscriber<T>(
  destination: Subscriber<any>,
  onNext?: (value: T) => void,
  onComplete?: () => void,
  onError?: (err: any) => void,
  onFinalize?: () => void
): Subscriber<T> {
  return new OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize);
}

/**
 * A generic helper for allowing operators to be created with a Subscriber and
 * use closures to capture necessary state from the operator function itself.
 */
class OperatorSubscriber<T> extends Subscriber<T> {
  /**
   * Creates an instance of an `OperatorSubscriber`.
   * @param destination The downstream subscriber.
   * @param onNext Handles next values, only called if this subscriber is not stopped or closed. Any
   * error that occurs in this function is caught and sent to the `error` method of this subscriber.
   * @param onError Handles errors from the subscription, any errors that occur in this handler are caught
   * and send to the `destination` error handler.
   * @param onComplete Handles completion notification from the subscription. Any errors that occur in
   * this handler are sent to the `destination` error handler.
   * @param onFinalize Additional finalization logic here. This will only be called on finalization if the
   * subscriber itself is not already closed. This is called after all other finalization logic is executed.
   */
  constructor(
    destination: Subscriber<any>,
    onNext?: (value: T) => void,
    onComplete?: () => void,
    onError?: (err: any) => void,
    private onFinalize?: () => void
  ) {
    // It's important - for performance reasons - that all of this class's
    // members are initialized and that they are always initialized in the same
    // order. This will ensure that all OperatorSubscriber instances have the
    // same hidden class in V8. This, in turn, will help keep the number of
    // hidden classes involved in property accesses within the base class as
    // low as possible. If the number of hidden classes involved exceeds four,
    // the property accesses will become megamorphic and performance penalties
    // will be incurred - i.e. inline caches won't be used.
    //
    // The reasons for ensuring all instances have the same hidden class are
    // further discussed in this blog post from Benedikt Meurer:
    // https://benediktmeurer.de/2018/03/23/impact-of-polymorphism-on-component-based-frameworks-like-react/
    super(destination);
    this._next = onNext
      ? function (this: OperatorSubscriber<T>, value: T) {
          try {
            onNext(value);
          } catch (err) {
            destination.error(err);
          }
        }
      : super._next;
    this._error = onError
      ? function (this: OperatorSubscriber<T>, err: any) {
          try {
            onError(err);
          } catch (err) {
            // Send any errors that occur down stream.
            destination.error(err);
          } finally {
            // Ensure finalization.
            this.unsubscribe();
          }
        }
      : super._error;
    this._complete = onComplete
      ? function (this: OperatorSubscriber<T>) {
          try {
            onComplete();
          } catch (err) {
            // Send any errors that occur down stream.
            destination.error(err);
          } finally {
            // Ensure finalization.
            this.unsubscribe();
          }
        }
      : super._complete;
  }

  unsubscribe() {
    const { closed } = this;
    super.unsubscribe();
    // Execute additional teardown if we have any and we didn't already do so.
    !closed && this.onFinalize?.();
  }
}

function noop() { }

/**
 * Emits the values emitted by the source Observable until a `notifier`
 * Observable emits a value.
 *
 * <span class="informal">Lets values pass until a second Observable,
 * `notifier`, emits a value. Then, it completes.</span>
 *
 * ![](takeUntil.png)
 *
 * `takeUntil` subscribes and begins mirroring the source Observable. It also
 * monitors a second Observable, `notifier` that you provide. If the `notifier`
 * emits a value, the output Observable stops mirroring the source Observable
 * and completes. If the `notifier` doesn't emit any value and completes
 * then `takeUntil` will pass all values.
 *
 * ## Example
 *
 * Tick every second until the first click happens
 *
 * ```ts
 * import { interval, fromEvent, takeUntil } from 'rxjs';
 *
 * const source = interval(1000);
 * const clicks = fromEvent(document, 'click');
 * const result = source.pipe(takeUntil(clicks));
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link take}
 * @see {@link takeLast}
 * @see {@link takeWhile}
 * @see {@link skip}
 *
 * @param notifier The `ObservableInput` whose first emitted value will cause the output
 * Observable of `takeUntil` to stop emitting values from the source Observable.
 * @return A function that returns an Observable that emits the values from the
 * source Observable until `notifier` emits its first value.
 */
export function takeUntil(notifier: any): any {
    return (source) =>
      new Observable((subscriber) => {
        from(notifier).subscribe(createOperatorSubscriber(subscriber, () => subscriber.complete(), noop));
        !subscriber.closed && source.subscribe(subscriber);
      });
  }