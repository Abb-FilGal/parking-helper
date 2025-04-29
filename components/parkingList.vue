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

    <!-- Modal for Parking Spot -->
    <ion-modal :is-open="isModalOpen" @didDismiss="closeModal" class="custom-modal">
        <parking-spot :spot="selectedSpot" @close="closeModal" />
    </ion-modal>
</ion-list>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useParkingSpots } from '~/composables/useParkingSpots';
import ParkingSpot from './parkingSpot.vue'; // Import the parkingSpot component

const { parkingSpots, isLoading, fetchParkingSpots } = useParkingSpots();

const isModalOpen = ref(false); // Track modal state
const selectedSpot = ref(null); // Track the selected parking spot

onMounted(async () => {
    if (parkingSpots.value.length === 0) {
        await fetchParkingSpots();
    }
});

const openParkingSpotPopup = (spot) => {
    console.log('Selected spot:', spot); // Debug log
    console.log('Spot image:', spot.imageUrls?.[0]); // Debug log for image
    selectedSpot.value = spot; // Set the selected spot
    isModalOpen.value = true; // Open the modal
};

const closeModal = () => {
    isModalOpen.value = false; // Close the modal
    selectedSpot.value = null; // Clear the selected spot
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

.custom-modal {
    --width: 90%; /* Set the modal width to 90% of the viewport width */
    --height: 80%; /* Set the modal height to 80% of the viewport height */
    --margin-top: auto; /* Center the modal vertically */
    --margin-bottom: auto; /* Center the modal vertically */
    --border-radius: 12px; /* Optional: Add rounded corners */
    --box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2); /* Optional: Add a shadow */
}

.custom-modal ion-content {
    padding: 16px; /* Add padding to the modal content */
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
}
</style>