import { of, interval, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { refreshFrom, publishRefresh } from './refresh';

class Test {
    private readonly _key = 'some key'
    private _value = 0;

    getValue(): Observable<number> {
        return of(undefined).pipe(
            map(() => this._value),
            map(i => i + 1),
            map(i => i - 1),
            refreshFrom(this._key),
        );
    }

    setValue(value: number): void {
        of(undefined).pipe(
            tap(() => this._value = value),
            publishRefresh(this._key)
        ).subscribe(() => console.log('set value to', value));
    }
}

const test = new Test();

test.getValue().subscribe(i => {
    console.log('[first]\t', i);
});
test.getValue().subscribe(i => {
    console.log('[second]', i);
});

test.setValue(10);
interval(1000).subscribe();

test.getValue().subscribe(i => {
    console.log('[third]', i);
});

test.setValue(20);
