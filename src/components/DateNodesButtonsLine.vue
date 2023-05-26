<template>
  <div class="nodeButtonContainer">
    <div
      v-for="node of handler ? selectedDateStartNodes : selectedDateEndNodes"
      :key="node.id"
    >
      <button
        ref="nodesButtonDom"
        @click="modalIsOpen[node.id] = true"
        class="nodesButtons"
      >
        <span v-if="handler"> {{ node.startTime[1] }} go </span>
        <span v-else> {{ node.endTime[1] }} finish </span>
        <span>{{ node.name }}</span>
      </button>
      <editNode :node="node"></editNode>
    </div>
  </div>
</template>
<script setup>
import {ref, onUpdated, nextTick, watch} from "vue";
import {storeToRefs} from "pinia";
import {useProjectsDB} from "/src/stores/ProjectsStore.js";
import editNode from "/src/components/dailyPage/editNode.vue";
const ProjectsDB = useProjectsDB();
const props = defineProps({handler: Boolean});
const {
  //deconstruct ProjectsDB
  modalIsOpen,
  selectedDateStartNodes,
  selectedDateEndNodes,
  startNodesTopMarginArray,
} = storeToRefs(ProjectsDB);
const nodesButtonDom = ref([]);
const getIndexOfClosestNumberAndMargin = function (target, numbers) {
  let closestIndex = 0; // Assume the first number is the closest initially
  for (let i = 1; i < numbers.length; i++) {
    if (
      Math.abs(target - numbers[i]) < Math.abs(target - numbers[closestIndex])
    ) {
      closestIndex = i;
    }
  }
  const margin = target - numbers[closestIndex];
  return [closestIndex, margin];
};
const timeToNumber = function (timeString) {
  if (Array.isArray(timeString)) {
    return timeString.map((i) => timeToNumber(i));
  }
  const [hours, minutes] = timeString.split(":");
  const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
  return isNaN(totalMinutes) ? 0 : totalMinutes;
};

onUpdated(() => {
  startNodesTopMarginArray.value = [];
  if (!props.handler) {
    return;
  }
  // start nodes procedure
  nodesButtonDom.value.forEach((nodeDom) => {
    startNodesTopMarginArray.value.push(nodeDom.offsetTop);
  });
  console.log(startNodesTopMarginArray.value);
});
watch(
  () => startNodesTopMarginArray.value,
  () => {
    // end nodes procedure
    if (props.handler) {
      return;
    }
    const nodeStartTimeArray = ref([]);
    selectedDateStartNodes.value.forEach((node) =>
      nodeStartTimeArray.value.push(node.startTime[1])
    );
    selectedDateEndNodes.value.forEach((node, index) => {
      if (node.endTime[1] === "") {
        nodesButtonDom.value[index].style.position = "relative";
        nodesButtonDom.value[index].style.transform = "none";
        return;
      }
      const [targetNodeIndex, margin] = getIndexOfClosestNumberAndMargin(
        timeToNumber(node.endTime[1]),
        timeToNumber(nodeStartTimeArray.value)
      );
      console.table([targetNodeIndex, margin]);
      nodesButtonDom.value[index].style.position = "absolute";
      nextTick(() => console.log(startNodesTopMarginArray.value));
      nodesButtonDom.value[index].style.transform = `translate(-50%,40px)`;
    });
  },
  {deep: true}
);
</script>
<style scoped>
.nodeButtonContainer {
  border: 2px solid yellow;
  --margin: 1rem;
  position: absolute;
  height: calc(100% - (2 * var(--margin)));
  width: calc(100% - (2 * var(--margin)));
  margin: var(--margin);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  overflow: auto;
}
.nodesButtons {
  cursor: pointer;
  padding: 0.5rem;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  filter: grayscale(70%) opacity(0.7);
  transition: filter var(--transition-speed) ease;
  border-radius: 0.5rem;
}
.nodesButtons:hover {
  transform-origin: center center;

  filter: grayscale(0%) opacity(1);
}
</style>
