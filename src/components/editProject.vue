<template>
  <teleport to="body">
    <div class="modal">
      <div class="modalBackground">
        <form class="editProjectFrom">
          <input v-model="state.tempProject.name" placeholder="Project Name" />
          <input
            v-model="state.tempProject.destination"
            placeholder="Destination"
            ref="inputDestinationDom"
            id="inputDestinationDom"
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
          <label
            ><input
              type="checkbox"
              v-model="state.tempProject.fixedDate"
            /><span style="font-size: 0.8rem; margin-left: 0.5rem"
              >Fixed date</span
            ></label
          >
          <div class="buttonContainer">
            <button type="submit" @click.prevent="submit">confirm</button>
            <button type="submit" @click="cancel">cancel</button>
            <button @click.prevent="ProjectsDB.removeProject">remove</button>
          </div>
        </form>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import {reactive, watchEffect, ref, onMounted} from "vue";
import {storeToRefs} from "pinia";
import {useProjectsDB} from "/src/stores/ProjectsStore.js";
const ProjectsDB = useProjectsDB();
const {
  //deconstruct state
  projectsDB,
  selectedProjectID,
  selectedProject,
  modalIsOpen,
  isNewMark,
  fixedDate,
  selectedProjectIndex,
} = storeToRefs(ProjectsDB);

const state = reactive({
  tempProject: {},
});

const inputDestinationDom = ref(null);
const emits = defineEmits(["removeProjectInside"]);
const submit = function () {
  if (
    !state.tempProject.dateStartEnd[0] ||
    !state.tempProject.dateStartEnd[1]
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
  if (state.tempProject.fixedDate) {
    ProjectsDB.exportNodesDB();
  }

  ProjectsDB.fetchSelectedProjectNodes();
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

onMounted(() => {
  const inputAutocomplete = inputDestinationDom.value;
  const options = {
    fields: ProjectsDB.fields,
    types: [
      "administrative_area_level_1",
      "administrative_area_level_2",
      "administrative_area_level_3",
      "administrative_area_level_4",
      "country",
    ],
  };
  const autocomplete = new ProjectsDB.google.maps.places.Autocomplete(
    inputAutocomplete,
    options
  );

  autocomplete.addListener("place_changed", () => {
    // Create a search event listener
    const place = autocomplete.getPlace();
    state.tempProject.destination = place.name;
    inputAutocomplete.value = place.name;
    console.log(place);
    state.tempProject.place = place;
  });
});

watchEffect(() => {
  selectedProjectID.value;
  initialize();
});
</script>

<style scoped lan="scss">
.editProjectFrom {
  display: grid;
}
</style>
