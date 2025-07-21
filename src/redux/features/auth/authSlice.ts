import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Department {
  id?: number;
  department_name: string;
}

interface Employee {
  id?: number;
  firstname: string;
  lastname: string;
  department_id: number;
  Department?: Department;
}

interface User {
  id: number | null;
  username: string | null;
  email: string | null;
  token: string | null;
  employee_id: number | null;
  role: string[] | null;
  employee?: Employee;
  CodeEmp: number | null;
}

interface AuthState {
  user: User | null;
}

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    logout(state) {
      state.user = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('persist:auth');
      }
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;