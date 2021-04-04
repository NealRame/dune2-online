import { Palette, Tile, TileData } from "./types"

import { isNil } from "lodash"

function tileToImageData(tile: TileData, palette: Palette, scale=1) {
    const image = new ImageData(tile.width*scale, tile.height*scale)

    for (let row = 0; row < tile.height; ++row) {
        const imageRowOffset = 4*scale*row*image.width

        for (let col = 0; col < tile.width; ++col) {
            const tilePixelIndex = row*tile.width + col
            const tilePixelColor = palette[
                isNil(tile.remap)
                    ? tile.data[tilePixelIndex]
                    : tile.remap[tile.data[tilePixelIndex]]
            ]
            const imagePixelIndex = imageRowOffset + 4*scale*col

            for (let i = 0; i < scale; ++i) {
                image.data.set(tilePixelColor, imagePixelIndex + 4*i)
            }
        }

        for (let i = 1; i < scale; ++i) {
            image.data.copyWithin(
                imageRowOffset + 4*i*image.width,
                imageRowOffset,
                imageRowOffset + 4*image.width
            )
        }
    }

    return image
}

export function createTile(tileData: TileData, palette: Palette): Tile {
    const tile: Partial<Tile> = {}
    for (const scale of [1, 2, 3, 4] as const) {
        tile[scale] = tileToImageData(tileData, palette, scale)
    }
    return tile as Tile
}
