import {defineStore} from "pinia";
import fetchDB from "/src/utils/fetchDB.js";
import exportDB from "/src/utils/exportDB.js";

export const useProjectsDB = defineStore("mainState", {
  state: () => ({
    //定義狀態初始值
    projectsDB: [],
    selectedProjectID: "-1",
    SelectedProjectNodes: [],
    nodesGroupedByDateStart: [],
    refEditNodeModalDom: null,
    google: {},
    userLocation: {},
    saveOption: {storageType: "localStorage", name: "projectsDB"},
  }),

  getters: {
    //對狀態加工的 getters，如同 computed
    selectedProjectIndex: function () {
      return this.projectsDB.findIndex(
        (project) => project.id === this.selectedProjectID
      );
    },
    selectedProjectNodesID: function () {
      return this.projectsDB.filter(
        (project) => project.id === this.selectedProjectID
      )[0]?.nodesID;
    },
    selectedProjectNodesDates: function () {
      // the selected project's dates in serial
      return this.getDatesBetweenDates(
        this.projectsDB.filter(
          (project) => project.id === this.selectedProjectID
        )[0]?.dateStartEnd
      );
    },
    getNodesGroupedByDateStart: function () {
      return this.SelectedProjectNodes.length === 0
        ? {}
        : this.selectedProjectNodesDates.map((date) =>
            this.SelectedProjectNodes.filter(
              (node) => node.startTime[0] === date
            )
          );
    },
    nodeType: () => ["Lodging", "Food", "Transition", "Fun", "Reminder"],
  },

  actions: {
    //定義使用到的函式，可以為同步和非同步，如同 method
    async fetchProjectDB() {
      //fetch projectsDB
      this.projectsDB = await fetchDB.fetchProjectsDB(
        this.saveOption.storageType,
        this.saveOption.name
      );
      console.log(this.projectsDB);
    },
    async fetchSelectedProjectNodes() {
      //fetch selected project's nodes
      const filteredNodeDB = await fetchDB.fetchSelectedNodesDB(
        this.saveOption.storageType,
        this.selectedProjectID
      );
      //map date
      this.SelectedProjectNodes = filteredNodeDB
        ? filteredNodeDB.map((node) => {
            //map right time
            [node.startTime[0], node.endTime[0]] = [
              this.selectedProjectNodesDates[node.startTime[0]],
              this.selectedProjectNodesDates[node.endTime[0]],
            ];
            return node;
          })
        : [];
      //split by dates and assign to nodesGroupedByDateStart
      this.nodesGroupedByDateStart = filteredNodeDB
        ? this.getNodesGroupedByDateStart
        : [];
    },
    exportProjectDB() {
      exportDB.exportData(
        this.saveOption.storageType,
        this.projectsDB,
        this.saveOption.name
      );
    },
    exportNodesDB() {
      const flatArray = this.deepCopyFunction(this.SelectedProjectNodes);
      const mapTimeResult = flatArray.map((node) => {
        [node.startTime[0], node.endTime[0]] = [
          this.selectedProjectNodesDates.indexOf(node.startTime[0]),
          this.selectedProjectNodesDates.indexOf(node.endTime[0]),
        ];
        return node;
      });
      exportDB.exportData(
        "localStorage",
        mapTimeResult,
        this.selectedProjectID
      );
      //save nodesID back in to ProjectDB
      this.projectsDB[this.selectedProjectIndex].nodesID = mapTimeResult.map(
        (node) => node.id
      );
      this.nodesGroupedByDateStart = this.getNodesGroupedByDateStart;
    },
    getDatesBetweenDates([startDate, endDate]) {
      if (startDate === undefined) return;
      const dates = [];
      let currentDate = new Date(startDate);
      while (currentDate <= new Date(endDate)) {
        dates.push(new Date(currentDate).toISOString().slice(0, 10));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return dates;
    },
    deepCopyFunction(inObject) {
      let outObject, value, key;
      if (typeof inObject !== "object" || inObject === null) {
        return inObject; // Return the value if inObject is not an object
      }
      // Create an array or object to hold the values
      outObject = Array.isArray(inObject) ? [] : {};
      for (key in inObject) {
        value = inObject[key];
        // Recursively (deep) copy for nested objects, including arrays
        outObject[key] = this.deepCopyFunction(value);
      }
      return outObject;
    },
    removeProject() {
      switch (this.saveOption.storageType) {
        case "localStorage":
          this.projectsDB.splice(this.selectedProjectIndex, 1);
          localStorage.removeItem(this.selectedProjectID);
          break;
        case "DB":
          //manpulate DB
          break;
      }
    },
    getCurrentPositionAsync() {
      const fallbackPosition = {lat: 25.03746, lng: 121.564558};
      return new Promise((resolve) => {
        if (navigator.geolocation) {
          let option = {
            enableAcuracy: false, // 提高精確度
            maximumAge: 100000, // 設定上一次位置資訊的有效期限(毫秒)
            timeout: 10000, // 逾時計時器(毫秒)
          };
          navigator.geolocation.getCurrentPosition(
            (position) => {
              this.userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              resolve();
            },
            (error) => {
              console.log(
                "Error occurred while retrieving geolocation:",
                error.message,
                ", use fallback position"
              );
              this.userLocation = fallbackPosition;
            },
            option
          );
        } else {
          console.log(`Geolocation is not supported by this browser.
            use fallback position`);
          this.userLocation = fallbackPosition;
        }
      });
    },
    waitUserLocation() {
      return new Promise((resolve, reject) => {
        const intervalId = setInterval(() => {
          if (Object.keys(this.userLocation).length !== 0) {
            clearInterval(intervalId);
            resolve(this.userLocation);
          }
        }, 250); // Polling interval (adjust as needed)

        setTimeout(() => {
          clearInterval(intervalId);
          reject(new Error("Timeout waiting for value")); // Timeout (adjust as needed)
        }, 10000); // Maximum wait time (adjust as needed)
      });
    },
    // async pause(milliseconds) {
    //   const wait = () => {
    //     return new Promise((resolve) => {
    //       setTimeout(resolve, milliseconds);
    //     });
    //   };
    //   await wait();
    // },
  },
});

//[{"id":"a00001","name":"宜蘭二日遊","destination":"宜蘭","dateStartEnd":["2023-04-06","2023-04-07"],"headCount":3,"childrenCount":1,"nodesID":["b001","b002","b003","b004","b005"]},{"id":"a00002","name":"台南二日遊","destination":"台南","dateStartEnd":["2023-05-01","2023-05-03"],"headCount":3,"childrenCount":1,"nodesID":["b006","b007","b008","b009","b010"]},{"id":"91c1fc8f-de57-48f7-b41e-a794864ed204","name":"new project21321","destination":null,"dateStartEnd":["2023-05-10","2023-05-26"],"headCount":null,"childrenCount":null,"nodesID":[]}]

// const stateController = {
//   formatDateTime: () => {
//     const date = new Date(dateTime.value);
//     const formattedDate = date.toLocaleDateString("ch-TW", {
//       hour12: false,
//     });
//     const formattedTime = date.toLocaleTimeString("ch-TW", {
//       hour12: false,
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//     const formattedDateTime = [formattedDate, formattedTime];
//     console.log(formattedDateTime);
//   },
// };

// dataset: {
//   nodeTypes: ["inn", "meal", "traffic", "fun", "reminder"],
//   trafficTypes: [
//     "rentCar",
//     "rentMotor",
//     "rail",
//     "highRails",
//     "airplane",
//     "bus",
//     "rentBike",
//     "rentBoat",
//   ],
// },
//a00001[{"id":"b00222","name":"三星博物館","type":"fun","startTime":[0,"11:01"],"endTime":[0,"12:00"],"geoLocation":"b001latlon","googleMap":"https://maps.google.com/","address":"宜蘭縣AA","phone":"0900000000","reservation":{"訂位功能":true}},{"id":"b003","name":"吃晚餐","type":"meal","startTime":[0,"18:01"],"endTime":[0,"17:00"],"geoLocation":"b001latlon","googleMap":"https://maps.google.com/","address":"宜蘭縣AA","phone":"0900000000","reservation":{"訂位功能":true}},{"id":"b0041","name":"吃早餐","type":"meal","startTime":[1,"10:01"],"endTime":[1,"11:00"],"geoLocation":"b001latlon","googleMap":"https://maps.google.com/","address":"宜蘭縣AA","phone":"0900000000","reservation":{"訂位功能":true}},{"id":"b005","name":"礁溪溫泉","type":"fun","startTime":[1,"15:01"],"endTime":[1,"16:00"],"geoLocation":"b001latlon","googleMap":"https://maps.google.com/","address":"宜蘭縣AA","phone":"0900000000","reservation":{"訂位功能":true}},{"id":"3c00f31b-13db-42fd-b11e-f185821a7428","name":null,"nodeTypes":null,"address":null,"startTime":[0],"endTime":[-1],"phone":null,"geoLocation":[],"googleMap":null,"childrenCount":null,"reservation":{}},{"id":"26f62b98-a8dd-4caf-85ec-73ac6bfc1002","name":null,"nodeTypes":null,"address":null,"startTime":[0],"endTime":[-1],"phone":null,"geoLocation":[],"googleMap":null,"childrenCount":null,"reservation":{}},{"id":"971a2d78-0e94-49ed-a3db-3fbb0027bd97","name":null,"nodeTypes":null,"address":null,"startTime":[0],"endTime":[-1],"phone":null,"geoLocation":[],"googleMap":null,"childrenCount":null,"reservation":{}},{"id":"c7452865-7a12-4f29-b8ed-adcbe72d5fbf","name":null,"nodeTypes":null,"address":null,"startTime":[1],"endTime":[-1],"phone":null,"geoLocation":[],"googleMap":null,"childrenCount":null,"reservation":{}}]
//a00002[{"id":"b006","name":"租車","type":"traffic","startTime":[0,"10:01"],"endTime":[1,"11:00"],"geoLocation":"b001latlon","googleMap":"https://maps.google.com/","address":"台南市AA","phone":"0900000000","reservation":{"訂位功能":true}},{"id":"b007","name":"青田百貨","type":"fun","startTime":[0,"10:01"],"endTime":[0,"11:00"],"geoLocation":"b001latlon","googleMap":"https://maps.google.com/","address":"台南縣AA","phone":"0900000000","reservation":{"訂位功能":true}},{"id":"b008","name":"吃晚餐","type":"meal","startTime":[1,"18:01"],"endTime":[1,"18:01"],"geoLocation":"b001latlon","googleMap":"https://maps.google.com/","address":"台南縣AA","phone":"0900000000","reservation":{"訂位功能":true}},{"id":"b009","name":"起床","type":"reminder","startTime":[1,"7:01"],"endTime":[-1],"geoLocation":"b001latlon","googleMap":"https://maps.google.com/","address":"台南縣AA","phone":"0900000000","reservation":{"訂位功能":true}},{"id":"b010","name":"租車","type":"traffic","startTime":[0,"13:01"],"endTime":[2,"18:01"],"geoLocation":"b001latlon","googleMap":"https://maps.google.com/","address":"台南縣AA","phone":"0900000000","reservation":{"訂位功能":true}},{"id":"74dad812-7d4c-4b69-b796-3614a31e0bac","name":null,"nodeTypes":null,"address":null,"startTime":[2],"endTime":[-1],"phone":null,"geoLocation":[],"googleMap":null,"childrenCount":null,"reservation":{}},{"id":"a78c526e-1aef-42ea-a9fc-cf35c9e2b4f3","name":null,"nodeTypes":null,"address":null,"startTime":[3],"endTime":[-1],"phone":null,"geoLocation":[],"googleMap":null,"childrenCount":null,"reservation":{}},{"id":"0a611cb4-9831-4eb8-9c0e-0efcf5011443","name":null,"nodeTypes":null,"address":null,"startTime":[3],"endTime":[-1],"phone":null,"geoLocation":[],"googleMap":null,"childrenCount":null,"reservation":{}}]
