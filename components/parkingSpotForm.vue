<!-- components/ParkingSpotForm.vue -->
<template>
    <form @submit.prevent="handleSubmit" class="parking-spot-form">
        <ion-item>
            <ion-label position="floating">Name</ion-label>
            <ion-input v-model="form.name" required></ion-input>
        </ion-item>
        
        <ion-item>
            <ion-label position="floating">Search Address</ion-label>
            <ion-input v-model="searchQuery" placeholder="Search for an address"></ion-input>
            <ion-button @click="handleSearch">Search</ion-button>
        </ion-item>

        <ion-item>
            <ion-label position="floating">Address</ion-label>
            <ion-input v-model="form.address" required></ion-input>
        </ion-item>
        
        <ion-item>
            <ion-label position="floating">Tags</ion-label>
            <ion-input 
                v-model="tagsInput" 
                @keyup.enter="addTag" 
                placeholder="Press Enter to add a tag"
            ></ion-input>
                    <div class="tags-container">
            <ion-chip v-for="(tag, index) in form.tags" :key="index">
                <ion-label>{{ tag }}</ion-label>
                <ion-icon name="close-circle" @click="removeTag(index)"></ion-icon>
            </ion-chip>
        </div>
        </ion-item>
        
        <ion-item>
            <ion-label position="floating">Price per Hour</ion-label>
            <ion-select v-model="form.pricePerHour" placeholder="Select">
                <ion-select-option value="PAID">PAID</ion-select-option>
                <ion-select-option value="PARTLY-PAID">PARTLY-PAID</ion-select-option>
                <ion-select-option value="FREE">FREE</ion-select-option>
            </ion-select>
        </ion-item>
        
        <Map 
            :latitude="form.latitude" 
            :longitude="form.longitude" 
            :address="form.address"
            @update:latitude="form.latitude = $event" 
            @update:longitude="form.longitude = $event"
            @update:address="form.address = $event"
        ></Map>

        <ion-item>
            <ion-label position="floating">Latitude</ion-label>
            <ion-input 
            v-model.number="form.latitude" 
            type="number" 
            step="0.000001" 
            required 
            @input="form.latitude = parseFloat(form.latitude.toFixed(6))"
            ></ion-input>
        </ion-item>
        
        <ion-item>
            <ion-label position="floating">Longitude</ion-label>
            <ion-input 
            v-model.number="form.longitude" 
            type="number" 
            step="0.000001" 
            required 
            @input="form.longitude = parseFloat(form.longitude.toFixed(6))"
            ></ion-input>
        </ion-item>
        
        <div class="image-upload-container">
            <div v-for="(image, index) in form.imageUrls" :key="index" class="image-preview">
                <img :src="image.preview || image.url" alt="Parking spot preview">
                <ion-button fill="clear" class="remove-image-btn" @click="removeImage(index)">
                    <ion-icon :icon="closeCircleOutline"></ion-icon>
                </ion-button>
            </div>

            <ion-button expand="block" @click="triggerFileInput">
                <ion-icon :icon="cameraOutline" slot="start"></ion-icon>
                Upload Images
            </ion-button>

            <input 
                type="file" 
                ref="fileInput" 
                accept="image/*" 
                multiple 
                style="display: none" 
                @change="handleFileChange"
            >
        </div>
        
        <div v-if="isUploading" class="upload-progress">
            <ion-progress-bar :value="uploadProgress / 100"></ion-progress-bar>
            <div class="progress-text">Uploading: {{ uploadProgress }}%</div>
        </div>
        
        <div class="form-actions">
            <ion-button type="submit" expand="block" :disabled="isSubmitting || isUploading">
                {{ isEditing ? 'Update' : 'Add' }} Parking Spot
            </ion-button>
            <ion-button type="button" expand="block" fill="outline" @click="$emit('cancel')">
                Cancel
            </ion-button>
        </div>
    </form>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { cameraOutline, closeCircleOutline } from 'ionicons/icons';
import { useCloudinaryService } from '~/services/cloudinaryService';
import { collection, doc, addDoc, updateDoc, GeoPoint } from 'firebase/firestore';
import { useNuxtApp } from '#app';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import Map from '~/components/Map.vue';
import { clearCache } from '~/services/cacheService';

