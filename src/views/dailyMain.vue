<template>
  <div class="viewContainer">
    <div class="dateTagContainer">
      <div class="buttonContainer">
        <button
          v-for="(date, index) of selectedProjectNodesDates"
          :value="index"
          @click="
            activeSelectedDateButton();
            selectedDateIndex = index;
          "
          ref="dateButtonDom"
        >
          {{ date }}
        </button>
        <button @click="minusDate()">➖</button>
        <button @click="plusDate()">➕</button>
      </div>
    </div>
    <div class="dailyMainContainer" v-if="selectedProjectID !== -1">
      <div class="dailyPanel left">
        <div class="upper">
          <div class="selectPanel">
            <span class="emoji" style="font-size: 1.7rem; line-height: 1.6rem"
              >🗓</span
            >
            <select v-model="selectedDateIndex" class="dateSelect">
              <option selected disabled :value="-1">Date</option>
              <option
                v-for="(date, index) of selectedProjectNodesDates"
                :value="index"
              >
                {{ date }}
              </option>
            </select>
            <div class="selectedDateButton">
              <button
                @click="
                  selectedDateIndex > 0
                    ? selectedDateIndex--
                    : selectedDateIndex
                "
              >
                ⬅️
              </button>
              <button
                @click="
                  selectedDateIndex < selectedProjectNodesDates.length - 1
                    ? selectedDateIndex++
                    : selectedDateIndex
                "
              >
                ➡️
              </button>
            </div>
          </div>
          <dailyInfo></dailyInfo>
        </div>
        <dailyBrief class="downer"></dailyBrief>
      </div>
      <dailyLine class="right" />
    </div>
  </div>
</template>

<script setup>
import {watch, onBeforeMount, ref, nextTick, onMounted} from "vue";
import {storeToRefs} from "pinia";
import {useProjectsDB} from "/src/stores/ProjectsStore.js";
import {useRoute} from "vue-router";
import dailyInfo from "/src/components/dailyPage/dailyInfo.vue";
import dailyLine from "/src/components/dailyPage/dailyLine.vue";
import dailyBrief from "/src/components/dailyPage/dailyBrief.vue";

const route = useRoute();
const ProjectsDB = useProjectsDB();
const {
  //deconstruct ProjectsDB
  selectedProjectID,
  selectedProjectNodesDates,
  selectedDateIndex,
} = storeToRefs(ProjectsDB);
const dateButtonDom = ref([]);

const activeSelectedDateButton = function () {
  nextTick(() => {
    dateButtonDom.value.forEach((button) => {
      button.classList.remove("active");
    });
    dateButtonDom.value[selectedDateIndex.value].classList.add("active");
  });
};

const plusDate = function () {
  const date = new Date(
    ProjectsDB.projectsDB[ProjectsDB.selectedProjectIndex].dateStartEnd[1]
  );
  date.setDate(date.getDate() + 1);
  ProjectsDB.projectsDB[ProjectsDB.selectedProjectIndex].dateStartEnd[1] = date
    .toISOString()
    .slice(0, 10);
  nextTick(() => {
    // dateButtonDom.value[dateButtonDom.value.length - 1].focus();
    selectedDateIndex.value = dateButtonDom.value.length - 1;
    activeSelectedDateButton();
  });

  console.log(`node ${selectedProjectID.value} nodes data was changed`);
  ProjectsDB.exportNodesDB();
};

const minusDate = function () {
  if (
    ProjectsDB.projectsDB[ProjectsDB.selectedProjectIndex].dateStartEnd[0] ===
    ProjectsDB.projectsDB[ProjectsDB.selectedProjectIndex].dateStartEnd[1]
  )
    return;

  const date = new Date(
    ProjectsDB.projectsDB[ProjectsDB.selectedProjectIndex].dateStartEnd[1]
  );
  date.setDate(date.getDate() - 1);
  ProjectsDB.projectsDB[ProjectsDB.selectedProjectIndex].dateStartEnd[1] = date
    .toISOString()
    .slice(0, 10);

  nextTick(() => {
    selectedDateIndex.value =
      dateButtonDom.value.length - 1 < selectedDateIndex.value
        ? selectedDateIndex.value - 1
        : selectedDateIndex.value;
    activeSelectedDateButton();
  });
  console.log(`node ${selectedProjectID.value} nodes data was changed`);
  ProjectsDB.exportNodesDB();
};

