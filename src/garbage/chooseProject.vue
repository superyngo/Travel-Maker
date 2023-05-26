<template>
  <div class="container">
    <select v-model="selectedProjectID">
      <option selected disabled :value="-1">Choose Project</option>
      <option
        v-for="(project, index) of projectsDB"
        :value="project?.id"
        :key="index"
      >
        {{ project?.name }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useProjectsDB } from "/src/stores/ProjectsStore.js";
const ProjectsDB = useProjectsDB();
const { projectsDB, selectedProjectID } = storeToRefs(ProjectsDB);
</script>
