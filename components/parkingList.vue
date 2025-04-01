<template>
<ion-list>
    <ion-list-header>
        <ion-label>Available Parking Spots</ion-label>
    </ion-list-header>
    
    <ion-item v-for="spot in parkingSpots" :key="spot.id" @click="selectSpot(spot)">
        <div slot="start" class="parking-thumbnail" v-if="spot.firstImage">
            <img 
                :src="spot.firstImage" 
                :alt="spot.name" 
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
import { ref, onMounted } from 'vue';
import { 
  IonList, 
  IonListHeader, 
  IonItem, 
  IonLabel, 
  IonButton, 
  IonIcon 
} from '@ionic/vue';
import { navigateOutline } from 'ionicons/icons';
import { collection, getDocs } from 'firebase/firestore';
import { useNuxtApp } from '#app';
import { useCloudinaryService } from '~/services/cloudinaryService'; // Import Cloudinary service

const props = defineProps({
  parkingSpots: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['select-spot', 'navigate-to-spot']);

const parkingSpots = ref([]);
const isLoading = ref(true);

const { getOptimizedUrl } = useCloudinaryService(); // Use the Cloudinary service

const fetchParkingSpots = async () => {
  const { $firestore } = useNuxtApp(); // Use Firestore instance from Nuxt plugin
  const parkingSpotsCollection = collection($firestore, 'parkingSpots');

  try {
    const querySnapshot = await getDocs(parkingSpotsCollection);
    parkingSpots.value = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        firstImage: data.imageUrls && data.imageUrls.length > 0
          ? getOptimizedUrl(data.imageUrls[0], { width: 100, height: 100 }) // Use the Cloudinary service
          : null
      };
    });
  } catch (error) {
    console.error('Error fetching parking spots:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  if (parkingSpots.value.length === 0) {
    await fetchParkingSpots();
  }
});

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

.cloudinary-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>