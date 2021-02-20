/**
 * 
 * @param {*} tile 
 * @param {*} palette 
 * @param {CanvasRenderingContext2D} context 
 */
export function tileToImageData(tile, palette, context, scale=1) {
    const colors = palette.getColorsList()
    const tile_pixels = tile.getPixels()
    const tile_remap_table = tile.getRemaptable()
    const tile_width = tile.getWidth()
    const tile_height = tile.getHeight()

    const image = context.createImageData(tile_width*scale, tile_height*scale)

    for (let row = 0; row < tile_height; ++row) {
        const image_row_offset = 4*scale*row*image.width

        for (let col = 0; col < tile_width; ++col) {
            const tile_pixel_index = row*tile_width + col
            const tile_pixel_color = colors[
                tile_remap_table.length > 0
                    ? tile_remap_table[tile_pixels[tile_pixel_index]]
                    : tile_pixels[tile_pixel_index]
            ]

            const image_pixel_index = image_row_offset + 4*scale*col
            const image_pixel = [
                Math.trunc(255*tile_pixel_color.getRed()),
                Math.trunc(255*tile_pixel_color.getGreen()),
                Math.trunc(255*tile_pixel_color.getBlue()),
                255,
            ]
            for (let i = 0; i < scale; ++i) {
                image.data.set(image_pixel, image_pixel_index + 4*i)
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

/**
 * 
 * @param {*} tile 
 * @param {*} palette 
 * @returns {String}
 */
export function tileToDataURI(tile, palette, scale=4) {
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")

    canvas.width = tile.getWidth()*scale
    canvas.height = tile.getHeight()*scale
    context.putImageData(tileToImageData(tile, palette, context, scale), 0, 0)

    return canvas.toDataURL()
}