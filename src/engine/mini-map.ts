import {
    GameLandTerrainColorProvider
} from "@/engine/constants"

import {
    type ILandTerrainColorProvider,
    type ITerrain,
    type ITerrainData,
    Land
} from "@/engine/land"

import {
    Inject,
    Service,
    ServiceLifecycle,
} from "@/engine/injector"

import { Color } from "@/graphics"
import { createObservable, IObservable } from "@/utils"

import { isNil } from "lodash"

export type TerrainColorGetter<TerrainData extends ITerrainData = ITerrainData>
    = (t: ITerrain<TerrainData>) => Color.RGBA

export interface IMiniMapEvent {
    changed: null
}

export interface IMiniMap {
    readonly image: ImageBitmap|null
    readonly events: IObservable<IMiniMapEvent>
}

@Service({ lifecycle: ServiceLifecycle.Singleton })
export class MiniMap implements IMiniMap {
    private bitmap_: ImageBitmap | null
    private canvas_: OffscreenCanvas
    private context_: OffscreenCanvasRenderingContext2D
    private events_: IObservable<IMiniMapEvent>

    constructor(
        @Inject(Land) private land_: Land,
        @Inject(GameLandTerrainColorProvider) private terrainColorProvider_: ILandTerrainColorProvider,
    ) {
        const [emitter, events] = createObservable<IMiniMapEvent>()

        const { width, height } = this.land_.view.size

        this.bitmap_ = null
        this.canvas_ = new OffscreenCanvas(width, height)
        this.context_ = this.canvas_.getContext("2d") as OffscreenCanvasRenderingContext2D
        this.events_ = events

        this.land_.events.on("terrainChanged", terrain => {
            if (!isNil(this.bitmap_)) {
                this.context_.drawImage(this.bitmap_, 0, 0)
            }

            const { x, y } = terrain.position
            const color = this.terrainColorProvider_.getTerrainColor(terrain)

            this.context_.fillStyle = Color.cssRGB(color)
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
