<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    props: {
        current: Number,
        label: String,
    },
})
</script>

<template>
    <div class="progress-bar">
        <label>
            <progress v-if="current != null" :value="current" max=1></progress>
            <div v-else class="progress" ></div>
            {{label}}
        </label>
    </div>
</template>

<style lang="scss" scoped>
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

        box-sizing: border-box;

        height: $progress-bar-height;
        width: 100%;

        padding: $progress-bar-padding;

        &::-webkit-progress-bar {
            background: transparent;
        }
        &::-webkit-progress-value {
            background: $progress-bar-color;
        }
    }

    .progress {
        display: block;
        border:
            $progress-bar-border-width
            $progress-bar-border-type
            $progress-bar-border-color;

        box-sizing: border-box;

        height: $progress-bar-height;
        width: 100%;

        padding: $progress-bar-padding;

        &:before {
            display: block;
            background-color: white;
            content: '';

            width: $progress-bar-undeterminate-value-width;
            height: 100%;

            animation: 1s ease-in-out infinite alternate progress-value-animation;
            -webkit-animation: 1s ease-in-out infinite alternate progress-value-animation;
        }
    }

    @keyframes progress-value-animation {
        to {
            transform: translateX(100%*math.div(100%, $progress-bar-undeterminate-value-width - 1));
        }
    }
    @-webkit-keyframes progress-value-animation {
        to {
            transform: translateX(100%*math.div(100%, $progress-bar-undeterminate-value-width - 1));
        }
    }
}
</style>
