
import { createClient } from '@supabase/supabase-js';
import { ChecklistItem, ChecklistType, Checklist, ActionPlan } from '@/types';

// Initialize Supabase client with proper error handling
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if supabase credentials are available
if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL and key are required. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

// Create client with fallbacks to prevent application from crashing
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseKey || 'placeholder-key'
);

// Auth services
export const authService = {
  // Register a new user
  async registerUser(email: string, password: string, name: string, unidade: string): Promise<boolean> {
    try {
      // Register the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) {
        console.error('Error registering user:', authError);
        return false;
      }
      
      if (!authData.user) {
        console.error('No user returned after registration');
        return false;
      }
      
      // Create a profile record in the users table
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email,
            name,
            role: 'collaborator',
            unidade,
          }
        ]);
        
      if (profileError) {
        console.error('Error creating user profile:', profileError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in registerUser:', error);
      return false;
    }
  }
};

// Checklist services
export const checklistService = {
  // Create a new checklist
  async createChecklist(checklist: Omit<Checklist, 'id'>): Promise<Checklist | null> {
    try {
      const { data, error } = await supabase
        .from('checklists')
        .insert(checklist)
        .select('*')
        .single();
      
      if (error) {
        console.error('Error creating checklist:', error);
        return null;
      }
      
      return data as Checklist;
    } catch (error) {
      console.error('Error in createChecklist:', error);
      return null;
    }
  },

  // Get checklists by store ID
  async getChecklistsByStore(storeId: string): Promise<Checklist[]> {
    try {
      const { data, error } = await supabase
        .from('checklists')
        .select(`
          *,
          items:checklist_items(*)
        `)
        .eq('storeId', storeId);
      
      if (error) {
        console.error('Error fetching checklists by store:', error);
        return [];
      }
      
      return data as unknown as Checklist[];
    } catch (error) {
      console.error('Error in getChecklistsByStore:', error);
      return [];
    }
  },

  // Get checklists by date
  async getChecklistsByDate(date: string): Promise<Checklist[]> {
    try {
      const { data, error } = await supabase
        .from('checklists')
        .select(`
          *,
          items:checklist_items(*)
        `)
        .eq('date', date);
      
      if (error) {
        console.error('Error fetching checklists by date:', error);
        return [];
      }
      
      return data as unknown as Checklist[];
    } catch (error) {
      console.error('Error in getChecklistsByDate:', error);
      return [];
    }
  },

  // Get checklists by type
  async getChecklistsByType(type: ChecklistType): Promise<Checklist[]> {
    try {
      const { data, error } = await supabase
        .from('checklists')
        .select(`
          *,
          items:checklist_items(*)
        `)
        .eq('type', type);
      
      if (error) {
        console.error('Error fetching checklists by type:', error);
        return [];
      }
      
      return data as unknown as Checklist[];
    } catch (error) {
      console.error('Error in getChecklistsByType:', error);
      return [];
    }
  },

  // Update a checklist item
  async updateChecklistItem(
    itemId: string,
    status: "sim" | "nao",
    justification?: string,
    photoUrl?: string
  ): Promise<boolean> {
    try {
      const updateData: Partial<ChecklistItem> = { 
        status, 
        timestamp: new Date().toISOString() 
      };
      
      if (status === 'nao' && justification) {
        updateData.justification = justification;
      }
      
      if (status === 'sim' && photoUrl) {
        updateData.photoUrl = photoUrl;
      }
      
      const { error } = await supabase
        .from('checklist_items')
        .update(updateData)
        .eq('id', itemId);
      
      if (error) {
        console.error('Error updating checklist item:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in updateChecklistItem:', error);
      return false;
    }
  },

  // Save a completed checklist
  async saveChecklist(checklistId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('checklists')
        .update({ completed: true })
        .eq('id', checklistId);
      
      if (error) {
        console.error('Error saving checklist:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in saveChecklist:', error);
      return false;
    }
  }
};

// Action Plan services
export const actionPlanService = {
  // Add a new action plan
  async addActionPlan(actionPlan: Omit<ActionPlan, 'id'>): Promise<ActionPlan | null> {
    try {
      const { data, error } = await supabase
        .from('action_plans')
        .insert(actionPlan)
        .select('*')
        .single();
      
      if (error) {
        console.error('Error adding action plan:', error);
        return null;
      }
      
      return data as ActionPlan;
    } catch (error) {
      console.error('Error in addActionPlan:', error);
      return null;
    }
  },

  // Get pending action plans
  async getPendingActionPlans(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('action_plans')
        .select(`
          *,
          checklists!inner(*),
          checklist_items!inner(*)
        `)
        .in('status', ['pending', 'enviado']);
      
      if (error) {
        console.error('Error fetching pending action plans:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getPendingActionPlans:', error);
      return [];
    }
  },

  // Review an action plan
  async reviewActionPlan(
    planId: string,
    status: "approved" | "rejected",
    reviewerId: string,
    reviewerName: string,
    comment?: string
  ): Promise<boolean> {
    try {
      const updateData: any = {
        status,
        reviewerId,
        reviewerName,
        updatedAt: new Date().toISOString()
      };
      
      if (comment) {
        updateData.reviewComment = comment;
      }
      
      const { error } = await supabase
        .from('action_plans')
        .update(updateData)
        .eq('id', planId);
      
      if (error) {
        console.error('Error reviewing action plan:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in reviewActionPlan:', error);
      return false;
    }
  }
};

// Storage service for image uploads
export const storageService = {
  // Upload an image for a checklist item
  async uploadImage(file: File, checklistId: string, itemId: string): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${checklistId}/${itemId}-${Date.now()}.${fileExt}`;
      const filePath = `checklist-images/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('checklist-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return null;
      }
      
      const { data } = supabase.storage
        .from('checklist-files')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error('Error in uploadImage:', error);
      return null;
    }
  },
  
  // Get the public URL for an image
  getPublicUrl(path: string): string {
    const { data } = supabase.storage
      .from('checklist-files')
      .getPublicUrl(path);
      
    return data.publicUrl;
  }
};

// Create necessary tables if they don't exist
export const setupDatabase = async () => {
  // This function would typically run server-side or in a migration
  console.log('Database setup would happen here in a real application');
};

// Initialize Supabase
export const initSupabase = async () => {
  try {
    // Check if user is authenticated
    const { data } = await supabase.auth.getSession();
    
    if (!data.session) {
      console.log('User not authenticated');
    } else {
      console.log('User authenticated:', data.session.user.id);
    }
    
    // Setup database if needed
    await setupDatabase();

    return true;
  } catch (error) {
    console.error('Error initializing Supabase:', error);
    return false;
  }
};
