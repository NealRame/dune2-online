export interface IRectangularCoordinates {
    x: number,
    y: number,
}
export interface ISize {
    width: number
    height: number
}

export interface Shape {
    columns: number,
    rows: number,
}

export interface Transform2DMatrix {
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
