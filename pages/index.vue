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
      
      <Map class="my-4" />
      
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
</script>

