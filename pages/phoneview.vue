<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Parking Finder</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <!-- Search and Filter Component -->
      <SearchParkingSpots @filters-applied="handleFiltersApplied" />

      <!-- Map Component -->
      <Map/>

      <!-- Parking List Component -->
      <ParkingList :parkingSpots="filteredParkingSpots" />
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import SearchParkingSpots from '~/components/SearchParkingSpots.vue';
import ParkingList from '~/components/parkingList.vue';

const parkingSpots = ref([]); // Reactive array for parking spots fetched from Firebase
const filteredParkingSpots = ref([]); // Reactive array for filtered parking spots

// Fetch parking spots from Firebase Firestore
const fetchParkingSpots = async () => {
  const db = getFirestore();
  const parkingSpotsCollection = collection(db, 'parkingSpots'); // Replace 'parkingSpots' with your Firestore collection name

  try {
    const querySnapshot = await getDocs(parkingSpotsCollection);
    parkingSpots.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    filteredParkingSpots.value = [...parkingSpots.value]; // Initialize filtered spots with all spots
    console.debug('[Parking Spots Fetched]', parkingSpots.value);
  } catch (error) {
    console.error('Error fetching parking spots:', error);
  }
};

// Call fetchParkingSpots when the component is mounted
onMounted(() => {
  fetchParkingSpots();
});

// Handle filters applied from the SearchParkingSpots component
const handleFiltersApplied = ({ searchQuery, priceFilter }) => {
  console.debug('[Filters Applied]', { searchQuery, priceFilter });

  filteredParkingSpots.value = parkingSpots.value.filter(spot => {
    const matchesSearchQuery =
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriceFilter =
      priceFilter === 'ALL' || spot.pricePerHour === priceFilter;

    return matchesSearchQuery && matchesPriceFilter;
  });

  console.debug('[Filtered Parking Spots]', filteredParkingSpots.value);
};
</script>
