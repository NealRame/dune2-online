import { Rect, Size } from "@/maths"

/**
 * @class Surface
 */
export class Surface {
    private image_: ImageBitmap

    /**
     * @param size
     * @param pixels
     */
    constructor(image: ImageBitmap) {
        this.image_ = image
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

    /**
     * @returns {ImageBitmap}
     */
    imageBitmap(): ImageBitmap {
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
            context.drawImage(this.image_, 0, 0)
        }

        return canvas.toDataURL()
    }
}
