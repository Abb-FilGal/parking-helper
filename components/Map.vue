<template>
    <div class="map-container">
        <div id="map" class="map"></div>
        <ion-button expand="block" @click="getUserLocation">Use My Location</ion-button>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import L from 'leaflet';

const map = ref(null);
const marker = ref(null);

const props = defineProps({
    latitude: {
        type: Number,
        default: 0
    },
    longitude: {
        type: Number,
        default: 0
    },
    address: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:latitude', 'update:longitude', 'update:address']);

// Function to get the user's current location
const getUserLocation = () => {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            emit('update:latitude', latitude);
            emit('update:longitude', longitude);
            setMarker(latitude, longitude);
            await reverseGeocode(latitude, longitude);
        },
        (error) => {
            console.error('Error getting location:', error);
            alert('Unable to retrieve your location.');
        }
    );
};

// Function to set the marker on the map
const setMarker = (latitude, longitude) => {
    if (marker.value) {
        marker.value.setLatLng([latitude, longitude]);
    } else {
        marker.value = L.marker([latitude, longitude], { draggable: true }).addTo(map.value);
        marker.value.on('dragend', async (e) => {
            const { lat, lng } = e.target.getLatLng();
            emit('update:latitude', lat);
            emit('update:longitude', lng);
            await reverseGeocode(lat, lng);
        });
    }
    map.value.setView([latitude, longitude], 15);
};

// Reverse geocoding to get the address from latitude and longitude
const reverseGeocode = async (latitude, longitude) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await response.json();
        const address = data.display_name || 'Unknown address';
        emit('update:address', address);
    } catch (error) {
        console.error('Error reverse geocoding:', error);
    }
};

// Forward geocoding to get latitude and longitude from an address
const forwardGeocode = async (address) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
        );
        const data = await response.json();
        if (data.length > 0) {
            const { lat, lon } = data[0];
            emit('update:latitude', parseFloat(lat));
            emit('update:longitude', parseFloat(lon));
            setMarker(parseFloat(lat), parseFloat(lon));
        } else {
            alert('Address not found.');
        }
    } catch (error) {
        console.error('Error forward geocoding:', error);
    }
};

// Watch for changes in latitude and longitude
watch(
    () => [props.latitude, props.longitude],
    ([newLatitude, newLongitude]) => {
        if (newLatitude && newLongitude) {
            setMarker(newLatitude, newLongitude);
        }
    }
);

// Watch for changes in the address
watch(
    () => props.address,
    (newAddress) => {
        if (newAddress) {
            forwardGeocode(newAddress);
        }
    }
);

onMounted(() => {
    map.value = L.map('map').setView([props.latitude, props.longitude], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map.value);

    if (props.latitude && props.longitude) {
        setMarker(props.latitude, props.longitude);
    }
});
</script>

<style scoped>
.map-container {
    position: relative;
    height: 400px;
    margin-bottom: 1rem;
}

.map {
    height: 100%;
    width: 100%;
}
</style>