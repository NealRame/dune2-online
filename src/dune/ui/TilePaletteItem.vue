<script lang="ts">
import { defineComponent, onMounted, ref, toRefs, unref } from "vue"

import { TileDescriptor } from "@/dune2/types"
import { ScaleFactor, Scene, Tile } from "@/engine"
import { Painter } from "@/graphics"

function blobToDataURL(blob: Blob): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.onabort = reject
        reader.readAsDataURL(blob)
    })
}

export default defineComponent({
    name: "TilePaletteItem",
    props: ["tile", "index", "scale"],
    setup(props: { tile: TileDescriptor, scale: ScaleFactor}) {
        const { tile: tileRef, scale: scaleRef } = toRefs(props)
        const imageRef = ref<string | null>(null)

        onMounted(async () => {
            const { images, shape } = unref(tileRef)
            const scale = unref(scaleRef) ?? 2

            const { width: imageW, height: imageH } = images[0][scale]
            const canvasW = imageW*shape.columns
            const canvasH = imageH*shape.rows
            const canvas = new OffscreenCanvas(canvasW, canvasH)

            const tileSize = {
                width: canvasW/(scale*16),
                height: canvasH/(scale*16),
            }

            const scene = new Scene(tileSize, new Painter(canvas))
            scene.scale = scale

            const tile = new Tile(scene, tileSize, images)
            scene.addItem(tile)
            scene.render()

            const blob = await canvas.convertToBlob()
            const dataURL = await blobToDataURL(blob)

            imageRef.value = dataURL
        })

        return {
            image: imageRef
        }
    },
})
</script>

<template>
    <label>
        <input type="radio" name="palette-item"/>
        <img :src="image" :title="index">
    </label>
</template>

<style lang="scss" scoped>
input[type=radio] {
    opacity: 0;
    position: absolute;
    height: 0;
    width: 0;
    & + img {
        border: 1px solid gray;
        display: inline-block;
        margin: 1px;
        &:hover {
            border-color:red;
        }
    }
    &:checked + img {
        border-color: rgb(221, 136, 38);
    }
}
</style>
