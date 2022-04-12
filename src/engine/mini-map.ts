import {
    GameLandTerrainColorProvider
} from "@/engine/constants"

import {
    Inject,
    Service,
    ServiceLifecycle,
} from "@/engine/injector"

import {
    type ILandTerrainColorProvider,
    type ITerrainData,
    type ITerrain,
    Land
} from "@/engine/land"

import { Color } from "@/graphics"
import { createObservable, IEmitter, IObservable } from "@/utils"

import { isNil } from "lodash"

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
    private emitter_: IEmitter<IMiniMapEvent>

    private update_(terrain: ITerrain<ITerrainData>) {
        if (!isNil(this.bitmap_)) {
            this.context_.drawImage(this.bitmap_, 0, 0)
        }

        const { x, y } = terrain.position
        const color = this.terrainColorProvider_.getTerrainColor(terrain)

        this.context_.fillStyle = Color.cssRGB(color)
        this.context_.fillRect(x, y, 1, 1)
        this.bitmap_ = this.canvas_.transferToImageBitmap()
    }

    private reset_() {
        const { width, height } = this.land_.view.size

        this.canvas_.width = width
        this.canvas_.height = height
        this.context_.clearRect(0, 0, width, height)

        for (const terrain of this.land_.terrains()) {
            const { x, y } = terrain.position
            const color = this.terrainColorProvider_.getTerrainColor(terrain)

            this.context_.fillStyle = Color.cssRGB(color)
            this.context_.fillRect(x, y, 1, 1)
        }
        this.bitmap_ = this.canvas_.transferToImageBitmap()
    }

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
        this.emitter_ = emitter

        this.land_.events.on("terrainChanged", terrain => {
            this.update_(terrain)
            this.emitter_.emit("changed", null)
        })
        this.land_.events.on("reset", () => {
            this.reset_()
            this.emitter_.emit("changed", null)
        })

        this.reset_()
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
