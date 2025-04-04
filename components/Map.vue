<template>
    <div class="map-container">
        <div id="map" class="map"></div>
        <ion-button expand="block" @click="getUserLocation">Use My Location</ion-button>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { setCache, getCache } from '~/services/cacheService';

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
            const roundedLat = parseFloat(latitude.toFixed(6)); // Round to 6 decimals
            const roundedLng = parseFloat(longitude.toFixed(6)); // Round to 6 decimals
            emit('update:latitude', roundedLat);
            emit('update:longitude', roundedLng);
            setMarker(roundedLat, roundedLng); // Pass rounded values to setMarker
            await reverseGeocode(roundedLat, roundedLng); // Pass rounded values to reverseGeocode
        },
        (error) => {
            console.error('Error getting location:', error);
            alert('Unable to retrieve your location.');
        }
    );
};

// Function to set the marker on the map
const setMarker = (latitude, longitude) => {
    const roundedLat = parseFloat(latitude.toFixed(6));
    const roundedLng = parseFloat(longitude.toFixed(6));

    if (marker.value) {
        marker.value.setLatLng([roundedLat, roundedLng]);
    } else {
        marker.value = L.marker([roundedLat, roundedLng], { draggable: true }).addTo(map.value);
        marker.value.on('dragend', async (e) => {
            const { lat, lng } = e.target.getLatLng();
            const roundedLat = parseFloat(lat.toFixed(6));
            const roundedLng = parseFloat(lng.toFixed(6));
            emit('update:latitude', roundedLat);
            emit('update:longitude', roundedLng);
            await reverseGeocode(roundedLat, roundedLng);
        });
    }
    map.value.setView([roundedLat, roundedLng], 15);
};

// Reverse geocoding to get the address from latitude and longitude
const reverseGeocode = async (latitude, longitude) => {
    const cacheKey = `reverse-${latitude}-${longitude}`;
    const cachedAddress = getCache(cacheKey);

    if (cachedAddress) {
        emit('update:address', cachedAddress);
        return;
    }

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await response.json();
        const address = data.display_name || 'Unknown address';

        // Cache the result
        setCache(cacheKey, address);

        emit('update:address', address);
    } catch (error) {
        console.error('Error reverse geocoding:', error);
    }
};

// Forward geocoding to get latitude and longitude from an address
const forwardGeocode = async (address) => {
    const cacheKey = `forward-${address}`;
    const cachedCoords = getCache(cacheKey);

    if (cachedCoords) {
        const { lat, lon } = cachedCoords;
        emit('update:latitude', lat);
        emit('update:longitude', lon);
        setMarker(lat, lon);
        return;
    }

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
        );
        const data = await response.json();
        if (data.length > 0) {
            const { lat, lon } = data[0];
            const roundedLat = parseFloat(lat.toFixed(6));
            const roundedLng = parseFloat(lon.toFixed(6));

            // Cache the result
            setCache(cacheKey, { lat: roundedLat, lon: roundedLng });

            emit('update:latitude', roundedLat);
            emit('update:longitude', roundedLng);
            setMarker(roundedLat, roundedLng);
        } else {
            alert('Address not found.');
        }
    } catch (error) {
        console.error('Error forward geocoding:', error);
    }
};

// Initialize the GeoSearch control
const initializeGeoSearch = () => {
    const provider = new OpenStreetMapProvider();

    const searchControl = new GeoSearchControl({
        provider,
        style: 'bar',
        autoComplete: true,
        autoCompleteDelay: 250,
        showMarker: false
    });

    map.value.addControl(searchControl);

    map.value.on('geosearch/showlocation', (result) => {
        const { x: longitude, y: latitude, label: address } = result.location;
        const roundedLat = parseFloat(latitude.toFixed(6));
        const roundedLng = parseFloat(longitude.toFixed(6));

        emit('update:latitude', roundedLat);
        emit('update:longitude', roundedLng);
        emit('update:address', address);

        setMarker(roundedLat, roundedLng);
    });
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

    initializeGeoSearch();
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