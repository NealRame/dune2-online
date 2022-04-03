import { Token } from "./injector"
import { IMiniMap } from "./mini-map"
import { Scene } from "./scene"
import { Mode } from "./types"

export const GameMetadataKeys = {
    resources: Symbol("game:metadata:resources"),
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

export const GameMode = new Token<Mode>("game:mode")
export const GameScene = new Token<Scene>("game:scene")
export const GameMinimap = new Token<IMiniMap>("game:minimap")

export const GameLandTerrainGenerator = Symbol("game:land:terrainGenerator")
export const GameLandTilesProvider = Symbol("game:land:terrainTilesProvider")
export const GameLandTerrainColorProvider = Symbol("game:land:terrainColorProvider")
