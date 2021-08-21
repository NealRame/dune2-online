import { Terrain } from "./land"
import { Game } from "./game"

import { Color } from "@/graphics"
import { createObserver, Observer } from "@/utils"

export interface MiniMap {
    readonly image: ImageBitmap|null
    readonly onChanged: Observer<void> // TODO: should be an emitter
}

export function createMiniMap<T extends Terrain>(game: Game<T>)
    : MiniMap {
    const observer = createObserver<void>()
    const { width, height } = game.scene.size

    const canvas = new OffscreenCanvas(width, height)
    const context = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D

    context.save()
    context.fillStyle = Color.cssRGB([0, 0, 0])
    context.fillRect(0, 0, width, height)
    context.restore()

    game.land.terrainsObserver.subscribe(terrain => {
        const color = terrain.color
        context.fillStyle = Color.cssRGB(color)
        context.fillRect(terrain.x, terrain.y, 1, 1)
        observer.publish()
    })

    return {
        get image() {
            return canvas.transferToImageBitmap()
        },
        get onChanged() {
            return observer
        },
    }
}
