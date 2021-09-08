import { Terrain } from "./types"

import { IScene, SceneItem } from "@/engine"
import { Painter } from "@/graphics"
import { Rect, ISize, Vector } from "@/maths"

export class TerrainItem implements SceneItem {
    private scene_: IScene
    private terrain_: Terrain

    constructor(scene: IScene, terrain: Terrain) {
        this.scene_ = scene
        this.terrain_ = terrain
    }

    get scene(): IScene {
        return this.scene_
    }

    get width(): number {
        return 1
    }

    get height(): number {
        return 1
    }

    get size(): ISize {
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
