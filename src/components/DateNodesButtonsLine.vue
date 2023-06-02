<template>
  <div class="nodeButtonContainerOuter">
    <div class="nodeButtonContainerInner">
      <div class="24hrdiv" v-for="i in 25">
        <div
          v-if="nodesSelectedDateGroupedByTime?.[i - 2]"
          :class="`hrsDiv ${i}`"
        >
          <div>
            <div
              class="startDivGrouped DivGrouped"
              v-for="node of nodesSelectedDateGroupedByTime[i - 2].start"
              :key="node.id"
            >
              <button
                class="nodesButtons startNodesButtons"
                @click="modalIsOpen[node.id] = true"
              >
                {{ node.startTime[1] }} start {{ node.name }}
              </button>
              <editNode :node="node"></editNode>
            </div>
          </div>
          <div
            class="endDivGrouped DivGrouped"
            v-for="node of nodesSelectedDateGroupedByTime[i - 2].end"
            :key="node.id"
          >
            <button
              class="nodesButtons endNodesButtons"
              @click="modalIsOpen[node.id] = true"
            >
              {{ node.endTime[1] }} finish {{ node.name }}
            </button>

            <editNode :node="node"></editNode>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import {storeToRefs} from "pinia";
import {useProjectsDB} from "/src/stores/ProjectsStore.js";
import editNode from "/src/components/dailyPage/editNode.vue";
const ProjectsDB = useProjectsDB();
const {
  //deconstruct ProjectsDB
  modalIsOpen,
  nodesSelectedDateGroupedByTime,
} = storeToRefs(ProjectsDB);
</script>
<style scoped>
.nodeButtonContainerOuter {
  position: relative;
}
.nodeButtonContainerInner {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  padding: var(--margin) 0;
}
.hrsDiv {
  display: grid;
  grid-template-columns: 1fr;
  /* grid-template-rows: 1fr; */
  place-items: center;
  margin: var(--margin);
}
.DivGrouped {
  display: grid;
  place-items: center;
}

.nodesButtons {
  display: block;
  cursor: pointer;
  padding: 0.5rem;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  filter: grayscale(70%) opacity(0.7);
  transition: filter var(--transition-speed) ease;
  border-radius: 0.5rem;
  margin: 0 var(--margin);
}
.endNodesButtons {
  background-color: red;
}
.nodesButtons:hover {
  transform-origin: center center;

  filter: grayscale(0%) opacity(1);
}
</style>
