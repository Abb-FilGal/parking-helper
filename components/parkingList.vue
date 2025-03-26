<template>
<ion-list>
    <ion-list-header>
        <ion-label>Available Parking Spots</ion-label>
    </ion-list-header>
    
    <ion-item v-for="spot in parkingSpots" :key="spot.id" @click="selectSpot(spot)">
        <div slot="start" class="parking-thumbnail" v-if="spot.imageUrl">
            <CloudinaryImage 
                :src="spot.imageUrl" 
                :alt="spot.name" 
                :width="100" 
                :height="100"
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
import { ref } from 'vue';
import { 
  IonList, 
  IonListHeader, 
  IonItem, 
  IonLabel, 
  IonButton, 
  IonIcon 
} from '@ionic/vue';
import { navigateOutline } from 'ionicons/icons';
import CloudinaryImage from './CloudinaryImage.vue';

const props = defineProps({
  parkingSpots: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['select-spot', 'navigate-to-spot']);

const selectSpot = (spot) => {
  emit('select-spot', spot);
};

const navigateToSpot = (spot) => {
  emit('navigate-to-spot', spot);
};
</script>

<style scoped>
.parking-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
}
</style>