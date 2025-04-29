<template>
    <div class="map-container">
        <div id="map" class="map"></div>
        <!-- <ion-button expand="block" @click="getUserLocation">Use My Location</ion-button> -->
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { useParkingSpots } from '~/composables/useParkingSpots';
import 'leaflet.markercluster';

const map = ref(null);
let markerClusterGroup = null;

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

// Use the composable to fetch parking spots
const { parkingSpots, fetchParkingSpots } = useParkingSpots();

const addParkingSpotMarkers = (spots) => {
    if (!map.value || !markerClusterGroup) {
        console.warn('Map or markerClusterGroup is not initialized.');
        return;
    }

    if (!spots || spots.length === 0) {
        console.warn('No parking spots available to display.');
        return;
    }

    const markers = spots
        .filter(spot => {
            // Validate that the spot has a valid location with latitude and longitude
            if (!spot.location || !spot.location.latitude || !spot.location.longitude) {
                console.warn('Invalid parking spot location:', spot);
                return false;
            }
            return true;
        })
        .map(spot => {
            // Create a marker for each valid parking spot
            const marker = L.marker([spot.location.latitude, spot.location.longitude]);

            // Bind a popup to the marker
            marker.bindPopup(`
                <b>${spot.name}</b><br>
                ${spot.address}<br>
                <img src="${spot.firstImage}" alt="${spot.name}" style="width: 100px; height: auto;" />
            `);

            // Add a click event to zoom into the marker and keep it centered
            marker.on('click', () => {
                map.value.flyTo([spot.location.latitude, spot.location.longitude], 15, {
                    duration: 1.5, // Smooth animation duration in seconds
                });

                // Reopen the popup after the flyTo animation completes
                setTimeout(() => {
                    marker.openPopup();
                }, 1500); // Match the duration of the flyTo animation
            });

            return marker;
        });

    // Clear existing markers and add new ones
    markerClusterGroup.clearLayers();
    markerClusterGroup.addLayers(markers);
};

const getUserLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                console.log('User location:', latitude, longitude); // Debug log

                // Center the map on the user's location
                map.value.setView([latitude, longitude], 13);

                // Add a marker for the user's location
                const userMarker = L.marker([latitude, longitude], {
                    icon: L.divIcon({
                        html: `<div style="background-color: red; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
                        className: '', // No additional class needed
                        iconSize: [20, 20] // Size of the marker
                    })
                }).addTo(map.value);

                // Optionally bind a popup to the user's location marker
                // userMarker.bindPopup('You are here!').openPopup();

                // Emit the user's location
                emit('update:latitude', latitude);
                emit('update:longitude', longitude);
            },
            (error) => {
                console.error('Error getting user location:', error);

                // Fallback to default location
                const fallbackLatitude = props.latitude || 59.3293;
                const fallbackLongitude = props.longitude || 18.0686;

                map.value.setView([fallbackLatitude, fallbackLongitude], 10);

                L.marker([fallbackLatitude, fallbackLongitude], {
                    icon: L.divIcon({
                        html: `<div class="user-location-marker"></div>`,
                        className: '',
                        iconSize: [20, 20]
                    })
                }).addTo(map.value).bindPopup('Default location: Unable to get user location').openPopup();
            }
        );
    } else {
        console.warn('Geolocation is not supported by this browser.');

        // Fallback to default location
        const fallbackLatitude = props.latitude || 59.3293;
        const fallbackLongitude = props.longitude || 18.0686;

        map.value.setView([fallbackLatitude, fallbackLongitude], 10);

        L.marker([fallbackLatitude, fallbackLongitude], {
            icon: L.divIcon({
                html: `<div class="user-location-marker"></div>`,
                className: '',
                iconSize: [20, 20]
            })
        }).addTo(map.value).bindPopup('Default location: Unable to get user location').openPopup();
    }
};
onMounted(async () => {
    if (!map.value) {
        map.value = L.map('map').setView([props.latitude, props.longitude], 10);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            minZoom: 5,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map.value);

        // Create a marker cluster group with custom styling
        markerClusterGroup = L.markerClusterGroup({
            iconCreateFunction: (cluster) => {
                const count = cluster.getChildCount(); // Number of markers in the cluster
                return L.divIcon({
                    html: `<div class="custom-cluster-icon">${count}</div>`,
                    className: 'custom-cluster', // Custom class for styling
                    iconSize: [40, 40] // Size of the cluster icon
                });
            }
        });

        map.value.addLayer(markerClusterGroup);

        // Fetch parking spots and add markers
        await fetchParkingSpots();
        console.log('Fetched parking spots:', parkingSpots.value); // Debug log
        addParkingSpotMarkers(parkingSpots.value);

        // Use the user's location as the default center
        getUserLocation();

        map.value.on('moveend', () => {
            const bounds = map.value.getBounds();
            const visibleSpots = parkingSpots.value.filter(spot =>
                spot.location &&
                bounds.contains([spot.location.latitude, spot.location.longitude])
            );
            addParkingSpotMarkers(visibleSpots);
        });

        // Ensure the map resizes correctly
        setTimeout(() => {
            map.value.invalidateSize();
        }, 0);

        // Add a resize listener
        window.addEventListener('resize', () => {
            if (map.value) {
                map.value.invalidateSize();
            }
        });
    }
});

onUnmounted(() => {
    window.removeEventListener('resize', () => {
        if (map.value) {
            map.value.invalidateSize();
        }
    });
});
</script>

<style>
.map-container {
    position: relative;
    height: 400px; /* Ensure the container has a fixed height */
    margin-bottom: 1rem;
}

.map {
    height: 100%; /* Fill the container */
    width: 100%; /* Fill the container */
}

/* Custom cluster marker styles */
.custom-cluster {
    background-color: blue; /* Blue background */
    border-radius: 50%; /* Make it circular */
    color: white; /* White text */
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: bold;
    border: 2px solid white; /* Optional: Add a white border */
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); /* Optional: Add a shadow */
}

.custom-cluster-icon {
    width: 100%;
    height: 100%;
    line-height: 40px; /* Center the text vertically */
    text-align: center;
}

.user-location-marker {
    background-color: red; /* Red background for the user marker */
    border: 2px solid white; /* White border for better visibility */
    border-radius: 50%; /* Make it circular */
    width: 20px; /* Width of the marker */
    height: 20px; /* Height of the marker */
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); /* Optional: Add a shadow */
}
</style>