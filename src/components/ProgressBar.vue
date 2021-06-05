<template>
    <div class="progress-bar">
        <label>
            <progress v-if="current != null" :value="current" max=1></progress>
            <progress v-else></progress>
            {{label}}
        </label>
    </div>
</template>

<style lang="scss" scoped>
@use "sass:math";

.progress-bar {
    label {
        display: block;
        color: $progress-bar-label-color;
        font-family: $progress-bar-label-font-family;
        font-size: $progress-bar-label-font-size;
        text-align: center;
    }

    progress {
        -webkit-appearance: none;
        appearance: none;

        display: block;
        border:
            $progress-bar-border-width
            $progress-bar-border-type
            $progress-bar-border-color;
        height: $progress-bar-height;
        width: 100%;
        padding: $progress-bar-padding;
        &::-webkit-progress-bar {
            background: transparent;
        }
        &::-webkit-progress-value {
            background: $progress-bar-color;
        }
        &:not([value])::-webkit-progress-value {
            transform: translateZ(0);
            width: $progress-bar-undetermined-value-size;
            animation: 1s ease-in-out infinite alternate progress-value-animation;
        }
    }
    @keyframes progress-value-animation {
        to {
            transform: translateX(100% * (100/$progress-bar-undetermined-value-size - 1));
        }
    }
    @-webkit-keyframes progress-value-animation {
        to {
            transform: translateX(100% * (100/$progress-bar-undetermined-value-size - 1));
        }
    }
}
</style>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    props: {
        current: Number,
        label: String,
    },
})
</script>
