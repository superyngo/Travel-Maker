<template>
  <div v-for="project of projectsDB">
    <dialog
      ref="editProjectDialogDom"
      id="editProjectDialogDom"
      v-if="project?.id === selectedProjectID"
    >
      <editProject @removeProjectInside="removeProject"></editProject>
    </dialog>
  </div>
  <nav>
    <chooseProject></chooseProject>
    <button @click="openEditProject">EDIT</button>
    <button @click="newProject">NEW</button>
    <button @click="removeProject">REMOVE</button><br />
    <button @click="selectedProjectID = '-1'">home</button>
  </nav>
  <router-view></router-view>
</template>

<script setup>
import {onBeforeMount, watch, ref, nextTick} from "vue";
import {useRouter} from "vue-router";
import {storeToRefs} from "pinia";
import {useProjectsDB} from "./stores/ProjectsStore.js";
import {Loader} from "@googlemaps/js-api-loader";
import chooseProject from "./components/chooseProject.vue";
import editProject from "./components/editProject.vue";
const router = useRouter();
const editProjectDialogDom = ref(null);
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

const cleanSelect = function () {
  selectedProjectID.value = "-1";
};

const openEditProject = function () {
  editProjectDialogDom.value[0].showModal();
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
  nextTick(() => {
    editProjectDialogDom.value[0].setAttribute("data-new", true);
    openEditProject();
  });
};

const removeProject = function () {
  if (selectedProjectID.value === "-1") return;
  let handler = () => confirm("Are you sure you want to remove this project");
  if (editProjectDialogDom.value[0].getAttribute("data-new")) {
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
  () => projectsDB.value,
  () => {
    console.log("ProjectsDB changed");
    ProjectsDB.exportProjectDB();
  },
  {deep: true}
);
</script>

<style lan="scss" scoped>
* {
  margin: 0;
  padding: 0;
}
#editProjectDialogDom {
  position: absolute;
  left: 50%;
  top: 50%;
  translate: -50% -50%;
  /* height: 100%;
  width: 100%; */
}
</style>
