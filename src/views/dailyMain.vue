<template>
  <div
    id="dailyMain"
    v-if="selectedProjectID !== '-1' && selectedProjectNodesDates.length !== 0"
  >
    <div class="dailyInfo">
      <select v-model="state.selectedDateIndex">
        <option selected disabled value="-1">第幾天</option>
        <option
          v-for="(date, index) of selectedProjectNodesDates"
          :value="index"
        >
          {{ date }}
        </option>
      </select>
      <dailyInfo daily-data=""></dailyInfo>
      <GoogleMap />
    </div>
    <div class="dailyLine">
      <button class="newNode" @click="newNode">new node</button>
      <dailyLine
        v-for="(nodesByDate, index) of nodesGroupedByDateStart"
        :currentDayNodes="nodesByDate"
        :currentDayIndex="index"
        :selectedDateIndex="Number(state.selectedDateIndex)"
        :key="index"
      />
    </div>
    <div class="mainBoard"></div>
  </div>
</template>

<script setup>
import {watch, reactive, onBeforeMount} from "vue";
import {storeToRefs} from "pinia";
import {useProjectsDB} from "/src/stores/ProjectsStore.js";
import {useRoute} from "vue-router";
import dailyInfo from "/src/components/dailyPage/dailyInfo.vue";
import dailyLine from "/src/components/dailyPage/dailyLine.vue";
import GoogleMap from "/src/components/GoogleMap.vue";

const route = useRoute();
const state = reactive({
  selectedDateIndex: 0,
  saveData: {storageType: "localStorage"},
});
const ProjectsDB = useProjectsDB();
const {
  //deconstruct ProjectsDB
  selectedProjectID,
  nodesGroupedByDateStart,
  SelectedProjectNodes,
  selectedProjectNodesDates,
  isNewMark,
  modalIsOpen,
} = storeToRefs(ProjectsDB);

const newNode = function () {
  const emptyNode = {
    id: crypto.randomUUID(),
    name: "New activity",
    nodeTypes: "-1",
    address: null,
    startTime: [
      selectedProjectNodesDates.value[state.selectedDateIndex],
      "12:00",
    ],
    endTime: [],
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

onBeforeMount(() => {
  //initially fetch nodes data
  selectedProjectID.value === "-1" &&
    (selectedProjectID.value = route.query.ProjectID);
  ProjectsDB.fetchSelectedProjectNodes();
});

watch(
  //fetch new project's nodes when selected project changed
  () => selectedProjectID.value,
  (newValue) => {
    if (newValue === "-1") return;
    console.log("Selected project changed");
    ProjectsDB.fetchSelectedProjectNodes();
    state.selectedDateIndex = 0;
  }
);

watch(
  //save nodes data when nodes data changed
  () => SelectedProjectNodes.value,
  (newValue) => {
    //save nodes data
    console.log(`node ${selectedProjectID.value} nodes data was changed`);
    ProjectsDB.exportNodesDB();
  },
  {deep: true}
);
</script>

<style lan="scss">
#dailyMain {
  width: 100%;
  height: 100svh;
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 1fr 3fr;
  align-items: center;
  > * {
    border: 1px solid black;
  }
  > .dailyLine {
    grid-row-start: span 2;
  }
}
</style>
