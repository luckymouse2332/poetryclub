/**
 * Error results
 */
type Err<E> = { success: false; error: E };

/**
 * Success results
 */
type Ok<T> = { success: true; data: T };

/**
 * General result type
 */
export type Result<T, E = string> = Ok<T> | Err<E>;

/**
 * Encapsulation for async result
 */
export type PromiseResult<T, E = string> = Promise<Result<T, E>>;

/**
 * Make a success result
 * @param data data you wants to return
 * @returns success result type
 */
export const ok = <T>(data: T): Ok<T> => ({ success: true, data });

/**
 * Make an error result
 * @param error error information you wants to return
 * @returns error result type
 */
export const err = <E>(error: E): Err<E> => ({ success: false, error });
