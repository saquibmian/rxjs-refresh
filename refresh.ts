import { MonoTypeOperatorFunction, Subject, BehaviorSubject, Observable } from "rxjs";
import { tap, flatMap } from 'rxjs/operators';

export function refreshFrom<T>(key: string): MonoTypeOperatorFunction<T> {
    return obs => RefreshTokens.get(key).pipe(
        flatMap(() => obs)
    );
}

export function publishRefresh<T>(key: string): MonoTypeOperatorFunction<T> {
    return tap(() => RefreshTokens.emit(key))
}

abstract class RefreshTokens {
    private static _tokens: {
        [key: string]: Subject<void>[];
    } = {};

    static get(key: string): Observable<void> {
        if (this._tokens[key] == null) {
            this._tokens[key] = [];
        }

        const subject = new BehaviorSubject<void>(undefined);
        const index = this._tokens[key].push(subject);
        let refreshCount = 0;

        return subject.pipe(
            tap(() => {
                if (refreshCount > 0) {
                    console.debug(`refreshing ${key}`, {
                        subscription: index,
                        refreshCount: refreshCount
                    });
                }
                ++refreshCount;
            })
        );
    }

    static emit(key: string): void {
        const tokens = this._tokens[key];
        if (tokens == null || tokens.length == 0) {
            return;
        }
        tokens.forEach(token => token.next());
    }
}
