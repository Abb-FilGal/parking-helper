<template>
  <div class="search-parking-spots">
    <ion-item class="search-bar">
      <ion-input
        v-model="searchQuery"
        placeholder="Search by name, address, or tags"
        class="search-input"
      ></ion-input>
      <ion-button
        slot="start"
        @click="toggleFilterDropdown"
        class="filter-button"
      >
        Filters
      </ion-button>
    </ion-item>

    <div v-if="showFilters" class="filter-dropdown">
      <ion-item>
        <ion-label position="floating">Price Filter</ion-label>
        <ion-select v-model="priceFilter" placeholder="Select price filter">
          <ion-select-option value="ALL">All</ion-select-option>
          <ion-select-option value="PAID">Paid</ion-select-option>
          <ion-select-option value="PARTLY-PAID">Partly Paid</ion-select-option>
          <ion-select-option value="FREE">Free</ion-select-option>
        </ion-select>
      </ion-item>
    </div>
    <ion-button expand="block" @click="applyFilters">Search</ion-button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const searchQuery = ref('');
const priceFilter = ref('ALL');
const showFilters = ref(false);

const emit = defineEmits(['filters-applied']);

const applyFilters = () => {
  emit('filters-applied', { searchQuery: searchQuery.value, priceFilter: priceFilter.value });
  showFilters.value = false;
};

const toggleFilterDropdown = () => {
  showFilters.value = !showFilters.value;
};
</script>

<style scoped>
.search-parking-spots {
  padding: 1rem;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-input {
  flex: 1;
}

.filter-button {
  aspect-ratio: 1 / 1;
  width: 40px;
  padding: 0;
}

.filter-dropdown {
  margin-top: 1rem;
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 8px;
  background-color: #f9f9f9;
}

ion-item {
  margin-bottom: 1rem;
}
</style>