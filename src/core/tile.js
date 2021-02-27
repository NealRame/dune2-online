import Surface from "../graphics/surface"
// import {setImmediate} from "./async"

/**
 * 
 * @param {*} tile 
 * @param {*} palette 
 * @param {CanvasRenderingContext2D} context 
 */
export function tileToImageData(tile, palette, scale=1) {
    const tile_pixels = tile.getPixels()
    const tile_remap_table = tile.getRemaptable()
    const tile_width = tile.getWidth()
    const tile_height = tile.getHeight()

    const surface = Surface({
        width: tile_width*scale,
        height: tile_height*scale,
    })

    for (let row = 0; row < tile_height; ++row) {
        const image_row_offset = 4*scale*row*surface.width

        for (let col = 0; col < tile_width; ++col) {
            const tile_pixel_index = row*tile_width + col
            const tile_pixel_color = palette[
                tile_remap_table.length > 0
                    ? tile_remap_table[tile_pixels[tile_pixel_index]]
                    : tile_pixels[tile_pixel_index]
            ]

            const image_pixel_index = image_row_offset + 4*scale*col
            const image_pixel = tile_pixel_color.rgba255

            for (let i = 0; i < scale; ++i) {
                surface.pixels.set(image_pixel, image_pixel_index + 4*i)
            }
        }
        
        for (let i = 1; i < scale; ++i) {
            surface.pixels.copyWithin(
                image_row_offset + 4*i*surface.width,
                image_row_offset,
                image_row_offset + 4*surface.width
            )
        }
    }

    return surface
}

export function* loadTiles(pb_tiles, palette, scales) {
    for (const pb_tile of pb_tiles) {
        yield Object.assign({}, ...scales.map(scale => ({
            [scale]: tileToImageData(pb_tile, palette, scale)
        })))
    }
}

export async function loadTilesets(game_data, palette) {
    const pb_tilesets = game_data.getTilesetsMap()
    const tilesets = {}
    for (const name of pb_tilesets.keys()) {
        const tiles = pb_tilesets.get(name).getTilesList()
        const surfaces = []
        for await (const tile of loadTiles(tiles, palette, [1, 2, 3, 4])) {
            surfaces.push(tile)
        }
        tilesets[name] = surfaces
    }
    return tilesets
}