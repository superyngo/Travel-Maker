<template>
  <div class="mapWrapper">
    <div id="map" ref="map" class="map"></div>
  </div>
  <div class="infoWindow-contentDom" ref="infoWindowDom"></div>
</template>

<script setup>
import {onMounted, ref, watch} from "vue";
import {useProjectsDB} from "/src/stores/ProjectsStore.js";
const ProjectsDB = useProjectsDB();
const map = ref(null);
const infoWindowDom = ref(null);

const state = {
  map: null,
  nodesPosition: [],
  nodeId: [],
  nodeName: [],
  infoWindow: null,
  directionsService: null,
  directionsRenderer: null,
  markers: [],
  path: [],
  // polylineDistanceMarker: [],
  // polyline: [],
  openModal: [],
  previousModal: null,
  distanceAndDuration: [],
};
const props = defineProps({
  startPlace: Object,
});

const smoothPanTo = function (map, target, isCenter) {
  //smooth panTo
  const start = map.getCenter();
  const startLat = start.lat();
  const startLng = start.lng();
  const targetLat =
    (typeof target.lat === "function" ? target.lat() : target.lat) +
    (isCenter ? 0 : 0.0012);
  const targetLng =
    typeof target.lng === "function" ? target.lng() : target.lng;
  const steps = 30; // Number of steps in the animation
  const delay = 0; // Delay between each step (in milliseconds)

  let i = 0;
  const panStep = () => {
    i++;
    const progress = i / steps;
    const deltaLat = targetLat - startLat;
    const deltaLng = targetLng - startLng;
    const newLat = startLat + deltaLat * progress;
    const newLng = startLng + deltaLng * progress;
    const newPosition = {lat: newLat, lng: newLng};
    map.panTo(newPosition);

    if (i < steps) {
      setTimeout(panStep, delay);
    }
  };

  panStep();
};

const setMap = async () => {
  if (!state.markers) return;
  state.map = new ProjectsDB.google.maps.Map(
    map.value, //set map to Dom
    {
      center: state.nodesPosition[0] || ProjectsDB.userLocation,
      zoom: 15,
      mapTypeControl: false,
    }
  );

  state.infoWindow = new ProjectsDB.google.maps.InfoWindow();
  //Initialize the Direction Service
  state.directionsService = new ProjectsDB.google.maps.DirectionsService();
};

const initailPlace = function () {
  [state.nodesPosition, state.nodeId, state.nodeName] = [[], [], []];

  ProjectsDB.nodeSortedByTime[1][ProjectsDB.selectedDate]?.forEach(({node}) => {
    if (node.geometry) {
      state.nodesPosition.push(node.geometry);
      state.nodeId.push(node.id);
      state.nodeName.push(node.name);
    }
  });
};

const cleanMarkers = function () {
  console.log(state.directionsRenderer);
  if (state.directionsRenderer)
    state.directionsRenderer.set("directions", null);

  console.log(state.markers);
  state.markers.forEach((marker) => marker.setMap(null));
  console.log("cleaning123");
  state.markers = [];
};

