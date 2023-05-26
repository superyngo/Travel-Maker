<template>
  <div v-for="project of projectsDB" :key="project.id">
    <teleport to="body" v-if="modalIsOpen[project.id]">
      <div class="modal">
        <div class="modalBackground">
          <form>
            <input
              v-model="state.tempProject.name"
              placeholder="Project Name"
            />
            <input
              v-model="state.tempProject.destination"
              placeholder="Destination"
            />
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
            <button @click.prevent="ProjectsDB.removeProject">remove</button>
          </form>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import {reactive, watchEffect} from "vue";
import {storeToRefs} from "pinia";
import {useProjectsDB} from "/src/stores/ProjectsStore.js";
const ProjectsDB = useProjectsDB();
const {
  projectsDB,
  selectedProjectID,
  selectedProject,
  modalIsOpen,
  isNewMark,
  selectedProjectIndex,
} = storeToRefs(ProjectsDB);
const state = reactive({
  tempProject: {},
});
const emits = defineEmits(["removeProjectInside"]);
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
  delete isNewMark.value[selectedProjectID.value];
  projectsDB.value[selectedProjectIndex.value] = ProjectsDB.deepCopyFunction(
    state.tempProject
  );
  closeModal();
};

const cancel = function () {
  closeModal();
  if (isNewMark.value[selectedProjectID.value]) {
    ProjectsDB.removeProject();
  } else {
    initialize();
  }
};

const initialize = function () {
  state.tempProject = ProjectsDB.deepCopyFunction(selectedProject.value);
};

const closeModal = function () {
  delete modalIsOpen.value[selectedProjectID.value];
};

watchEffect(() => {
  selectedProjectID.value;
  initialize();
});
</script>

<style scoped lan="scss">
input {
  display: block;
  width: 95%;
}
</style>
