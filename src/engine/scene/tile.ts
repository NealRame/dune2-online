import { SceneItem } from "./item"
import { Image, IScene } from "./types"

import { Painter } from "@/graphics"
import { Rect, IShape2D, ISize2D } from "@/maths"

import { isMatch } from "lodash"

function getImageSize(scene: IScene, image: Image): ISize2D {
    const { width: w, height: h } = image[1]
    return {
        width: w/scene.gridUnit,
        height: h/scene.gridUnit,
    }
}

function checkImages(scene: IScene, images: Image[]): ISize2D {
    const [head, ...tail] = images
    const size = getImageSize(scene, head)
    for (const image of tail) {
        if (!isMatch(getImageSize(scene, image), size)) {
            throw new Error("All image must have the same size")
        }
    }
    return size
}

function checkShape(tileSize: ISize2D, imageSize: ISize2D, images: Array<Image>)
    : IShape2D {
    const columns = tileSize.width/imageSize.width
    const rows = tileSize.height/imageSize.height
    if (columns*rows > images.length) {
        throw new Error("Inconsistent number of images for the shape of the sprite")
    }
    return { columns, rows }
}

export class Tile extends SceneItem {
    protected shape_: IShape2D

    protected imageSize_: ISize2D
    protected images_: Image[]

    constructor(
        scene: IScene,
        size: ISize2D,
        images: Image[],
    ) {
        super(scene)

        this.width_ = size.width
        this.height_ = size.height

        this.imageSize_ = checkImages(this.scene, images)
        this.shape_ = checkShape(this.size, this.imageSize_, images)
        this.images_ = images
    }

    render(painter: Painter, viewport: Rect): Tile {
        const { gridSpacing, scale } = this.scene
        for (let i = 0; i < this.images_.length; ++i) {
            const scenePos = this.position.add({
                x: Math.floor(i%this.shape_.columns),
                y: Math.floor(i/this.shape_.columns),
            })
            const sceneRect = new Rect(scenePos, this.imageSize_)

            if (viewport.overlap(sceneRect)) {
                const bitmap = this.images_[i][scale]
                const screenPos = scenePos.sub(viewport).mul(gridSpacing)
                painter.drawImageBitmap(bitmap, screenPos)
            }
        }
        return this
    }
}
