import { Terrain } from "./land"
import { Game } from "./game"

import { Color } from "@/graphics"
import { createObserver, Observer } from "@/utils"

interface MiniMap {
    readonly image: ImageBitmap|null
    readonly onChanged: Observer<void> // TODO: should be an emitter
}

export function createMiniMap<T extends Terrain>(game: Game<T>)
    : MiniMap {
    const observer = createObserver<void>()
    const { width, height } = game.scene.size

    const canvas = new OffscreenCanvas(width, height)
    const context = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D

    for (const terrain of game.land.terrains()) {
        const color = terrain.color
        context.fillStyle = Color.cssRGB(color)
        context.fillRect(terrain.x, terrain.y, 1, 1)
    }

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
