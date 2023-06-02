<template>
  <div class="dailyInfoContainer">
    <div class="date">
      <span class="emoji">📅：</span>
      <span class="infoText">
        {{
          selectedProjectNodesDates?.[1].substring(
            selectedProjectNodesDates[0].length - 5
          )
        }}
        <span v-if="selectedProjectNodesDates?.length > 2">
          ~{{
            selectedProjectNodesDates[
              selectedProjectNodesDates.length - 1
            ].substring(selectedProjectNodesDates[0].length - 5)
          }}
        </span>
        total {{ selectedProjectNodesDates?.length - 1 }} day<span
          v-if="selectedProjectNodesDates?.length - 1 > 1"
          >s</span
        >
      </span>
    </div>
    <div class="location">
      <span class="emoji" style="letter-spacing: 0.5ch">📍:</span>
      <span class="infoText">{{ selectedProject?.destination }}</span>
    </div>
    <!-- <div class="weather">
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
    </div> -->
    <!-- {{ selectedProjectNodes }}
    <hr />
    {{
      nodeSortedByTime[1][selectedDate]?.[
        nodeSortedByTime[1][selectedDate]?.length - 1
      ]
    }}
    <hr />
    {{ nodesGroupedByDatesAndTime }} -->
  </div>
</template>

<script setup>
import {useProjectsDB} from "/src/stores/ProjectsStore.js";
import {storeToRefs} from "pinia";
const ProjectsDB = useProjectsDB();
const {
  selectedProjectNodesDates,
  selectedProject,
  nodeSortedByTime,
  selectedDate,
  selectedProjectNodes,
  nodesGroupedByDatesAndTime,
} = storeToRefs(ProjectsDB);
</script>

<style scoped>
.dailyInfoContainer {
}
.infoText {
  margin-left: 0.5rem;
}
</style>
