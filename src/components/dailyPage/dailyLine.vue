<template>
  <template v-if="selectedDateIndex === currentDayIndex">
    <div class="container">
      <GoogleMap v-for="i of 1" :idProp="i"></GoogleMap>
      <div class="mainLine"></div>
      <div
        ref="nodes"
        class="node"
        v-for="(node, index) of currentDayNodes"
        :key="index"
      >
        <button @click="showEditNode(node)">{{ node.name }}</button>
        <dialog
          class="editNodeDom"
          :ref="
            (el) => {
              dialog[node.id] = el;
            }
          "
        >
          <editNode :node="node"></editNode>
        </dialog>
      </div>
    </div>
  </template>
</template>

<script setup>
import {ref, nextTick, watch, onBeforeUpdate, onMounted, onUpdated} from "vue";
import editNode from "/src/components/dailyPage/editNode.vue";
import {storeToRefs} from "pinia";
import {useProjectsDB} from "/src/stores/ProjectsStore.js";
import GoogleMap from "/src/components/GoogleMap.vue";

const props = defineProps({
  currentDayNodes: Object,
  selectedDateIndex: Number || String,
  currentDayIndex: Number,
});
const ProjectsDB = useProjectsDB();
const {
  //deconstruct ProjectsDB
  refEditNodeModalDom,
  SelectedProjectNodes,
} = storeToRefs(ProjectsDB);

const nodes = ref(null);
const dialog = ref({});

const showEditNode = function (thisNode) {
  dialog.value[thisNode.id].showModal();

  const nodeIndex = SelectedProjectNodes.value.findIndex(
    (node) => node.id === thisNode.id
  );
  SelectedProjectNodes.value[nodeIndex].show = true;
};

const setNodesPosition = function () {
  //set the nodes position on dailyLine
  props.selectedDateIndex === props.currentDayIndex &&
    nodes.value &&
    nextTick(() => {
      nodes.value.forEach((node, index) => {
        node.style.setProperty("--sequence", index + 1);
        node.style.setProperty("--nodesCount", nodes.value.length + 1);
      });
    });
};

onBeforeUpdate(() => {
  //reset ref of modal doms
  props.selectedDateIndex === props.currentDayIndex && (dialog.value = {});
});

onMounted(() => {
  //set nodes position && bind dialog dom to store
  setNodesPosition();
  props.selectedDateIndex === props.currentDayIndex &&
    (refEditNodeModalDom.value = dialog.value);
});

onUpdated(() => {
  //bind dialog dom to store and set the nodes position on dailyLine
  setNodesPosition();
  props.selectedDateIndex === props.currentDayIndex &&
    (refEditNodeModalDom.value = dialog.value);
});
</script>

<style scoped>
.container {
  height: 100svh;
  border: 1px solid red;
  position: relative;
  > .mainLine {
    left: 50%;
    position: absolute;
    background-color: black;
    border: 1px solid black;
    height: 100svh;
    width: 1px;
  }
  > .node {
    --sequence: 1;
    --nodesCount: 2;
    position: absolute;
    top: calc(var(--sequence) / var(--nodesCount) * 100svh);
    left: 55%;
  }
}
</style>
