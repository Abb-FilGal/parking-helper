import { ref } from 'vue';
import { collection, getDocs } from 'firebase/firestore';
import { useNuxtApp } from '#app';
import { setCache, getCache } from '~/services/cacheService';
import { useCloudinaryService } from '~/services/cloudinaryService';

export const useParkingSpots = () => {
    const parkingSpots = ref([]);
    const isLoading = ref(true);
    const { getOptimizedUrl } = useCloudinaryService();

    const fetchParkingSpots = async () => {
        try {
            const cacheKey = 'parkingSpots';
            const cachedSpots = getCache(cacheKey);

            if (cachedSpots && cachedSpots.length > 0) {
                console.debug('[ParkingList] Using cached parking spots');
                parkingSpots.value = cachedSpots;
                return;
            }

            console.debug('[ParkingList] Fetching parking spots from Firestore');
            const { $firestore } = useNuxtApp();
            const parkingSpotsCollection = collection($firestore, 'parkingSpots');

            const querySnapshot = await getDocs(parkingSpotsCollection);
            const spots = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    latitude: data.latitude || null,
                    longitude: data.longitude || null
                };
            });

            console.debug('[ParkingList] Caching fetched parking spots');
            setCache(cacheKey, spots);

            parkingSpots.value = spots;
        } catch (error) {
            console.error('[ParkingList] Error fetching parking spots:', error);
            parkingSpots.value = []; // Fallback to an empty array
        } finally {
            isLoading.value = false;
        }
    };

    return {
        parkingSpots,
        isLoading,
        fetchParkingSpots
    };
};