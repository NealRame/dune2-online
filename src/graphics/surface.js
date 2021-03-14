import Rect from "../maths/rect"

import isNil from "lodash/isNil"
import clamp from "lodash/clamp"

/**
 * @typedef {{width: number, height: number}} Size
 */

/**
 * @class Surface
 */
export default class Surface {
    #width
    #height
    #pixels

    /**
     * 
     * @param {Size} size
     * @param {Uint8ClampedArray} pixels
     */
    constructor({width, height, pixels = null}) {
        this.#width = width
        this.#height = height
        this.#pixels = isNil(pixels)
            ? new Uint8ClampedArray(4*width*height)
            : pixels
    }

    get height() { return this.#height }
    get width() { return this.#width }
    get size() { return {width: this.#width, height: this.#height} }
    /**
     * @returns {Rect}
     */
    get rect() { return Rect({x: 0, y: 0}, this.size) }
    get pixels() { return this.#pixels }

    /**
     * 
     * @returns {ImageData}
     */
    imageData() {
        return new ImageData(this.#pixels, this.#width, this.#height)
    }

    /**
     * 
     * @returns {string}
     */
    dataURI() {
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")

        canvas.width = this.width
        canvas.height = this.height
        context.putImageData(this.imageData(), 0, 0)

        return canvas.toDataURL()
    }

    /**
     * 
     * @param {Surface} surface 
     * @param {Rect} src_rect 
     * @param {Rect} dst_rect 
     * @returns {Surface} this surface
     */
    blit(surface, {x, y}, src_rect = null) {
        src_rect = isNil(src_rect)
            ? surface.rect
            : surface.rect.intersected(src_rect)
        src_rect.x = clamp(0, src_rect.x - x, src_rect.width)
        src_rect.y = clamp(0, src_rect.y - y, src_rect.height)
        src_rect.crop({
            width: Math.min(this.width - x, src_rect.width),
            height: Math.min(this.height - y, src_rect.height)
        })

        for (let y = 0; y < src_rect.height; ++y) {
            const src_offset = 4*(y*surface.width + src_rect.x)
            const src_pixels = new Uint8ClampedArray(
                surface.pixels.buffer,
                src_offset,
                4*src_rect.width
            )
            const dst_offset = 4*(y*this.width + x)
            this.#pixels.set(src_pixels, dst_offset)
        }

        return this
    }
}
