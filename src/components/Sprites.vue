<template>
    <screen ref="screen"
        :width="screenWidth"
        :height="screenHeight"
    />
</template>

<style lang="scss" scoped>
canvas {
    position: absolute;
    left: 0;
    top: 0;
}
</style>

<script lang="ts">
import Screen from "@/components/Screen.vue"

import { ScaleFactor, IScene, Scene, Grid, AnimationSprite, Tile, Sprite } from "@/engine"

import { IPaintDevice } from "@/graphics"

import { defineComponent, onMounted, ref, unref } from "vue"
import { debounce, isNil } from "lodash"
import { imageSet } from "@/dune2/data"

class Smoke extends AnimationSprite {
    protected repeat_ = true
    constructor(scene: IScene) {
        super(scene)
        const images = imageSet("units")
        const size = { width: 1, height: 1 }
        this.frames_ = [
            new Tile(scene, size, [images[260]]),
            new Tile(scene, size, [images[261]]),
            new Tile(scene, size, [images[262]]),
            new Tile(scene, size, [images[261]]),
        ]
    }
}

class Explosion1 extends AnimationSprite {
    protected frameCount_ = 30
    constructor(scene: IScene) {
        super(scene)
        const images = imageSet("units")
        const size = { width: 1, height: 1 }
        this.frames_ = [
            new Tile(scene, size, [images[263]]),
            new Tile(scene, size, [images[264]]),
            new Tile(scene, size, [images[265]]),
            new Tile(scene, size, [images[266]]),
            new Tile(scene, size, [images[267]]),
        ]
    }
}

class Explosion2 extends AnimationSprite {
    protected frameCount_ = 40
    constructor(scene: IScene) {
        super(scene)
        const images = imageSet("units")
        const size = { width: 1.5, height: 1.5 }
        this.frames_ = [
            new Tile(scene, size, [images[268]]),
            new Tile(scene, size, [images[269]]),
            new Tile(scene, size, [images[270]]),
            new Tile(scene, size, [images[271]]),
            new Tile(scene, size, [images[272]]),
        ]
    }
}

class Explosion3 extends AnimationSprite {
    protected frameCount_ = 40
    constructor(scene: IScene) {
        super(scene)
        const images = imageSet("units")
        const size = { width: 1.5, height: 1.5 }
        this.frames_ = [
            new Tile(scene, size, [images[273]]),
            new Tile(scene, size, [images[274]]),
            new Tile(scene, size, [images[275]]),
            new Tile(scene, size, [images[276]]),
            new Tile(scene, size, [images[277]]),
        ]
    }
}

class Explosion4 extends AnimationSprite {
    protected frameCount_ = 40
    constructor(scene: IScene) {
        super(scene)
        const images = imageSet("units")
        const size = { width: 1.5, height: 1.5 }
        this.frames_ = [
            new Tile(scene, size, [images[278]]),
            new Tile(scene, size, [images[279]]),
            new Tile(scene, size, [images[280]]),
            new Tile(scene, size, [images[281]]),
            new Tile(scene, size, [images[282]]),
        ]
    }
}

class Explosion5 extends AnimationSprite {
    protected frameCount_ = 40
    constructor(scene: IScene) {
        super(scene)
        const images = imageSet("units")
        const size = { width: 1.5, height: 1.5 }
        this.frames_ = [
            new Tile(scene, size, [images[283]]),
            new Tile(scene, size, [images[284]]),
            new Tile(scene, size, [images[285]]),
            new Tile(scene, size, [images[286]]),
            new Tile(scene, size, [images[287]]),
        ]
    }
}

class Explosion6 extends AnimationSprite {
    protected frameCount_ = 40
    constructor(scene: IScene) {
        super(scene)
        const images = imageSet("units")
        const size = { width: 1.5, height: 1.5 }
        this.frames_ = [
            new Tile(scene, size, [images[288]]),
            new Tile(scene, size, [images[289]]),
            new Tile(scene, size, [images[290]]),
            new Tile(scene, size, [images[291]]),
            new Tile(scene, size, [images[292]]),
        ]
    }
}

