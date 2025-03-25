<template>
  <div class="map-container">
    <div id="map" ref="mapElement" style="width: 100%; height: 100%;"></div>
    <div v-if="loading" class="loading-overlay">
      <ion-spinner name="circles"></ion-spinner>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { IonSpinner } from '@ionic/vue';

const mapElement = ref(null);
const loading = ref(true);

// Mock parking spots data (replace with Firebase data later)
const mockParkingSpots = [
  { id: 1, lat: 37.7749, lng: -122.4194, name: 'Downtown Parking', available: 5 },
  { id: 2, lat: 37.7694, lng: -122.4862, name: 'Beach Parking', available: 2 },
  { id: 3, lat: 37.8199, lng: -122.4783, name: 'Golden Gate Parking', available: 10 }
];

onMounted(() => {
  // Simulate loading
  setTimeout(() => {
    loading.value = false;
    console.log('Map component loaded');
    console.log('Mock parking spots:', mockParkingSpots);
  }, 1500);
  
  // In a real implementation, you would initialize a map here
  // initMap();
});

// Function to initialize map (placeholder)
const initMap = () => {
  console.log('Initializing map');
  // This would be implemented with Google Maps, Mapbox, or Leaflet
};
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 400px;
  background-color: #f0f0f0;
  border-radius: 8px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.7);
}
</style>

