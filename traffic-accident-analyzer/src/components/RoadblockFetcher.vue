<template>
    <div></div>
  </template>
  
  <script>
  export default {
    name: "RoadblockFetcher",
    props: ["onFetched"],
    async mounted() {
      try {
        const response = await fetch("https://your-backend-api/roadblocks");
        if (!response.ok) {
          throw new Error("Failed to fetch roadblocks");
        }
        const data = await response.json();
        console.log("Fetched roadblocks:", data);
        this.$emit("onFetched", data.roadblocks || []); 
      } catch (error) {
        console.error("Error fetching roadblocks:", error);
        this.$emit("onFetched", []);
      }
    },
  };
  </script>
  