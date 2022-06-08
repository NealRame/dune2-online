
<script lang="ts">
import { defineComponent } from "vue"

import { Easing, sequence } from "@/maths"

function fadeOutAnimation(frameCount: number) {
    return (el: HTMLElement, animationDone: () => void) => {
        const it = sequence(frameCount, Easing.Quadratic.easeIn)
        const animationCallback = () => {
            const { done, value } = it.next()
            el.style.opacity = String(1 - (value ?? 1))
            if (done) {
                animationDone()
            } else {
                requestAnimationFrame(animationCallback)
            }
        }
        animationCallback()
    }
}

export default defineComponent({
    props: ["show"],
    setup() {
        return {
            fadeOut: fadeOutAnimation(15),
        }
    }
})
</script>

<template>
    <transition name="modal" @leave="fadeOut" :css="false" >
        <div v-if="show" class="modal" tabindex=-1>
            <div class="modal-content">
                <slot></slot>
            </div>
        </div>
    </transition>
</template>

<style lang="scss" scoped>
.modal {
    display: block;
    opacity: 1;

    background-color: rgba($color: $modal-background-color, $alpha: $modal-opacity);
    z-index: $modal-z-index;

    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;

    overflow: hidden;
    outline: 0;

    .modal-content {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: $modal-content-width;
        padding: $modal-content-padding;
        margin: 0 auto;
    }
}
</style>
