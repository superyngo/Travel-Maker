<template>
  <div wrapper>
    <div style="display: none">
      <input
        :id="idProp + 'pac-input'"
        class="controls"
        type="text"
        placeholder="Enter a location"
      />
    </div>

    <div :id="idProp + 'map'" ref="map" style="height: 600px"></div>

    <div :id="idProp + 'infoWindow-contentDom'" class="infoWindow-contentDom">
      <template v-for="item of state.infoWindowContent">
        <component
          v-if="item.tag === 'a' && item.href"
          :is="item.tag"
          :href="item.href"
          target="_blank"
        >
          <strong>{{ item.title }}</strong
          ><span> </span>
        </component>
        <component :is="item.tag" v-else-if="item.value && item.tag !== 'a'">
          <strong>{{ item.title }}</strong> : {{ item.value }}
        </component>
      </template>
    </div>
  </div>
</template>

<script setup>
import {onMounted, reactive} from "vue";
import {useProjectsDB} from "/src/stores/ProjectsStore.js";
const ProjectsDB = useProjectsDB();

const state = reactive({
  map: null,
  markers: null,
  editMode: false,
  infoWindowContent: {
    placename: {tag: "div", title: "Name", value: null, href: null, icon: null},
    address: {
      tag: "div",
      title: "Address",
      value: null,
      href: null,
      icon: null,
    },
    phone: {tag: "div", title: "Phone", value: null, href: null, icon: null},
    openingTime: {
      tag: "div",
      title: "Open on",
      value: null,
      href: null,
      icon: null,
    },
    rating: {
      tag: "div",
      title: "Rating",
      value: null,
      href: null,
      icon: null,
    },
    website: {
      tag: "a",
      title: "Website",
      value: "Website",
      href: null,
      icon: null,
    },
    viewOnGoogleMaps: {
      tag: "a",
      title: "View on Google Maps",
      value: "View on Google Maps",
      href: null,
      icon: null,
    },
  },
  infoWindowDom: {},
});
const props = defineProps({
  idProp: Number || String,
});

const setMap = async () => {
  state.map = new ProjectsDB.google.maps.Map(
    document.getElementById(props.idProp + "map"), //set map to Dom
    {
      center: ProjectsDB.userLocation,
      zoom: 15,
    }
  );

  const smoothPanTo = function (map, target) {
    //smooth panTo
    const start = map.getCenter();
    const startLat = start.lat();
    const startLng = start.lng();
    const targetLat = target.lat();
    const targetLng = target.lng();
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
    //bind search box input to map
    input
  );

  const infowindow = new ProjectsDB.google.maps.InfoWindow({}); //start infoWindow
  state.infoWindowDom = document.getElementById(
    // bind infoWindows dom
    props.idProp + "infoWindow-contentDom"
  );

  const setMarkerWithInfowindow = async function (place) {
    //pin marker with infoWindow
    console.log(place);
    smoothPanTo(state.map, place.geometry.location);
    state.map.setZoom(17);

    chosenPlaceMarker.setPlace({
      // Set the position of the marker using the place ID and location.
      placeId: place.place_id,
      location: place.geometry.location,
    });
    chosenPlaceMarker.setVisible(true);

    infowindow.setContent(state.infoWindowDom);
    infowindow.open(state.map, chosenPlaceMarker);
  };

  const setInfoWindowContent = function (place) {
    state.infoWindowContent.placeId = place.place_id;
    state.infoWindowContent.placename.value = place.name;
    state.infoWindowContent.address.value = place.formatted_address;
    state.infoWindowContent.phone.value = place.formatted_phone_number;
    state.infoWindowContent.openingTime.value =
      place.current_opening_hours?.weekday_text.join(" , ");
    state.infoWindowContent.rating.value = place.rating;
    state.infoWindowContent.website.href = place.website;
    state.infoWindowContent.viewOnGoogleMaps.href = `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;

    state.infoWindowDom.style.display = "inline";
  };

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
        setInfoWindowContent(places[0]);
        setMarkerWithInfowindow(places[0]);
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
            setInfoWindowContent(place);
            setMarkerWithInfowindow(place);
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
    // setMarkerWithInfowindow({
    //   place_id: placeId,
    //   geometry: {location: event.latLng},
    // });

    // Get place details using the Place ID

    placeId &&
      placeService.getDetails(
        {
          placeId: placeId,
          fields: [
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
          ],
        },
        (place, status) => {
          if (status === ProjectsDB.google.maps.places.PlacesServiceStatus.OK) {
            setInfoWindowContent(place);
            setMarkerWithInfowindow(place);
          }
        }
      );
  });

  function openPlaceOnGoogleMaps(placeId) {
    const url = `https://www.google.com/maps/place/?q=place_id:${placeId}`;

    // Open the URL in a new tab
    window.open(url, "_blank");
  }

  //travel function https://developers.google.com/maps/documentation/javascript/examples/directions-travel-modes
};

onMounted(async () => {
  await ProjectsDB.waitUserLocation();
  setMap();
});
</script>

<style scoped lan="scss">
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
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

a {
  margin-right: 5px;
}
</style>