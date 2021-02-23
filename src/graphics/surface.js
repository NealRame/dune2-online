import is_nil from "lodash/isNil"
import Rect from "../maths/rect"

export default function Surface({width, height}, pixels = null) {
    pixels = is_nil(pixels) ? new Uint8ClampedArray(4*width*height) : pixels
    const image_data = new ImageData(pixels, width, height)

    return {
        get height() {
            return height
        },
        get width() {
            return width
        },
        get size() {
            return {width, height}
        },
        get rect() {
            return Rect({x: 0, y: 0}, this.size)
        },
        get pixels() {
            return pixels
        },
        get imageData() {
            return image_data
        },
        get dataUri() {
            const canvas = document.createElement("canvas")
            const context = canvas.getContext("2d")

            canvas.width = width
            canvas.height = height
            context.putImageData(image_data, 0, 0)

            return canvas.toDataURL()
        },
        blit(surface, src_rect, dst_rect) {
            dst_rect = this.rect.intersected(dst_rect)
            src_rect = surface.rect.intersected(src_rect).cropped(dst_rect.size)

            for (let y = 0; y < src_rect.height; ++y) {
                const src_offset = 4*(src_rect.y*surface.width + src_rect.x)
                const src_pixels = new Uint8ClampedArray(
                    surface.pixels.buffer,
                    src_offset,
                    4*src_rect.width
                )
                const dst_offset = 4*(dst_rect.y*width + dst_rect.x)
                pixels.set(src_pixels, dst_offset)
            }
        }
    }
}