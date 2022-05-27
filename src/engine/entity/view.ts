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

export class EntityView<Data extends IEntityData> extends SceneItem {
    constructor(
        private entity_: IEntity<Data>,
        private tilesProvider_: IEntityTileProvider<Data>,
        scene: IScene,
    ) { super(scene) }

    render(painter: Painter)
        : this {
        const gridSpacing = this.scene.gridSpacing
        const image = this.tilesProvider_.getTile(this.entity_.model)

        if (!isNil(image)) {
            painter.drawImageBitmap(image[this.scene.scale], {
                x: this.entity_.x*gridSpacing,
                y: this.entity_.x*gridSpacing,
            })
        }
        return this
    }
}
