<template>
    <div>
      <header class="fixed-header">
        <h1>SafeRoad Taipei</h1>
      </header>
      <div class="spacer"></div>
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
import { fetchRoute } from './apiService';  
/* global google */
export default {
  data() {
    return {
      map: null,
      destination: "",
      steps: [],
      directionsRenderer: null,
    };
  },
  methods: {
  async loadGoogleMapsAPI() {
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
    });

    this.directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: false,
    });
    this.directionsRenderer.setMap(this.map);

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
  async calculateRoute() {
		if (!this.destination) {
		alert("請輸入目的地！");
		return;
		}

		navigator.geolocation.getCurrentPosition(
		async (position) => {
			const sourceLat = position.coords.latitude;
			const sourceLng = position.coords.longitude;

			try {
      const destinationCoords = await this.getCoordinatesFromAddress(this.destination);
          if (!destinationCoords) {
            alert("目標地點經緯度轉換錯誤");
            return;
          }

      const destLat = destinationCoords.lat;
      const destLng = destinationCoords.lng;
			const data = await fetchRoute(sourceLat, sourceLng, destLat, destLng);
			
			if (!data || !data.route) {
				alert("fetchRoute出錯，無法獲取有效的路徑資訊！");
				return;
			}

			this.updateMapWithRoute(data.route);
			this.displaySteps(data.route.legs[0]);
			} catch (error) {
			console.error("Error calculating route:", error);
			alert("路徑計算失敗，請稍後再試。");
			}
		},
		() => {
			alert("無法獲取當前位置！");
		}
		);
  },
  async getCoordinatesFromAddress(address) {
      const geocoder = new google.maps.Geocoder();

      return new Promise((resolve) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === "OK" && results[0]) {
            const location = results[0].geometry.location;
            resolve({ lat: location.lat(), lng: location.lng() });
          } else {
            console.error(`Geocoding failed: ${status}`);
            resolve(null);
          }
        });
      });
    },

  updateMapWithRoute(route) {
  const bounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(route.bounds.southwest),
    new google.maps.LatLng(route.bounds.northeast)
  );

  if (this.routePolylines) {
    this.routePolylines.forEach(polyline => polyline.setMap(null));
  }
  this.routePolylines = [];

  this.map.fitBounds(bounds);

  // const getRiskColor = (score) => {
  //   if (score < 0.3) return "#008000"; // 綠色
  //   if (score < 0.6) return "#FFFF00"; // 黃色
  //   return "#FF0000"; // 紅色
  // };

  const steps = route.legs[0].steps;
  steps.forEach((step) => {
    const decodedPath = google.maps.geometry.encoding.decodePath(step.polyline.points);
    const polyline = new google.maps.Polyline({
      path: decodedPath,
      geodesic: true,
      strokeColor: "#F89880",
      strokeOpacity: 1.0,
      strokeWeight: 5,
      icons: [
        {
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 5, 
            strokeWeight: 5,
            strokeColor: '#FF5733',
            fillColor: '#097969',
          },
          offset: '0%', 
          repeat: '400px' 
        },
      ],
      map: this.map,
    });
    this.routePolylines.push(polyline);
  });
  },

  displaySteps(leg) {
    this.steps = leg.steps.map((step) =>
      step.html_instructions.replace(/<[^>]*>/g, "")
    );
  },
  },
  mounted() {
    this.loadGoogleMapsAPI().then(() => {
      this.initMap();
    });
  },
};

  </script>
  
  <style src="./SafeRoad.css"></style>  