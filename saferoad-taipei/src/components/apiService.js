import axios from "axios";

export async function fetchRoute(sourceLat, sourceLng, destLat, destLng) {
  const apiUrl = "https://bbq.nccumisoj.online/route";
  const params = {
    source_lat: sourceLat,
    source_long: sourceLng,
    dest_lat: destLat,
    dest_long: destLng,
  };

  try {
    console.log("路徑規劃中，等待伺服器回應");

    const response = await axios.post(apiUrl, params, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("API 回應錯誤:", error.response?.data || error.message);
    throw new Error(`API 回應錯誤: ${error.response?.statusText || error.message}`);
  }
}
