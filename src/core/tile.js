/**
 * 
 * @param {*} tile 
 * @param {*} palette 
 * @param {CanvasRenderingContext2D} context 
 * @returns {ImageData}
 */
function tileToImageData(tile, palette, scale=1) {
    const tile_pixels = tile.getPixels()
    const tile_remap_table = tile.getRemaptable()
    const tile_width = tile.getWidth()
    const tile_height = tile.getHeight()

    const image = new ImageData(tile_width*scale, tile_height*scale)

    for (let row = 0; row < tile_height; ++row) {
        const image_row_offset = 4*scale*row*image.width

        for (let col = 0; col < tile_width; ++col) {
            const tile_pixel_index = row*tile_width + col
            const tile_pixel_color = palette[
                tile_remap_table.length > 0
                    ? tile_remap_table[tile_pixels[tile_pixel_index]]
                    : tile_pixels[tile_pixel_index]
            ]
            const image_pixel_index = image_row_offset + 4*scale*col

            for (let i = 0; i < scale; ++i) {
                image.data.set(tile_pixel_color, image_pixel_index + 4*i)
            }
        }
        
        for (let i = 1; i < scale; ++i) {
            image.data.copyWithin(
                image_row_offset + 4*i*image.width,
                image_row_offset,
                image_row_offset + 4*image.width
            )
        }
    }

    return image
}

function TileLoader(palette, scales) {
    return pb_tile => Object.assign({}, ...scales.map(scale => ({
        [scale]: tileToImageData(pb_tile, palette, scale)
    })))
}

function loadTiles(pb_tiles, palette, scales) {
    return pb_tiles.map(TileLoader(palette, scales))
}

export function loadTilesets(game_data, palette) {
    const pb_tilesets = game_data.getTilesetsMap()
    const tilesets = {}
    for (const name of pb_tilesets.keys()) {
        const tiles = pb_tilesets.get(name).getTilesList()
        tilesets[name] = loadTiles(tiles, palette, [1, 2, 3, 4])
    }
    return tilesets
}