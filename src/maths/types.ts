export interface IShape2D {
    columns: number,
    rows: number,
}

export interface ISize2D {
    width: number
    height: number
}
export interface IVector2D {
    x: number,
    y: number,
}

export type IRect2D = IVector2D & ISize2D

export interface ITransformMatrix2D {
    m11: number,
    m12: number,
    m21: number,
    m22: number,
}

export enum Direction {
    North,
    Northeast,
    East,
    Southeast,
    South,
    Southwest,
    West,
    Northwest,
}
export const DirectionCount = Direction.Northwest + 1
