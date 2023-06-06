<template>
  <teleport to="body" v-if="modalIsOpen[node.id]">
    <div class="modal">
      <div class="modalBackground">
        <div class="editWrapper">
          <GoogleMap
            :idProp="node.id"
            @pick="pick"
            :pickable="true"
            :startPlace="state.tempNode.place"
          ></GoogleMap>
          <form class="editForm">
            <div class="firstWrapper innerWrappers">
              <label class="label2">
                <span>Name:</span>
                <input
                  type="text"
                  placeholder="Activity name"
                  v-model="state.tempNode.name"
              /></label>
              <label class="label2">
                <span>Type:</span>
                <select v-model="state.tempNode.type" style="font-size: 1rem">
                  <option selected disabled value="-1">
                    Select activity type
                  </option>
                  <option v-for="type of nodeType" :value="type" :key="type">
                    {{ type }}
                  </option>
                </select>
              </label>
              <label class="label2">
                <span>Place:</span>
                <input
                  type="text"
                  placeholder="Place"
                  v-model="state.tempNode.placename"
                />
              </label>
            </div>
            <div class="secondWrapper innerWrappers">
              <div class="timeWrapper">
                <label class="label15">
                  <span>start:</span>
                  <select v-model="state.tempNode.startTime[0]">
                    <option selected disabled :value="null">
                      Choose start date
                    </option>
                    <option
                      v-for="date of selectedProjectNodesDates"
                      :value="date"
                    >
                      {{ date }}
                    </option>
                  </select>
                </label>
                <div class="label15">
                  <VueTimepicker
                    auto-scroll
                    input-width="90%"
                    format="HH:mm"
                    :minute-interval="10"
                    v-model="state.tempNode.startTime[1]"
                  />
                </div>
              </div>
              <div class="timeWrapper">
                <label class="label15">
                  <span>end:</span>
                  <select v-model="state.tempNode.endTime[0]">
                    <option selected disabled :value="null">
                      Choose end date or empty
                    </option>
                    <option
                      v-for="date of selectedProjectNodesDates"
                      :value="date"
                    >
                      {{ date }}
                    </option>
                    <option :value="null"></option>
                  </select>
                </label>
                <div class="label15">
                  <VueTimepicker
                    auto-scroll
                    input-width="90%"
                    format="HH:mm"
                    close-on-complete
                    :minute-interval="10"
                    v-model="state.tempNode.endTime[1]"
                  />
                </div>
              </div>
            </div>
            <div class="thirdWrapper innerWrappers">
              <label class="label2">
                <span>📍:</span>
                <input
                  type="address"
                  placeholder="Address"
                  v-model="state.tempNode.address"
              /></label>
              <label class="label2">
                <span>☎️:</span>
                <input
                  type="phone"
                  placeholder="Phone"
                  v-model="state.tempNode.phone"
              /></label>
              <label class="label2">
                <span>📝:</span>
                <textarea
                  placeholder="memo"
                  v-model="state.tempNode.memo"
                ></textarea>
              </label>
            </div>
            <div class="buttonWrapper">
              <button type="button" @click="submit()">🆗</button>
              <button type="button" @click="cancel()">❎</button>
              <button @click.prevent="removeNode()">
                <svg
                  style="width: 1rem; display: block"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                >
                  <!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                  <path
                    fill="currentColor"
                    style="color: var(--visual-secondary)"
                    d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
const test = function () {
  console.log("test");
};
import {reactive, onBeforeMount} from "vue";
import {storeToRefs} from "pinia";
import {useProjectsDB} from "/src/stores/ProjectsStore.js";
import VueTimepicker from "vue3-timepicker/src/VueTimepicker.vue";
import GoogleMap from "/src/components/GoogleMap.vue";

const ProjectsDB = useProjectsDB();
const state = reactive({
  tempNode: {},
});
const {
  //deconstruct ProjectsDB
  selectedProjectNodes,
  nodeType,
  selectedProjectNodesDates,
  modalIsOpen,
  isNewMark,
  selectedProjectID,
} = storeToRefs(ProjectsDB);
const props = defineProps({
  node: Object,
});
const nodeIndex = selectedProjectNodes.value.findIndex(
  (node) => node.id === props.node.id
);

onBeforeMount(() => {
  state.tempNode = ProjectsDB.deepCopyFunction(props.node);
});

