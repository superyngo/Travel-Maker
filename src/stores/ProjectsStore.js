import {defineStore} from "pinia";
import fetchDB from "/src/utils/fetchDB.js";
import exportDB from "/src/utils/exportDB.js";

export const useProjectsDB = defineStore("mainState", {
  state: () => ({
    //定義狀態初始值
    modalIsOpen: {},
    isNewMark: {},
    projectsDB: [],
    selectedProjectID: -1,
    selectedProjectNodes: [],
    selectedDateIndex: 1,
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
    selectedProject: function () {
      return this.projectsDB[this.selectedProjectIndex];
    },
    selectedProjectNodesID: function () {
      return this.projectsDB.filter(
        (project) => project.id === this.selectedProjectID
      )[0]?.nodesID;
    },
    selectedProjectNodesDates: function () {
      // the selected project's dates in serial
      if (this.selectedProjectID === -1) {
        return;
      }
      let tempSelectedProjectNodesDates =
        this.getDatesBetweenDates(
          this.projectsDB.filter(
            (project) => project.id === this.selectedProjectID
          )[0]?.dateStartEnd
        ) || [];
      tempSelectedProjectNodesDates = [
        "temp",
        ...tempSelectedProjectNodesDates,
      ];

      return tempSelectedProjectNodesDates;
    },
    selectedDate: function () {
      return this.selectedProjectNodesDates[this.selectedDateIndex];
    },
    nodesGroupedByDatesAndTime: function () {
      if (!this.selectedProjectNodes) return;
      let tempNodesGroupedByDatesAndTime = {};
      let tempArrayToSort = {start: [], end: []};
      this.selectedProjectNodes.forEach((node) => {
        //start nodes
        let [date, timeHH] = [
          node.startTime[0],
          node.startTime[1]
            ? isNaN(parseInt(node.startTime[1].substring(0, 2)))
              ? -1
              : parseInt(node.startTime[1].substring(0, 2))
            : -1,
        ];
        tempNodesGroupedByDatesAndTime[date] =
          tempNodesGroupedByDatesAndTime[date] || [];
        tempNodesGroupedByDatesAndTime[date][timeHH] =
          tempNodesGroupedByDatesAndTime[date][timeHH] || {};
        tempNodesGroupedByDatesAndTime[date][timeHH].start =
          tempNodesGroupedByDatesAndTime[date][timeHH].start || [];
        tempNodesGroupedByDatesAndTime[date][timeHH].start.push(node);
        if (timeHH !== -1) {
          tempArrayToSort.start.push(
            tempNodesGroupedByDatesAndTime[date][timeHH].start
          );
        }
        //end nodes
        if (!node.endTime[0]) return;
        [date, timeHH] = [
          node.endTime[0],
          node.endTime[1]
            ? isNaN(parseInt(node.endTime[1].substring(0, 2)))
              ? -1
              : parseInt(node.endTime[1].substring(0, 2))
            : -1,
        ];
        tempNodesGroupedByDatesAndTime[date] =
          tempNodesGroupedByDatesAndTime[date] || [];
        tempNodesGroupedByDatesAndTime[date][timeHH] =
          tempNodesGroupedByDatesAndTime[date][timeHH] || {};
        tempNodesGroupedByDatesAndTime[date][timeHH].end =
          tempNodesGroupedByDatesAndTime[date][timeHH].end || [];
        tempNodesGroupedByDatesAndTime[date][timeHH].end.push(node);
        if (timeHH !== -1) {
          tempArrayToSort.end.push(
            tempNodesGroupedByDatesAndTime[date][timeHH].end
          );
        }
      });
      [tempArrayToSort.start, tempArrayToSort.end] = [
        Array.from(new Set(tempArrayToSort.start)),
        Array.from(new Set(tempArrayToSort.end)),
      ];
      tempArrayToSort.start.forEach((array) => {
        array.sort((a, b) => {
          return (
            parseInt(a.startTime[1].substring(3, 5)) -
            parseInt(b.startTime[1].substring(3, 5))
          );
        });
      });
      tempArrayToSort.end.forEach((array) => {
        array.sort((a, b) => {
          return (
            parseInt(a.endTime[1].substring(3, 5)) -
            parseInt(b.endTime[1].substring(3, 5))
          );
        });
      });

      return tempNodesGroupedByDatesAndTime;
    },
    nodesSelectedDateGroupedByTime: function () {
      return this.nodesGroupedByDatesAndTime?.[this.selectedDate];
    },
    nodeSortedByTime: function () {
      if (!this.selectedProjectNodes) return;
      let tempNodeSortedByTime = {};
      let tempNodeNoTime = {};
      let datesToloopArray = [];
      this.selectedProjectNodes.forEach((node) => {
        //start nodes
        let [date, timeHH] = [
          node.startTime[0],
          node.startTime[1]
            ? isNaN(parseInt(node.startTime[1].substring(0, 2)))
              ? -1
              : parseInt(node.startTime[1].substring(0, 2))
            : -1,
        ];
        tempNodeSortedByTime[date] = tempNodeSortedByTime[date] || [];
        tempNodeNoTime[date] = tempNodeNoTime[date] || [];
        switch (timeHH) {
          case -1:
            tempNodeNoTime[date].push({
              type: "start",
              node: node,
            });
            break;
          default:
            tempNodeSortedByTime[date].push({
              time: node.startTime[1],
              type: "start",
              node: node,
            });
            datesToloopArray.push(date);
            break;
        }
        // end nodes
        [date, timeHH] = [
          node.endTime[0],
          node.endTime[1]
            ? isNaN(parseInt(node.endTime[1].substring(0, 2)))
              ? -1
              : parseInt(node.endTime[1].substring(0, 2))
            : -1,
        ];
        tempNodeSortedByTime[date] = tempNodeSortedByTime[date] || [];
        tempNodeNoTime[date] = tempNodeNoTime[date] || [];
        switch (timeHH) {
          case -1:
            tempNodeNoTime[date].push({
              type: "end",
              node: node,
            });
            break;
          default:
            tempNodeSortedByTime[date].push({
              time: node.endTime[1],
              type: "end",
              node: node,
            });
            datesToloopArray.push(date);
            break;
        }
      });

      datesToloopArray = Array.from(new Set(datesToloopArray));
      datesToloopArray.forEach((date) => {
        tempNodeSortedByTime[date].sort((a, b) => {
          return this.timeToNumber(a.time) - this.timeToNumber(b.time);
        });
      });

      return [tempNodeNoTime, tempNodeSortedByTime];
    },
    nodeType: () => ["🏠", "🍴", "🚗", "🎉", "⁉️"],
    fields: () => [
      "place_id",
      "name",
      "type",
      "formatted_phone_number",
      "geometry",
      "website",
      "formatted_address",
      "icon",
      "rating",
      "current_opening_hours",
      "editorial_summary",
    ],
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
      const tempSelectedDateIndex = this.selectedDateIndex;
      console.log("Fetching selected project data");
      this.selectedDateIndex =
        this.selectedProjectNodesDates.length - 1 < tempSelectedDateIndex
          ? 1
          : tempSelectedDateIndex;

      //algorithm
      const addAbsDivideBy2Add1 = function (index) {
        return (index + Math.abs(index)) / 2;
      };

      //fetch selected project's nodes
      const selectedProjectNodesDB = await fetchDB.fetchSelectedNodesDB(
        this.saveOption.storageType,
        this.selectedProjectID
      );
      //map date
      if (!selectedProjectNodesDB || selectedProjectNodesDB.length === 0) {
        this.selectedProjectNodes = [];
        return;
      }
      this.selectedProjectNodes = selectedProjectNodesDB.map((node) => {
        //map right time
        [node.startTime[0], node.endTime[0]] = [
          this.selectedProjectNodesDates[
            addAbsDivideBy2Add1(node.startTime[0])
          ] || this.selectedProjectNodesDates[0],
          this.selectedProjectNodesDates[node.endTime[0]],
        ];
        return node;
      });
    },
    exportProjectDB() {
      exportDB.exportData(
        this.saveOption.storageType,
        this.projectsDB,
        this.saveOption.name
      );
    },
    exportNodesDB() {
      const flatArray = this.deepCopyFunction(this.selectedProjectNodes);
      let mapTimeResult = [];
      if (flatArray) {
        mapTimeResult = flatArray.map((node) => {
          [node.startTime[0], node.endTime[0]] = [
            this.selectedProjectNodesDates.indexOf(node.startTime[0]),
            this.selectedProjectNodesDates.indexOf(node.endTime[0]),
          ];
          return node;
        });
      }
      exportDB.exportData(
        "localStorage",
        mapTimeResult,
        this.selectedProjectID
      );
      //save nodesID back in to ProjectDB
      this.projectsDB[this.selectedProjectIndex].nodesID = mapTimeResult.map(
        (node) => node.id
      );
      //save modified nodes back to state
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
      // let outObject, value, key;
      // if (typeof inObject !== "object" || inObject === null) {
      //   return inObject; // Return the value if inObject is not an object
      // }
      // // Create an array or object to hold the values
      // outObject = Array.isArray(inObject) ? [] : {};
      // for (key in inObject) {
      //   value = inObject[key];
      //   // Recursively (deep) copy for nested objects, including arrays
      //   outObject[key] = this.deepCopyFunction(value);
      // }
      return JSON.parse(JSON.stringify(inObject));
    },
    removeProject() {
      if (this.selectedProjectID === -1) return;
      let handler = () =>
        confirm("Are you sure you want to remove this project");
      if (this.isNewMark[this.selectedProjectID]) {
        delete this.isNewMark[this.selectedProjectID];
        handler = () => true;
      }
      if (handler()) {
        delete this.modalIsOpen[this.selectedProjectID];
        switch (this.saveOption.storageType) {
          case "localStorage":
            console.log(this.selectedProjectID);
            localStorage.removeItem(this.selectedProjectID);
            this.projectsDB.splice(this.selectedProjectIndex, 1);
            this.selectedProjectID = -1;
            break;
          case "DB":
            //manipulate DB
            break;
        }
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
    timeToNumber(timeString) {
      // if (Array.isArray(timeString)) {
      //   return timeString.map((i) => this.timeToNumber(i));
      // }
      const [hours, minutes] = timeString.split(":");
      const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
      return isNaN(totalMinutes) ? 0 : totalMinutes;
    },
    numberToTime(timeNumber) {
      const [hours, minutes] = [Math.floor(timeNumber / 60), timeNumber % 60];
      return (
        hours.toString().padStart(2, "0") +
        ":" +
        minutes.toString().padStart(2, "0")
      );
    },
  },
});

//[{"id":"a00001","name":"宜蘭二日遊","destination":"宜蘭","dateStartEnd":["2023-04-06","2023-04-07"],"headCount":3,"childrenCount":1,"nodesID":["b001","b002","b003","b004","b005"]},{"id":"a00002","name":"台南二日遊","destination":"台南","dateStartEnd":["2023-05-01","2023-05-03"],"headCount":3,"childrenCount":1,"nodesID":["b006","b007","b008","b009","b010"]},{"id":"91c1fc8f-de57-48f7-b41e-a794864ed204","name":"new project21321","destination":null,"dateStartEnd":["2023-05-10","2023-05-26"],"headCount":null,"childrenCount":null,"nodesID":[]}]

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
