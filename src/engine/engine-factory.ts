/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    GameMetadataKeys,
    GameLandMetadataKeys,
} from "./constants"
import {
    Container,
    Token,
} from "./injector"
import {
    GameMetadata,
    IProgressNotifier
} from "./types"

import {
    Painter
} from "@/graphics"

import {
    fetchData
} from "@/utils"

import { isNil } from "lodash"
import { Scene } from "./scene"

export interface IEngine {
    get<T>(id: Token<T>): T
}

function getGameResourcesMetadata(game: any) {
    const rcMeta = Reflect.getMetadata(GameMetadataKeys.resources, game) ?? []
    return rcMeta as NonNullable<GameMetadata["resources"]>
}

function getGameLandMetadata(game: any) {
    const landMeta = Reflect.getMetadata(GameMetadataKeys.land, game)
    if (isNil(landMeta)) {
        throw new Error("missing land configuration")
    }
    if (isNil(landMeta.generator)) {
        throw new Error("missing land.generator configuration")
    }
    return landMeta as NonNullable<GameMetadata["land"]>
}

async function loadResources(
    game: any,
    container: Container,
    progress: IProgressNotifier,
): Promise<void> {
    const metadata = getGameResourcesMetadata(game)
    for (const rcDescriptor of metadata) {
        const rcDecoder = container.get(rcDescriptor.decoder)

        progress.setLabel(`Downloading ${rcDescriptor.name}`)
        progress.setValue(0)
        const rcData = await fetchData(rcDescriptor.uri, (current, total) => {
            progress.setValue(current/total)
        })

        progress.setLabel(`Decoding ${rcDescriptor.name}`)
        progress.setValue(null)
        const rc = await rcDecoder.decode(rcData, rcDescriptor.id)

        container.set(rcDescriptor.id, rc)
    }
}

function createLand(
    game: any,
    container: Container,
) {
    const metadata = getGameLandMetadata(game)
    // container.set(GameLandMetadataKeys.generator, metadata.generator)
}

export async function create(
    game: any,
    screen: HTMLCanvasElement,
    progress: IProgressNotifier,
): Promise<IEngine> {
    const container = new Container()

    progress.begin()
    await loadResources(game, container, progress)
    progress.end()

    const painter = new Painter(screen)
    const scene = new Scene({ width: 64, height: 64 }, painter)

    return {
        get<T>(id: Token<T>): T {
            return container.get(id)
        }
    }
}
