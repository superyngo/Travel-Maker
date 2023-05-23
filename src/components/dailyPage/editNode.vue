<template>
  <div class="container" v-if="modalIsOpen[node.id]">
    <GoogleMap
      :idProp="node.id"
      @pick="pick"
      :pickable="true"
      :startPlaceId="state.tempNode.place_id"
    ></GoogleMap>
    <hr />
    <form>
      <div class="wrapper">
        <label>
          <span>Name:</span>
          <input
            type="text"
            placeholder="Activity name"
            v-model="state.tempNode.name"
        /></label>
        <label>
          <span>Type:</span>
          <select v-model="state.tempNode.type" value="-1">
            <option selected disabled value="-1">Select activity type</option>
            <option v-for="type of nodeType" :value="type" :key="type">
              {{ type }}
            </option>
          </select>
        </label>
        <label>
          <span>Place:</span>
          <input
            id="autocomplete"
            type="text"
            placeholder="Place"
            v-model="state.tempNode.placename"
          />
        </label>
      </div>

      <div class="wrapper">
        <label>
          <span>Start:</span>
          <select v-model="state.tempNode.startTime[0]">
            <option selected disabled value="-1">Choose start date</option>
            <option v-for="date of selectedProjectNodesDates" :value="date">
              {{ date }}
            </option>
          </select>
        </label>
        <VueTimepicker
          format="HH:mm"
          close-on-complete
          :minute-interval="10"
          v-model="state.tempNode.startTime[1]"
        >
        </VueTimepicker>

        <label>
          <span>End:</span>
          <select v-model="state.tempNode.endTime[0]">
            <option selected disabled value="-1">Choose end date</option>
            <option v-for="date of selectedProjectNodesDates" :value="date">
              {{ date }}
            </option>
            <option value="null"></option>
          </select>
        </label>
        <VueTimepicker
          format="HH:mm"
          close-on-complete
          :minute-interval="10"
          v-model="state.tempNode.endTime[1]"
        >
        </VueTimepicker>
      </div>

      <div class="wrapper">
        <label>
          <span>Address:</span>
          <input
            type="address"
            placeholder="Address"
            v-model="state.tempNode.address"
        /></label>
        <label>
          <span>Phone:</span>
          <input
            type="phone"
            placeholder="Phone"
            v-model="state.tempNode.phone"
        /></label>
      </div>
      <!-- <div>reservation</div> -->
      <div class="wrapper">
        <div>
          <button type="submit" @click.prevent="submit">Submit</button>
          <button type="submit" @click="cancel">Cancel</button>
          <button @click.prevent="removeNode">Remove</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import {reactive, onBeforeMount, onUpdated} from "vue";
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
  SelectedProjectNodes,
  nodeType,
  selectedProjectNodesDates,
  modalIsOpen,
  isNewMark,
} = storeToRefs(ProjectsDB);
const props = defineProps({
  node: Object,
});
const nodeIndex = SelectedProjectNodes.value.findIndex(
  (node) => node.id === props.node.id
);

onBeforeMount(() => {
  state.tempNode = ProjectsDB.deepCopyFunction(props.node);
});

onUpdated(async () => {});

const pick = function (place) {
  console.log(place);
  const getType = function (placeType) {
    console.log(placeType);
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
  if (!state.tempNode.startTime[0] || !state.tempNode.startTime[1]) {
    alert("Must fill start date and time!!");
    return;
  }
  SelectedProjectNodes.value[nodeIndex] = ProjectsDB.deepCopyFunction(
    state.tempNode
  );
  closeModel();
};

const cancel = function () {
  if (isNewMark.value[props.node.id]) {
    removeNode();
  } else {
    state.tempNode = ProjectsDB.deepCopyFunction(props.node);
    closeModel();
  }
};

const removeNode = function () {
  let handler = () =>
    confirm(`Are you sure you want to remove ${props.node.id}`);
  if (isNewMark.value[props.node.id]) {
    handler = () => true;
  }
  if (handler()) {
    closeModel();
    SelectedProjectNodes.value.splice(
      SelectedProjectNodes.value.findIndex((node) => node.id === props.node.id),
      1
    );
  }
};
</script>

<style scoped lan="scss">
.container {
  width: 50svw;
  border: 1px solid yellow;
}

form {
  display: grid;
  gap: 5px;
}

.wrapper {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}

label {
  /* display: block; */
}

input,
select {
  text-align: center;
  border: none;
}
</style>
