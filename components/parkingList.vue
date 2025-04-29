<template>
  <ion-list>
    <ion-list-header>
      <ion-label>Available Parking Spots</ion-label>
    </ion-list-header>
    
    <ion-item v-for="spot in parkingSpots" :key="spot.id" @click="openParkingSpotPopup(spot)">
      <div slot="start" class="parking-thumbnail">
        <img 
          :src="spot.imageUrls?.[0] || 'https://res.cloudinary.com/dxlumukjr/image/upload/v1744094822/ChatGPT_Image_Apr_8_2025_08_46_38_AM_gsojdh.png'" 
          :alt="spot.name || 'Parking Spot'" 
          class="cloudinary-image"
        />
      </div>
      <ion-label>
        <h2>{{ spot.name }}</h2>
        <p>{{ spot.address }}</p>
        <p>Tags: {{ spot.tags.join(', ') }}</p>
        <p>Price per hour: {{ spot.pricePerHour }}</p>
      </ion-label>
      <ion-button slot="end" fill="clear" @click.stop="navigateToSpot(spot)">
        <ion-icon :icon="navigateOutline"></ion-icon>
      </ion-button>
    </ion-item>
    
    <ion-item v-if="parkingSpots.length === 0">
      <ion-label>No parking spots available</ion-label>
    </ion-item>
  </ion-list>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  parkingSpots: {
    type: Array,
    required: true,
  },
});
</script>

<style scoped>
.parking-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
}

.cloudinary-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>