class Harvester extends Sprite {
    constructor(scene: IScene) {
        super(scene)
        const images = imageSet("units")
        const size = { width: 1.5, height: 1.5 }
        this.frames_ = [
            new Tile(scene, size, [images[16]]),
            new Tile(scene, size, [images[17]]),
            new Tile(scene, size, [images[19]]),
            new Tile(scene, size, [images[21]]),
            new Tile(scene, size, [images[23]]),
            new Tile(scene, size, [images[22]]),
            new Tile(scene, size, [images[20]]),
            new Tile(scene, size, [images[18]]),
        ]
    }
}

class HarvesterSand extends AnimationSprite {
    protected repeat_ = true

    private x_ = 0
    private y_ = 0

    constructor(scene: IScene) {
        super(scene)
        this.width_ = 1
        this.height_ = 1
        this.x_ = 0
        this.y_ = 0
    }

    get x(): number { return this.x_ }
    set x(x: number) { this.x_ = x }

    get y(): number { return this.y_ }
    set y(y: number) { this.y_ = y }
}

class HarvesterSand1 extends HarvesterSand {
    constructor(scene: IScene) {
        super(scene)
        const images = imageSet("units")
        const size = { width: 1, height: 1 }
        this.frames_ = [
            new Tile(scene, size, [images[303]]),
            new Tile(scene, size, [images[304]]),
            new Tile(scene, size, [images[305]]),
        ]
    }
}

class HarvesterSand2 extends HarvesterSand {
    constructor(scene: IScene) {
        super(scene)
        const images = imageSet("units")
        const size = { width: 1, height: 1 }
        this.frames_ = [
            new Tile(scene, size, [images[306]]),
            new Tile(scene, size, [images[308]]),
            new Tile(scene, size, [images[310]]),
        ]
    }
}

class HarvesterSand3 extends HarvesterSand {
    constructor(scene: IScene) {
        super(scene)
        const images = imageSet("units")
        const size = { width: 1, height: 1 }
        this.frames_ = [
            new Tile(scene, size, [images[312]]),
            new Tile(scene, size, [images[314]]),
            new Tile(scene, size, [images[316]]),
        ]
    }
}

class HarvesterSand4 extends HarvesterSand {
    constructor(scene: IScene) {
        super(scene)
        const images = imageSet("units")
        const size = { width: 1, height: 1 }
        this.frames_ = [
            new Tile(scene, size, [images[318]]),
            new Tile(scene, size, [images[320]]),
            new Tile(scene, size, [images[322]]),
        ]
    }
}

class HarvesterSand5 extends HarvesterSand {
    constructor(scene: IScene) {
        super(scene)
        const images = imageSet("units")
        const size = { width: 1, height: 1 }
        this.frames_ = [
            new Tile(scene, size, [images[324]]),
            new Tile(scene, size, [images[325]]),
            new Tile(scene, size, [images[326]]),
        ]
    }
}

class HarvesterSand6 extends HarvesterSand {
    constructor(scene: IScene) {
        super(scene)
        const images = imageSet("units")
        const size = { width: 1, height: 1 }
        this.frames_ = [
            new Tile(scene, size, [images[319]]),
            new Tile(scene, size, [images[321]]),
            new Tile(scene, size, [images[323]]),
        ]
    }
}

class HarvesterSand7 extends HarvesterSand {
    constructor(scene: IScene) {
        super(scene)
        const images = imageSet("units")
        const size = { width: 1, height: 1 }
        this.frames_ = [
            new Tile(scene, size, [images[313]]),
            new Tile(scene, size, [images[315]]),
            new Tile(scene, size, [images[317]]),
        ]
    }
}

class HarvesterSand8 extends HarvesterSand {
    protected repeat_ = true
    constructor(scene: IScene) {
        super(scene)
        const images = imageSet("units")
        const size = { width: 1, height: 1 }
        this.frames_ = [
            new Tile(scene, size, [images[307]]),
            new Tile(scene, size, [images[309]]),
            new Tile(scene, size, [images[311]]),
        ]
    }
}

