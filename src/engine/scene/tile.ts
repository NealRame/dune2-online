import { SceneItem } from "./item"
import { Image, IScene } from "./types"

import { IEntity } from "@/engine/entity"
import { Painter } from "@/graphics"
import { Rect, IVector2D, IShape, ISize } from "@/maths"

import { isMatch } from "lodash"

function getImageSize(scene: IScene, image: Image): ISize {
    const { width: w, height: h } = image[1]
    return {
        width: w/scene.gridUnit,
        height: h/scene.gridUnit,
    }
}

function checkImages(scene: IScene, images: Image[]) {
    const [head, ...tail] = images
    const size = getImageSize(scene, head)
    for (const image of tail) {
        if (!isMatch(getImageSize(scene, image), size)) {
            throw new Error("All image must have the same size")
        }
    }
}

function checkShape({ columns, rows }: IShape, images: Image[]) {
    if (columns*rows > images.length) {
        throw new Error("Inconsistent number of images for the shape of the sprite")
    }
}

export class Tile extends SceneItem {
    protected imageSize_: ISize
    protected images_: Image[]
    protected shape_: IShape

    constructor(
        entity: IEntity,
        scene: IScene,
        position: IVector2D,
        shape: IShape,
        images: Image[],
    ) {
        super(entity, scene)

        checkImages(scene, images)
        checkShape(shape, images)

        this.imageSize_ = getImageSize(scene, images[0])
        this.images_ = images
        this.shape_ = shape
        this.x_ = position.x
        this.y_ = position.y
        this.width_ = shape.columns*this.imageSize_.width
        this.height_ = shape.rows*this.imageSize_.height
    }

    render(painter: Painter, viewport: Rect): Tile {
        const { gridSpacing, scale } = this.scene
        for (let i = 0; i < this.images_.length; ++i) {
            const scenePos = this.position.add({
                x: Math.floor(i%this.shape_.columns),
                y: Math.floor(i/this.shape_.columns),
            })
            const sceneRect = new Rect(scenePos, this.imageSize_)

            if (viewport.intersects(sceneRect)) {
                const bitmap = this.images_[i][scale]
                const screenPos = scenePos.sub(viewport).mul(gridSpacing)
                painter.drawImageBitmap(bitmap, screenPos)
            }
        }
        return this
    }
}
