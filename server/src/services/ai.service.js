const OpenAI = require('openai');
const { ConfigModel } = require('../models/config.model');
const { TaskModel } = require('../models/task.model');
const { EmpModel } = require('../models/emp.model');

class AIService {
  constructor() {
    console.log('========== INITIALIZING AI SERVICE ==========');
    console.log('OpenAI API key exists:', !!process.env.OPENAI_API_KEY);
    console.log('OpenAI API key length:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0);
    
    try {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      console.log('OpenAI client initialized successfully');
    } catch (error) {
      console.error('Error initializing OpenAI client:', error);
      console.error('Error stack:', error.stack);
    }
    
    this.rateLimitTracker = new Map();
    console.log('Rate limit tracker initialized');
    console.log('========== AI SERVICE INITIALIZATION COMPLETE ==========');
  }

  async checkRateLimit(userId) {
    const now = Date.now();
    const hourAgo = now - 60 * 60 * 1000;
    const userRequests = this.rateLimitTracker.get(userId) || [];
    
    // Clean old requests
    const recentRequests = userRequests.filter(time => time > hourAgo);
    
    const aiSettings = await ConfigModel.getValue('ai_settings', { rate_limit_per_hour: 100 });
    
    if (recentRequests.length >= aiSettings.rate_limit_per_hour) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    recentRequests.push(now);
    this.rateLimitTracker.set(userId, recentRequests);
  }

  async callOpenAI(prompt, userId, options = {}) {
    console.log('========== CALLING OPENAI API ==========');
    console.log('User ID:', userId);
    console.log('Prompt length:', prompt.length);
    console.log('Options:', options);
    
    try {
      await this.checkRateLimit(userId);
      console.log('Rate limit check passed');
      
      const aiSettings = await ConfigModel.getValue('ai_settings', {
        model: 'gpt-4o-mini',
        max_tokens: 1000,
        temperature: 0.7
      });
      console.log('AI settings loaded:', aiSettings);
      
      console.log('OpenAI API key exists:', !!process.env.OPENAI_API_KEY);
      console.log('OpenAI API key length:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0);
      console.log('OpenAI client initialized:', !!this.openai);
      
      console.log('Making API request to OpenAI with model:', aiSettings.model);
      const response = await this.openai.chat.completions.create({
        model: aiSettings.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.max_tokens || aiSettings.max_tokens,
        temperature: options.temperature || aiSettings.temperature,
      });
      
      console.log('OpenAI API response received');
      console.log('Response status:', response.status);
      console.log('Response choices length:', response.choices?.length);
      
      const result = response.choices[0].message.content.trim();
      console.log('Response content length:', result.length);
      console.log('========== OPENAI API CALL COMPLETED ==========');
      return result;
    } catch (error) {
      console.error('========== OPENAI API ERROR ==========');
      console.error('OpenAI API Error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      if (error.response) {
        console.error('OpenAI API Error Response:', error.response.status, error.response.data);
      }
      
      throw new Error('AI service temporarily unavailable. Please try again later.');
    }
  }

  async generateTaskSummary(description, userId) {
    if (!description || description.trim().length === 0) {
      return "No description provided for summary generation.";
    }

    const prompt = `
    Analyze the following task description and provide a concise, professional summary in 2-3 sentences:
    
    Task Description: "${description}"
    
    Focus on:
    - Main objective
    - Key deliverables
    - Expected outcome
    
    Provide only the summary, no additional formatting or explanations.
    `;

    return await this.callOpenAI(prompt, userId, { max_tokens: 200 });
  }

  async suggestPriority(description, deadline, userId) {
    const priorityLevels = await ConfigModel.getValue('priority_levels', ['Low', 'Medium', 'High', 'Critical']);
    const deadlineBenchmarks = await ConfigModel.getValue('deadline_benchmarks', {
      urgent_days: 1,
      normal_days: 7,
      extended_days: 14
    });

    const daysUntilDeadline = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));

    const prompt = `
    Analyze this task and suggest an appropriate priority level:
    
    Task Description: "${description}"
    Days until deadline: ${daysUntilDeadline}
    Available priority levels: ${priorityLevels.join(', ')}
    
    Deadline benchmarks:
    - Urgent: ${deadlineBenchmarks.urgent_days} day(s)
    - Normal: ${deadlineBenchmarks.normal_days} days
    - Extended: ${deadlineBenchmarks.extended_days} days
    
    Consider:
    - Task complexity and scope
    - Time constraints
    - Potential impact
    - Dependencies
    
    Respond with only the suggested priority level and a brief 1-sentence justification.
    Format: "Priority: [LEVEL] - [Justification]"
    `;

    return await this.callOpenAI(prompt, userId, { max_tokens: 150 });
  }

