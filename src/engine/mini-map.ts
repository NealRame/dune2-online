import { Engine } from "./engine"
import { ITerrain, ITerrainData } from "./land"

import { Color } from "@/graphics"
import { EventEmitter, IEmitter } from "@/utils"

import { constant, isNil } from "lodash"

export type TerrainColorGetter<TerrainData extends ITerrainData>
    = (t: ITerrain<TerrainData>) => Color.RGBA

export interface IMiniMapEvent {
    changed: null
}

export interface IMiniMap extends IEmitter<IMiniMapEvent> {
    readonly image: ImageBitmap|null
}

export class MiniMap<TerrainData extends ITerrainData> extends EventEmitter<IMiniMapEvent> implements IMiniMap {
    private bitmap_: ImageBitmap | null
    private canvas_: OffscreenCanvas
    private context_: OffscreenCanvasRenderingContext2D

    protected terrainColor_: TerrainColorGetter<TerrainData> = constant([0, 0, 0, 0])

    constructor(game: Engine<TerrainData>) {
        super()

        const { width, height } = game.land.view.size

        this.bitmap_ = null
        this.canvas_ = new OffscreenCanvas(width, height)
        this.context_ = this.canvas_.getContext("2d") as OffscreenCanvasRenderingContext2D

        game.land.listen("terrainChanged", terrain => {
            if (!isNil(this.bitmap_)) {
                this.context_.drawImage(this.bitmap_, 0, 0)
            }

            const { x, y } = terrain.position

            this.context_.fillStyle = Color.cssRGB(this.terrainColor_(terrain))
            this.context_.fillRect(x, y, 1, 1)
            this.bitmap_ = this.canvas_.transferToImageBitmap()
            this.emit("changed", null)
        })
    }

    get image()
        : ImageBitmap | null {
        return this.bitmap_
    }
}
