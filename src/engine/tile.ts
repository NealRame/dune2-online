import { AbstractSceneItem } from "./scene"
import { Image, Scene } from "./types"

import { Painter } from "@/graphics"
import { Rect, RectangularCoordinates, Shape, Size } from "@/maths"

import { isMatch } from "lodash"

function getImageSize(scene: Scene, image: Image): Size {
    const { width: w, height: h } = image[1]
    return {
        width: w/scene.gridUnit,
        height: h/scene.gridUnit,
    }
}

function checkImages(scene: Scene, images: Image[]) {
    const [head, ...tail] = images
    const size = getImageSize(scene, head)
    for (const image of tail) {
        if (!isMatch(getImageSize(scene, image), size)) {
            throw new Error("All image must have the same size")
        }
    }
}

function checkShape({ columns, rows }: Shape, images: Image[]) {
    if (columns*rows > images.length) {
        throw new Error("Inconsistent number of images for the shape of the sprite")
    }
}

export class Tile extends AbstractSceneItem {
    private imageSize_: Size
    private images_: Image[]
    private shape_: Shape

    constructor(
        scene: Scene,
        position: RectangularCoordinates,
        shape: Shape,
        images: Image[],
    ) {
        super(scene)

        checkImages(scene, images)
        checkShape(shape, images)

        this.imageSize_ = getImageSize(scene, images[0])
        this.images_ = images
        this.shape_ = shape
        this.position = position
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

export type TileConfig = {
    position?: RectangularCoordinates,
    shape: Shape,
    images: Image[]
}

export function createTile(scene: Scene, config: TileConfig): Tile {
    return new Tile(
        scene,
        config.position ?? { x: 0, y: 0 },
        config.shape,
        config.images,
    )
}
