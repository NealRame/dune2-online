/* eslint-disable @typescript-eslint/no-explicit-any */
export type UnionToIntersection<U>
    = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

export type TupleToUnion<T> = {
    [P in keyof T]: T[P]
} extends { [key: number]: infer V } ? V : never

export type TupleToIntersection<T>
    = UnionToIntersection<TupleToUnion<T>>
