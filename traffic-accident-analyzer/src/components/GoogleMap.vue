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
    console.log(1);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const sourceLat = position.coords.latitude;
        const sourceLng = position.coords.longitude;
        console.log(2);


        try {
          const data = await this.mockFetchRoute(
            sourceLat,
            sourceLng,
            24.978061, // Mock 目的地緯度
            121.546478 // Mock 目的地經度
          );
          console.log("收到了嗎", data);

          if (!data || !data.route) {
            alert("無法獲取有效的路徑資訊！");
            return;
          }
          console.log("這裡有嗎", data.route);

          this.updateMapWithRoute(data.route);

          this.displaySteps(data.route.legs[0]);

        } catch (error) {
          console.error("Error calculating route:", error);
          alert("模擬路徑計算失敗，請稍後再試。");
        }
      },
      () => {
        alert("無法獲取當前位置！");
      }
    );
  },
  updateMapWithRoute(route) {
  const bounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(route.bounds.southwest),
    new google.maps.LatLng(route.bounds.northeast)
  );

  console.log(route.bounds);
  console.log("Bounds initialized");

  if (this.routePolylines) {
    this.routePolylines.forEach(polyline => polyline.setMap(null));
  }
  this.routePolylines = [];

  this.map.fitBounds(bounds);
  console.log("Map bounds adjusted");

  const steps = route.legs[0].steps;
  steps.forEach((step, index) => {
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
    console.log(`Step ${index + 1} added to map`);
  });

  console.log("Route updated on map");
  },

  displaySteps(leg) {
    console.log("displaySteps都有了", leg);
    this.steps = leg.steps.map((step) =>
      step.html_instructions.replace(/<[^>]*>/g, "")
    );
  },

  mockFetchRoute(sourceLat, sourceLng, destLat, destLng) {
    const s1 = sourceLat;
    const s2 = sourceLng;
    const d1 = destLat;
    const d2 = destLng;
    console.log(`Mock fetching route from (${s1}, ${s2}) to (${d1}, ${d2})`);
    // 模擬後端返回的資料
    const mockResponse = {
	"need_remind": true,
	"route": {
		"bounds": {
			"northeast": {
				"lat": 24.9881581,
				"lng": 121.5772828
			},
			"southwest": {
				"lat": 24.9761791,
				"lng": 121.546068
			}
		},
		"copyrights": "Map data ©2024 Google",
		"legs": [
			{
				"distance": {
					"text": "3.8 km",
					"value": 3810
				},
				"duration": {
					"text": "12 mins",
					"value": 711
				},
				"end_address": "231, Taiwan, New Taipei City, Xindian District, Section 3, Zhongxing Rd, 70號1 樓",
				"end_location": {
					"lat": 24.9778036,
					"lng": 121.546068
				},
				"start_address": "No. 121, Section 2, Zhinan Rd, Wenshan District, Taipei City, Taiwan 116",
				"start_location": {
					"lat": 24.9876793,
					"lng": 121.5772828
				},
				"steps": [
					{
						"distance": {
							"text": "35 m",
							"value": 35
						},
						"duration": {
							"text": "1 min",
							"value": 9
						},
						"end_location": {
							"lat": 24.9873688,
							"lng": 121.577215
						},
						"html_instructions": "Head <b>south</b> on <b>指南路二段147巷</b> toward <b>指南路二段</b>",
						"polyline": {
							"points": "_lowC_q`eV|@J"
						},
						"start_location": {
							"lat": 24.9876793,
							"lng": 121.5772828
						},
						"travel_mode": "DRIVING"
					},
					{
						"distance": {
							"text": "0.4 km",
							"value": 366
						},
						"duration": {
							"text": "2 mins",
							"value": 104
						},
						"end_location": {
							"lat": 24.9880971,
							"lng": 121.5736738
						},
						"html_instructions": "Turn <b>right</b> onto <b>指南路二段</b>",
						"maneuver": "turn-right",
						"polyline": {
							"points": "ajowCsp`eVU~ACLCXK`A?FCLAH?DGf@CV?BGj@Q|AEVUvBCVERETGZGX"
						},
						"start_location": {
							"lat": 24.9873688,
							"lng": 121.577215
						},
						"travel_mode": "DRIVING"
					},
					{
						"distance": {
							"text": "0.3 km",
							"value": 263
						},
						"duration": {
							"text": "1 min",
							"value": 47
						},
						"end_location": {
							"lat": 24.9876418,
							"lng": 121.5711908
						},
						"html_instructions": "Continue onto <b>道南橋</b><div style=\"font-size:0.9em\">Pass by 小曼谷泰國雲南料理 政大店 (on the right)</div>",
						"polyline": {
							"points": "snowCmz_eVEf@CRAN?J?N@F?D@B@HDL?@Pj@bAlD?B@B?BBFBL@J?D@J?HAB?BCVAV"
						},
						"start_location": {
							"lat": 24.9880971,
							"lng": 121.5736738
						},
						"travel_mode": "DRIVING"
					},
					{
						"distance": {
							"text": "54 m",
							"value": 54
						},
						"duration": {
							"text": "1 min",
							"value": 16
						},
						"end_location": {
							"lat": 24.987724,
							"lng": 121.570658
						},
						"html_instructions": "Continue onto <b>指南路一段</b>",
						"polyline": {
							"points": "wkowC}j_eVI|@Ej@"
						},
						"start_location": {
							"lat": 24.9876418,
							"lng": 121.5711908
						},
						"travel_mode": "DRIVING"
					},
					{
						"distance": {
							"text": "0.9 km",
							"value": 888
						},
						"duration": {
							"text": "2 mins",
							"value": 146
						},
						"end_location": {
							"lat": 24.9827548,
							"lng": 121.5652856
						},
						"html_instructions": "Turn <b>left</b> onto <b>木新路二段</b>",
						"maneuver": "turn-left",
						"polyline": {
							"points": "glowCsg_eVL?P?j@?~@AB?vAAN?n@AX?V@l@HPDB?\\H`@Fd@JHBZRt@n@t@t@PZHNHPRt@\\xABF`A|DVfA\\vARt@fArEZjA"
						},
						"start_location": {
							"lat": 24.987724,
							"lng": 121.570658
						},
						"travel_mode": "DRIVING"
					},
					{
						"distance": {
							"text": "1.2 km",
							"value": 1191
						},
						"duration": {
							"text": "3 mins",
							"value": 203
						},
						"end_location": {
							"lat": 24.9799621,
							"lng": 121.5538977
						},
						"html_instructions": "Continue onto <b>木新路三段</b><div style=\"font-size:0.9em\">Pass by Suzuki (on the right in 1.1 km)</div>",
						"polyline": {
							"points": "emnwCaf~dVRlA`@jCJn@Fb@Hj@^nCJr@@LXhBD\\PlAN`ABNJt@TbBF`@BZDXN|@Jv@BNVzAZtBDVDVh@fCHf@^vBDRl@tDFXFb@BH@V?HFj@XnB@BB@BDBHBH"
						},
						"start_location": {
							"lat": 24.9827548,
							"lng": 121.5652856
						},
						"travel_mode": "DRIVING"
					},
					{
						"distance": {
							"text": "0.1 km",
							"value": 143
						},
						"duration": {
							"text": "1 min",
							"value": 31
						},
						"end_location": {
							"lat": 24.9795309,
							"lng": 121.5525659
						},
						"html_instructions": "Continue onto <b>寶橋</b>",
						"polyline": {
							"points": "w{mwC{~{dV@HBPFRFTf@dC@BBJBJL`@"
						},
						"start_location": {
							"lat": 24.9799621,
							"lng": 121.5538977
						},
						"travel_mode": "DRIVING"
					},
					{
						"distance": {
							"text": "0.7 km",
							"value": 653
						},
						"duration": {
							"text": "2 mins",
							"value": 112
						},
						"end_location": {
							"lat": 24.9761791,
							"lng": 121.5472512
						},
						"html_instructions": "Continue onto <b>寶橋路</b>",
						"polyline": {
							"points": "aymwCqv{dVZt@R\\LPFJJRT^LXJNHJ@H^p@dApBFNh@bArAbCb@t@d@x@DJJPNXBBVf@FJt@rAh@bAd@x@LR"
						},
						"start_location": {
							"lat": 24.9795309,
							"lng": 121.5525659
						},
						"travel_mode": "DRIVING"
					},
					{
						"distance": {
							"text": "0.2 km",
							"value": 217
						},
						"duration": {
							"text": "1 min",
							"value": 43
						},
						"end_location": {
							"lat": 24.9778036,
							"lng": 121.546068
						},
						"html_instructions": "Turn <b>right</b> onto <b>中興路三段</b>/<wbr/><b>北103鄉道</b><div style=\"font-size:0.9em\">Destination will be on the right</div>",
						"maneuver": "turn-right",
						"polyline": {
							"points": "cdmwCiuzdVcAp@]R_@Vs@b@ABmBlAOLKFA@"
						},
						"start_location": {
							"lat": 24.9761791,
							"lng": 121.5472512
						},
						"travel_mode": "DRIVING"
					}
				],
				"traffic_speed_entry": [],
				"via_waypoint": []
			}
		],
		"overview_polyline": {
			"points": "_lowC_q`eV|@JU~AGf@Q`BaAbJW|AM`AEb@@h@HZ~A|FBf@Gv@OhB^?fEC~@Ap@@`BXfARd@VjBdBZj@\\fA`@`BjCrKbB~Gt@xE|@nG~A~Kf@zDv@`F`@lCn@~C|AhJN|@D`@Ft@ZrBNZTdAp@`Dh@vA`@n@v@xAv@vAlA`C|BfEzAlCr@pArCdFaIhFA@"
		},
		"summary": "木新路三段",
		"warnings": [],
		"waypoint_order": []
	}
}

    // 模擬延遲回應
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockResponse);
      }, 1); // 模擬1秒延遲
    });
  },
  },
  mounted() {
    this.loadGoogleMapsAPI().then(() => {
      this.initMap();
    });
  },
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
  