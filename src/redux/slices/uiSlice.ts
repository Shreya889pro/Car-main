import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarCollapsed: boolean;
  sidebarOpen: boolean;
  darkMode: boolean;
  commandPaletteOpen: boolean;
  notificationPanelOpen: boolean;
  searchQuery: string;
  currentPage: string;
  breadcrumbs: { label: string; path: string }[];
  loading: {
    global: boolean;
    page: boolean;
  };
  modals: {
    createOrder: boolean;
    addEmployee: boolean;
    confirmAction: boolean;
  };
  drawers: {
    orderDetails: boolean;
    employeeDetails: boolean;
    settings: boolean;
  };
}

const initialState: UIState = {
  sidebarCollapsed: false,
  sidebarOpen: true,
  darkMode: true,
  commandPaletteOpen: false,
  notificationPanelOpen: false,
  searchQuery: '',
  currentPage: 'dashboard',
  breadcrumbs: [],
  loading: {
    global: false,
    page: false,
  },
  modals: {
    createOrder: false,
    addEmployee: false,
    confirmAction: false,
  },
  drawers: {
    orderDetails: false,
    employeeDetails: false,
    settings: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
    },
    toggleCommandPalette: (state) => {
      state.commandPaletteOpen = !state.commandPaletteOpen;
    },
    setCommandPaletteOpen: (state, action: PayloadAction<boolean>) => {
      state.commandPaletteOpen = action.payload;
    },
    toggleNotificationPanel: (state) => {
      state.notificationPanelOpen = !state.notificationPanelOpen;
    },
    setNotificationPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.notificationPanelOpen = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload;
    },
    setBreadcrumbs: (state, action: PayloadAction<UIState['breadcrumbs']>) => {
      state.breadcrumbs = action.payload;
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    setPageLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.page = action.payload;
    },
    openModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = false;
    },
    openDrawer: (state, action: PayloadAction<keyof UIState['drawers']>) => {
      state.drawers[action.payload] = true;
    },
    closeDrawer: (state, action: PayloadAction<keyof UIState['drawers']>) => {
      state.drawers[action.payload] = false;
    },
    closeAllModals: (state) => {
      state.modals = {
        createOrder: false,
        addEmployee: false,
        confirmAction: false,
      };
    },
    closeAllDrawers: (state) => {
      state.drawers = {
        orderDetails: false,
        employeeDetails: false,
        settings: false,
      };
    },
  },
});

export const {
  toggleSidebar,
  toggleSidebarCollapsed,
  setSidebarOpen,
  toggleDarkMode,
  setDarkMode,
  toggleCommandPalette,
  setCommandPaletteOpen,
  toggleNotificationPanel,
  setNotificationPanelOpen,
  setSearchQuery,
  setCurrentPage,
  setBreadcrumbs,
  setGlobalLoading,
  setPageLoading,
  openModal,
  closeModal,
  openDrawer,
  closeDrawer,
  closeAllModals,
  closeAllDrawers,
} = uiSlice.actions;

export default uiSlice.reducer;
