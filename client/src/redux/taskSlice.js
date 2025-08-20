import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosClient } from '../utils/axiosClient';

// Async thunks for API calls
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchTasksByManager = createAsyncThunk(
  'tasks/fetchTasksByManager',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/tasks/manager');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchTasksByEmployee = createAsyncThunk(
  'tasks/fetchTasksByEmployee',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/tasks/employee');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  'tasks/updateTaskStatus',
  async ({ taskId, status, attachments }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(`/tasks/${taskId}/status`, {
        status,
        attachments,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const reviewTask = createAsyncThunk(
  'tasks/reviewTask',
  async ({ taskId, feedback, rating }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(`/tasks/${taskId}/review`, {
        feedback,
        rating,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchTaskStats = createAsyncThunk(
  'tasks/fetchTaskStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/tasks/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchEmployeesForAssignment = createAsyncThunk(
  'tasks/fetchEmployeesForAssignment',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/tasks/employees-for-assignment');
      return response.data.employees;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, taskData }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put(`/tasks/${taskId}`, taskData);
      return response.data.task;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/tasks/${taskId}`);
      return taskId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const initialState = {
  tasks: [],
  taskStats: {},
  employeesForAssignment: [],
  loading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  error: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTasks: (state) => {
      state.tasks = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Task
      .addCase(createTask.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.createLoading = false;
        state.tasks.unshift(action.payload.task);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Tasks by Manager
      .addCase(fetchTasksByManager.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasksByManager.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
      })
      .addCase(fetchTasksByManager.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Tasks by Employee
      .addCase(fetchTasksByEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasksByEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
      })
      .addCase(fetchTasksByEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Task Status
      .addCase(updateTaskStatus.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.tasks.findIndex(task => task._id === action.payload.task._id);
        if (index !== -1) {
          state.tasks[index] = action.payload.task;
        }
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })
      
      // Review Task
      .addCase(reviewTask.pending, (state) => {
        state.reviewLoading = true;
        state.error = null;
      })
      .addCase(reviewTask.fulfilled, (state, action) => {
        state.reviewLoading = false;
        const index = state.tasks.findIndex(task => task._id === action.payload.task._id);
        if (index !== -1) {
          state.tasks[index] = action.payload.task;
        }
      })
      .addCase(reviewTask.rejected, (state, action) => {
        state.reviewLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Task Stats
      .addCase(fetchTaskStats.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchTaskStats.fulfilled, (state, action) => {
        state.taskStats = action.payload.stats;
      })
      .addCase(fetchTaskStats.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Fetch Employees for Assignment
      .addCase(fetchEmployeesForAssignment.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchEmployeesForAssignment.fulfilled, (state, action) => {
        state.employeesForAssignment = action.payload;
      })
      .addCase(fetchEmployeesForAssignment.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Update Task
      .addCase(updateTask.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.tasks.findIndex(task => task._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })
      
      // Delete Task
      .addCase(deleteTask.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.tasks = state.tasks.filter(task => task._id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearTasks } = taskSlice.actions;
export default taskSlice.reducer;
