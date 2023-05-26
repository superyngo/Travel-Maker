<template>
  <button class="newNodeButton" @click="newNode">
    <svg
      style="width: 1rem; position: relative; top: 0.1rem; margin: auto 0.2rem"
      aria-hidden="true"
      focusable="false"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 448 512"
    >
      <!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
      <path
        fill="currentColor"
        style="color: var(--visual-secondary)"
        d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
      />
    </svg>
  </button>
  <div class="mainLineContainer">
    <div class="splitter"></div>

    <div class="startNodes nodeButtonLinePart">
      <DateNodesButtonsLine :handler="true" />
    </div>
    <div class="endNodes nodeButtonLinePart">
      <DateNodesButtonsLine :handler="false" />
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, onUpdated} from "vue";
import {storeToRefs} from "pinia";
import {useProjectsDB} from "/src/stores/ProjectsStore.js";
import DateNodesButtonsLine from "/src/components/DateNodesButtonsLine.vue";
const ProjectsDB = useProjectsDB();
const {
  //deconstruct ProjectsDB
  modalIsOpen,
  isNewMark,
  SelectedProjectNodes,
  selectedProjectNodesDates,
  selectedDateIndex,
} = storeToRefs(ProjectsDB);

const nodes = ref(null);

// const setNodesPosition = function () {
//   //set the nodes position on dailyLine
//   props.selectedDateIndex === props.currentDayIndex &&
//     nodes.value &&
//     nextTick(() => {
//       nodes.value.forEach((node, index) => {
//         node.style.setProperty("--sequence", index + 1);
//         node.style.setProperty("--nodesCount", nodes.value.length + 1);
//       });
//     });
// };

const newNode = function () {
  const emptyNode = {
    id: crypto.randomUUID(),
    name: "New activity",
    nodeTypes: "-1",
    address: null,
    startTime: [
      selectedProjectNodesDates.value[selectedDateIndex.value],
      "12:00",
    ],
    endTime: ["", ""],
    phone: null,
    geoLocation: [],
    googleMap: null,
    childrenCount: null,
    reservation: {},
  };
  SelectedProjectNodes.value.push(emptyNode);
  isNewMark.value[emptyNode.id] = true;
  modalIsOpen.value[emptyNode.id] = true;
};

onMounted(() => {
  //set nodes position
  // setNodesPosition();
});

onUpdated(() => {
  //set the nodes position on dailyLine
  // setNodesPosition();
});
</script>

<style scoped>
.mainLineContainer {
  height: 100%;
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
}
.splitter {
  left: 50%;
  position: absolute;
  border: 1px solid var(--text-secondary);
  height: 100%;
}
.newNodeButton {
  position: absolute;
  z-index: 1;
  filter: grayscale(70%) opacity(0.7);
  rotate: 0deg;
  transition: all var(--transition-speed) ease;
  background-color: var(--text-primary);
  border-radius: 0.5rem;
  cursor: pointer;
}

.newNodeButton:hover {
  filter: grayscale(0%) opacity(1);
  rotate: 90deg;
}

.nodeButtonLinePart {
  position: relative;
}
</style>
