import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { toast } from "@/components/ui/use-toast";
import { Checklist, ActionPlan } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Auth service
export const authService = {
  // Login with email and password
  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Get user profile data
      const { data: profileData, error: profileError } = await supabase
        .from('colaboradores')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        // Check if maybe an admin
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (adminError) throw profileError;
        
        return {
          ...data.user,
          ...adminData,
          role: "admin"
        };
      }

      return {
        ...data.user,
        ...profileData,
        role: "collaborator"
      };
    } catch (error: any) {
      console.error("Login error:", error.message);
      return null;
    }
  },

  // Register a new user
  register: async (name: string, email: string, password: string, unidade: string) => {
    try {
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            unidade
          }
        }
      });

      if (error) throw error;

      if (!data.user) throw new Error("User registration failed");

      return data.user;
    } catch (error: any) {
      console.error("Registration error:", error.message);
      return null;
    }
  },

  // Logout
  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  // Get current session
  getCurrentUser: async () => {
    try {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) return null;

      // Get user profile data - first try collaborador
      const { data: profileData, error: profileError } = await supabase
        .from('colaboradores')
        .select('*')
        .eq('id', data.session.user.id)
        .single();

      if (!profileError) {
        return {
          ...data.session.user,
          ...profileData,
          role: "collaborator"
        };
      }

      // If not collaborador, try admin
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('id', data.session.user.id)
        .single();
        
      if (!adminError) {
        return {
          ...data.session.user,
          ...adminData,
          role: "admin"
        };
      }

      return null;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  }
};