  async checkDeadlineFeasibility(description, deadline, complexity, userId) {
    const deadlineBenchmarks = await ConfigModel.getValue('deadline_benchmarks', {
      buffer_percentage: 20
    });

    const daysUntilDeadline = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));

    const prompt = `
    Assess the feasibility of this task deadline:
    
    Task: "${description}"
    Complexity: ${complexity || 'Not specified'}
    Days until deadline: ${daysUntilDeadline}
    Recommended buffer: ${deadlineBenchmarks.buffer_percentage}%
    
    Analyze:
    - Task scope vs. available time
    - Complexity considerations
    - Potential risks or blockers
    - Resource requirements
    
    Provide:
    1. Feasibility assessment (Realistic/Tight/Unrealistic)
    2. Brief explanation (1-2 sentences)
    3. Recommendation if needed
    
    Format: "Assessment: [STATUS] - [Explanation] [Recommendation if needed]"
    `;

    return await this.callOpenAI(prompt, userId, { max_tokens: 200 });
  }

  async generateTaskFeedback(task, completionTime, rating, userId) {
    const performanceRanges = await ConfigModel.getValue('performance_ranges', {
      excellent: { min: 4.5, max: 5.0 },
      good: { min: 3.5, max: 4.4 },
      average: { min: 2.5, max: 3.4 },
      poor: { min: 1.0, max: 2.4 }
    });

    let performanceCategory = 'average';
    for (const [category, range] of Object.entries(performanceRanges)) {
      if (rating >= range.min && rating <= range.max) {
        performanceCategory = category;
        break;
      }
    }

    const expectedDays = Math.ceil((new Date(task.deadline) - new Date(task.createdAt)) / (1000 * 60 * 60 * 24));
    const actualDays = Math.ceil(completionTime / (1000 * 60 * 60 * 24));

    const prompt = `
    Generate constructive feedback for a completed task:
    
    Task: "${task.title}"
    Description: "${task.description}"
    Priority: ${task.priority}
    Rating: ${rating}/5 (${performanceCategory} performance)
    Expected completion: ${expectedDays} days
    Actual completion: ${actualDays} days
    
    Provide balanced feedback covering:
    - What was done well
    - Areas for improvement (if any)
    - Time management assessment
    - Suggestions for future similar tasks
    
    Keep it professional, constructive, and encouraging. 2-3 sentences maximum.
    `;

    return await this.callOpenAI(prompt, userId, { max_tokens: 250 });
  }

  async generatePerformanceReport(employeeId, period, userId) {
    try {
      const employee = await EmpModel.findById(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      const periodDays = period === 'weekly' ? 7 : period === 'monthly' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      const tasks = await TaskModel.find({
        assignedTo: employeeId,
        createdAt: { $gte: startDate }
      }).populate('assignedBy', 'name');

      const completedTasks = tasks.filter(task => task.status === 'Completed' || task.status === 'Reviewed');
      const avgRating = completedTasks.length > 0 
        ? completedTasks.reduce((sum, task) => sum + (task.rating || 0), 0) / completedTasks.length 
        : 0;

      const onTimeCompletions = completedTasks.filter(task => 
        new Date(task.updatedAt) <= new Date(task.deadline)
      ).length;

      const prompt = `
      Generate a performance report for employee: ${employee.name}
      
      Period: ${period} (${periodDays} days)
      Total tasks assigned: ${tasks.length}
      Completed tasks: ${completedTasks.length}
      Average rating: ${avgRating.toFixed(1)}/5
      On-time completions: ${onTimeCompletions}/${completedTasks.length}
      
      Task breakdown by priority:
      ${tasks.reduce((acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {})}
      
      Provide a comprehensive performance analysis including:
      - Overall performance summary
      - Strengths and achievements
      - Areas for improvement
      - Recommendations for development
      
      Keep it professional and actionable. 4-5 sentences.
      `;

      return await this.callOpenAI(prompt, userId, { max_tokens: 400 });
    } catch (error) {
      console.error('Error generating performance report:', error);
      throw error;
    }
  }

  async predictDeadlineRisk(employeeId, userId) {
    try {
      const employee = await EmpModel.findById(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      const activeTasks = await TaskModel.find({
        assignedTo: employeeId,
        status: { $in: ['Pending', 'In Progress'] }
      });

      const workloadLimits = await ConfigModel.getValue('workload_limits', {
        max_concurrent_tasks: 5,
        high_priority_limit: 3
      });

      const highPriorityTasks = activeTasks.filter(task => 
        task.priority === 'High' || task.priority === 'Critical'
      );

      const upcomingDeadlines = activeTasks.filter(task => {
        const daysUntilDeadline = Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24));
        return daysUntilDeadline <= 7;
      });

      const prompt = `
      Analyze deadline risk for employee: ${employee.name}
      
      Current workload:
      - Active tasks: ${activeTasks.length}/${workloadLimits.max_concurrent_tasks}
      - High priority tasks: ${highPriorityTasks.length}/${workloadLimits.high_priority_limit}
      - Upcoming deadlines (7 days): ${upcomingDeadlines.length}
      
      Task details:
      ${activeTasks.map(task => 
        `- ${task.title} (${task.priority}, due: ${new Date(task.deadline).toLocaleDateString()})`
      ).join('\n')}
      
      Assess:
      - Risk level (Low/Medium/High/Critical)
      - Potential bottlenecks
      - Recommendations for workload management
      
      Provide a concise risk assessment with actionable recommendations. 3-4 sentences.
      `;

      return await this.callOpenAI(prompt, userId, { max_tokens: 300 });
    } catch (error) {
      console.error('Error predicting deadline risk:', error);
      throw error;
    }
  }

  async analyzeBottlenecks(managerId, userId) {
    try {
      const employees = await EmpModel.find({ user: managerId });
      const employeeIds = employees.map(emp => emp._id);

      const activeTasks = await TaskModel.find({
        assignedTo: { $in: employeeIds },
        status: { $in: ['Pending', 'In Progress'] }
      }).populate('assignedTo', 'name');

      const workloadByEmployee = employees.map(emp => {
        const empTasks = activeTasks.filter(task => 
          task.assignedTo._id.toString() === emp._id.toString()
        );
        const highPriorityTasks = empTasks.filter(task => 
          task.priority === 'High' || task.priority === 'Critical'
        );
        
        return {
          name: emp.name,
          totalTasks: empTasks.length,
          highPriorityTasks: highPriorityTasks.length,
          overdueTasks: empTasks.filter(task => new Date(task.deadline) < new Date()).length
        };
      });

      const prompt = `
      Analyze team bottlenecks and workload distribution:
      
      Team overview:
      ${workloadByEmployee.map(emp => 
        `- ${emp.name}: ${emp.totalTasks} tasks (${emp.highPriorityTasks} high priority, ${emp.overdueTasks} overdue)`
      ).join('\n')}
      
      Total active tasks: ${activeTasks.length}
      Team size: ${employees.length}
      
      Identify:
      - Overloaded team members
      - Workload imbalances
      - Potential bottlenecks
      - Redistribution recommendations
      
      Provide actionable insights for better workload management. 4-5 sentences.
      `;

      return await this.callOpenAI(prompt, userId, { max_tokens: 350 });
    } catch (error) {
      console.error('Error analyzing bottlenecks:', error);
      throw error;
    }
  }

  async simulateWorkloadChange(employeeId, newTaskData, userId) {
    try {
      const employee = await EmpModel.findById(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      const currentTasks = await TaskModel.find({
        assignedTo: employeeId,
        status: { $in: ['Pending', 'In Progress'] }
      });

      const workloadLimits = await ConfigModel.getValue('workload_limits', {
        max_concurrent_tasks: 5,
        daily_hours: 8,
        weekly_hours: 40
      });

      const prompt = `
      Simulate workload impact for employee: ${employee.name}
      
      Current workload:
      - Active tasks: ${currentTasks.length}
      - Task priorities: ${currentTasks.reduce((acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {})}
      
      Proposed new task:
      - Title: ${newTaskData.title}
      - Priority: ${newTaskData.priority}
      - Deadline: ${new Date(newTaskData.deadline).toLocaleDateString()}
      - Estimated complexity: ${newTaskData.complexity || 'Not specified'}
      
      Workload limits:
      - Max concurrent tasks: ${workloadLimits.max_concurrent_tasks}
      - Daily hours: ${workloadLimits.daily_hours}
      - Weekly hours: ${workloadLimits.weekly_hours}
      
      Analyze:
      - Impact on current workload
      - Feasibility assessment
      - Risk factors
      - Alternative recommendations
      
      Provide a "what-if" analysis with recommendations. 3-4 sentences.
      `;

      return await this.callOpenAI(prompt, userId, { max_tokens: 300 });
    } catch (error) {
      console.error('Error simulating workload change:', error);
      throw error;
    }
  }

  async explainTask(taskId, userId) {
    try {
      const task = await TaskModel.findById(taskId)
        .populate('assignedBy', 'name')
        .populate('assignedTo', 'name');

      if (!task) {
        throw new Error('Task not found');
      }

      const prompt = `
      Explain this task in simple, clear language:
      
      Task: ${task.title}
      Description: ${task.description}
      Priority: ${task.priority}
      Deadline: ${new Date(task.deadline).toLocaleDateString()}
      Assigned by: ${task.assignedBy.name}
      Status: ${task.status}
      
      Provide:
      - What needs to be done (in simple terms)
      - Why it's important
      - Key steps or approach
      - Success criteria
      
      Use plain language that anyone can understand. 3-4 sentences.
      `;

      return await this.callOpenAI(prompt, userId, { max_tokens: 250 });
    } catch (error) {
      console.error('Error explaining task:', error);
      throw error;
    }
  }

  async suggestResources(taskId, userId) {
    try {
      const task = await TaskModel.findById(taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      const prompt = `
      Suggest helpful resources and steps for this task:
      
      Task: ${task.title}
      Description: ${task.description}
      Priority: ${task.priority}
      Deadline: ${new Date(task.deadline).toLocaleDateString()}
      
      Provide practical suggestions for:
      - Tools or software that might help
      - Skills or knowledge areas to focus on
      - Step-by-step approach
      - Potential challenges and solutions
      - Time management tips
      
      Keep suggestions actionable and relevant. 4-5 bullet points.
      `;

      return await this.callOpenAI(prompt, userId, { max_tokens: 350 });
    } catch (error) {
      console.error('Error suggesting resources:', error);
      throw error;
    }
  }

  async chatbotResponse(query, employeeId, userId) {
    try {
      const employee = await EmpModel.findById(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      const tasks = await TaskModel.find({ assignedTo: employeeId });
      const pendingTasks = tasks.filter(task => task.status === 'Pending');
      const inProgressTasks = tasks.filter(task => task.status === 'In Progress');
      const completedTasks = tasks.filter(task => task.status === 'Completed' || task.status === 'Reviewed');
      
      const avgRating = completedTasks.length > 0 
        ? completedTasks.reduce((sum, task) => sum + (task.rating || 0), 0) / completedTasks.length 
        : 0;

      const prompt = `
      You are an AI assistant helping employee ${employee.name}. Answer their query based on their work data:
      
      Employee query: "${query}"
      
      Available data:
      - Total tasks: ${tasks.length}
      - Pending tasks: ${pendingTasks.length}
      - In progress tasks: ${inProgressTasks.length}
      - Completed tasks: ${completedTasks.length}
      - Average performance rating: ${avgRating.toFixed(1)}/5
      
      Recent tasks:
      ${tasks.slice(-5).map(task => 
        `- ${task.title} (${task.status}, ${task.priority} priority)`
      ).join('\n')}
      
      Provide a helpful, conversational response. If the query is about specific data, use the numbers provided. If it's general advice, provide supportive guidance. Keep it friendly and professional. 2-3 sentences.
      `;

      return await this.callOpenAI(prompt, userId, { max_tokens: 200 });
    } catch (error) {
      console.error('Error generating chatbot response:', error);
      throw error;
    }
  }
}

module.exports = new AIService();
