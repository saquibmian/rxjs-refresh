import { MonoTypeOperatorFunction, Subject, BehaviorSubject, Observable, Subscription, Operator, Subscriber, TeardownLogic, observable } from "rxjs";
import { tap, flatMap } from 'rxjs/operators';

export function refreshFrom<T>(key: string): MonoTypeOperatorFunction<T> {
    return obs => RefreshTokens.createForKey(key).pipe(
        flatMap(() => obs)
    );
}

export function publishRefresh<T>(key: string): MonoTypeOperatorFunction<T> {
    return obs => obs.pipe(
        tap(() => RefreshTokens.emitAllForKey(key))
    );
}

abstract class RefreshTokens {
    private static tokens: {
        [key: string]: Subject<void>[];
    } = {};

    static createForKey(key: string): Observable<void> {
        if (this.tokens[key] == null) {
            this.tokens[key] = [];
        }

        const subject = new BehaviorSubject<void>(undefined);
        const index = this.tokens[key].push(subject);
        let count = 0;

        return subject.pipe(
            tap(() => console.debug('refreshing', {
                key: key,
                subscriptionNumber: index,
                iterationNumber: count++
            }))
        );
    }

    static emitAllForKey(key: string): void {
        const tokens = this.tokens[key];
        if (tokens == null || tokens.length == 0) {
            return;
        }
        tokens.forEach(token => token.next());
    }
}
