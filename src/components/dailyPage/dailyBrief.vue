<template>
  <div class="briefContainer">
    <GoogleMapBrief
      v-if="ProjectsDB.nodeSortedByTime[1][ProjectsDB.selectedDate]?.length > 0"
    ></GoogleMapBrief>
  </div>
</template>
<script setup>
import GoogleMapBrief from "/src/components/GoogleMap-brief.vue";
import {useProjectsDB} from "/src/stores/ProjectsStore.js";
const ProjectsDB = useProjectsDB();
</script>
<style>
.briefContainer {
  border: 1px solid black;
  height: 100%;
}
</style>
