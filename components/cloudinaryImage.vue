<!-- components/CloudinaryImage.vue -->
<template>
  <div class="cloudinary-image" :class="{ 'loading': isLoading }">
    <img 
      v-if="optimizedUrl" 
      :src="optimizedUrl" 
      :alt="alt"
      @load="handleImageLoaded"
      @error="handleImageError"
      :style="imageStyle"
    >
    <div v-if="isLoading" class="loading-indicator">
      <ion-spinner name="dots"></ion-spinner>
    </div>
    <div v-if="hasError" class="error-indicator">
      <ion-icon :icon="imageOutline"></ion-icon>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { imageOutline } from 'ionicons/icons';
import { useCloudinaryService } from '~/services/cloudinaryService';

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  },
  width: {
    type: [Number, String],
    default: 300
  },
  height: {
    type: [Number, String],
    default: 200
  },
  crop: {
    type: String,
    default: 'fill'
  },
  format: {
    type: String,
    default: 'auto'
  },
  quality: {
    type: Number,
    default: 80
  },
  objectFit: {
    type: String,
    default: 'cover'
  }
});

const { getOptimizedUrl } = useCloudinaryService();
const isLoading = ref(true);
const hasError = ref(false);

const optimizedUrl = computed(() => {
  if (!props.src) return null;
  
  return getOptimizedUrl(props.src, {
    width: props.width,
    height: props.height,
    crop: props.crop,
    format: props.format,
    quality: props.quality
  });
});

const imageStyle = computed(() => {
  return {
    objectFit: props.objectFit
  };
});

const handleImageLoaded = () => {
  isLoading.value = false;
};

const handleImageError = () => {
  isLoading.value = false;
  hasError.value = true;
};

onMounted(() => {
  if (!props.src) {
    isLoading.value = false;
    hasError.value = true;
  }
});
</script>

<style scoped>
.cloudinary-image {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
  overflow: hidden;
}

.cloudinary-image img {
  width: 100%;
  height: 100%;
}

.loading-indicator, .error-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.error-indicator {
  color: #999;
}

.error-indicator ion-icon {
  font-size: 2rem;
}
</style>