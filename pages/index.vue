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
      
      <!-- <Map class="my-4" /> -->
      <parkingList class="my-4" :parkingSpots="mockParkingSpots" />
      <parkingSpotForm class="my-4" />
      
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
import Map from '~/components/Map.vue'
import parkingList from '~/components/parkingList.vue';
import parkingSpotForm from '~/components/parkingSpotForm.vue';

const { $firestore } = useNuxtApp();

const testFirebase = async () => {
  try {
    // This will fail if the collection doesn't exist, but it tests the connection
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

</script>

