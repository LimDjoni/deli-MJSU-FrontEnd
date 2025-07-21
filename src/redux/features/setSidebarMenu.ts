import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type MenuItem = {
  id: number;
  form_name: string;
  path?: string;
  children?: MenuItem[];
  create_flag?: boolean;
  update_flag?: boolean;
  read_flag?: boolean;
  delete_flag?: boolean;
};

interface SidebarState {
  menuItems: MenuItem[];
}

const initialState: SidebarState = {
  menuItems: [],
};

export const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    setSidebarMenu: (state, action: PayloadAction<MenuItem[]>) => {
      state.menuItems = action.payload;
    },
  },
});

export const { setSidebarMenu } = sidebarSlice.actions;
export default sidebarSlice.reducer;