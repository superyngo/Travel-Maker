<template>
  <div class="dailyMainContainer" v-if="selectedProjectID !== -1">
    <div class="dailyPanel">
      <div class="upper">
        <div class="selectPanel">
          <span class="emoji" style="font-size: 1.7rem; line-height: 1.6rem"
            >🗓</span
          >
          <select v-model="selectedDateIndex" class="dateSelect">
            <option selected disabled :value="-1">Date</option>
            <option
              v-for="(date, index) of selectedProjectNodesDates"
              :value="index"
            >
              {{ date }}
            </option>
          </select>
          <div class="selectedDateButton">
            <button
              @click="
                selectedDateIndex > 0 ? selectedDateIndex-- : selectedDateIndex
              "
            >
              ⬅️
            </button>
            <button
              @click="
                selectedDateIndex < selectedProjectNodesDates.length - 1
                  ? selectedDateIndex++
                  : selectedDateIndex
              "
            >
              ➡️
            </button>
          </div>
        </div>
        <dailyInfo></dailyInfo>
      </div>
      <dailyBrief class="downer"></dailyBrief>
    </div>
    <dailyLine />
  </div>
</template>

<script setup>
import {watch, onBeforeMount} from "vue";
import {storeToRefs} from "pinia";
import {useProjectsDB} from "/src/stores/ProjectsStore.js";
import {useRoute} from "vue-router";
import dailyInfo from "/src/components/dailyPage/dailyInfo.vue";
import dailyLine from "/src/components/dailyPage/dailyLine.vue";
import dailyBrief from "/src/components/dailyPage/dailyBrief.vue";

const route = useRoute();
const ProjectsDB = useProjectsDB();
const {
  //deconstruct ProjectsDB
  selectedProjectID,
  selectedProjectNodesDates,
  selectedDateIndex,
} = storeToRefs(ProjectsDB);

onBeforeMount(() => {
  //initially fetch nodes data
  selectedProjectID.value === -1 &&
    (selectedProjectID.value = route.query.ProjectID);
  ProjectsDB.fetchSelectedProjectNodes();
});

watch(
  //fetch new project's nodes when selected project changed
  () => selectedProjectID.value,
  (newValue) => {
    if (newValue === -1) return;
    console.log("Selected project changed");
    ProjectsDB.fetchSelectedProjectNodes();
  }
);

// watch(
//   //save nodes data when nodes data changed
//   () => selectedProjectNodes.value,
//   () => {
//     if (selectedProjectID.value === -1) return;
//     //save nodes data
//     console.log(`node ${selectedProjectID.value} nodes data was changed`);
//     ProjectsDB.exportNodesDB();
//   }
// );
</script>

<style>
.dailyMainContainer {
  margin-left: var(--navWidth);
  display: grid;
  gap: 1rem;
  width: calc(100svw - var(--navWidth));
  height: 100svh;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  color: var(--text-secondary);
}
.dailyMainContainer select,
.dailyMainContainer option,
.dailyMainContainer button {
  color: var(--text-secondary);
}
.emoji {
  display: inline-block;
  width: 2rem;
  color: var(--visual-secondary);
  font-weight: 700;
}
.dailyPanel {
  margin: var(--margin);
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 2fr;
  gap: var(--margin);
}
.selectPanel {
  position: relative;
  width: 100%;
  height: 2rem;
}
.dateSelect {
  position: absolute;
  height: 100%;
  border: none;
  z-index: 0;
}
.selectedDateButton {
  position: absolute;
  left: 8rem;
  top: 0.1rem;
}
.selectedDateButton button {
  cursor: pointer;
  border: none;
  background-color: transparent;
  font-size: 1rem;
}
.dailyMainContainer button:hover {
  scale: 1.1;
}
.dailyMainContainer button:active {
  scale: 0.9;
}
</style>
