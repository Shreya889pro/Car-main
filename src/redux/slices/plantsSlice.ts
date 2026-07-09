import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Plant } from '@/types';

const initialPlants: Plant[] = [
  { id: '1', name: 'Detroit Manufacturing Facility', code: 'DTF-01', location: 'Detroit, Michigan', address: '5000 Industrial Boulevard, Detroit, MI 48201', capacity: 50000, currentLoad: 38500, departments: ['1', '2', '3', '4', '5', '6', '7'], managers: ['1', '2', '3'], status: 'operational', establishedDate: '1995-06-15', area: 250000, shifts: [{ id: 's1', name: 'Day Shift', startTime: '06:00', endTime: '14:00', workers: 150 }, { id: 's2', name: 'Afternoon Shift', startTime: '14:00', endTime: '22:00', workers: 120 }, { id: 's3', name: 'Night Shift', startTime: '22:00', endTime: '06:00', workers: 80 }] },
  { id: '2', name: 'Chicago Assembly Plant', code: 'CHI-02', location: 'Chicago, Illinois', address: '3200 Assembly Drive, Chicago, IL 60601', capacity: 35000, currentLoad: 28000, departments: ['8', '9', '10'], managers: ['4'], status: 'operational', establishedDate: '2002-03-20', area: 180000, shifts: [{ id: 's4', name: 'Day Shift', startTime: '07:00', endTime: '15:00', workers: 100 }, { id: 's5', name: 'Night Shift', startTime: '15:00', endTime: '23:00', workers: 70 }] },
  { id: '3', name: 'Milwaukee Parts Facility', code: 'MKE-03', location: 'Milwaukee, Wisconsin', address: '1500 Parts Avenue, Milwaukee, WI 53201', capacity: 20000, currentLoad: 15500, departments: ['11', '12'], managers: ['5'], status: 'operational', establishedDate: '2010-08-10', area: 120000, shifts: [{ id: 's6', name: 'Day Shift', startTime: '08:00', endTime: '16:00', workers: 60 }] },
  { id: '4', name: 'Cleveland Distribution Center', code: 'CLE-04', location: 'Cleveland, Ohio', address: '800 Distribution Way, Cleveland, OH 44101', capacity: 25000, currentLoad: 12000, departments: ['13', '14', '15'], managers: ['6'], status: 'operational', establishedDate: '2015-01-05', area: 150000, shifts: [{ id: 's7', name: 'Day Shift', startTime: '06:00', endTime: '14:00', workers: 45 }, { id: 's8', name: 'Night Shift', startTime: '14:00', endTime: '22:00', workers: 35 }] },
  { id: '5', name: 'Toledo Specialty Plant', code: 'TOL-05', location: 'Toledo, Ohio', address: '2500 Specialty Road, Toledo, OH 43601', capacity: 15000, currentLoad: 8500, departments: ['16', '17'], managers: ['7'], status: 'maintenance', establishedDate: '2018-11-22', area: 80000, shifts: [{ id: 's9', name: 'Day Shift', startTime: '07:00', endTime: '15:00', workers: 40 }] },
];

interface PlantsState {
  plants: Plant[];
  selectedPlant: Plant | null;
  loading: boolean;
  error: string | null;
}

const initialState: PlantsState = {
  plants: initialPlants,
  selectedPlant: null,
  loading: false,
  error: null,
};

const plantsSlice = createSlice({
  name: 'plants',
  initialState,
  reducers: {
    setPlants: (state, action: PayloadAction<Plant[]>) => {
      state.plants = action.payload;
    },
    selectPlant: (state, action: PayloadAction<string>) => {
      state.selectedPlant = state.plants.find(p => p.id === action.payload) || null;
    },
    clearSelectedPlant: (state) => {
      state.selectedPlant = null;
    },
    updatePlant: (state, action: PayloadAction<Plant>) => {
      const index = state.plants.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.plants[index] = action.payload;
      }
    },
  },
});

export const { setPlants, selectPlant, clearSelectedPlant, updatePlant } = plantsSlice.actions;
export default plantsSlice.reducer;
