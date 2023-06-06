<template>
  <div class="mapWrapper">
    <div style="display: none">
      <input
        :id="idProp + 'pac-input'"
        class="controls"
        type="text"
        placeholder="Enter a location"
      />
    </div>

    <div :id="idProp + 'map'" ref="map" class="map"></div>

    <div
      :id="idProp + 'infoWindow-contentDom'"
      class="infoWindow-contentDom"
      ref="infoWindowDom"
    >
      <template v-for="item of state.infoWindowContent" :key="item.title">
        <span v-if="item.tag === 'a' && item.href" class="contentItem">
          <span>{{ item.title }}</span>
          <a :href="item.href" target="_blank">
            <span>{{ item.value }}</span>
          </a>
        </span>
        <div v-if="item.tag === 'div' && item.value" class="contentItem">
          <span>{{ item.title }}</span>
          <span class="contentItemLine" v-if="!item.strong">
            {{ item.value }}
          </span>
          <strong class="contentItemLine" v-if="item.strong">
            {{ item.value }}
          </strong>
        </div>
        <div
          v-if="item.tag === 'expand'"
          class="contentItem"
          @click="
            state.infoWindowContent.openingTime.liShow =
              !state.infoWindowContent.openingTime.liShow
          "
        >
          <span>{{ item.title }}</span>
          <span class="openTimeListWrapper" v-auto-animate>
            <div class="firstLine">{{ item.value }}</div>
            <ul
              class="openTimeList"
              v-if="state.infoWindowContent.openingTime.liShow"
            >
              <li v-for="li of item.li">
                {{ li }}
              </li>
            </ul>
          </span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import {onMounted, reactive, ref} from "vue";
import {useProjectsDB} from "/src/stores/ProjectsStore.js";
import {vAutoAnimate} from "@formkit/auto-animate";
const ProjectsDB = useProjectsDB();
const map = ref(null);
const infoWindowDom = ref(null);

const state = reactive({
  map: null,
  markers: null,
  editMode: false,
  infoWindowContent: {
    placename: {tag: "div", title: null, value: null, icon: null, strong: true},
    description: {tag: "div", title: null, value: null, icon: null},
    address: {
      tag: "div",
      title: "📍",
      value: null,
    },
    phone: {tag: "div", title: "☎️", value: null, icon: null},
    openingTime: {
      tag: "expand",
      title: "🕐",
      value: null,
      li: null,
      liShow: false,
    },
    website: {
      tag: "a",
      title: "🌐",
      value: "",
      href: null,
    },
    viewOnGoogleMaps: {
      tag: "a",
      title: "🗺️",
      value: "view on Google Maps",
      href: null,
    },
  },
  chosenPlace: {},
});
const props = defineProps({
  idProp: String,
  pickable: Boolean,
  startPlace: Object,
});

const emits = defineEmits(["pick"]);

const fetchDescription = async function (placeId) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/places?placeid=${placeId}`
    );
    const description = await response.text();
    // const response = await fetch(
    //   `https://www.google.com/maps/place/?q=place_id:${placeId}`
    // );
    // if (!response.ok) throw new Error("Network response was not ok");
    // const htmlString = await response.text();

    // // Create a new DOMParser
    // const parser = new DOMParser();

    // // Parse the HTML string into a DOM document
    // const doc = parser.parseFromString(htmlString, "text/html");
    // console.log("doc", doc);
    // // Handle the parsed HTML document

    // const metaElement = doc.querySelector('meta[itemprop="description"]');

    // // Get the content attribute value of the <meta> element
    // const description = metaElement ? metaElement.getAttribute("content") : "";
    // console.log(description);
    return description;
  } catch (error) {
    console.error("Erroe:", error);
    throw error;
  }
};

