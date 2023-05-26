<template>
  <myNav></myNav>
  <div class="main">
    <router-view></router-view>
  </div>
  <editProject></editProject>
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
const {projectsDB, selectedProjectID} = storeToRefs(ProjectsDB);

onBeforeMount(async () => {
  ProjectsDB.fetchProjectDB();
  initMap();
  await ProjectsDB.getCurrentPositionAsync();
});

const routeToProject = function () {
  if (selectedProjectID.value === "-1") {
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
    apiKey: "AIzaSyAUnQZuVbSFm-UyBkDX9W9atlfFZeKN-DM",
    version: "weekly",
    libraries: ["places"],
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
  () => projectsDB.value.length,
  () => {
    console.log("ProjectsDB changed");
    ProjectsDB.exportProjectDB();
  }
);
</script>

<style lan="scss">
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+TC&display=swap");
:root {
  font-size: 16px;
  font-family: "Noto Sans TC", sans-serif;
  --transition-speed: 600ms;
  --navWidth: 5rem;
  --bg-primary: #23232e;
  --bg-secondary: #141418;
  --text-primary: #f0eeee;
  --text-secondary: #002b2f;
  --visual-primary: #4fffedc3;
  --visual-secondary: #1a4c47;
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
*::-webkit-scrollbar {
  width: 0.25rem;
}
*::-webkit-scrollbar-track {
  background-color: #1e1e24;
}
*::-webkit-scrollbar-thumb {
  background-color: #bdc4c4;
}
.main {
  /* position: relative; */
  margin-left: var(--navWidth);
  /* width: calc(100svw - var(--navWidth)); */
  height: 100svh;
  border: 2px solid red;
}
</style>
