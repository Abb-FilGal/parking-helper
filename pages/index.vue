<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Parking Finder</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <h1>Welcome to Parking Finder</h1>
      <p>Find available parking spots near you!</p>

      <!-- Search and Filter Component -->
      <SearchParkingSpots @filters-applied="handleFiltersApplied" />

      <Map 
        class="my-4" 
        :latitude="defaultLatitude" 
        :longitude="defaultLongitude" 
        :address="defaultAddress" 
        :parkingSpots="filteredParkingSpots"
      />
      <ParkingList ref="parkingList" :parkingSpots="filteredParkingSpots" />
      <ParkingSpotForm 
        class="my-4" 
        @form-submitted="reloadParkingSpots" 
        :isEditing="isEditing" 
        :parkingSpot="selectedSpot"
      />
      
      <ion-button expand="block" @click="testFirebase">
        Test Firebase Connection
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton 
} from '@ionic/vue';
import { collection, getDocs } from 'firebase/firestore';
import { ref, computed, watch } from 'vue';
import Map from '~/components/Map.vue';
import ParkingList from '~/components/parkingList.vue';
import ParkingSpotForm from '~/components/parkingSpotForm.vue';
import SearchParkingSpots from '~/components/SearchParkingSpots.vue';
import { useParkingSpots } from '~/composables/useParkingSpots';

const { $firestore } = useNuxtApp();

const testFirebase = async () => {
  try {
    const querySnapshot = await getDocs(collection($firestore, 'test-collection'));
    console.log('Firebase connection successful!');
    console.log('Documents:', querySnapshot.docs.length);
  } catch (error) {
    console.error('Firebase connection error:', error);
    alert('Firebase connection error: ' + error.message);
  }
};

const mockParkingSpots = [
    {
        id: 1,
        name: 'Downtown Parking',
        address: '123 Main St, San Francisco, CA',
        tags: ['downtown', 'city'],
        pricePerHour: 'PAID',
        latitude: 37.7749,
        longitude: -122.4194,
        imageUrl: 'https://www.slingacademy.com/media/images/2024-11/1.jpeg'
    },
    {
        id: 2,
        name: 'Beach Parking',
        address: '456 Ocean Ave, San Francisco, CA',
        tags: ['scenic', 'beach'],
        pricePerHour: 'PARTLY-PAID',
        latitude: 37.7694,
        longitude: -122.4862,
        imageUrl: 'https://www.slingacademy.com/media/images/2024-11/1.jpeg'
    },
    {
        id: 3,
        name: 'Golden Gate Parking',
        address: '789 Bridge Rd, San Francisco, CA',
        tags: ['scenic'],
        pricePerHour: 'FREE',
        latitude: 37.8199,
        longitude: -122.4783,
        imageUrl: 'https://www.slingacademy.com/media/images/2024-11/1.jpeg'
    }
];

const isEditing = ref(false);
const selectedSpot = ref(null);

const { fetchParkingSpots } = useParkingSpots();

const reloadParkingSpots = async () => {
    console.debug('[Parent] Reloading parking spots');
    await fetchParkingSpots();
};

const defaultLatitude = 59.3293; // Example latitude
const defaultLongitude = 18.0686; // Example longitude
const defaultAddress = 'Stockholm, Sweden';

const parkingSpots = ref([
    { name: 'Spot 1', address: '123 Main St', tags: ['downtown'], pricePerHour: 'PAID', latitude: 59.3293, longitude: 18.0686 },
    { name: 'Spot 2', address: '456 Elm St', tags: ['scenic'], pricePerHour: 'FREE', latitude: 59.3285, longitude: 18.0700 },
    { name: 'Spot 3', address: '789 Oak St', tags: ['city'], pricePerHour: 'PARTLY-PAID', latitude: 59.3300, longitude: 18.0670 }
]);

const searchQuery = ref('');
const priceFilter = ref('ALL');

// Debug: Watch for changes in searchQuery and priceFilter
watch(searchQuery, (newQuery) => {
  console.debug(`[Search Query Updated] New Query: "${newQuery}"`);
});

watch(priceFilter, (newFilter) => {
  console.debug(`[Price Filter Updated] New Filter: "${newFilter}"`);
});

const filteredParkingSpots = computed(() => {
  const filtered = parkingSpots.value.filter(spot => {
    const matchesSearchQuery =
      spot.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      spot.address.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      spot.tags.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase()));

    const matchesPriceFilter =
      priceFilter.value === 'ALL' || spot.pricePerHour === priceFilter.value;

    return matchesSearchQuery && matchesPriceFilter;
  });

  console.debug(`[Filtered Parking] List: ${filtered}`);
  return filtered;
});

const handleFiltersApplied = ({ searchQuery: query, priceFilter: filter }) => {
  console.debug('[Filters Applied]', { searchQuery: query, priceFilter: filter });
  searchQuery.value = query;
  priceFilter.value = filter;
};
</script>
