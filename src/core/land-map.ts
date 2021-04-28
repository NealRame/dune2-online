import { Noise2DFunction, rangeMapper, Size } from "@/maths"

import { flow, times } from "lodash"

export enum Terrain {
    SpiceField = 0,
    Dunes,
    Sand,
    Rock,
    Mountain,
}

export function LandMap(
    { width, height }: Size,
    noise: Noise2DFunction
): Terrain[][] {
    const terrainMap = flow(
        rangeMapper(-1, 1, 0, 1),
        (n: number): Terrain => {
            if (n < 0.1000) return Terrain.SpiceField
            if (n < 0.2000) return Terrain.Dunes
            if (n < 0.6666) return Terrain.Sand
            if (n < 0.9875) return Terrain.Rock
            return Terrain.Mountain
        }
    )
    return times(height, row => times(width, col => terrainMap(noise(row, col))))
}