const props = defineProps({
    parkingSpot: {
        type: Object,
        default: () => ({
            name: '',
            address: '',
            tags: [],
            pricePerHour: '',
            latitude: 0,
            longitude: 0,
            imageUrls: []
        })
    },
    isEditing: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['submit', 'cancel']);

const { isUploading, uploadProgress, uploadImage } = useCloudinaryService();
const fileInput = ref(null);
const imageFile = ref(null);
const imagePreview = ref(null);
const isSubmitting = ref(false);

// Create a reactive form object
const form = reactive({
    name: '',
    address: '',
    tags: [],
    pricePerHour: '',
    latitude: 0,
    longitude: 0,
    imageUrls: []
});

// Initialize form with parking spot data if editing
onMounted(() => {
    if (props.isEditing && props.parkingSpot) {
        Object.keys(form).forEach(key => {
            if (key in props.parkingSpot) {
                form[key] = props.parkingSpot[key];
            }
        });
    }
});

// Watch for changes in the address to suggest a name
watch(
    () => form.address,
    (newAddress) => {
        if (newAddress && !form.name) {
            // Suggest a name based on the address
            const suggestedName = suggestNameFromAddress(newAddress);
            form.name = suggestedName;
        }
    }
);

// Function to suggest a name based on the address
const suggestNameFromAddress = (address) => {
    // Split the address into parts (e.g., "123 Main St, City, Country")
    const parts = address.split(',');
    if (parts.length > 0) {
        // Use the first part of the address (e.g., "123 Main St")
        return parts[0].trim();
    }
    return 'Unnamed Parking Spot';
};

// Tags input and methods
const tagsInput = ref('');

const addTag = () => {
    const tag = tagsInput.value.trim();
    if (tag && !form.tags.includes(tag)) {
        form.tags.push(tag);
    }
    tagsInput.value = ''; // Clear the input after adding the tag
};

const removeTag = (index) => {
    form.tags.splice(index, 1);
};

const triggerFileInput = () => {
    fileInput.value.click();
};

const handleFileChange = (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            form.imageUrls.push({
                file,
                preview: e.target.result // Store the preview for display
            });
        };
        reader.readAsDataURL(file);
    });

    // Clear the file input to allow re-uploading the same file
    if (fileInput.value) {
        fileInput.value.value = '';
    }
};

const removeImage = (index) => {
    form.imageUrls.splice(index, 1);
};

const handleSubmit = async () => {
    isSubmitting.value = true;

    try {
        const { $firestore } = useNuxtApp(); // Use Firestore instance from Nuxt plugin
        const uploadedImageUrls = [];

        // Generate a unique folder name for this upload
        const folderName = `parking-spots/${form.name}-${Date.now()}`;

        // Upload all selected images to the same folder
        for (const image of form.imageUrls) {
            if (image.file) {
                const uploadResult = await uploadImage(image.file, folderName);
                if (uploadResult.error) {
                    throw new Error(uploadResult.error);
                }
                uploadedImageUrls.push(uploadResult.secure_url);
            } else {
                // If the image already has a URL (e.g., during editing), keep it
                uploadedImageUrls.push(image.url);
            }
        }

        // Round latitude and longitude to 6 decimal places
        const roundedLatitude = parseFloat(form.latitude.toFixed(6));
        const roundedLongitude = parseFloat(form.longitude.toFixed(6));

        // Create the final parking spot object
        const parkingSpot = {
            ...form,
            imageUrls: uploadedImageUrls, // Store all uploaded image URLs
            location: new GeoPoint(roundedLatitude, roundedLongitude)
        };

        delete parkingSpot.latitude; // Remove latitude and longitude from the object
        delete parkingSpot.longitude;

        if (props.isEditing) {
            // Update existing parking spot
            const parkingSpotRef = doc($firestore, 'parkingSpots', props.parkingSpot.id);
            await updateDoc(parkingSpotRef, parkingSpot);
        } else {
            // Add new parking spot
            const parkingSpotsCollection = collection($firestore, 'parkingSpots');
            await addDoc(parkingSpotsCollection, parkingSpot);
        }

        // Clear the cache for parking spots
        clearCache('parkingSpots');

        emit('form-submitted'); // Emit the event after successful submission
        resetForm(); // Reset the form fields
        console.log('Form submitted:', parkingSpot);
    } catch (error) {
        console.error('Error submitting form:', error);
    } finally {
        isSubmitting.value = false;
    }
};

// Search functionality
const provider = new OpenStreetMapProvider();
const searchQuery = ref('');

const handleSearch = async () => {
    if (!searchQuery.value) return;

    try {
        const results = await provider.search({ query: searchQuery.value });
        if (results.length > 0) {
            const { x: longitude, y: latitude, label: address } = results[0];
            form.latitude = parseFloat(latitude.toFixed(6));
            form.longitude = parseFloat(longitude.toFixed(6));
            form.address = address;
        } else {
            alert('No results found for the given address.');
        }
    } catch (error) {
        console.error('Error during search:', error);
    }
};

const resetForm = () => {
    form.name = '';
    form.address = '';
    form.tags = [];
    form.pricePerHour = '';
    form.latitude = 0;
    form.longitude = 0;
    form.imageUrls = [];
    searchQuery.value = '';
};
</script>

<style scoped>
.parking-spot-form {
    padding: 1rem;
}

.image-upload-container {
    margin: 1.5rem 0;
}

.image-preview {
    position: relative;
    width: 100%;
    height: 200px;
    margin-bottom: 1rem;
    border-radius: 8px;
    overflow: hidden;
}

.image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.remove-image-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    --background: rgba(0, 0, 0, 0.5);
    --border-radius: 50%;
    width: 36px;
    height: 36px;
}

.upload-progress {
    margin: 1rem 0;
}

.progress-text {
    text-align: center;
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: var(--ion-color-medium);
}

.form-actions {
    margin-top: 1.5rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
}
</style>