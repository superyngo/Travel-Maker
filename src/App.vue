<template>
  <div v-for="project of projectsDB" :key="project.id">
    <teleport to="body">
      <div class="modal" v-if="modalIsOpen[project.id]">
        <div class="modalBackground">
          <editProject
            @removeProjectInside="removeProject"
            :project="project"
          ></editProject>
        </div>
      </div>
    </teleport>
  </div>
  <nav>
    <chooseProject></chooseProject>
    <button @click="openEditProject()">EDIT</button>
    <button @click="newProject">NEW</button>
    <button @click="removeProject">REMOVE</button><br />
    <button @click="selectedProjectID = '-1'">HOME</button>
  </nav>
  <router-view></router-view>
</template>

<script setup>
import {onBeforeMount, watch, ref} from "vue";
import {useRouter} from "vue-router";
import {storeToRefs} from "pinia";
import {useProjectsDB} from "./stores/ProjectsStore.js";
import {Loader} from "@googlemaps/js-api-loader";
import chooseProject from "./components/chooseProject.vue";
import editProject from "./components/editProject.vue";

const router = useRouter();
const ProjectsDB = useProjectsDB();
const {projectsDB, selectedProjectID, modalIsOpen, isNewMark} =
  storeToRefs(ProjectsDB);

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

const cleanSelect = function () {
  selectedProjectID.value = "-1";
};

const openEditProject = function () {
  modalIsOpen.value[selectedProjectID.value] = true;
};

const newProject = function () {
  const emptyProject = {
    id: crypto.randomUUID(),
    name: "new project",
    destination: null,
    dateStartEnd: [],
    headCount: null,
    childrenCount: null,
    nodesID: [],
  };
  projectsDB.value = [...projectsDB.value, emptyProject];

  selectedProjectID.value = projectsDB.value[projectsDB.value.length - 1].id;
  isNewMark.value[emptyProject.id] = true;
  openEditProject();
};

const removeProject = function () {
  if (selectedProjectID.value === "-1") return;
  let handler = () => confirm("Are you sure you want to remove this project");
  if (isNewMark.value[selectedProjectID.value]) {
    delete isNewMark.value[selectedProjectID.value];
    handler = () => true;
  }
  if (handler()) {
    ProjectsDB.removeProject();
    cleanSelect(); //clean after remove so the json would be removed
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
  (newValue) => {
    routeToProject();
  },
  {deep: true}
);

watch(
  //save ProjectDB
  () => projectsDB.value.length,
  () => {
    console.log("ProjectsDB changed");
    ProjectsDB.exportProjectDB();
  }
  // {deep: true}
);
</script>

<style lan="scss" scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
