<template>
  <div class="navbar">
    <ul class="navbar-nav">
      <li class="nav-item">
        <div class="nav-item-inner">
          <select
            v-model="selectedProjectID"
            class="li-text navSelect select"
            ref="selectedProjectIDPanel"
            id="selectedProjectIDPanel"
          >
            <option selected disabled :value="-1" class="navOption">
              <span>Project</span>
            </option>
            <option
              v-for="(project, index) of projectsDB"
              :value="project?.id"
              :key="index"
              class="navOption"
            >
              {{ project?.name }}
            </option>
          </select>
          <span for="selectedProjectID" class="logo" ref="logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
              <path
                fill="currentColor"
                d="M470.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 256 265.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160zm-352 160l160-160c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L210.7 256 73.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0z"
              />
            </svg>
          </span>
        </div>
      </li>
      <li class="nav-item" v-for="item of navBarItems">
        <component :is="item.tag" @click="item.click" class="nav-item-inner">
          <svg
            aria-hidden="true"
            focusable="false"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            :viewBox="item.viewBox"
            v-if="item.iconPath"
          >
            <!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path fill="currentColor" :d="item.iconPath" />
          </svg>
          <span class="li-text">{{ item.value }}</span>
        </component>
      </li>
    </ul>
  </div>
</template>
<script setup>
import {storeToRefs} from "pinia";
import {useProjectsDB} from "/src/stores/ProjectsStore.js";
const ProjectsDB = useProjectsDB();
const {projectsDB, selectedProjectID, modalIsOpen, isNewMark} =
  storeToRefs(ProjectsDB);

const openEditProject = function () {
  if (selectedProjectID.value === -1) return;
  modalIsOpen.value[selectedProjectID.value] = true;
};

const newProject = function () {
  console.log(new Date().toISOString().substring(0, 10));

  const emptyProject = {
    id: crypto.randomUUID(),
    name: "new project",
    destination: null,
    dateStartEnd: [
      new Date().toISOString().substring(0, 10),
      new Date().toISOString().substring(0, 10),
    ],
    headCount: null,
    childrenCount: null,
    nodesID: [],
  };
  projectsDB.value = [...projectsDB.value, emptyProject];

  selectedProjectID.value = emptyProject.id;
  isNewMark.value[emptyProject.id] = true;
  openEditProject();
};
const navBarItems = [
  {
    tag: "button",
    value: "NEW",
    click: newProject,
    viewBox: "0 0 448 512",
    iconPath:
      "M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z",
  },
  {
    tag: "button",
    value: "EDIT",
    click: openEditProject,
    viewBox: "0 0 512 512",
    iconPath:
      "M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z",
  },
  {
    tag: "button",
    value: "REMOVE",
    click: ProjectsDB.removeProject,
    viewBox: "0 0 512 512",
    iconPath:
      "M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z",
  },
  {
    tag: "button",
    value: "HOME",
    click: () => {
      selectedProjectID.value = -1;
    },
    viewBox: "0 0 576 512",
    iconPath:
      "M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z",
  },
];
</script>

<style>
.navbar {
  position: absolute;
  background-color: var(--bg-primary);
  transition: width var(--transition-speed) ease;
  z-index: 1;
}

.navbar-nav {
  width: 100%;
  list-style: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.nav-item {
  width: 100%;
}
.nav-item-inner,
.navSelect {
  display: flex;
  align-items: center;
  height: var(--navWidth);
  text-decoration: none;
  font-size: 1rem;
  width: 100%;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  filter: grayscale(100%) opacity(0.7);
  transition: var(--transition-speed);
  outline: none;
  border: none;
  cursor: pointer;
  > svg {
    width: 2rem;
    margin: 0 1.5rem;
  }
  > .logo {
    rotate: 0deg;
    transition: var(--transition-speed);
    > svg {
      width: 2rem;
      margin: 0 1.5rem;
    }
  }
}
.nav-item-inner:hover,
.nav-item-inner:hover .navSelect {
  filter: grayscale(0%) opacity(1);
  background-color: var(--bg-secondary);
}
.navSelect,
.navOption {
  text-transform: uppercase;
  text-align: center;
  letter-spacing: 0.2ch;
}

.li-text {
  display: none;
  margin-left: 2rem;
}

path {
  color: var(--visual-primary);
}

/* for small screen */
@media only screen and (max-width: 700px) {
  .navbar {
    bottom: 0;
    height: var(--navWidth);
    width: 100%;
    /* width: 100swh; */
  }
  .navbar-nav {
    flex-direction: row;
  }
  .nav-item-inner,
  .navSelect {
    justify-content: center;
  }

  .logo {
    display: none;
  }
  .select {
    display: inline;
  }
}

/* for large screen */
@media only screen and (min-width: 700px) {
  .navbar {
    top: 0;
    height: 100vh;
    height: 100svh;
    width: var(--navWidth);
  }
  .navbar:hover {
    width: 16rem;
  }
  .navbar:hover .li-text {
    display: inline;
  }
  .navbar:hover .logo {
    rotate: -180deg;
  }
}
</style>
