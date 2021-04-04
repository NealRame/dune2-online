import { Rect, RectangularCoordinates, Size } from "@/maths"

import isNil from "lodash/isNil"
import clamp from "lodash/clamp"

/**
 * @class Surface
 */
export class Surface {
    private image_: ImageData

    /**
     * @param size
     * @param pixels
     */
    constructor(sizeOrImage: Size|ImageData) {
        if (sizeOrImage instanceof ImageData) {
            this.image_ = sizeOrImage
        } else {
            const { width, height } = sizeOrImage
            this.image_ = new ImageData(width, height)
        }
    }

    get width(): number { return this.image_.width }
    get height(): number { return this.image_.height }

    get size(): Size {
        return {
            width: this.width,
            height: this.height
        }
    }

    /**
     * @returns
     */
    get rect(): Rect {
        return new Rect(
            { x: 0, y: 0 },
            this.size
        )
    }

    get pixels(): Uint8ClampedArray {
        return this.image_.data
    }

    /**
     * @returns {ImageData}
     */
    imageData(): ImageData {
        return this.image_
    }

    /**
     * @returns this surface as a dataURI string
     */
    dataURI(): string {
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")

        canvas.width = this.width
        canvas.height = this.height
        if (context != null) {
            context.putImageData(this.imageData(), 0, 0)
        }

        return canvas.toDataURL()
    }

    /**
     *
     * @param surface
     * @param position
     * @param srcRect
     * @returns this
     */
    blit(
        surface: Surface,
        { x, y }: RectangularCoordinates,
        srcRect?: Rect
    ): Surface {
        srcRect = isNil(srcRect)
            ? surface.rect
            : surface.rect.intersected(srcRect)
        srcRect.x = clamp(0, srcRect.x - x, srcRect.width)
        srcRect.y = clamp(0, srcRect.y - y, srcRect.height)
        srcRect.crop({
            width: Math.min(this.width - x, srcRect.width),
            height: Math.min(this.height - y, srcRect.height),
        })

        for (let y = 0; y < srcRect.height; ++y) {
            const srcOffset = 4*(y*surface.width + srcRect.x)
            const srcPixels = new Uint8ClampedArray(
                surface.pixels.buffer,
                srcOffset,
                4*srcRect.width,
            )
            const dstOffset = 4*(y*this.width + x)
            this.pixels.set(srcPixels, dstOffset)
        }

        return this
    }
}
