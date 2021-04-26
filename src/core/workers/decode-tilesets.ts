import { base64ToByteArray } from "@/utils"
import { Palette, Tile, TilesetMap } from "@/core"

import { isNil } from "lodash"
import { ungzip } from "pako"

import registerPromiseWorker from "promise-worker/register"

type TileData = {
    w: number,
    h: number,
    data: Uint8Array,
    remap?: Uint8Array,
}

function tileToImageData(tile: TileData, palette: Palette, scale=1) {
    const image = new ImageData(tile.w*scale, tile.h*scale)

    for (let row = 0; row < tile.h; ++row) {
        const imageRowOffset = 4*scale*row*image.width

        for (let col = 0; col < tile.w; ++col) {
            const tilePixelIndex = row*tile.w + col
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

async function createTile(tileData: TileData, palette: Palette): Promise<Tile> {
    const tile: Partial<Tile> = {}
    for (const scale of [1, 2, 3, 4] as const) {
        tile[scale] = await createImageBitmap(tileToImageData(tileData, palette, scale))
    }
    return tile as Tile
}

async function decodeTilesets(inflatedData: string, palette: Palette): Promise<TilesetMap> {
    const tilesets: Partial<TilesetMap> = {}
    const tilesetsData = JSON.parse(
        inflatedData,
        function (key: string, value: unknown) {
            if (key === "data" || key === "remap") {
                return base64ToByteArray(value as string)
            }
            return value
        }
    )

    for (const group of ["Terrain", "Units"] as const) {
        tilesets[group] = await Promise.all(tilesetsData[group].map(
            (tileData: TileData) => createTile(tileData, palette)
        ))
    }

    return tilesets as TilesetMap
}

registerPromiseWorker(async ({ data, palette }) => {
    const inflatedData = (new TextDecoder()).decode(ungzip(data))
    return decodeTilesets(inflatedData, palette)
})
