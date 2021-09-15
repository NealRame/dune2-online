import { Engine } from "./engine"
import { ITerrain } from "./__land"

import { Color } from "@/graphics"
import { createObserver, IObserver } from "@/utils"

import { isNil } from "lodash"

export interface IMiniMap {
    readonly image: ImageBitmap|null
    readonly onChanged: IObserver<void> // TODO: should be an emitter
}

export function createMiniMap<T extends ITerrain>(game: Engine<T>)
    : IMiniMap {
    const observer = createObserver<void>()
    const { width, height } = game.scene.size

    const canvas = new OffscreenCanvas(width, height)
    const context = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D

    let image: ImageBitmap|null = null

    game.land.onTerrainChanged(terrain => {
        if (!isNil(image)) {
            context.drawImage(image, 0, 0)
        }

        const color = terrain.color

        context.fillStyle = Color.cssRGB(color)
        context.fillRect(terrain.x, terrain.y, 1, 1)

        image = canvas.transferToImageBitmap()

        observer.publish()
    })

    return {
        get image() {
            return image
        },
        get onChanged() {
            return observer
        },
    }
}
