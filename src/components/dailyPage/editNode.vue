<template>
  <div class="container" v-if="node.show">
    <GoogleMap
      :idProp="node.id"
      @pick="pick"
      :pickable="true"
      :startPlaceId="state.tempNode.place_id"
    ></GoogleMap>

    <br />
    <form method="dialog">
      <!-- <input type="text" placeholder="ID" v-model="state.tempNode.id" /> -->
      <label>
        <span>name:</span>
        <input type="text" placeholder="Name" v-model="state.tempNode.name"
      /></label>

      <label>
        <span>type:</span>
        <select v-model="state.tempNode.type" value="-1">
          <option selected disabled value="-1">Choose activity Types</option>
          <option v-for="type of nodeType" :value="type">{{ type }}</option>
        </select>
      </label>

      <label>
        <span>place:</span>
        <input
          id="autocomplete"
          type="text"
          placeholder="地點"
          v-model="state.tempNode.placename"
      /></label>

      <label>
        <span>start@:</span>
        <select v-model="state.tempNode.startTime[0]">
          <option selected disabled value="-1">Choose start date</option>
          <option v-for="date of selectedProjectNodesDates" :value="date">
            {{ date }}
          </option>
        </select>
        <input
          type="time"
          v-model="state.tempNode.startTime[1]"
          step="600000"
        />
      </label>

      <label>
        <span>end@:</span>
        <select v-model="state.tempNode.endTime[0]">
          <option selected disabled value="-1">Choose end date</option>
          <option v-for="date of selectedProjectNodesDates" :value="date">
            {{ date }}
          </option>
          <option value="null"></option>
        </select>
        <input type="time" v-model="state.tempNode.endTime[1]" />
      </label>

      <label>
        <span>address:</span>
        <input
          type="address"
          placeholder="地址"
          v-model="state.tempNode.address"
      /></label>

      <label>
        <span>phone:</span>
        <input type="phone" placeholder="電話" v-model="state.tempNode.phone"
      /></label>
      <!-- <div>reservation</div> -->
      <button type="submit" @click.prevent="submit">submit</button>
      <button type="submit" @click="cancel">cancel</button>
      <button @click.prevent="removeNode">remove</button>
    </form>
  </div>
</template>

<script setup>
import {reactive, onBeforeMount, onMounted, onUpdated} from "vue";
import {storeToRefs} from "pinia";
import {useProjectsDB} from "/src/stores/ProjectsStore.js";
import GoogleMap from "/src/components/GoogleMap.vue";

const ProjectsDB = useProjectsDB();
const state = reactive({
  tempNode: {},
  open: false,
  google: null,
  map: null,
  markers: null,
});
const {
  //deconstruct ProjectsDB
  SelectedProjectNodes,
  refEditNodeModalDom,
  nodeType,
  selectedProjectNodesDates,
} = storeToRefs(ProjectsDB);
const props = defineProps({
  node: Object,
  open: Boolean,
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
      return "Lodging";
    }
    if (placeType.includes("transit_station")) {
      return "Transition";
    }
    if (placeType.includes("food")) {
      return "Food";
    }
    return "Fun";
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

const deleteShow = function () {
  refEditNodeModalDom.value[props.node.id].close();
  delete SelectedProjectNodes.value[nodeIndex].show;
};

const submit = function () {
  if (!state.tempNode.startTime[0] || !state.tempNode.startTime[1]) {
    alert("Must fill start date and time!!");
    return;
  }
  delete refEditNodeModalDom.value[props.node.id].dataset.new;
  SelectedProjectNodes.value[nodeIndex] = ProjectsDB.deepCopyFunction(
    state.tempNode
  );
  deleteShow();
};

const cancel = function () {
  if (refEditNodeModalDom.value[props.node.id].getAttribute("data-new")) {
    removeNode();
  } else {
    state.tempNode = ProjectsDB.deepCopyFunction(props.node);
    deleteShow();
  }
};

const removeNode = function () {
  let handler = () =>
    confirm(`Are you sure you want to remove ${props.node.id}`);
  if (refEditNodeModalDom.value[props.node.id].getAttribute("data-new")) {
    handler = () => true;
  }
  if (handler()) {
    refEditNodeModalDom.value[props.node.id].close();
    SelectedProjectNodes.value.splice(
      SelectedProjectNodes.value.findIndex((node) => node.id === props.node.id),
      1
    );
  }
};
</script>

<style scoped>
.container {
  border: 1px solid yellow;
}

label {
  display: block;
}
</style>
