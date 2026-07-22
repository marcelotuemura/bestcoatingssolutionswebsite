/**
 * Deeply widen string literal fields so EN/ES dictionaries share one shape.
 */
export type DictionaryShape<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly DictionaryShape<U>[]
    : T extends object
      ? { readonly [K in keyof T]: DictionaryShape<T[K]> }
      : T;
