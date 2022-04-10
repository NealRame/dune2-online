<script lang="ts">
import { defineComponent } from "vue"

let inputRangeCount = 0

export default defineComponent({
    name: "InputRange",
    emits: ["update:modelValue"],
    props: {
        label: {
            type: String,
            default: () => `input-range-${++inputRangeCount}`,
        },
        min: {
            type: Number,
            default: -1.0,
        },
        max: {
            type: Number,
            default: 1.0,
        },
        step: {
            type: Number,
            default: 0.1,
        },
        modelValue: Number,
    },
    setup(props, { emit, expose }) {
        expose({})
        return {
            onInput: (ev: Event) => {
                const input = ev.target as HTMLInputElement
                const value = parseFloat(input.value)
                if (!isNaN(value)) {
                    emit("update:modelValue", value)
                }
            },
        }
    },
})
</script>

<template>
    <div class="spin-box">
        <input v-if="label"
            ref="input"
            type="number"
            :id="label"
            :step="step"
            :min="min"
            :max="max"
            :value="modelValue"
            @input="onInput"
        >
    </div>
</template>
