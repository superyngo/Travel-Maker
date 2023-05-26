<template>
  <div class="dailyInfoContainer">
    <!-- <div>{{ selectedProjectID }}</div>
    <div>{{ selectedProjectNodesID }}</div> -->
    <div class="date">
      <span class="emoji">📅：</span>
      <span class="infoText"
        >{{
          selectedProjectNodesDates[0].substring(
            selectedProjectNodesDates[0].length - 5
          )
        }}<span v-if="selectedProjectNodesDates.length > 1"
          >~{{
            selectedProjectNodesDates[
              selectedProjectNodesDates.length - 1
            ].substring(selectedProjectNodesDates[0].length - 5)
          }}</span
        ></span
      >
    </div>
    <div class="location">
      <span class="emoji" style="letter-spacing: 0.5ch">📍:</span>
      <span class="infoText">宜蘭</span>
    </div>
    <div class="weather">
      <span class="emoji">
        <span
          style="font-size: 1.2rem; letter-spacing: 0.5ch; margin-left: 0.1rem"
          >🌡</span
        >:
      </span>
      <span class="infoText">晴時多雲</span>
    </div>
    <div class="astronomicalPhenomenon">
      <span class="emoji" style="letter-spacing: 0.5ch">🌅:</span>
      <span class="infoText">天文現象</span>
    </div>
  </div>
</template>

<script setup>
import {useProjectsDB} from "/src/stores/ProjectsStore.js";
import {storeToRefs} from "pinia";
const ProjectsDB = useProjectsDB();
const {selectedProjectID, selectedProjectNodesID, selectedProjectNodesDates} =
  storeToRefs(ProjectsDB);
</script>

<style scoped>
.dailyInfoContainer {
}
.infoText {
  margin-left: 0.5rem;
}
</style>
