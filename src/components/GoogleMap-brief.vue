<template>
  <div class="mapWrapper">
    <div id="map" ref="map" class="map"></div>
  </div>
</template>

<script setup>
import {onMounted, reactive, ref, watch} from "vue";
import {useProjectsDB} from "/src/stores/ProjectsStore.js";
import {vAutoAnimate} from "@formkit/auto-animate";
const ProjectsDB = useProjectsDB();
const map = ref(null);

const state = {
  map: null,
  nodesPosition: [],
  nodeId: [],
  infoWindow: null,
  markers: [],
  polyline: [],
  polylineDistanceMarker: [],
};
const props = defineProps({
  startPlace: Object,
});

const fetchDescription = async function (placeId) {
  try {
    const response = await fetch(
      `https://www.google.com/maps/place/?q=place_id:${placeId}`
    );
    if (!response.ok) throw new Error("Network response was not ok");
    const htmlString = await response.text();

    // Create a new DOMParser
    const parser = new DOMParser();

    // Parse the HTML string into a DOM document
    const doc = parser.parseFromString(htmlString, "text/html");
    console.log("doc", doc);
    // Handle the parsed HTML document

    const metaElement = doc.querySelector('meta[itemprop="description"]');

    // Get the content attribute value of the <meta> element
    const description = metaElement ? metaElement.getAttribute("content") : "";
    console.log(description);
    return description;
  } catch (error) {
    console.error("Erroe:", error);
    throw error;
  }
};

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

  const setInfoWindowContentAndMarkerWithInfowindow = async function (place) {
    //get description from Google Maps
    const description = await fetchDescription(place.place_id);

    //fill content
    state.infoWindowContent.placeId = place.place_id;
    state.infoWindowContent.description.value =
      (place.rating || null) + " " + description;
    state.infoWindowContent.placename.value = place.name;
    state.infoWindowContent.address.value = place.formatted_address;
    state.infoWindowContent.phone.value = place.formatted_phone_number;
    state.infoWindowContent.openingTime.value = place.current_opening_hours
      ?.open_now
      ? "營業中"
      : "休息中";
    state.infoWindowContent.openingTime.li =
      place.current_opening_hours?.weekday_text;
    const url = place.website ? new URL(place.website) : null;
    state.infoWindowContent.website.href = url;
    state.infoWindowContent.website.value = url?.hostname;
    state.infoWindowContent.viewOnGoogleMaps.href = `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;
    infoWindowDom.value.style.display = "inline";

    //setMarkerWithInfowindow
    //pin marker with infoWindow
    state.chosenPlace = place;
    smoothPanTo(state.map, place.geometry.location);
    state.map.setZoom(17);
    console.log("mark", place);
    chosenPlaceMarker.setPlace({
      // Set the position of the marker using the place ID and location.
      placeId: place.place_id,
      location: place.geometry.location,
    });
    chosenPlaceMarker.setVisible(true);
    chosenPlaceMarker.addListener("click", () => {
      infowindow.open(state.map);
    });

    infowindow.setContent(infoWindowDom.value);
    infowindow.open(state.map, chosenPlaceMarker);

    if (props.pickable) {
      emits("pick", state.chosenPlace);
    }
  };
  state.infoWindow = new ProjectsDB.google.maps.InfoWindow();
};

const initailPlace = function () {
  state.nodesPosition = [];
  state.nodeId = [];
  ProjectsDB.nodeSortedByTime[1][ProjectsDB.selectedDate]?.forEach(({node}) => {
    state.nodesPosition.push(node.geometry);
    state.nodeId.push(node.id);
  });
};

const setMarkers = function () {
  state.markers.forEach((marker) => {
    marker.setMap(null);
  });
  state.markers = [];

  state.polyline.forEach((polyline) => {
    polyline.setMap(null);
  });
  state.polyline = [];
  // Create an info window to share between markers.

  const bounds = new ProjectsDB.google.maps.LatLngBounds();

  // Create the markers.
  if (!state.nodesPosition) return;
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
      state.infoWindow.close();
      state.infoWindow.setContent("123");
      state.infoWindow.open(state.map, markers[i]);
    });

    if (i > 0) {
      // Connect markers with a polyline
      state.polyline[i] = new google.maps.Polyline({
        path: [state.nodesPosition[i - 1], position],
        map: state.map,
        strokeColor: "#ff0000", // Set the color of the polyline (e.g., red)
        strokeOpacity: 1, // Set the opacity of the polyline (0.0 - 1.0)
        strokeWeight: 3, // Se
      });

      // Calculate and display the distance
      const distance =
        ProjectsDB.google.maps.geometry.spherical.computeLength(
          state.polyline[i].getPath()
        ) / 1000;

      const centerPosition = {
        lat: (state.nodesPosition[i - 1].lat + position.lat) / 2,
        lng: (state.nodesPosition[i - 1].lng + position.lng) / 2,
      };
      console.log(centerPosition);

      // Add a custom marker with the distance information
      state.polylineDistanceMarker[i] = new google.maps.Marker({
        position: centerPosition, // Set the marker position halfway along the path
        map: state.map,
        label: {
          text: distance.toFixed(2) + " km", // Set the label as the distance in meters,
          color: "purple",
        },
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"></svg>',
          labelOrigin: new ProjectsDB.google.maps.Point(80, 140),
        },
      });
    }
  });
};

watch(
  () => ProjectsDB.nodeSortedByTime[1][ProjectsDB.selectedDate],
  () => {
    if (!state.map) return;
    initailPlace();
    if (!state.markers) return;
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
</style>
