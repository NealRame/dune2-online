import { isNil } from "lodash"

import {
    SceneItem,
    type IScene,
} from "@/engine/scene"

import {
    Painter,
} from "@/graphics"

import {
    type IEntity,
    type IEntityData,
    type IEntityTileProvider,
} from "./types"
import { Rect, Vector } from "@/maths"

export class EntityView<Data extends IEntityData> extends SceneItem {
    constructor(
        private entity_: IEntity<Data>,
        private tilesProvider_: IEntityTileProvider<Data>,
        scene: IScene,
    ) { super(scene) }

    get rect(): Rect {
        const tiles = this.tilesProvider_.getTiles(this.entity_.model)

        if (tiles.length === 0) {
            return Rect.empty()
        }

        let rect: Rect

        if (tiles.length === 1) {
            rect = tiles[0].rect
        } else {
            rect = Rect.bounding(tiles.map(tile => tile.rect)).translate(this.entity_)
        }

        return rect.translate(this.entity_)
    }

    render(painter: Painter, viewport: Rect)
        : this {
        const rect = Rect.intersection(viewport, this.rect)
        const tiles = this.tilesProvider_.getTiles(this.entity_.model)

        if (!isNil(rect)) {
            const gridSpacing = this.scene.gridSpacing
            const origin = (new Vector(this.entity_.x, this.entity_.y)).sub(viewport.topLeft())

            for (const tile of tiles) {
                painter.save()
                painter.translate(tile.position.add(origin).mul(gridSpacing))
                tile.render(painter, tile.rect)
                painter.restore()
            }
        }

        return this
    }
}
