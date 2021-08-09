import { RectangularCoordinates, Size } from "@/maths"

export function indexToPositionConverter({ width }: Size)
    : (n: number) => RectangularCoordinates {
    return n => ({ x: n%width, y: Math.floor(n/width) })
}

export function createPositionToZoneConverter(
    landSize: Size,
    zoneSize?: Size,
): (p: RectangularCoordinates) => number {
    const zoneWidth = zoneSize?.width ?? 1
    const zoneHeight = zoneSize?.height ?? 1

    const zonesColCount = Math.ceil(landSize.width/zoneWidth)
    const zonesRowCount = Math.ceil(landSize.height/zoneHeight)

    return ({ x, y }: RectangularCoordinates): number => {
        const zoneCol = Math.floor(x/zoneWidth)
        const zoneRow = Math.floor(y/zoneHeight)

        if (zoneCol >= 0 && zoneCol < zonesColCount
            && zoneRow >= 0 && zoneRow < zonesRowCount) {
            return zonesColCount*zoneRow + zoneCol
        }
        return -1
    }
}
