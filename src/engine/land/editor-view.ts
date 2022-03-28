import {
    type ITerrainData,
    type ILand,
    type ILandTerrainTilesProvider,
    type ILandView
} from "./types"

import {
    IScene,
    SceneItem
} from "@/engine/scene"

import { Painter } from "@/graphics"

import { Rect } from "@/maths"

import { isNil } from "lodash"

export class LandEditorView<
    TerrainData extends ITerrainData
> extends SceneItem implements ILandView {
    constructor(
        private land_: ILand<TerrainData>,
        private tilesProvider_: ILandTerrainTilesProvider<TerrainData>,
        scene: IScene,
    ) {
        super(scene)
    }

    get width(): number {
        return this.scene.width
    }

    get height(): number {
        return this.scene.height
    }

    render(painter: Painter, viewport: Rect)
        : ILandView {
        const gridSpacing = this.scene.gridSpacing
        const { x: viewportX, y: viewportY } = viewport.topLeft()

        for (const terrain of this.land_.terrains(viewport)) {
            const neighbors = this.land_.neighborhood(terrain.position)
            const image = this.tilesProvider_.getTerrainTile(terrain, neighbors)

            if (!isNil(image)) {
                painter.drawImageBitmap(image[this.scene.scale], {
                    x: (terrain.position.x - viewportX)*gridSpacing,
                    y: (terrain.position.y - viewportY)*gridSpacing,
                })
            }
        }

        return this
    }

    update()
        : ILandView {
        return this
    }
}
