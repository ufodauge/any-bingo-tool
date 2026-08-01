export type Ok<T> = {
  ok: true;
  value: T;
  unwrapOr: <U>(or: U) => T;
  unwrapOrElse: <U>(fn: () => U) => T;
  and: <U, E extends Error>(result: Result<U, E>) => Result<U, E>;
  // map: <U>(fn: (v: T) => U) => Ok<U>;
  // mapOr: <U>(fn: (v: T) => U, or: U) => Ok<U>;
  // mapOrElse: <U>(fn: (v: T) => U, orElse: () => U) => Ok<U>;
};

export type Err<E extends Error> = {
  ok: false;
  error: E;
  unwrapOr: <U>(or: U) => U;
  unwrapOrElse: <U>(fn: () => U) => U;
  or: <U, F extends Error>(result: Result<U, F>) => Result<U, F>;
  // map: <U>(fn: (v: never) => U) => Err<E>;
  // mapOr: <U>(fn: (v: never) => U, or: U) => Ok<U>;
  // mapOrElse: <U>(fn: (v: never) => U, orElse: () => U) => Ok<U>;
};

export type Result<T, E extends Error> = Ok<T> | Err<E>;

export const ok = <T>(value: T): Ok<T> => ({
  value,
  ok: true,
  unwrapOr: () => value,
  unwrapOrElse: () => value,
  and: <U, E extends Error>(_result: Result<U, E>) => _result,
  // map: <U>(fn: (v: T) => U) => ok(fn(value)),
});

export const err = <E extends Error>(error: E | string): Err<E> => ({
  error: typeof error === "string" ? (Error(error) as E) : error,
  ok: false,
  unwrapOr: <T>(or: T) => or,
  unwrapOrElse: <T>(fn: () => T) => fn(),
  or: <U, F extends Error>(result: Result<U, F>) => result,
  // map: <U>(_fn: (v: never) => U) => err(error),
});
