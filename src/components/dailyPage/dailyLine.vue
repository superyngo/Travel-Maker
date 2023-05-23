<template>
  <template v-if="selectedDateIndex === currentDayIndex">
    <div class="container">
      <div class="mainLine"></div>
      <div
        ref="nodes"
        class="node"
        v-for="node of currentDayNodes"
        :key="node.id"
      >
        <button @click="modalIsOpen[node.id] = true">
          {{ node.name }}
        </button>
        <teleport to="body">
          <div class="modal" v-if="modalIsOpen[node.id]">
            <div class="modalBackground">
              <editNode :node="node"></editNode>
            </div>
          </div>
        </teleport>
      </div>
    </div>
  </template>
</template>

<script setup>
import {ref, nextTick, onBeforeUpdate, onMounted, onUpdated} from "vue";
import editNode from "/src/components/dailyPage/editNode.vue";
import {storeToRefs} from "pinia";
import {useProjectsDB} from "/src/stores/ProjectsStore.js";
const props = defineProps({
  currentDayNodes: Object,
  selectedDateIndex: Number || String,
  currentDayIndex: Number,
});
const ProjectsDB = useProjectsDB();
const {
  //deconstruct ProjectsDB
  modalIsOpen,
} = storeToRefs(ProjectsDB);

const nodes = ref(null);

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

onMounted(() => {
  //set nodes position
  setNodesPosition();
});

onUpdated(() => {
  //set the nodes position on dailyLine
  setNodesPosition();
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
