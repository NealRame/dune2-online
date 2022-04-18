<script lang="ts">
import { IRect2D, ISize2D } from "@/maths"
import { IPaintDevice, IPaintDeviceEvents, Painter } from "@/graphics"

import { clamp, isNil } from "lodash"
import { defineComponent, onMounted, ref, toRefs, unref, watch } from "vue"
import { createObservable, IObservable } from "@/utils"

export interface IScreen {
    getPaintDevice(): IPaintDevice
}

export default defineComponent({
    emits: [
        "mouseClick",
        "mouseMotion",
    ],
    props: [
        "height",
        "width",
    ],
    setup(props, { expose }) {
        const canvasRef = ref<HTMLCanvasElement | null>(null)
        const {
            height: heightRef,
            width: widthRef,
        } = toRefs(props)
        const [emitter, events] = createObservable<IPaintDeviceEvents>()

        // handle mouse move event
        const mouseMove = (e: MouseEvent) => {
            const canvas = unref(canvasRef) as HTMLCanvasElement
            const { left, top } = canvas.getBoundingClientRect()
            emitter.emit("mouseMoved", {
                button: e.buttons > 0,
                altKey: e.altKey,
                ctrlKey: e.ctrlKey,
                metaKey: e.metaKey,
                position: {
                    // TODO consider borders thickness
                    x: Math.round(clamp(e.clientX - left, 0, canvas.width)),
                    y: Math.round(clamp(e.clientY - top, 0, canvas.height)),
                },
                movement: {
                    x: e.movementX,
                    y: e.movementY,
                },
            })
        }

        // handle mouse click event
        const mouseClick = (e: MouseEvent) => {
            const canvas = unref(canvasRef) as HTMLCanvasElement
            const { left, top } = canvas.getBoundingClientRect()
            emitter.emit("mouseClicked", {
                button: true,
                position: {
                    // TODO consider borders thickness
                    x: Math.round(clamp(e.clientX - left, 0, canvas.width)),
                    y: Math.round(clamp(e.clientY - top, 0, canvas.height)),
                },
                altKey: e.altKey,
                ctrlKey: e.ctrlKey,
                metaKey: e.metaKey,
            })
        }

        watch([widthRef, heightRef], ([width, height]) => {
            emitter.emit("resized", {
                height,
                width,
            })
        })

        onMounted(() => {
            const canvas = unref(canvasRef) as HTMLCanvasElement
            canvas.addEventListener("mousemove", mouseMove)
            canvas.addEventListener("click", mouseClick)
            // initialize painter
        })

        let paintDevice: IPaintDevice | null = null
        let painter: Painter | null = null

        expose({
            getPaintDevice() {
                if (isNil(paintDevice)) {
                    const canvas = unref(canvasRef) as HTMLCanvasElement
                    paintDevice = {
                        get painter(): Painter {
                            if (isNil(painter)) {
                                painter = new Painter(canvas)
                            }
                            return painter
                        },
                        get events(): IObservable<IPaintDeviceEvents> {
                            return events
                        },
                        get width(): number {
                            return canvas.width
                        },
                        get height(): number {
                            return canvas.height
                        },
                        get size(): ISize2D {
                            return {
                                height: canvas.height,
                                width: canvas.width,
                            }
                        },
                        get rect(): IRect2D {
                            return {
                                x: 0,
                                y: 0,
                                width: canvas.width,
                                height: canvas.height,
                            }
                        },
                    }
                }
                return paintDevice
            },
        })

        return {
            canvas: canvasRef,
        }
    }
})
</script>

<template>
    <canvas ref="canvas" :width="width" :height="height"/>
</template>
