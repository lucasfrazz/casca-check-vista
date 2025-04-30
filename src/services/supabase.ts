
import { createClient } from '@supabase/supabase-js';
import { ChecklistItem, ChecklistType, Checklist, ActionPlan } from '@/types';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Checklist services
export const checklistService = {
  // Create a new checklist
  async createChecklist(checklist: Omit<Checklist, 'id'>): Promise<Checklist | null> {
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
  },

  // Get checklists by store ID
  async getChecklistsByStore(storeId: string): Promise<Checklist[]> {
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
  },

  // Get checklists by date
  async getChecklistsByDate(date: string): Promise<Checklist[]> {
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
  },

  // Get checklists by type
  async getChecklistsByType(type: ChecklistType): Promise<Checklist[]> {
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
  },

  // Update a checklist item
  async updateChecklistItem(
    itemId: string,
    status: "sim" | "nao",
    justification?: string,
    photoUrl?: string
  ): Promise<boolean> {
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
  },

  // Save a completed checklist
  async saveChecklist(checklistId: string): Promise<boolean> {
    const { error } = await supabase
      .from('checklists')
      .update({ completed: true })
      .eq('id', checklistId);
    
    if (error) {
      console.error('Error saving checklist:', error);
      return false;
    }
    
    return true;
  }
};

// Action Plan services
export const actionPlanService = {
  // Add a new action plan
  async addActionPlan(actionPlan: Omit<ActionPlan, 'id'>): Promise<ActionPlan | null> {
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
  },

  // Get pending action plans
  async getPendingActionPlans(): Promise<any[]> {
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
  },

  // Review an action plan
  async reviewActionPlan(
    planId: string,
    status: "approved" | "rejected",
    reviewerId: string,
    reviewerName: string,
    comment?: string
  ): Promise<boolean> {
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
  }
};

// Storage service for image uploads
export const storageService = {
  // Upload an image for a checklist item
  async uploadImage(file: File, checklistId: string, itemId: string): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${checklistId}/${itemId}-${Date.now()}.${fileExt}`;
    const filePath = `checklist-images/${fileName}`;
    
    const { error } = await supabase.storage
      .from('checklist-files')
      .upload(filePath, file);
      
    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }
    
    const { data } = supabase.storage
      .from('checklist-files')
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  }
};

// Create necessary tables if they don't exist
export const setupDatabase = async () => {
  // This function would typically run server-side or in a migration
  // For this example, we'll assume the tables are created through the Supabase dashboard
  console.log('Database setup would happen here in a real application');
};

// Initialize Supabase
export const initSupabase = async () => {
  // Check if user is authenticated
  const { data } = await supabase.auth.getSession();
  
  if (!data.session) {
    console.log('User not authenticated');
  } else {
    console.log('User authenticated:', data.session.user.id);
  }
  
  // Setup database if needed
  await setupDatabase();
};
