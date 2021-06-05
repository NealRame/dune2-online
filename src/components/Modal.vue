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

<script lang="ts">
import { defineComponent } from "vue"
import gsap from "gsap"

export default defineComponent({
    props: ["show"],
    setup() {
        return {
            fadeOut(el: HTMLElement, done: () => void) {
                gsap.to(el, {
                    duration: 0.25,
                    opacity: 0,
                    onComplete: done
                })
            },
        }
    }
})
</script>
