export interface IVector2D {
    x: number,
    y: number,
}
export interface ISize {
    width: number
    height: number
}

export interface IShape {
    columns: number,
    rows: number,
}

export interface ITransform2DMatrix {
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