export default defineComponent({
    components: { Screen },
    setup() {
        const screen = ref<IPaintDevice | null>(null)
        const screenWidth = ref(0)
        const screenHeight = ref(0)
        const scale = ref<ScaleFactor>(4)

        let scene: IScene|null

        // handle window resize events
        const onResize = () => {
            const { x: leftPos } = (unref(screen) as IPaintDevice).rect
            const size = {
                width: window.innerWidth - leftPos,
                height: window.innerHeight,
            }
            screenWidth.value = size.width
            screenHeight.value = size.height
            if (!isNil(scene)) {
                scene.viewport.size = size
            }
        }

        onMounted(async () => {
            const paintDevice = unref(screen) as IPaintDevice

            scene = new Scene({
                width: 60,
                height: 60,
            }, paintDevice.painter)

            scene.scale = unref(scale)
            scene.viewport.size = paintDevice.size

            const harvester = new Harvester(scene)
            const sands = [
                new HarvesterSand1(scene),
                new HarvesterSand2(scene),
                new HarvesterSand3(scene),
                new HarvesterSand4(scene),
                new HarvesterSand5(scene),
                new HarvesterSand6(scene),
                new HarvesterSand7(scene),
                new HarvesterSand8(scene),
            ]
            let sandCurrent = sands[0]

            scene
                .addItem(new Grid(scene))
                .addItem(harvester)
                .addItem(sandCurrent)
                // .addItem(new Explosion6(scene))

            window.addEventListener("resize", debounce(onResize, 60))
            window.addEventListener("keyup", ({ key }: KeyboardEvent) => {
                if (isNil(scene)) return
                switch (key) {
                case "a":
                    harvester.frameIndex = 7
                    scene.removeItem(sandCurrent)
                    scene.addItem(sandCurrent = sands[7])
                    break
                case "z":
                    harvester.frameIndex = 0
                    scene.removeItem(sandCurrent)
                    scene.addItem(sandCurrent = sands[0])
                    break
                case "e":
                    harvester.frameIndex = 1
                    scene.removeItem(sandCurrent)
                    scene.addItem(sandCurrent = sands[1])
                    break
                case "q":
                    harvester.frameIndex = 6
                    scene.removeItem(sandCurrent)
                    scene.addItem(sandCurrent = sands[6])
                    break
                case "d":
                    harvester.frameIndex = 2
                    scene.removeItem(sandCurrent)
                    scene.addItem(sandCurrent = sands[2])
                    break
                case "w":
                    harvester.frameIndex = 5
                    scene.removeItem(sandCurrent)
                    scene.addItem(sandCurrent = sands[5])
                    break
                case "x":
                    harvester.frameIndex = 4
                    scene.removeItem(sandCurrent)
                    scene.addItem(sandCurrent = sands[4])
                    break
                case "c":
                    harvester.frameIndex = 3
                    scene.removeItem(sandCurrent)
                    scene.addItem(sandCurrent = sands[3])
                    break
                case "ArrowUp":
                    sandCurrent.y -= 1/scene.gridUnit
                    console.log(sandCurrent.position)
                    break
                case "ArrowRight":
                    sandCurrent.x += 1/scene.gridUnit
                    console.log(sandCurrent.position)
                    break
                case "ArrowDown":
                    sandCurrent.y += 1/scene.gridUnit
                    console.log(sandCurrent.position)
                    break
                case "ArrowLeft":
                    sandCurrent.x -= 1/scene.gridUnit
                    console.log(sandCurrent.position)
                    break
                }
            })

            ;(function animationLoop() {
                if (!isNil(scene)) {
                    scene.render()
                    requestAnimationFrame(animationLoop)
                }
            })()

            onResize()
        })

        return {
            screen,
            screenWidth,
            screenHeight,
        }
    }
})
</script>
