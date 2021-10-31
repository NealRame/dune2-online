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

class HarvesterSand1 extends AnimationSprite {
    protected repeat_ = true
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

    get x(): number {
        return 0.25
    }

    get y(): number {
        return 0.75
    }
}

class HarvesterSand2 extends AnimationSprite {
    protected repeat_ = true
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

class HarvesterSand3 extends AnimationSprite {
    protected repeat_ = true
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

class HarvesterSand4 extends AnimationSprite {
    protected repeat_ = true
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

class HarvesterSand5 extends AnimationSprite {
    protected repeat_ = true
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

class HarvesterSand6 extends AnimationSprite {
    protected repeat_ = true
    protected frameCount_ = 60
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

class HarvesterSand7 extends AnimationSprite {
    protected repeat_ = true
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

class HarvesterSand8 extends AnimationSprite {
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

        let scene: IScene|null = null

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
            scene
                .addItem(new Grid(scene))
                .addItem(new Harvester(scene))
                .addItem(new HarvesterSand1(scene))
                // .addItem(new Explosion6(scene))

            window.addEventListener("resize", debounce(onResize, 60))

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
