<template>
  <div class="container" v-if="node.show">
    <div id="map">123</div>
    <br />
    <form method="dialog">
      <!-- <input type="text" placeholder="ID" v-model="state.tempNode.id" /> -->
      <input type="text" placeholder="Name" v-model="state.tempNode.name" />
      <select v-model="state.tempNode.type" value="-1">
        <option selected disabled value="-1">Choose activity Types</option>
        <option v-for="type of nodeType" :value="type">{{ type }}</option>
      </select>

      <select v-model="state.tempNode.startTime[0]">
        <option selected disabled value="-1">Choose start date</option>
        <option v-for="date of selectedProjectNodesDates" :value="date">
          {{ date }}
        </option>
      </select>

      <select v-model="state.tempNode.endTime[0]">
        <option selected disabled value="-1">Choose start date</option>
        <option v-for="date of selectedProjectNodesDates" :value="date">
          {{ date }}
        </option>
      </select>

      <input
        id="autocomplete"
        type="text"
        placeholder="地點"
        v-model="state.tempNode.geoLocation"
      />
      <div>pick from googleMaps</div>
      <input
        type="address"
        placeholder="地址"
        v-model="state.tempNode.address"
      />
      <input type="phone" placeholder="電話" v-model="state.tempNode.phone" />
      <div>reservation</div>
      <button type="submit" @click="submit">submit</button>
      <button type="submit" @click="cancel">cancel</button>
      <button @click.prevent="removeNode">remove</button>
    </form>
  </div>
</template>

<script setup>
import {reactive, onBeforeMount, onMounted, onUpdated} from "vue";
import {storeToRefs} from "pinia";
import {useProjectsDB} from "/src/stores/ProjectsStore.js";
import {Loader} from "@googlemaps/js-api-loader";
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

onUpdated(async () => {
  await initMap();
});

const deleteShow = function () {
  refEditNodeModalDom.value[props.node.id].close();
  delete SelectedProjectNodes.value[nodeIndex].show;
};

const submit = function () {
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

const initMap = async () => {
  const loader = new Loader({
    apiKey: "AIzaSyAUnQZuVbSFm-UyBkDX9W9atlfFZeKN-DM",
    version: "weekly",
    libraries: ["places"],
    language: "zh-TW",
  });
  state.google = await loader.load();
  state.map = new state.google.maps.Map(document.getElementById("map"), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 8,
  });
  console.log(state.google);
};
if (props.node.show) console.log(123);
</script>

<style scoped>
.container {
  border: 1px solid yellow;
}
</style>