onMounted(() => {
  activeSelectedDateButton();
});

onBeforeMount(() => {
  //initially fetch nodes data
  selectedProjectID.value === -1 &&
    (selectedProjectID.value = route.query.ProjectID);
  ProjectsDB.fetchSelectedProjectNodes();
});

watch(
  //fetch new project's nodes when selected project changed
  () => selectedProjectID.value,
  (newValue) => {
    if (newValue === -1) return;
    console.log("Selected project changed");
    ProjectsDB.fetchSelectedProjectNodes();
    activeSelectedDateButton();
  }
);

// watch(
//   //save nodes data when nodes data changed
//   () => selectedProjectNodes.value,
//   () => {
//     if (selectedProjectID.value === -1) return;
//     //save nodes data
//     console.log(`node ${selectedProjectID.value} nodes data was changed`);
//     ProjectsDB.exportNodesDB();
//   }
// );
</script>

<style scoped>
.viewContainer {
  border: 5px solid rgb(113, 15, 95);
  position: relative;
}
/* large screen */
@media only screen and (min-width: 600px) {
  .viewContainer {
    left: var(--navWidth);
    position: relative;
    width: calc(100svw - var(--navWidth));
    height: 100%;
  }
}
/* small screen */
@media only screen and (max-width: 600px) {
  .viewContainer {
    position: absolute;
    width: 100%;
    height: calc(100svh - var(--navWidth));
  }
}
.dateTagContainer {
  height: 2rem;
  width: 100%;
  position: absolute;
  > .buttonContainer {
    position: relative;
    top: 0.65rem;
    > button {
      padding: 0 0.1rem;
      border: none;
      background-color: grey;
      border-radius: 0.5rem;
      cursor: pointer;
      margin: 0 0.1rem;
      border: var(--button-border) solid black;
      border-radius: 0;
    }
    > .active {
      border: none;
      background-color: white;
      cursor: pointer;
      border: var(--button-border) solid black;
      border-bottom: var(--button-border) solid white;
    }
    > button:hover {
      filter: brightness(1.5);
    }
  }
}
.dailyMainContainer {
  position: absolute;
  top: 2rem;
  bottom: 0;
  right: 0;
  left: 0;
  border: 5px solid black;
  /* position: relative; */
  display: grid;
  gap: 1rem;
  /* width: calc(100svw - var(--navWidth)); */
  /* height: 95svh; */
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 1fr;
  color: var(--text-secondary);
  border-top: var(--button-border) solid black;
}
.dailyMainContainer select,
.dailyMainContainer option,
.dailyMainContainer button {
  color: var(--text-secondary);
}
.emoji {
  display: inline-block;
  width: 2rem;
  color: var(--visual-secondary);
  font-weight: 700;
}
.dailyPanel {
  margin: var(--margin);
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 3fr;
  gap: var(--margin);
}
.selectPanel {
  position: relative;
  width: 100%;
  height: 2rem;
}
.dateSelect {
  position: absolute;
  height: 100%;
  border: none;
  z-index: 0;
}
.selectedDateButton {
  position: absolute;
  left: 8rem;
  top: 0.1rem;
}
.selectedDateButton button {
  cursor: pointer;
  border: none;
  background-color: transparent;
  font-size: 1rem;
}
.dailyMainContainer button:hover {
  scale: 1.1;
}
.dailyMainContainer button:active {
  scale: 0.9;
}
.mapView {
  height: 100%;
}
.upper {
  max-height: 200px;
}
</style>
