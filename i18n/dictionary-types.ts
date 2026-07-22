/**
 * Deeply widen string literal fields so EN/ES dictionaries share one shape.
 */
export type DictionaryShape<T> = {
  readonly [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends Record<string, unknown>
      ? DictionaryShape<T[K]>
      : T[K];
};
