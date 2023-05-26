<template>
  <div class="nodeButtonContainer">
    <div
      v-for="node of handler ? selectedDateStartNodes : selectedDateEndNodes"
      :key="node.id"
    >
      <button @click="modalIsOpen[node.id] = true" class="nodesButtons">
        <span v-if="handler"> {{ node.startTime[1] }} go </span>
        <span v-else> {{ node.endTime[1] }} finish </span>
        <span>{{ node.name }}</span>
      </button>
      <editNode :node="node"></editNode>
    </div>
  </div>
</template>
<script setup>
import {ref} from "vue";
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
} = storeToRefs(ProjectsDB);

const nodeStartTimeArray = ref([]);
selectedDateStartNodes.value.forEach((node) =>
  nodeStartTimeArray.value.push(node.startTime[1])
);
console.log(nodeStartTimeArray.value);

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

selectedDateEndNodes.value.forEach((node) => {
  if (node.endTime[1] === "") {
    return;
  }
  const [targetNodeIndex, margin] = getIndexOfClosestNumberAndMargin(
    node.endTime[1],
    nodeStartTimeArray.value
  );
});
</script>
<style scoped>
.nodeButtonContainer {
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
  padding: 0.5rem;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  filter: grayscale(70%) opacity(0.7);
  transition: var(--transition-speed);
  border-radius: 0.5rem;
}
.nodesButtons:hover {
  filter: grayscale(0%) opacity(1);
  cursor: pointer;
}
</style>