// Checklist service
export const checklistService = {
  // Create a new checklist
  createChecklist: async (checklist: Checklist) => {
    try {
      // Insert the checklist
      const { data, error } = await supabase
        .from('checklists')
        .insert([
          {
            id: checklist.id,
            type: checklist.type,
            date: checklist.date,
            storeId: checklist.storeId,
            userId: checklist.userId,
            userName: checklist.userName,
            completed: checklist.completed,
            period: checklist.period
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Insert checklist items
      const itemsToInsert = checklist.items.map(item => ({
        id: item.id,
        checklistId: checklist.id,
        description: item.description,
        status: item.status,
        justification: item.justification,
        photoUrl: item.photoUrl,
        timestamp: item.timestamp,
        recurrenceCount: item.recurrenceCount || 0
      }));

      const { error: itemsError } = await supabase
        .from('checklist_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      return {
        ...data,
        items: checklist.items
      };
    } catch (error) {
      console.error("Create checklist error:", error);
      return null;
    }
  },

  // Save a completed checklist
  saveChecklist: async (checklistId: string) => {
    try {
      const { error } = await supabase
        .from('checklists')
        .update({ completed: true })
        .eq('id', checklistId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Save checklist error:", error);
      return false;
    }
  },

  // Get checklists by store
  getChecklistsByStore: async (storeId: string) => {
    try {
      // Get checklists for the store
      const { data: checklists, error } = await supabase
        .from('checklists')
        .select('*')
        .eq('storeId', storeId);

      if (error) throw error;
      if (!checklists || checklists.length === 0) return [];

      // Get all items for these checklists
      const checklistIds = checklists.map(c => c.id);
      const { data: items, error: itemsError } = await supabase
        .from('checklist_items')
        .select('*')
        .in('checklistId', checklistIds);

      if (itemsError) throw itemsError;

      // Combine checklists with their items
      return checklists.map(checklist => {
        const checklistItems = items?.filter(item => item.checklistId === checklist.id) || [];
        return {
          ...checklist,
          items: checklistItems
        };
      });
    } catch (error) {
      console.error("Get checklists by store error:", error);
      return [];
    }
  },

  // Get checklists by date
  getChecklistsByDate: async (date: string) => {
    try {
      // Get checklists for the date
      const { data: checklists, error } = await supabase
        .from('checklists')
        .select('*')
        .eq('date', date);

      if (error) throw error;
      if (!checklists || checklists.length === 0) return [];

      // Get all items for these checklists
      const checklistIds = checklists.map(c => c.id);
      const { data: items, error: itemsError } = await supabase
        .from('checklist_items')
        .select('*')
        .in('checklistId', checklistIds);

      if (itemsError) throw itemsError;

      // Combine checklists with their items
      return checklists.map(checklist => {
        const checklistItems = items?.filter(item => item.checklistId === checklist.id) || [];
        return {
          ...checklist,
          items: checklistItems
        };
      });
    } catch (error) {
      console.error("Get checklists by date error:", error);
      return [];
    }
  },

  // Get checklists by type
  getChecklistsByType: async (type: string) => {
    try {
      // Get checklists for the type
      const { data: checklists, error } = await supabase
        .from('checklists')
        .select('*')
        .eq('type', type);

      if (error) throw error;
      if (!checklists || checklists.length === 0) return [];

      // Get all items for these checklists
      const checklistIds = checklists.map(c => c.id);
      const { data: items, error: itemsError } = await supabase
        .from('checklist_items')
        .select('*')
        .in('checklistId', checklistIds);

      if (itemsError) throw itemsError;

      // Combine checklists with their items
      return checklists.map(checklist => {
        const checklistItems = items?.filter(item => item.checklistId === checklist.id) || [];
        return {
          ...checklist,
          items: checklistItems
        };
      });
    } catch (error) {
      console.error("Get checklists by type error:", error);
      return [];
    }
  },

  // Update checklist item
  updateChecklistItem: async (itemId: string, status: "sim" | "nao", justification?: string, photoUrl?: string) => {
    try {
      const updateData: any = {
        status,
        timestamp: new Date().toISOString()
      };

      if (status === "nao" && justification) {
        updateData.justification = justification;
      }

      if (status === "sim" && photoUrl) {
        updateData.photoUrl = photoUrl;
      }

      const { error } = await supabase
        .from('checklist_items')
        .update(updateData)
        .eq('id', itemId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Update checklist item error:", error);
      return false;
    }
  },
};

// Action Plan service
export const actionPlanService = {
  // Add action plan
  addActionPlan: async (actionPlan: Omit<ActionPlan, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('action_plans')
        .insert([actionPlan])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Add action plan error:", error);
      return null;
    }
  },

  // Get pending action plans
  getPendingActionPlans: async () => {
    try {
      // Get pending action plans
      const { data, error } = await supabase
        .from('action_plans')
        .select(`
          *,
          checklist_items(
            id, 
            description, 
            checklistId
          ),
          checklists:checklist_items(
            checklistId, 
            checklists(
              id, 
              type, 
              storeId
            )
          )
        `)
        .eq('status', 'pending');

      if (error) throw error;
      if (!data) return [];

      // Get store names
      const storeIds = data.map(plan => plan.checklists?.checklists?.storeId).filter(Boolean);
      const { data: stores, error: storesError } = await supabase
        .from('stores')
        .select('id, name')
        .in('id', storeIds);

      if (storesError) throw storesError;

      // Format the data
      return data.map(plan => {
        const checklistType = plan.checklists?.checklists?.type;
        const storeId = plan.checklists?.checklists?.storeId;
        const store = stores?.find(s => s.id === storeId);
        const createdAt = new Date(plan.createdAt);
        const now = new Date();
        const daysPending = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

        return {
          id: plan.id,
          description: plan.description,
          createdAt: plan.createdAt,
          daysPending,
          storeId,
          storeName: store?.name || "Loja Desconhecida",
          checklistType,
          itemDescription: plan.checklist_items?.description
        };
      });
    } catch (error) {
      console.error("Get pending action plans error:", error);
      return [];
    }
  },

  // Review action plan
  reviewActionPlan: async (
    planId: string,
    status: "approved" | "rejected",
    reviewerId: string,
    reviewerName: string,
    comment?: string
  ) => {
    try {
      const { error } = await supabase
        .from('action_plans')
        .update({
          status,
          updatedAt: new Date().toISOString(),
          reviewerId,
          reviewerName,
          reviewComment: comment
        })
        .eq('id', planId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Review action plan error:", error);
      return false;
    }
  },
};

// Storage service
export const storageService = {
  // Upload image
  uploadImage: async (file: File, checklistId: string, itemId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${checklistId}/${itemId}-${Date.now()}.${fileExt}`;
      const filePath = `checklist-photos/${fileName}`;

      const { error } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Upload image error:", error);
      return null;
    }
  },

  // Delete image
  deleteImage: async (filePath: string) => {
    try {
      const { error } = await supabase.storage
        .from('images')
        .remove([filePath]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Delete image error:", error);
      return false;
    }
  }
};
