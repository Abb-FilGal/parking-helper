<!-- components/ParkingSpotForm.vue -->
<template>
    <form @submit.prevent="handleSubmit" class="parking-spot-form">
        <ion-item>
            <ion-label position="floating">Name</ion-label>
            <ion-input v-model="form.name" required></ion-input>
        </ion-item>
        
        <ion-item>
            <ion-label position="floating">Address</ion-label>
            <ion-input v-model="form.address" required></ion-input>
        </ion-item>
        
        <!-- <ion-item>
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
        </ion-item> -->
        
        <ion-item>
            <ion-label position="floating">Price per Hour</ion-label>
            <ion-select v-model="form.pricePerHour" placeholder="Select">
                <ion-select-option value="PAID">PAID</ion-select-option>
                <ion-select-option value="PARTLY-PAID">PARTLY-PAID</ion-select-option>
                <ion-select-option value="FREE">FREE</ion-select-option>
            </ion-select>
        </ion-item>
        
        <ion-item>
            <ion-label position="floating">Latitude</ion-label>
            <ion-input v-model.number="form.latitude" type="number" step="0.000001" required></ion-input>
        </ion-item>
        
        <ion-item>
            <ion-label position="floating">Longitude</ion-label>
            <ion-input v-model.number="form.longitude" type="number" step="0.000001" required></ion-input>
        </ion-item>
        
        <div class="image-upload-container">
            <div class="image-preview" v-if="imagePreview || form.imageUrl">
                <img :src="imagePreview || form.imageUrl" alt="Parking spot preview">
                <ion-button fill="clear" class="remove-image-btn" @click="removeImage">
                    <ion-icon :icon="closeCircleOutline"></ion-icon>
                </ion-button>
            </div>
            
            <ion-button expand="block" @click="triggerFileInput" v-if="!imagePreview && !form.imageUrl">
                <ion-icon :icon="cameraOutline" slot="start"></ion-icon>
                Upload Image
            </ion-button>
            
            <input 
                type="file" 
                ref="fileInput" 
                accept="image/*" 
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
import { ref, reactive, onMounted } from 'vue';
import { cameraOutline, closeCircleOutline } from 'ionicons/icons';
import { useCloudinaryService } from '~/services/cloudinaryService';

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
            imageUrl: ''
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
    imageUrl: ''
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

const triggerFileInput = () => {
    fileInput.value.click();
};

const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    imageFile.value = file;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
};

const removeImage = () => {
    imageFile.value = null;
    imagePreview.value = null;
    form.imageUrl = '';
    if (fileInput.value) {
        fileInput.value.value = '';
    }
};

const handleSubmit = async () => {
    isSubmitting.value = true;
    
    try {
        let imageUrl = form.imageUrl;
        
        // Upload image if a new one was selected
        if (imageFile.value) {
            const uploadResult = await uploadImage(imageFile.value);
            imageUrl = uploadResult.secure_url;
        }
        
        // Create the final parking spot object
        const parkingSpot = {
            ...form,
            imageUrl
        };
        
        emit('submit', parkingSpot);
        console.log('Form submitted:', parkingSpot);
    } catch (error) {
        console.error('Error submitting form:', error);
    } finally {
        isSubmitting.value = false;
    }
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