const pick = function (place) {
  const getType = function (placeType) {
    if (placeType.includes("lodging")) {
      return nodeType.value[0];
    }
    if (placeType.includes("transit_station")) {
      return nodeType.value[2];
    }
    if (placeType.includes("food")) {
      return nodeType.value[1];
    }
    return nodeType.value[3];
  };
  state.tempNode.type = getType(place.types);
  state.tempNode.name = state.tempNode.type + "@" + place.name;
  state.tempNode.placename = place.name;
  state.tempNode.address = place.formatted_address;
  state.tempNode.phone = place.formatted_phone_number;
  state.tempNode.place_id = place.place_id;
  state.tempNode.geometry = place.geometry.location;
  state.tempNode.place = place;
};

const closeModel = function () {
  delete isNewMark.value[props.node.id];
  delete modalIsOpen.value[props.node.id];
};

const submit = function () {
  if (!state.tempNode.startTime[0]) {
    alert("Must fill start date!!");
    return;
  }

  if (
    state.tempNode.startTime[1].includes("HH") ||
    state.tempNode.startTime[1].includes("mm")
  ) {
    alert("Start time must be complete");
    return;
  }
  if (typeof state.tempNode.endTime[1] === "object") {
    state.tempNode.endTime[1] =
      state.tempNode.endTime[1].HH + ":" + state.tempNode.endTime[1].mm;
  }
  const regex = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
  if (regex.test(state.tempNode.endTime[1]) && !state.tempNode.endTime[0]) {
    alert("End time must be complete or empty");
    return;
  }
  if (
    state.tempNode.endTime[0] &&
    state.tempNode.endTime[1] &&
    new Date(state.tempNode.endTime[0]) < new Date(state.tempNode.startTime[0])
  ) {
    alert("End time must be after start time");
    return;
  }

  if (
    state.tempNode.endTime[0] === state.tempNode.startTime[0] &&
    state.tempNode.endTime[1] &&
    ProjectsDB.timeToNumber(state.tempNode.endTime[1]) <
      ProjectsDB.timeToNumber(state.tempNode.startTime[1])
  ) {
    alert("End time must be after start time");
    return;
  }
  //confirm submit
  selectedProjectNodes.value[nodeIndex] = ProjectsDB.deepCopyFunction(
    state.tempNode
  );
  console.log(`node ${selectedProjectID.value} nodes data was changed`);
  ProjectsDB.exportNodesDB();
  closeModel();
  return;
};

const cancel = function () {
  if (isNewMark.value[props.node.id]) {
    removeNode();
    return;
  }
  state.tempNode = ProjectsDB.deepCopyFunction(props.node);
  closeModel();
};

const removeNode = function () {
  let handler = () =>
    confirm(`Are you sure you want to remove ${props.node.id}`);
  if (isNewMark.value[props.node.id]) {
    handler = () => true;
  }
  if (handler()) {
    closeModel();
    selectedProjectNodes.value.splice(
      selectedProjectNodes.value.findIndex((node) => node.id === props.node.id),
      1
    );
    console.log(`node ${selectedProjectID.value} nodes data was changed`);
    ProjectsDB.exportNodesDB();
  }
};
</script>

<style scoped>
.editWrapper {
  height: 90svh;
  width: 90svw;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 4fr 1fr;
  gap: 0.5rem;
}
.editForm {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
}
.editForm input,
.editForm select,
.editForm textarea {
  width: 80%;
  text-align: center;
  background-color: transparent;
  border: none;
}

.editForm input:focus,
.editForm select:focus {
  outline: 1px solid;
  z-index: 1;
}
.editForm label {
  display: flex;
}
.label2 {
  height: 3rem;
  line-height: 3rem;
}
.label15 {
  height: 2.5rem;
  line-height: 2.5rem;
}
.label3 {
  height: 4.5rem;
  line-height: 4.5rem;
}
.innerWrappers {
  display: flex;
  flex-direction: column;
}

.buttonWrapper {
  display: flex;
  gap: 1rem;
  grid-row: 2 / span 1;
  grid-column: 1 / span 3;
  justify-self: center;
}
.buttonWrapper button {
  cursor: pointer;
  font-size: 1.5rem;
  background-color: transparent;
  border: none;
}
.buttonWrapper button:hover {
  scale: 1.2;
}
</style>
