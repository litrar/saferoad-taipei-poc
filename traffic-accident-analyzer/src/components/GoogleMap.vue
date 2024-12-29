<template>
    <div>
      <div id="map"></div>
      <div style="margin-top: 20px;">
        <label>目標地點：</label>
        <input
          v-model="destination"
          @keyup.enter="calculateRoute"
          placeholder="輸入目的地"
          class="destination-input"
        />
        <button @click="calculateRoute" class="route-button">規劃路徑</button>
      </div>
      <div v-if="steps.length" class="steps-container" style="margin-top: 40px;">
        <ul>
          <li
            v-for="(step, index) in steps"
            :key="index"
            class="step-item"
          >
            <span class="step-index">步驟 {{ index + 1 }}:</span> {{ step }}
          </li>
        </ul>
      </div>
    </div>
  </template>
    
  
  <script>
  /* global google */
//   import RoadblockFetcher from "@/components/RoadblockFetcher.vue";
export default {
  data() {
    return {
      map: null,
      destination: "",
      steps: [],
      roadblocks: [],
      directionsRenderer: null,
    };
  },
  methods: {
    loadGoogleMapsAPI() {
    if (window.google && google.maps) {
        console.log("Google Maps API already loaded");
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        if (document.getElementById("google-maps-script")) {
        resolve();
        return;
        }
        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src =
        "https://maps.googleapis.com/maps/api/js?key=AIzaSyCgU1cmUh5LUDLZ3HNWJbYufN5rVhsQfwI&libraries=places,marker,drawing,geometry";
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
},
    initMap() {
      const mapElement = document.getElementById("map");
      if (!mapElement) {
        console.error("Map element not found");
        return;
      }
      this.map = new google.maps.Map(mapElement, {
        center: { lat: 24.988, lng: 121.575 },
        zoom: 18,
        mapId: "DEMO_MAP_ID",
      });
      this.navigateToLocation();
    },
    navigateToLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            this.map.setCenter(userLocation);
            new google.maps.Marker({
              position: userLocation,
              map: this.map,
              title: "您的位置",
            });
          },
          () => console.error("Failed to get current location")
        );
      }
    },
  calculateRoute() {
    if (!this.destination) {
        alert("請輸入目的地！");
        return;
    }
    if (!this.directionsRenderer) {
    this.directionsRenderer = new google.maps.DirectionsRenderer();
    this.directionsRenderer.setMap(this.map);
    }
    const directionsService = new google.maps.DirectionsService();

    navigator.geolocation.getCurrentPosition(
        (position) => {
        const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
        };

        directionsService.route(
        {
          origin: userLocation,
          destination: this.destination,
          travelMode: google.maps.TravelMode.DRIVING, 
        },
        (response, status) => {
          if (status === "OK") {
            this.directionsRenderer.setDirections(response);
            this.steps = response.routes[0].legs[0].steps.map((step) =>
              step.instructions.replace(/<[^>]*>/g, "")
            );
          } else {
            alert("路徑規劃失敗：" + status);
          }
        }
      );
        },
        () => {
        alert("無法獲取當前位置！");
        }
    );
},
    displaySteps(route) {
      this.steps = route.legs.flatMap((leg) =>
        leg.steps.map((step) => step.instructions.replace(/<[^>]*>/g, ""))
      );
    },
  },
  mounted() {
  this.loadGoogleMapsAPI().then(() => {
    this.initMap();
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: false, 
    });
    this.directionsRenderer.setMap(this.map);
  });
}
};

  </script>
  
  <style>
#map {
  border: 5px solid powderblue;
  margin-block: 20px;
  height: 500px;
  width: 80%;
  margin: 0 auto;
  position: relative; 
}

#map,
.steps-container {
  margin: 0 auto;
  width: 80%; 
}

h3 {
  margin: 0 0 10px 0;
  text-align: left;
  font-size: 1.5em;
}

ul {
  list-style: none;
  margin: 0; 
  padding: 0;
}

.step-item {
  margin-bottom: 10px;
  padding: 10px;
  background-color: #e6f7ff;
  border-radius: 8px; 
  font-size: 16px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 
}

.step-item:hover {
  background-color: #cceeff;
}

.step-index {
  font-weight: bold;
  margin-right: 5px;
}


li {
  margin-bottom: 10px;
  font-size: 16px;
  display: flex;
  align-items: center;
}

li::before {
  content: "🚗";
  margin-right: 10px;
  font-size: 18px;
}

.destination-input {
  margin-left: 20px;
  padding: 10px;
  border: 2px solid #ccc;
  border-radius: 8px;
  width: 300px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.destination-input:focus {
  border-color: #007bff;
  box-shadow: 0 0 8px rgba(0, 123, 255, 0.5);
}

.route-button {
  margin-left: 20px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s, box-shadow 0.3s;
}

.route-button:hover {
  background-color: #0056b3;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.route-button:active {
  background-color: #004085;
}

  </style>
  