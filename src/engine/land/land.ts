import { Terrain } from "./terrain"
import { ILand, ITerrainData, ITerrain, Neighborhood, LandInitialData } from "./types"
import { renderImage } from "./workers"

import { SceneItem, Image, IScene } from "@/engine/scene"

import { Painter } from "@/graphics"
import { ISize, IVector2D, Rect } from "@/maths"
import { createObserver, IObserver } from "@/utils"

import { chain, isNil, remove, times } from "lodash"

export class LandDataError extends Error {
    constructor(m: string) {
        super(m)
        Object.setPrototypeOf(this, LandDataError.prototype)
    }
}

export abstract class Land<TerrainData extends ITerrainData> extends SceneItem implements ILand<TerrainData> {
    private fogOfWar_ = false
    private image_: Partial<Image> = {}
    private redraw_: Record<number, [IVector2D, Array<Image>]> = {}

    private terrains_: Array<Terrain<TerrainData>> = []
    private terrainsObserver_: IObserver<ITerrain<TerrainData>>

    private positionToIndex_({ x, y }: IVector2D): number {
        if ((x >= 0 && x < this.width) && (y >= 0 && y < this.height)) {
            return this.width*y + x
        }
        return -1
    }

    private indexToPosition_(index: number): IVector2D {
        return {
            x: index%this.width,
            y: Math.floor(index/this.width)
        }
    }

    private onTerrainChanged_(terrain: ITerrain<TerrainData>) {
        const neighbors = this.neighborhood(terrain.position)

        chain(neighbors as Array<ITerrain<TerrainData>>)
            .tap(terrains => remove(terrains, isNil))
            .tap(terrains => terrains.push(terrain))
            .forEach(terrain => {
                const position = terrain.position
                const neighbors = this.neighborhood(position)

                const images: Array<Image> = [
                    this.terrainImage_(terrain, neighbors)
                ]

                const fogImage = this.fogImage_(terrain, neighbors)
                if (!isNil(fogImage)) {
                    images.push(fogImage)
                }

                this.redraw_[this.positionToIndex_(position)] = [
                    position,
                    images,
                ]
            })
            .value()
    }

    protected abstract terrainImage_(t: ITerrain<TerrainData>, n: Neighborhood<TerrainData>): Image
    protected abstract fogImage_(t: ITerrain<TerrainData>, n: Neighborhood<TerrainData>): Image|null

    constructor(
        scene: IScene,
        landData: LandInitialData<TerrainData>,
    ) {
        super(scene)

        this.terrainsObserver_ = createObserver<ITerrain<TerrainData>>()
        this.terrainsObserver_.subscribe(terrain => {
            this.onTerrainChanged_(terrain)
        })

        this.terrains_ = times(this.width*this.height, index => {
            const position = this.indexToPosition_(index)
            const data = (typeof landData === "function")
                ? landData(position)
                : landData[index]

            if (isNil(data)) {
                throw new LandDataError("Not enougth data to cover land area!")
            }
            return new Terrain(position, data, this.terrainsObserver_.publish)
        })
    }

    render(painter: Painter, viewport: Rect): ILand<TerrainData> {
        const bitmap = this.image_[this.scene.scale]
        if (!isNil(bitmap)) {
            painter.drawImageBitmap(
                bitmap,
                { x: 0, y: 0 },
                viewport.scaled(this.scene.gridSpacing)
            )
        }
        return this
    }

    update(): ILand<TerrainData> {
        const tiles = Object.values(this.redraw_)
        this.redraw_ = {}
        if (tiles.length > 0) {
            renderImage({
                size: this.size,
                gridUnit: this.scene.gridUnit,
                image: this.image_,
                tiles,
            }).then(image => {
                this.image_ = image
            })
        }
        return this
    }

    reveal(position: IVector2D, size?: ISize): this {
        size = size ?? { width: 1, height: 1 }
        for (const terrain of this.terrains(new Rect(position, size))) {
            terrain.update({ revealed: true } as Partial<TerrainData>)
        }
        return this
    }

    terrain(position: IVector2D)
        : ITerrain<TerrainData>|null {
        return this.terrains_[this.positionToIndex_(position)] ?? null
    }

    neighborhood({ x, y }: IVector2D)
        : Neighborhood<TerrainData> {
        return [
            this.terrain({ x, y: y - 1 }),
            this.terrain({ x: x + 1, y }),
            this.terrain({ x, y: y + 1 }),
            this.terrain({ x: x - 1, y }),
        ]
    }

    * terrains(zone?: Rect)
        : Generator<ITerrain<TerrainData>, void, undefined> {
        if (!isNil(zone)) {
            const rect = this.rect.intersected(zone)
            if (!isNil(rect)) {
                for (const { x, y } of rect.partition()) {
                    yield this.terrain({ x, y }) as ITerrain<TerrainData>
                }
            }
        } else {
            yield * this.terrains_
        }
    }

    onTerrainChanged(callback: (t: ITerrain<TerrainData>) => void)
        : () => void {
        return this.terrainsObserver_.subscribe(callback)
    }
}
