<template>
  <div class="appContainer">
    <myNav></myNav>
    <router-view></router-view>
    <editProject v-if="modalIsOpen[selectedProjectID]"></editProject>
  </div>
</template>

<script setup>
import {onBeforeMount, watch} from "vue";
import {useRouter} from "vue-router";
import {storeToRefs} from "pinia";
import {useProjectsDB} from "./stores/ProjectsStore.js";
import {Loader} from "@googlemaps/js-api-loader";
import editProject from "./components/editProject.vue";
import myNav from "./components/myNav.vue";

const router = useRouter();
const ProjectsDB = useProjectsDB();
const {selectedProjectID, selectedProject, modalIsOpen, apiKey} =
  storeToRefs(ProjectsDB);

onBeforeMount(async () => {
  ProjectsDB.fetchProjectDB();
  initMap();
  await ProjectsDB.getCurrentPositionAsync();
});

const routeToProject = function () {
  if (selectedProjectID.value === -1) {
    router.push({
      name: "home",
    });
  } else {
    router.push({
      name: "dailyMain",
      query: {ProjectID: selectedProjectID.value},
    });
  }
};

const initMap = async () => {
  const loader = new Loader({
    apiKey: apiKey.value,
    version: "weekly",
    libraries: ["places", "geometry"],
    language: "zh-TW",
  });
  ProjectsDB.google = await loader.load();
};

watch(
  //route to the project
  () => selectedProjectID.value,
  () => {
    routeToProject();
  }
);

watch(
  //save ProjectDB
  () => selectedProject.value?.nodesID,
  () => {
    console.log("ProjectsDB changed");
    ProjectsDB.exportProjectDB();
  }
  // {deep: true}
);
</script>

<style>
.appContainer {
  position: relative;
  width: 100svw;
  height: 100svh;
}
</style>
