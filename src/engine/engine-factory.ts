/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    GameMetadataKeys,
} from "./constants"
import {
    Container,
    Token,
} from "./injector"
import {
    GameMetadata, IProgressNotifier
} from "./types"

import {
    fetchData
} from "@/utils"

export interface IEngine {
    get<T>(id: Token<T>): T
}

function getGameResourcesMetadata(game: any) {
    const rcMeta = Reflect.getMetadata(GameMetadataKeys.resources, game) ?? []
    return rcMeta as NonNullable<GameMetadata["resources"]>
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

export async function create(
    game: any,
    progress: IProgressNotifier,
): Promise<IEngine> {
    const container = new Container()

    progress.begin()
    await loadResources(game, container, progress)
    progress.end()

    return {
        get<T>(id: Token<T>): T {
            return container.get(id)
        }
    }
}
