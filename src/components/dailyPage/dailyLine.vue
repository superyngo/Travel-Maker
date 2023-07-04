<template>
  <div class="mainLineContainer">
    <button class="newNodeButton" @click="newNode">
      <svg
        style="
          width: 1rem;
          position: relative;
          top: 0.1rem;
          margin: auto 0.2rem;
        "
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
    <dateNodesButtonsLine />
  </div>
</template>

<script setup>
import {storeToRefs} from "pinia";
import {useProjectsDB} from "/src/stores/ProjectsStore.js";
import dateNodesButtonsLine from "/src/components/dateNodesButtonsLine.vue";
const ProjectsDB = useProjectsDB();
const {
  //deconstruct ProjectsDB
  modalIsOpen,
  isNewMark,
  selectedProject,
  selectedProjectNodes,
  selectedProjectNodesDates,
  selectedDateIndex,
  nodeSortedByTime,
  selectedDate,
} = storeToRefs(ProjectsDB);

const newNode = function () {
  const lastNode =
    nodeSortedByTime.value[1][selectedDate.value]?.[
      nodeSortedByTime.value[1][selectedDate.value]?.length - 1
    ];
  const lastNodeTime = lastNode?.time
    ? ProjectsDB.timeToNumber(lastNode.time) < 1380
      ? ProjectsDB.numberToTime(ProjectsDB.timeToNumber(lastNode.time) + 60)
      : lastNode.time
    : "07:00";
  const place = lastNode?.node.place || selectedProject.value.place;
  const emptyNode = {
    id: crypto.randomUUID(),
    name: "New activity",
    nodeTypes: -1,
    address: null,
    startTime: [
      selectedProjectNodesDates.value[selectedDateIndex.value],
      lastNodeTime,
    ],
    endTime: ["", ""],
    phone: null,
    geoLocation: [],
    googleMap: null,
    childrenCount: null,
    reservation: {},
    place: place,
  };
  selectedProjectNodes.value.push(emptyNode);
  isNewMark.value[emptyNode.id] = true;
  modalIsOpen.value[emptyNode.id] = true;
};
</script>

<style scoped>
.mainLineContainer {
  /* border: 10px solid blue; */
  /* height: 10%; */
  margin: var(--margin);
  position: relative;
  display: grid;
}
.newNodeButton {
  position: absolute;
  left: calc(0% - var(--margin) * 2);
  z-index: 1;
  filter: grayscale(70%) opacity(0.7);
  rotate: 0deg;
  transition: all var(--transition-speed) ease;
  background-color: var(--text-primary);
  border-radius: 0.5rem;
  border: 0.2rem solid var(--visual-secondary);
  cursor: pointer;
}

.newNodeButton:hover {
  filter: grayscale(0%) opacity(1);
  rotate: 90deg;
}
</style>
