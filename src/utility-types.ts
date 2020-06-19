/**
 * From T, pick a set of properties whose keys are in the union K
 */
export type Schema<T, K extends keyof T> = {
    -readonly [P in K]: T[P];
};

/**
 * From T, pick a set of properties as optional whose keys are in the union K
 */
export type PartialSchema<T, K extends keyof T> = {
    -readonly [P in K]?: T[P];
};