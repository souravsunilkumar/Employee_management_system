import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosClient } from '../utils/axiosClient';

// Async thunks for AI API calls

// Generate task summary
export const generateTaskSummary = createAsyncThunk(
  'ai/generateTaskSummary',
  async (description, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/ai/task-summary', { description });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to generate task summary');
    }
  }
);

// Suggest task priority
export const suggestPriority = createAsyncThunk(
  'ai/suggestPriority',
  async ({ description, deadline }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/ai/suggest-priority', { description, deadline });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to suggest priority');
    }
  }
);

// Check deadline feasibility
export const checkDeadline = createAsyncThunk(
  'ai/checkDeadline',
  async ({ description, deadline, complexity }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/ai/check-deadline', { description, deadline, complexity });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to check deadline');
    }
  }
);

// Generate task feedback
export const generateTaskFeedback = createAsyncThunk(
  'ai/generateTaskFeedback',
  async ({ taskId, rating }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/ai/task-feedback', { taskId, rating });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to generate feedback');
    }
  }
);

// Get performance report
export const getPerformanceReport = createAsyncThunk(
  'ai/getPerformanceReport',
  async ({ employeeId, period = 'monthly' }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`/ai/performance-report/${employeeId}?period=${period}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to get performance report');
    }
  }
);

// Get deadline risk
export const getDeadlineRisk = createAsyncThunk(
  'ai/getDeadlineRisk',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`/ai/deadline-risk/${employeeId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to get deadline risk');
    }
  }
);

// Analyze bottlenecks
export const analyzeBottlenecks = createAsyncThunk(
  'ai/analyzeBottlenecks',
  async (managerIdentifier, { rejectWithValue }) => {
    try {
      // Check if the identifier is an email or ID
      const isEmail = typeof managerIdentifier === 'string' && managerIdentifier.includes('@');
      
      // If it's an email, use a query parameter instead of path parameter
      let url = isEmail 
        ? `/ai/bottlenecks?email=${encodeURIComponent(managerIdentifier)}` 
        : `/ai/bottlenecks/${managerIdentifier}`;
      
      console.log('Making API request to:', url);
      const response = await axiosClient.get(url);
      return response.data.data;
    } catch (error) {
      console.error('Bottleneck analysis API error:', error.response || error);
      
      // Handle the specific error message for temporary offline status
      if (error.response?.status === 503 && error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      }
      
      return rejectWithValue(error.response?.data?.error || 'Failed to analyze bottlenecks');
    }
  }
);

// Simulate workload change
export const simulateWorkloadChange = createAsyncThunk(
  'ai/simulateWorkloadChange',
  async ({ employeeId, taskData }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/ai/what-if', { employeeId, taskData });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to simulate workload change');
    }
  }
);

// Explain task
export const explainTask = createAsyncThunk(
  'ai/explainTask',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`/ai/explain-task/${taskId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to explain task');
    }
  }
);

// Suggest resources
export const suggestResources = createAsyncThunk(
  'ai/suggestResources',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`/ai/suggest-resources/${taskId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to suggest resources');
    }
  }
);

// Get chatbot response
export const getChatbotResponse = createAsyncThunk(
  'ai/getChatbotResponse',
  async (query, { rejectWithValue }) => {
    try {
      console.log('Sending chatbot request with query:', query);
      const response = await axiosClient.post('/ai/chatbot', { query });
      console.log('Chatbot response received:', response.data);
      return { query, response: response.data.data.response };
    } catch (error) {
      console.error('Chatbot API error:', error.response || error);
      
      // Check for specific error types
      if (error.response?.status === 403) {
        console.log('Access denied error for chatbot:', error.response.data);
        return rejectWithValue(error.response.data.error || 'Access denied: Chatbot is only available for employees');
      }
      
      if (error.response?.status === 503) {
        console.log('Service unavailable error for chatbot:', error.response.data);
        return rejectWithValue('The AI service is temporarily offline due to usage limits.');
      }
      
      return rejectWithValue(error.response?.data?.error || 'Failed to get chatbot response');
    }
  }
);

