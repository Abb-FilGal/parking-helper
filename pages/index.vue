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
      
      <Map 
        class="my-4" 
        :latitude="defaultLatitude" 
        :longitude="defaultLongitude" 
        :address="defaultAddress" 
        :parkingSpots="parkingSpots"
      />
      <ParkingList ref="parkingList" :parkingSpots="parkingSpots" />
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
import { ref } from 'vue';
import Map from '~/components/Map.vue';
import ParkingList from '/components/parkingList.vue';
import ParkingSpotForm from '/components/parkingSpotForm.vue';
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
    { name: 'Spot 1', address: '123 Main St', latitude: 59.3293, longitude: 18.0686 },
    { name: 'Spot 2', address: '456 Elm St', latitude: 59.3285, longitude: 18.0700 },
    { name: 'Spot 3', address: '789 Oak St', latitude: 59.3300, longitude: 18.0670 }
]);
</script>
