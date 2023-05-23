<template>
  <div id="e1_inline"></div>
  <input
    type="text"
    ref="input"
    :value="modelvale"
    @input="emits('update:modelvalue')"
  />
</template>

<script setup>
import {ref} from "vue";
import fg from "/src/utils/fg.timepicker.js";
const input = ref(null);
const props = defineProps({modelvalue: Text});
const emits = defineEmits(["update:modelvalue"]);
let TP = new fg.Timepicker({
  bindContainer: document.getElementById("e1_inline"),
  // bindInput: input.value,
  animatePopup: false,
});
console.log(TP);
</script>

<style scoped lan="scss" src="/src/utils/fg.timepicker.css"></style>
