import { Engine } from "./engine"
import { ITerrain, ITerrainData } from "./land"

import { Color } from "@/graphics"
import { createObservable, IObservable } from "@/utils"

import { constant, isNil } from "lodash"

export type TerrainColorGetter<TerrainData extends ITerrainData>
    = (t: ITerrain<TerrainData>) => Color.RGBA

export interface IMiniMapEvent {
    changed: null
}

export interface IMiniMap {
    readonly image: ImageBitmap|null
    readonly events: IObservable<IMiniMapEvent>
}

export class MiniMap<TerrainData extends ITerrainData> implements IMiniMap {
    private bitmap_: ImageBitmap | null
    private canvas_: OffscreenCanvas
    private context_: OffscreenCanvasRenderingContext2D
    private events_: IObservable<IMiniMapEvent>

    terrainColor: TerrainColorGetter<TerrainData> = constant([0, 0, 0, 0])

    constructor(game: Engine<TerrainData>) {
        const [emitter, events] = createObservable<IMiniMapEvent>()

        const { width, height } = game.land.view.size

        this.bitmap_ = null
        this.canvas_ = new OffscreenCanvas(width, height)
        this.context_ = this.canvas_.getContext("2d") as OffscreenCanvasRenderingContext2D
        this.events_ = events

        game.land.events.on("terrainChanged", terrain => {
            if (!isNil(this.bitmap_)) {
                this.context_.drawImage(this.bitmap_, 0, 0)
            }

            const { x, y } = terrain.position

            this.context_.fillStyle = Color.cssRGB(this.terrainColor(terrain))
            this.context_.fillRect(x, y, 1, 1)
            this.bitmap_ = this.canvas_.transferToImageBitmap()

            emitter.emit("changed", null)
        })
    }

    get events()
        : IObservable<IMiniMapEvent> {
        return this.events_
    }

    get image()
        : ImageBitmap | null {
        return this.bitmap_
    }
}
