<template>
    <div>
      <div style="margin-top: 20px;">
        <label>目標地點：</label>
        <input v-model="destination" placeholder="輸入目的地" />
      </div>
    </div>
</template>

<script>
export default {
  data() {
    return {
      destination: "",
    };
  },
};
</script>