const setMarkers = function () {
  // Create an info window to share between markers.

  const bounds = new ProjectsDB.google.maps.LatLngBounds();

  // Create the markers.
  if (!state.nodesPosition || !state.nodesPosition[0]) return;
  state.nodesPosition.forEach((position, i) => {
    state.markers[i] = new ProjectsDB.google.maps.Marker({
      position,
      map: state.map,
      shadow: null,
      zIndex: 999,
      label: (i + 1).toString(),
    });

    bounds.extend(position);
    state.map.fitBounds(bounds);

    // Add a click listener for each marker, and set up the info window.
    state.markers[i].addListener("click", ({domEvent, latLng}) => {
      state.openModal.push(function () {
        ProjectsDB.modalIsOpen[state.nodeId[i]] = true;
      });
      if (state.previousModal) {
        infoWindowDom.value.removeEventListener("click", state.previousModal);
      }
      infoWindowDom.value.addEventListener("click", state.openModal[0]);
      state.previousModal = state.openModal.pop();
      infoWindowDom.value.innerText =
        (state.distanceAndDuration[i - 1]?.distance.text ?? "") +
        (state.distanceAndDuration[i - 1]?.duration.text
          ? ` (${state.distanceAndDuration[i - 1]?.duration.text}) to`
          : "") +
        state.nodeName[i];
      state.infoWindow.close();
      state.infoWindow.setContent(infoWindowDom.value);
      state.infoWindow.open(state.map, state.markers[i]);
      infoWindowDom.value.style.display = "inline";
    });

    //original design just straight poly line
    // if (i > 0) {
    //   // Connect markers with a polyline
    //   state.polyline[i] = new google.maps.Polyline({
    //     path: [state.nodesPosition[i - 1], position],
    //     map: state.map,
    //     strokeColor: "#ff0000", // Set the color of the polyline (e.g., red)
    //     strokeOpacity: 1, // Set the opacity of the polyline (0.0 - 1.0)
    //     strokeWeight: 3, // Se
    //   });

    //   // Calculate and display the distance
    //   const distance =
    //     ProjectsDB.google.maps.geometry.spherical.computeLength(
    //       state.polyline[i].getPath()
    //     ) / 1000;

    //   const centerPosition = {
    //     lat: (state.nodesPosition[i - 1].lat + position.lat) / 2,
    //     lng: (state.nodesPosition[i - 1].lng + position.lng) / 2,
    //   };

    //   // Add a custom marker with the distance information
    //   state.polylineDistanceMarker[i] = new google.maps.Marker({
    //     position: centerPosition, // Set the marker position halfway along the path
    //     map: state.map,
    //     label: {
    //       text: distance.toFixed(2) + " km", // Set the label as the distance in meters,
    //       color: "purple",
    //     },
    //     icon: {
    //       url: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"></svg>',
    //       labelOrigin: new ProjectsDB.google.maps.Point(80, 140),
    //     },
    //   });
    // }
  });

  // //use path + polyline
  // //Loop and Draw Path Route between the Points on MAP
  // for (var i = 0; i < state.nodesPosition.length; i++) {
  //   if (i + 1 < state.nodesPosition.length) {
  //     var src = state.nodesPosition[i];
  //     var des = state.nodesPosition[i + 1];
  //     // path.push(src);
  //     state.directionsService.route(
  //       {
  //         origin: src,
  //         destination: des,
  //         travelMode: ProjectsDB.google.maps.DirectionsTravelMode.WALKING,
  //       },
  //       function (result, status) {
  //         if (status == ProjectsDB.google.maps.DirectionsStatus.OK) {
  //           //Initialize the Path Array
  //           state.path = new ProjectsDB.google.maps.MVCArray();
  //           //Set the Path Stroke Color
  //           state.polyline = new ProjectsDB.google.maps.Polyline({
  //             map: state.map,
  //             strokeColor: "#4986E7",
  //           });
  //           state.polyline.setPath(state.path);
  //           for (
  //             var i = 0, len = result.routes[0].overview_path.length;
  //             i < len;
  //             i++
  //           ) {
  //             state.path.push(result.routes[0].overview_path[i]);
  //           }
  //         }
  //       }
  //     );
  //   }
  // }

  // use directionsRenderer
  // Define the route request options
  const request = {
    origin: state.nodesPosition[0], // Set the origin to the first place
    destination: state.nodesPosition[state.nodesPosition.length - 1], // Set the destination to the last place
    waypoints: state.nodesPosition.slice(1, -1).map((point) => {
      return {location: point, stopover: true};
    }), // Set the waypoints to intermediate places
    travelMode: ProjectsDB.google.maps.TravelMode.WALKING,
  };
  // Send the route request
  state.directionsService.route(request, function (response, status) {
    console.log(response);
    state.distanceAndDuration = response.routes[0].legs;
    if (status === ProjectsDB.google.maps.DirectionsStatus.OK) {
      // Create a Directions Renderer object and set its map and directions properties
      state.directionsRenderer = new ProjectsDB.google.maps.DirectionsRenderer({
        map: state.map,
        directions: response,
        suppressMarkers: true,
        draggable: false,
      });
    } else {
      // Handle the error case
      console.log("Error:", status);
    }
  });
};

watch(
  () => ProjectsDB.nodeSortedByTime[1][ProjectsDB.selectedDate],
  () => {
    if (!state.map) return;
    initailPlace();
    if (!state.nodesPosition) return;
    cleanMarkers();
    setMarkers();
  }
);

onMounted(async () => {
  await ProjectsDB.waitUserLocation();
  initailPlace();
  setMap();
  setMarkers();
});
</script>

<style scoped>
.mapWrapper {
  height: 100%;
  border: 1px solid black;
}
.map {
  width: 100%;
  height: 100%;
  /* border: 5px solid black; */
  /* z-index: 1; */
}

.infoWindow-contentDom {
  display: none;
  cursor: pointer;
}

/* .infoWindow-contentDom:hover {
  font-size: 1rem;
}
.infoWindow-contentDom:active {
  font-size: 0.9rem;
} */
</style>