const initialState = {
  // Task-related AI features
  taskSummary: null,
  prioritySuggestion: null,
  deadlineFeasibility: null,
  taskFeedback: null,
  taskExplanation: null,
  resourceSuggestions: null,
  
  // Performance and analytics
  performanceReport: null,
  deadlineRisk: null,
  bottleneckAnalysis: null,
  workloadSimulation: null,
  
  // Chatbot
  chatHistory: [],
  
  // Loading states
  loading: {
    taskSummary: false,
    prioritySuggestion: false,
    deadlineFeasibility: false,
    taskFeedback: false,
    performanceReport: false,
    deadlineRisk: false,
    bottleneckAnalysis: false,
    workloadSimulation: false,
    taskExplanation: false,
    resourceSuggestions: false,
    chatbot: false,
  },
  
  // Error states
  errors: {
    taskSummary: null,
    prioritySuggestion: null,
    deadlineFeasibility: null,
    taskFeedback: null,
    performanceReport: null,
    deadlineRisk: null,
    bottleneckAnalysis: null,
    workloadSimulation: null,
    taskExplanation: null,
    resourceSuggestions: null,
    chatbot: null,
  }
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearError: (state, action) => {
      const { feature } = action.payload;
      if (feature && state.errors[feature]) {
        state.errors[feature] = null;
      }
    },
    clearAllErrors: (state) => {
      Object.keys(state.errors).forEach(key => {
        state.errors[key] = null;
      });
    },
    clearChatHistory: (state) => {
      state.chatHistory = [];
    },
    clearAIData: (state, action) => {
      const { feature } = action.payload;
      if (feature && state[feature] !== undefined) {
        state[feature] = null;
      }
    }
  },
  extraReducers: (builder) => {
    // Task Summary
    builder
      .addCase(generateTaskSummary.pending, (state) => {
        state.loading.taskSummary = true;
        state.errors.taskSummary = null;
      })
      .addCase(generateTaskSummary.fulfilled, (state, action) => {
        state.loading.taskSummary = false;
        state.taskSummary = action.payload.summary;
      })
      .addCase(generateTaskSummary.rejected, (state, action) => {
        state.loading.taskSummary = false;
        state.errors.taskSummary = action.payload;
      });

    // Priority Suggestion
    builder
      .addCase(suggestPriority.pending, (state) => {
        state.loading.prioritySuggestion = true;
        state.errors.prioritySuggestion = null;
      })
      .addCase(suggestPriority.fulfilled, (state, action) => {
        state.loading.prioritySuggestion = false;
        state.prioritySuggestion = action.payload.suggestion;
      })
      .addCase(suggestPriority.rejected, (state, action) => {
        state.loading.prioritySuggestion = false;
        state.errors.prioritySuggestion = action.payload;
      });

    // Deadline Check
    builder
      .addCase(checkDeadline.pending, (state) => {
        state.loading.deadlineFeasibility = true;
        state.errors.deadlineFeasibility = null;
      })
      .addCase(checkDeadline.fulfilled, (state, action) => {
        state.loading.deadlineFeasibility = false;
        state.deadlineFeasibility = action.payload.feasibility;
      })
      .addCase(checkDeadline.rejected, (state, action) => {
        state.loading.deadlineFeasibility = false;
        state.errors.deadlineFeasibility = action.payload;
      });

    // Task Feedback
    builder
      .addCase(generateTaskFeedback.pending, (state) => {
        state.loading.taskFeedback = true;
        state.errors.taskFeedback = null;
      })
      .addCase(generateTaskFeedback.fulfilled, (state, action) => {
        state.loading.taskFeedback = false;
        state.taskFeedback = action.payload.feedback;
      })
      .addCase(generateTaskFeedback.rejected, (state, action) => {
        state.loading.taskFeedback = false;
        state.errors.taskFeedback = action.payload;
      });

    // Performance Report
    builder
      .addCase(getPerformanceReport.pending, (state) => {
        state.loading.performanceReport = true;
        state.errors.performanceReport = null;
      })
      .addCase(getPerformanceReport.fulfilled, (state, action) => {
        state.loading.performanceReport = false;
        state.performanceReport = action.payload;
      })
      .addCase(getPerformanceReport.rejected, (state, action) => {
        state.loading.performanceReport = false;
        state.errors.performanceReport = action.payload;
      });

    // Deadline Risk
    builder
      .addCase(getDeadlineRisk.pending, (state) => {
        state.loading.deadlineRisk = true;
        state.errors.deadlineRisk = null;
      })
      .addCase(getDeadlineRisk.fulfilled, (state, action) => {
        state.loading.deadlineRisk = false;
        state.deadlineRisk = action.payload.riskAnalysis;
      })
      .addCase(getDeadlineRisk.rejected, (state, action) => {
        state.loading.deadlineRisk = false;
        state.errors.deadlineRisk = action.payload;
      });

    // Bottleneck Analysis
    builder
      .addCase(analyzeBottlenecks.pending, (state) => {
        state.loading.bottleneckAnalysis = true;
        state.errors.bottleneckAnalysis = null;
      })
      .addCase(analyzeBottlenecks.fulfilled, (state, action) => {
        state.loading.bottleneckAnalysis = false;
        state.bottleneckAnalysis = action.payload.analysis;
      })
      .addCase(analyzeBottlenecks.rejected, (state, action) => {
        state.loading.bottleneckAnalysis = false;
        state.errors.bottleneckAnalysis = action.payload;
      });

    // Workload Simulation
    builder
      .addCase(simulateWorkloadChange.pending, (state) => {
        state.loading.workloadSimulation = true;
        state.errors.workloadSimulation = null;
      })
      .addCase(simulateWorkloadChange.fulfilled, (state, action) => {
        state.loading.workloadSimulation = false;
        state.workloadSimulation = action.payload.simulation;
      })
      .addCase(simulateWorkloadChange.rejected, (state, action) => {
        state.loading.workloadSimulation = false;
        state.errors.workloadSimulation = action.payload;
      });

    // Task Explanation
    builder
      .addCase(explainTask.pending, (state) => {
        state.loading.taskExplanation = true;
        state.errors.taskExplanation = null;
      })
      .addCase(explainTask.fulfilled, (state, action) => {
        state.loading.taskExplanation = false;
        state.taskExplanation = action.payload.explanation;
      })
      .addCase(explainTask.rejected, (state, action) => {
        state.loading.taskExplanation = false;
        state.errors.taskExplanation = action.payload;
      });

    // Resource Suggestions
    builder
      .addCase(suggestResources.pending, (state) => {
        state.loading.resourceSuggestions = true;
        state.errors.resourceSuggestions = null;
      })
      .addCase(suggestResources.fulfilled, (state, action) => {
        state.loading.resourceSuggestions = false;
        state.resourceSuggestions = action.payload.suggestions;
      })
      .addCase(suggestResources.rejected, (state, action) => {
        state.loading.resourceSuggestions = false;
        state.errors.resourceSuggestions = action.payload;
      });

    // Chatbot
    builder
      .addCase(getChatbotResponse.pending, (state) => {
        state.loading.chatbot = true;
        state.errors.chatbot = null;
      })
      .addCase(getChatbotResponse.fulfilled, (state, action) => {
        state.loading.chatbot = false;
        state.chatHistory.push({
          id: Date.now(),
          query: action.payload.query,
          response: action.payload.response,
          timestamp: new Date().toISOString()
        });
      })
      .addCase(getChatbotResponse.rejected, (state, action) => {
        state.loading.chatbot = false;
        state.errors.chatbot = action.payload;
      });
  }
});

export const { clearError, clearAllErrors, clearChatHistory, clearAIData } = aiSlice.actions;
export default aiSlice.reducer;
