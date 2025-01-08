// apiService.js
export async function fetchRoute(sourceLat, sourceLng, destLat, destLng) {
    const apiUrl = "https://35.209.156.165/route";
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

    console.log("路徑規劃中，等待伺服器回應...");
  
    if (!response.ok) {
      throw new Error(`API 回應錯誤: ${response.statusText}`);
    }

    console.log("解析資料中...");
  
    return response.json();
  }
  