<template>
  <div class="container">
    <div>{{ selectedProjectID }}</div>
    <div>{{ selectedProjectNodesID }}</div>
    <div class="date">{{ selectedProjectNodesDates }}</div>
    <div class="location">宜蘭</div>
    <div class="weather">晴時多雲</div>
    <div class="astronomicalPhenomenon">天文現象</div>
  </div>
</template>

<script setup>
import { useProjectsDB } from "/src/stores/ProjectsStore.js";
import { storeToRefs } from "pinia";
const ProjectsDB = useProjectsDB();
const { selectedProjectID, selectedProjectNodesID, selectedProjectNodesDates } =
  storeToRefs(ProjectsDB);
</script>

<style scoped>
.container {
  border: 1px solid black;
}
</style>
