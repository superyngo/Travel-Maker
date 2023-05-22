<template>
  <div class="container">
    <GoogleMap v-for="i of 1" :idProp="i"></GoogleMap>
  </div>
</template>

<script setup>
import {onMounted} from "vue";
import {Loader} from "@googlemaps/js-api-loader";
import GoogleMap from "./components/GoogleMap.vue";
import {useProjectsDB} from "./stores/ProjectsStore.js";
const ProjectsDB = useProjectsDB();

const initMap = async () => {
  const loader = new Loader({
    apiKey: "AIzaSyAUnQZuVbSFm-UyBkDX9W9atlfFZeKN-DM",
    version: "weekly",
    libraries: ["places"],
    language: "zh-TW",
  });
  ProjectsDB.google = await loader.load();
};

onMounted(async () => {
  initMap();
  await ProjectsDB.getCurrentPositionAsync();
});
</script>
