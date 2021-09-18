import { Engine } from "./engine"
import { ITerrain, ITerrainData } from "./land"

import { Color } from "@/graphics"
import { createObserver, IObserver } from "@/utils"

import { constant, isNil } from "lodash"

export type TerrainColorGetter<TerrainData extends ITerrainData>
    = (t: ITerrain<TerrainData>) => Color.RGBA

export interface IMiniMap {
    readonly image: ImageBitmap|null
    readonly onChanged: IObserver<void> // TODO: should be an emitter
}

export class MiniMap<TerrainData extends ITerrainData> implements IMiniMap {
    private observer_: IObserver<void>
    private bitmap_: ImageBitmap | null
    private canvas_: OffscreenCanvas
    private context_: OffscreenCanvasRenderingContext2D

    protected terrainColor_: TerrainColorGetter<TerrainData> = constant([0, 0, 0, 0])

    constructor(game: Engine<TerrainData>) {
        const { width, height } = game.land.size

        this.bitmap_ = null
        this.canvas_ = new OffscreenCanvas(width, height)
        this.context_ = this.canvas_.getContext("2d") as OffscreenCanvasRenderingContext2D

        this.observer_ = createObserver<void>()

        game.land.onTerrainChanged(terrain => {
            if (!isNil(this.bitmap_)) {
                this.context_.drawImage(this.bitmap_, 0, 0)
            }

            const { x, y } = terrain.position

            this.context_.fillStyle = Color.cssRGB(this.terrainColor_(terrain))
            this.context_.fillRect(x, y, 1, 1)
            this.bitmap_ = this.canvas_.transferToImageBitmap()
            this.observer_.publish()
        })
    }

    get image()
        : ImageBitmap | null {
        return this.bitmap_
    }

    get onChanged()
        : IObserver<void> {
        return this.observer_
    }
}
