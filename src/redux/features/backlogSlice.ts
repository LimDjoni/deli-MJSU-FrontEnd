import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BacklogState {
  origin: 'approval' | 'review-backlog' | 'in-progress' | null; // Define allowed origins
}

const initialState: BacklogState = {
  origin: null,
};

const backlogSlice = createSlice({
  name: 'backlog',
  initialState,
  reducers: {
    setBacklogOrigin(state, action: PayloadAction<'approval' | 'review-backlog' | 'in-progress'>) {
      state.origin = action.payload;
    },
    clearBacklogOrigin(state) {
      state.origin = null;
    },
  },
});

export const { setBacklogOrigin, clearBacklogOrigin } = backlogSlice.actions;
export default backlogSlice.reducer;
