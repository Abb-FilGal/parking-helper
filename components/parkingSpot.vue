<template>
<div class="parking-spot">
    <ion-header>
        <ion-toolbar>
            <ion-title>{{ spot.name }}</ion-title>
            <ion-buttons slot="end">
                <ion-button @click="$emit('close')">Close</ion-button>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>

    <ion-content>
        <Swiper
            ref="swiperRef"
            :slides-per-view="1"
            :loop="true"
            :autoplay="{ delay: 3000, disableOnInteraction: false }"
            @init="onSwiperInit"
            @slideChange="onSlideChange"
            class="parking-carousel"
        >
            <SwiperSlide v-for="(imageUrl, index) in spot.imageUrls" :key="index">
                <img :src="imageUrl" :alt="`Image ${index + 1} of ${spot.name}`" class="parking-image" />
            </SwiperSlide>
        </Swiper>
        <h2>{{ spot.name }}</h2>
        <p>{{ spot.address }}</p>
        <p>Tags: {{ spot.tags.join(', ') }}</p>
        <p>Price per hour: {{ spot.pricePerHour }}</p>
        <ion-button @click="goToNextSlide">Next Slide</ion-button>
    </ion-content>
</div>
</template>

<script lang="ts">
// import SwiperCore, { Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/swiper.min.css';

// Install the Autoplay module
// SwiperCore.use([Autoplay]);

export default {
  components: {
    Swiper,
    SwiperSlide,
  },
  methods: {
    onSwiperInit(swiper: any) {
      console.log('Swiper initialized:', swiper);
      this.swiperInstance = swiper; // Save the Swiper instance for later use

      // Start autoplay manually
      if (swiper.autoplay) {
        console.log('Autoplay is enabled');
        swiper.autoplay.start();
      } else {
        console.error('Autoplay is not enabled');
      }
    },
    onSlideChange(swiper: any) {
      console.log('Active slide index:', swiper.activeIndex);
    },
    goToNextSlide() {
      if (this.swiperInstance) {
        this.swiperInstance.slideNext(); // Programmatically go to the next slide
      } else {
        console.error('Swiper instance is not initialized');
      }
    },
  },
  data() {
    return {
      swiperInstance: null as any, // Explicitly type the Swiper instance
    };
  },
  props: {
    spot: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped>
.parking-image {
  width: 100%; /* Make the image take up the full width of the slide */
  height: auto; /* Maintain aspect ratio */
  border-radius: 8px;
  margin-bottom: 1rem;
}

.parking-carousel {
  width: 100%; /* Ensure the carousel takes up the full width */
  height: auto; /* Adjust height based on content */
}

.parking-spot {
  display: flex;
  flex-direction: column;
  height: 100%; /* Make the component take up the full height of the modal */
  text-align: center;
  padding: 16px;
}

ion-content {
  flex: 1; /* Allow the content to grow and take up available space */
  overflow-y: auto; /* Add a scrollbar only if the content overflows */
  padding: 16px; /* Add padding for better spacing */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
</style>