function mapCenterControl(map, clickButton) {
  let centerControlDiv = document.createElement("div");

  // Set CSS for the control border.
  let controlUI = document.createElement("button");
  controlUI.style.backgroundColor = "#fff";
  controlUI.style.border = "none";
  controlUI.style.outline = "none";
  controlUI.style.width = "40px";
  controlUI.style.height = "40px";
  controlUI.style.borderRadius = "2px";
  controlUI.style.boxShadow = "0 1px 4px rgba(0,0,0,0.3)";
  controlUI.style.cursor = "pointer";
  controlUI.style.marginRight = "10px";
  controlUI.style.padding = "0";
  controlUI.title = "Your Location";
  centerControlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  let controlText = document.createElement("div");
  controlText.style.margin = "10px";
  controlText.style.width = "30px";
  controlText.style.height = "30px";
  controlText.style.backgroundImage =
    "url('//maps.google.com/mapfiles/kml/pal3/icon40.png')";
  controlText.style.backgroundSize = "20px 20px";
  controlText.style.backgroundPosition = "0px 0px";
  controlText.style.backgroundRepeat = "no-repeat";
  controlUI.appendChild(controlText);

  // constructor passing in this DIV.
  centerControlDiv.index = 1; // 排列優先度
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(centerControlDiv); // 設定按鈕加入地圖的位置

  // Setup the click event listeners.
  controlUI.addEventListener("click", () => clickButton());
}

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
  state.map = new ProjectsDB.google.maps.Map(
    map.value, //set map to Dom
    {
      center: ProjectsDB.userLocation,
      zoom: 15,
      mapTypeControl: false,
    }
  );

  const myPlaceMarker = new ProjectsDB.google.maps.Marker({
    //set chosen PlaceMarker
    clickable: false,
    icon: new google.maps.MarkerImage(
      "//maps.gstatic.com/mapfiles/mobile/mobileimgs2.png",
      new google.maps.Size(22, 22),
      new google.maps.Point(0, 18),
      new google.maps.Point(11, 11)
    ),
    shadow: null,
    zIndex: 999,
    map: state.map,
  });

  mapCenterControl(state.map, async () => {
    //bind my place button
    await ProjectsDB.getCurrentPositionAsync();
    myPlaceMarker.setPosition(ProjectsDB.userLocation);
    smoothPanTo(state.map, ProjectsDB.userLocation, true);
  });

  ProjectsDB.google.maps.event.addListener(
    //set searchbox bounds
    state.map,
    "bounds_changed",
    function () {
      searchBox.setBounds(state.map.getBounds());
    }
  );

  const placeService = new ProjectsDB.google.maps.places.PlacesService( //start place service
    state.map
  );

  const chosenPlaceMarker = new ProjectsDB.google.maps.Marker({
    //set chosen PlaceMarker
    map: state.map,
  });

  const input = document.getElementById(props.idProp + "pac-input"); //set search bar to dom
  const searchBox = new ProjectsDB.google.maps.places.SearchBox(input); //start search box
  state.map.controls[ProjectsDB.google.maps.ControlPosition.TOP_CENTER].push(
    //put search box input to map
    input
  );

  const infowindow = new ProjectsDB.google.maps.InfoWindow({}); //start infoWindow

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

  if (props.startPlace) {
    //set inital place
    console.log(props.startPlace);
    setInfoWindowContentAndMarkerWithInfowindow(props.startPlace);
  }

  let markers = [];

  searchBox.addListener("places_changed", () => {
    // Create a search event listener on the map
    const places = searchBox.getPlaces();

    places.forEach((place) => {
      placeService.getDetails(
        {
          placeId: place.place_id,
          fields: [
            "current_opening_hours",
            "formatted_phone_number",
            "website",
          ],
        },
        (placeWithOH, status) => {
          if (status === ProjectsDB.google.maps.places.PlacesServiceStatus.OK) {
            place.current_opening_hours = placeWithOH.current_opening_hours;
            place.formatted_phone_number = placeWithOH.formatted_phone_number;
            place.website = placeWithOH.website;
          }
        }
      );
    });

    switch (places.length) {
      case 0: //no places
        break;
      case 1: //1 place
        setInfoWindowContentAndMarkerWithInfowindow(places[0]);
        break;
      default: // Many places result
        markers.forEach((marker) => {
          marker.setMap(null);
        });
        markers = [];

        const bounds = new ProjectsDB.google.maps.LatLngBounds();

        places.forEach((place) => {
          // For each place, get the icon, name and location.
          if (!place.geometry || !place.geometry.location) {
            console.log("Returned place contains no geometry");
            return;
          }

          const icon = {
            url: place.icon,
            size: new ProjectsDB.google.maps.Size(71, 71),
            origin: new ProjectsDB.google.maps.Point(0, 0),
            anchor: new ProjectsDB.google.maps.Point(17, 34),
            scaledSize: new ProjectsDB.google.maps.Size(25, 25),
          };

          markers.push(
            // Create a marker for each place.
            new ProjectsDB.google.maps.Marker({
              map: state.map,
              icon,
              title: place.name,
              position: place.geometry.location,
            })
          );
          markers[markers.length - 1].addListener("click", () => {
            setInfoWindowContentAndMarkerWithInfowindow(place);
          });

          if (place.geometry.viewport) {
            // set map bounds to search results
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        });
        state.map.fitBounds(bounds);
    }
  });

  state.map.addListener("click", async (event) => {
    // Create a click event listener on the map
    if (!event.placeId) {
      console.log("no POI place ID");
      return;
    }
    event.stop();
    const placeId = event.placeId;

    placeId && // Get place details using the Place ID
      placeService.getDetails(
        {
          placeId: placeId,
          fields: ProjectsDB.fields,
        },
        (place, status) => {
          if (status === ProjectsDB.google.maps.places.PlacesServiceStatus.OK) {
            setInfoWindowContentAndMarkerWithInfowindow(place);
          }
        }
      );
  });

  //travel function https://developers.google.com/maps/documentation/javascript/examples/directions-travel-modes
};

onMounted(async () => {
  await ProjectsDB.waitUserLocation();

  setMap();
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
  z-index: 1;
}

.controls {
  background-color: #fff;
  border-radius: 2px;
  border: 1px solid transparent;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
  font-family: Roboto;
  font-size: 15px;
  font-weight: 300;
  height: 29px;
  margin-left: 17px;
  margin-top: 10px;
  outline: none;
  padding: 0 11px 0 13px;
  text-overflow: ellipsis;
  width: 400px;
}

.controls:focus {
  border-color: #4d90fe;
}

.title {
  font-weight: bold;
}

.infoWindow-contentDom {
  display: none;
}
.clickableContentItem:hover {
  font-size: 1.2rem;
}
.clickableContentItem:active {
  font-size: 1rem;
}

.contentItem {
  display: grid;
  grid-template-columns: 1.5rem 1fr;
  cursor: pointer;
  position: relative;
}

.contentItem:hover::after {
  content: "";
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.1);
  filter: brightness(0.9);
  z-index: 0;
}

a {
  z-index: 1;
}
</style>
