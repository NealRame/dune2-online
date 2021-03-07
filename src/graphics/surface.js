import Rect from "../maths/rect"

import isNil from "lodash/isNil"

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
    constructor({width, height}, pixels = null) {
        this.#width = width
        this.#height = height
        this.#pixels = isNil(pixels)
            ? new Uint8ClampedArray(4*width*height)
            : pixels
    }

    get height() { return this.#height }
    get width() { return this.#width }
    get size() { return {width: this.#width, height: this.#height} }
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
            const dst_offset = 4*(dst_rect.y*this.width + dst_rect.x)
            this.#pixels.set(src_pixels, dst_offset)
        }

        return this
    }
}
