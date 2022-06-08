/* eslint-disable @typescript-eslint/no-explicit-any */

import { GameMetadataKeys } from "@/engine/constants"
import { IGameMetadata } from "@/engine/types"

export function Game(metadata: IGameMetadata)
    : ClassDecorator {
    const properties = Object.keys(metadata)
    return target => {
        for (const property of properties) {
            if (Reflect.has(GameMetadataKeys, property)) {
                const metadataKey = (GameMetadataKeys as any)[property]
                const metadataValue = (metadata as any)[property]
                Reflect.defineMetadata(metadataKey, metadataValue, target)
            } else {
                console.warn(`unsupported metadata property: ${property}`)
            }
        }
    }
}
