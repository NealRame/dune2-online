import { IRectangularCoordinates, ISize } from "@/maths"

export function indexToPositionConverter({ width }: ISize)
    : (n: number) => IRectangularCoordinates {
    return n => ({ x: n%width, y: Math.floor(n/width) })
}

export function createPositionToZoneConverter(
    landSize: ISize,
    zoneSize?: ISize,
): (p: IRectangularCoordinates) => number {
    const zoneWidth = zoneSize?.width ?? 1
    const zoneHeight = zoneSize?.height ?? 1

    const zonesColCount = Math.ceil(landSize.width/zoneWidth)
    const zonesRowCount = Math.ceil(landSize.height/zoneHeight)

    return ({ x, y }: IRectangularCoordinates): number => {
        const zoneCol = Math.floor(x/zoneWidth)
        const zoneRow = Math.floor(y/zoneHeight)

        if (zoneCol >= 0 && zoneCol < zonesColCount
            && zoneRow >= 0 && zoneRow < zonesRowCount) {
            return zonesColCount*zoneRow + zoneCol
        }
        return -1
    }
}
