import { Token } from "./injector"
import { Scene } from "./scene"
import { GameEngineMode } from "./types"

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

export const GameMode = new Token<GameEngineMode>("game:mode")
export const GameScene = new Token<Scene>("game:scene")

export const GameLandTerrainGenerator = Symbol("game:land:terrain:generator")
export const GameLandTilesProvider = Symbol("game:land:tiles:provider")
