// apiService.js
export async function fetchRoute(sourceLat, sourceLng, destLat, destLng) {
    const apiUrl = "https://your-api-endpoint.com/route";
    const params = {
      source_lat: sourceLat,
      source_long: sourceLng,
      dest_lat: destLat,
      dest_long: destLng,
    };
  
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
  
    if (!response.ok) {
      throw new Error(`API 回應錯誤: ${response.statusText}`);
    }
  
    return response.json();
  }
  