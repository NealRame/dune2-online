import {
    GameLandTerrainColorProvider
} from "@/engine/constants"

import {
    Inject,
    Service,
    ServiceLifecycle,
} from "@/engine/injector"

import {
    type ILand,
    type ILandTerrainColorProvider,
    type ITerrainData,
    type ITerrain,
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
    land: ILand | null
}

@Service({ lifecycle: ServiceLifecycle.Singleton })
export class MiniMap implements IMiniMap {
    private events_: IObservable<IMiniMapEvent>
    private emitter_: IEmitter<IMiniMapEvent>

    private bitmap_: ImageBitmap | null
    private canvas_: OffscreenCanvas | null
    private land_: ILand | null

    private update_(terrain: ITerrain<ITerrainData>) {
        if (isNil(this.canvas_)) return

        const context = this.canvas_.getContext("2d") as OffscreenCanvasRenderingContext2D

        if (!isNil(this.bitmap_)) {
            context.drawImage(this.bitmap_, 0, 0)
        }

        const { x, y } = terrain.position
        const color = this.terrainColorProvider_.getTerrainColor(terrain)

        context.fillStyle = Color.cssRGB(color)
        context.fillRect(x, y, 1, 1)

        this.bitmap_ = this.canvas_.transferToImageBitmap()
        this.emitter_.emit("changed", null)
    }

    private reset_() {
        if (isNil(this.land_)) return

        const { width, height } = this.land_.size

        if (width !== 0 && height !== 0) {
            this.canvas_ = new OffscreenCanvas(width, height)

            const context = this.canvas_.getContext("2d") as OffscreenCanvasRenderingContext2D
            context.clearRect(0, 0, width, height)

            for (const terrain of this.land_.terrains()) {
                const { x, y } = terrain.position
                const color = this.terrainColorProvider_.getTerrainColor(terrain)

                context.fillStyle = Color.cssRGB(color)
                context.fillRect(x, y, 1, 1)
            }

            this.bitmap_ = this.canvas_.transferToImageBitmap()
        } else {
            this.bitmap_ = null
        }

        this.emitter_.emit("changed", null)
    }

    constructor(
        @Inject(GameLandTerrainColorProvider) private terrainColorProvider_: ILandTerrainColorProvider,
    ) {
        const [emitter, events] = createObservable<IMiniMapEvent>()

        this.events_ = events
        this.emitter_ = emitter

        this.canvas_ = null
        this.land_ = null
        this.bitmap_ = null
    }

    get events()
        : IObservable<IMiniMapEvent> {
        return this.events_
    }

    get image()
        : ImageBitmap | null {
        return this.bitmap_
    }

    get land(): ILand | null {
        return this.land_
    }

    set land(land: ILand | null) {
        if (!isNil(this.land_)) {
            this.land_.events.off("reset", this.reset_)
            this.land_.events.off("terrainChanged", this.update_)
        }

        this.land_ = land

        if (!isNil(this.land_)) {
            this.land_.events.on("terrainChanged", terrain => this.update_(terrain))
            this.land_.events.on("reset", () => this.reset_())
            this.reset_()
        }
    }
}
