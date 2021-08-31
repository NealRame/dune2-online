import { Terrain } from "./types"
import { SceneItem } from "../types"

import { Scene } from "@/engine"
import { Painter } from "@/graphics"
import { Rect, Size, Vector } from "@/maths"

export class TerrainItem implements SceneItem {
    private scene_: Scene
    private terrain_: Terrain

    constructor(scene: Scene, terrain: Terrain) {
        this.scene_ = scene
        this.terrain_ = terrain
    }

    get scene(): Scene {
        return this.scene_
    }

    get width(): number {
        return 1
    }

    get height(): number {
        return 1
    }

    get size(): Size {
        return {
            width: 1,
            height: 1,
        }
    }

    get rect(): Rect {
        return new Rect(this.position, this.size)
    }

    get position(): Vector {
        const { x, y } = this.terrain_.position
        return new Vector(x, y)
    }

    update(): TerrainItem {
        return this
    }

    render(
        painter: Painter,
        viewport: Rect,
    ): TerrainItem {
        const { gridSpacing, scale } = this.scene_
        if (this.rect.intersects(viewport)) {
            for (const image of this.terrain_.image()) {
                painter.drawImageBitmap(
                    image[scale],
                    this.position.sub(viewport).mul(gridSpacing)
                )
            }
        }
        return this
    }
}
