import { IScene, ISceneLayer, Scene, SceneLayer } from "./scene"
import { ILand, ITerrainData, LandConstructor, LandInitialData } from "./land"
import { IUnit, IUnitData, Unit } from "./unit"

import { Painter } from "@/graphics"
import { ISize } from "@/maths"

export interface Config<T extends ITerrainData> {
    painter: Painter
    size: ISize
    Land: LandConstructor<T>
    landData: LandInitialData<T>
}

export interface Engine<T extends ITerrainData> {
    readonly scene: Scene
    readonly land: ILand<T>
    readonly units: UnitManager
    start(): Engine<T>
    stop(): Engine<T>
}

interface UnitManager {
    readonly layer: ISceneLayer
    add(unit: IUnit<IUnitData>): IUnit<IUnitData>
    update(): void
}

function createUnitManager(scene: IScene, land: ILand)
    : UnitManager {
    const units = new Set<IUnit<IUnitData>>()
    const layer = new SceneLayer(scene)

    scene.addItem(layer)

    return {
        get layer(): ISceneLayer {
            return layer
        },
        add(unit: Unit): IUnit<IUnitData> {
            unit.events.on("destinationReached", ({ x, y }) => {
                land.reveal({ x: x - 1, y: y - 1 }, { width: 3, height: 3 })
            })

            unit.events.once("destroyed", unit => unit.events.clear())

            units.add(unit)
            layer.addItem(unit.view)

            // unit.events.emit("destinationReached", unit)

            return unit
        },
        update(): void {
            for (const unit of units) {
                unit.update()
            }
        }
    }
}

export function create<T extends ITerrainData>(
    config: Config<T>
): Engine<T> {
    const scene = new Scene(config.size, config.painter)
    const land = new config.Land(scene, config.landData)

    scene.addItem(land.view)

    const units = createUnitManager(scene, land)

    let animationRequestId = 0

    return {
        get scene() {
            return scene
        },
        get land() {
            return land
        },
        get units() {
            return units
        },
        start(): Engine<T> {
            (function animationLoop() {
                scene.render()

                land.update()
                units.update()

                animationRequestId = requestAnimationFrame(animationLoop)
            })()
            return this
        },
        stop(): Engine<T> {
            cancelAnimationFrame(animationRequestId)
            animationRequestId = 0
            return this
        }
    }
}
