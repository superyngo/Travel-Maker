<template>
  <form>
    <input v-model="state.tempProject.name" placeholder="Project Name" />
    <input v-model="state.tempProject.destination" placeholder="Destination" />
    <input
      type="number"
      v-model="state.tempProject.headCount"
      placeholder="Heads count"
    />
    <input
      type="number"
      v-model="state.tempProject.childrenCount"
      placeholder="Children"
    />
    <input
      type="Date"
      v-model="state.tempProject.dateStartEnd[0]"
      placeholder="Start Date"
    />
    <input
      type="Date"
      v-model="state.tempProject.dateStartEnd[1]"
      placeholder="End Date"
    />
    <button type="submit" @click.prevent="submit">confirm</button>
    <button type="submit" @click="cancel">cancel</button>
    <button @click.prevent="emits('removeProjectInside')">remove</button>
  </form>
</template>

<script setup>
import {reactive, onBeforeMount} from "vue";
import {useProjectsDB} from "/src/stores/ProjectsStore.js";
const ProjectsDB = useProjectsDB();
const state = reactive({
  tempProject: {},
});
const emits = defineEmits(["removeProjectInside"]);
const props = defineProps({project: Object});

const submit = function () {
  if (
    !state.tempProject.dateStartEnd[1] ||
    !state.tempProject.dateStartEnd[0]
  ) {
    alert("Start and End Date must be filled");
    return;
  }
  if (state.tempProject.dateStartEnd[1] < state.tempProject.dateStartEnd[0]) {
    alert("End Date must be later than Start Date");
    return;
  }
  delete ProjectsDB.isNewMark[props.project.id];
  ProjectsDB.projectsDB[ProjectsDB.selectedProjectIndex] =
    ProjectsDB.deepCopyFunction(state.tempProject);
  closeModal();
};

const cancel = function () {
  closeModal();
  if (ProjectsDB.isNewMark[props.project.id]) {
    emits("removeProjectInside");
    initialize();
  } else {
    initialize();
  }
};

const initialize = function () {
  state.tempProject = ProjectsDB.deepCopyFunction(props.project);
};

const closeModal = function () {
  delete ProjectsDB.modalIsOpen[props.project.id];
};

onBeforeMount(() => {
  initialize();
});
</script>

<style scoped lan="scss">
input {
  display: block;
  width: 95%;
}
</style>
