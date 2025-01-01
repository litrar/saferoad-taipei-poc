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
      <button @click="calculateRoute" class="route-button" :disabled="isLoading">
        規劃路徑
      </button>
    </div>
    <div v-if="isLoading" class="progress-container">
      <div
        v-for="(step, index) in progressSteps"
        :key="index"
        class="progress-step color: #000000"
        :class="{ active: index <= currentProgressStep }"
      >
        {{ step }}
        <div v-if="index === currentProgressStep" class="arrow">
          →
        </div>
      </div>
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

    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
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
      isLoading: false,
      progressSteps: [
        "解析目標地點",
        "分析行程",
        "顯示導航步驟",
        "完成！",
      ],
      currentProgressStep: -1,
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
      center: { lat: 24.98747, lng: 121.5764 },
      zoom: 18,
    });

    new google.maps.Marker({
            position: { lat: 24.98747, lng: 121.5764 },
            map: this.map,
            title: "您的位置",
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

    this.isLoading = true;
    this.currentProgressStep = 0;

    navigator.geolocation.getCurrentPosition(
      async (position) => {

        const sourceLat = position.coords.latitude;
        const sourceLng = position.coords.longitude;


        try {
          this.updateProgress(1); 
          const destinationCoords = await this.getCoordinatesFromAddress(this.destination);

          if (!destinationCoords) {
            alert("目標地點經緯度轉換錯誤");
            this.resetProgress();
            return;
          }

          const destLat = destinationCoords.lat;
          const destLng = destinationCoords.lng;

          this.updateProgress(2); 
          const data = await fetchRoute(sourceLat, sourceLng, destLat, destLng);

          if (!data || !data.route || !data.segmentRisks) {
            alert("無法獲取有效的路徑或風險資訊！");
            this.resetProgress();
            return;
          }

          this.updateProgress(3); 
          this.updateMapWithRoute(data.route, data.segmentRisks);

          this.displaySteps(data.route.legs[0]);
          this.updateProgress(4); 
        } catch (error) {
          console.error("Error calculating route:", error);
          alert("路徑計算失敗，請稍後再試。");
        } finally {
          this.isLoading = false;
        }
      },
      () => {
        alert("無法獲取當前位置！");
        this.resetProgress();
      }
    );
  },


  updateProgress(step) {
    this.currentProgressStep = step;
  },

  resetProgress() {
    this.isLoading = false;
    this.currentProgressStep = -1;
  },


  async getCoordinatesFromAddress(address) {
    const geocoder = new google.maps.Geocoder();
    return new Promise((resolve) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results[0]) {
          const location = results[0].geometry.location;
          resolve({ lat: location.lat(), lng: location.lng() });
        } else {
          resolve(null);
        }
      });
    });
  },


  updateMapWithRoute(route, segmentRisks) {
  const bounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(route.bounds.southwest),
    new google.maps.LatLng(route.bounds.northeast)
  );

  this.map.fitBounds(bounds);

  const getRiskColor = (score) => {
    if (score < 0.3) return "#008000"; // 綠
    if (score < 0.6) return "#FFFF00"; // 黃
    return "#FF0000"; // 紅
  };

  const steps = route.legs[0].steps;

  const infoWindow = new google.maps.InfoWindow(); 

  steps.forEach((step) => {
    const decodedPath = google.maps.geometry.encoding.decodePath(step.polyline.points);

    let riskColor = "#0000FF"; // 預設藍
    let riskData = null;

    for (const risk of segmentRisks) {
      const startMatch = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(risk.start.lat, risk.start.lng),
        decodedPath[0]
      ) < 10;

      const endMatch = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(risk.end.lat, risk.end.lng),
        decodedPath[decodedPath.length - 1]
      ) < 10;

      if (startMatch && endMatch) {
        riskColor = getRiskColor(risk.risk_score);
        riskData = risk; 
        break;
      }
    }

    const polyline = new google.maps.Polyline({
      path: decodedPath,
      geodesic: true,
      strokeColor: riskColor,
      strokeOpacity: 1.0,
      strokeWeight: 5,
      map: this.map,
    });

    if (riskData) {
      polyline.addListener("mouseover", () => {
        infoWindow.setContent(`
          <div>
            <strong>風險分數:</strong> ${riskData.risk_score.toFixed(2)}<br>
            <strong>描述:</strong> ${riskData.description}
          </div>
        `);
        infoWindow.setPosition(decodedPath[Math.floor(decodedPath.length / 2)]); // 設定中間點位置
        infoWindow.open(this.map);
      });

      polyline.addListener("mouseout", () => {
        infoWindow.close();
      });
    }
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