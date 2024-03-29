import { IEntityManager } from "./entity"
import { Token } from "./injector"
import { IMiniMap } from "./mini-map"
import { Scene } from "./scene"
import { Mode, State } from "./types"

export const GameMetadataKeys = {
    resources: Symbol("game:metadata:resources"),
    entity: Symbol("entity:metadata"),
    land: Symbol("game:metadata:land"),
}

export const GameLandMetadataKeys = {
    generator: Symbol("game:metadata:land:generator"),
    tilesProvider: Symbol("game:metadata:land:tilesProvider"),
}

export const GameResourcesMetadataKeys = {
    id: Symbol("game:metadata:resource:id"),
    uri: Symbol("game:metadata:resource:uri"),
}

/******************************************************************************
 * Identifiers
 *****************************************************************************/

export const GameMode: Token<Mode> = Symbol("game:mode")
export const GameState: Token<State> = Symbol("game:state")
export const GameScene: Token<Scene> = Symbol("game:scene")
export const GameMinimap: Token<IMiniMap> = Symbol("game:minimap")

export const GameLandTerrainGenerator = Symbol("game:land:terrainGenerator")
export const GameLandTilesProvider = Symbol("game:land:terrainTilesProvider")
export const GameLandTerrainColorProvider = Symbol("game:land:terrainColorProvider")

export const GameUnitsManager: Token<IEntityManager> = Symbol("game:units:manager")
