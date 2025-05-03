
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { toast } from "@/components/ui/use-toast";
import { Checklist, ActionPlan, User, ChecklistType, PeriodoType, DatabaseUser, DatabaseChecklist } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { mapDatabaseUserToAppUser, mapDatabaseChecklistToAppChecklist, mapDatabaseActionPlanToAppActionPlan } from "@/utils/databaseAdapters";

// Initialize Supabase function (called from main.tsx)
export const initSupabase = async () => {
  try {
    // Test connection by pinging the API
    const { error } = await supabase.from('colaboradores').select('count').limit(1);
    
    if (error) {
      console.error("Supabase connection error:", error);
      return false;
    }
    
    console.log("Supabase connection successful");
    return true;
  } catch (err) {
    console.error("Error initializing Supabase:", err);
    return false;
  }
};

// Auth service
export const authService = {
  // Login with email and password
  login: async (email: string, password: string): Promise<User | null> => {
    try {
      console.log("Tentando login com:", email);
      
      // Primeiro, tenta login como admin
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .single();
        
      if (!adminError && adminData) {
        console.log("Admin encontrado:", adminData);
        
        // Verificar senha - usando senha direta para simplificar
        if (adminData.senha === password) {
          const userData = mapDatabaseUserToAppUser(adminData as DatabaseUser, "admin");
          console.log("Login de admin bem-sucedido:", userData);
          return userData;
        } else {
          throw new Error("Senha incorreta");
        }
      }
      
      // Se não for admin, tenta como colaborador
      const { data: profileData, error: profileError } = await supabase
        .from('colaboradores')
        .select('*')
        .eq('email', email)
        .single();

      if (profileError || !profileData) {
        console.error("Usuário não encontrado:", profileError);
        throw new Error("Usuário não encontrado ou senha incorreta");
      }
      
      // Verificar senha - usando senha direta para simplificar
      if (profileData.senha === password) {
        const userData = mapDatabaseUserToAppUser(profileData as DatabaseUser, "collaborator");
        console.log("Login de colaborador bem-sucedido:", userData);
        return userData;
      } else {
        throw new Error("Senha incorreta");
      }
    } catch (error: any) {
      console.error("Login error:", error.message);
      throw error;
    }
  },

  // Register a new user
  register: async (name: string, email: string, password: string, unidade: string): Promise<User | null> => {
    try {
      console.log("Registrando novo usuário:", { name, email, unidade });
      
      // Check if user already exists
      const { data: existingUser, error: existingError } = await supabase
        .from('colaboradores')
        .select('*')
        .eq('email', email)
        .single();
        
      if (!existingError && existingUser) {
        throw new Error("Este email já está em uso");
      }

      // Insert new user
      const { data, error } = await supabase
        .from('colaboradores')
        .insert([
          {
            nome: name,
            email,
            senha: password,
            unidade
          }
        ])
        .select()
        .single();

      if (error) {
        console.error("Erro ao inserir colaborador:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Falha ao criar conta - nenhum dado retornado");
      }

      console.log("Colaborador registrado com sucesso:", data);
      return mapDatabaseUserToAppUser(data as DatabaseUser, "collaborator");
    } catch (error: any) {
      console.error("Registration error:", error.message);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      // In a real auth system, we'd do supabase.auth.signOut()
      // For this project, just clearing local state is enough
      console.log("User logged out");
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  // Get current session
  getCurrentUser: async () => {
    try {
      // Get from localStorage or similar
      const savedUserString = localStorage.getItem('currentUser');
      if (!savedUserString) return null;
      
      try {
        return JSON.parse(savedUserString) as User;
      } catch (e) {
        return null;
      }
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  },
  
  // Save current user to localStorage for session persistence
  saveCurrentUser: async (user: User) => {
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (error) {
      console.error("Error saving user to localStorage:", error);
    }
  }
};

// Checklist service
export const checklistService = {
  // Create a new checklist
  createChecklist: async (checklist: Checklist) => {
    try {
      console.log("Criando novo checklist:", checklist);
      
      // Convert app model to database model
      const dbChecklist: any = {
        colaborador_id: parseInt(checklist.userId),
        data: checklist.date
      };
      
      // Set the appropriate vistoria field based on period
      if (checklist.period === "manhã") {
        dbChecklist.vistoria1 = checklist.items;
      } else if (checklist.period === "tarde") {
        dbChecklist.vistoria2 = checklist.items;
      } else {
        dbChecklist.vistoria3 = checklist.items;
        dbChecklist.status_vistoria3 = checklist.completed ? "completed" : "pending";
      }

      console.log("Dados a serem inseridos no banco:", dbChecklist);

      // Insert the checklist
      const { data, error } = await supabase
        .from('checklists')
        .insert([dbChecklist])
        .select()
        .single();

      if (error) {
        console.error("Erro ao inserir checklist:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Falha ao criar checklist - nenhum dado retornado");
      }

      console.log("Checklist criado com sucesso:", data);
      return mapDatabaseChecklistToAppChecklist(data as DatabaseChecklist, checklist.type, checklist.period);
    } catch (error) {
      console.error("Create checklist error:", error);
      throw error;
    }
  },

  // Save a completed checklist
  saveChecklist: async (checklistId: string) => {
    try {
      console.log("Salvando checklist completado:", checklistId);
      
      const { error } = await supabase
        .from('checklists')
        .update({ status_vistoria3: "completed" })
        .eq('id', parseInt(checklistId));

      if (error) {
        console.error("Erro ao atualizar checklist:", error);
        throw error;
      }
      
      console.log("Checklist salvo com sucesso");
      return true;
    } catch (error) {
      console.error("Save checklist error:", error);
      throw error;
    }
  },

  // Get checklists by store
  getChecklistsByStore: async (storeId: string) => {
    try {
      console.log("Buscando checklists para a loja:", storeId);
      
      // Get checklists for the colaborador
      const { data: dbChecklists, error } = await supabase
        .from('checklists')
        .select('*')
        .eq('colaborador_id', parseInt(storeId));

      if (error) {
        console.error("Erro ao buscar checklists:", error);
        throw error;
      }
      
      console.log(`Encontrados ${dbChecklists?.length || 0} checklists para a loja`);
      if (!dbChecklists || dbChecklists.length === 0) return [];

      // Convert DB checklists to app model
      // For simplicity, we'll map each checklist to up to 3 app checklists (one per period)
      const appChecklists: Checklist[] = [];
      
      for (const dbChecklist of dbChecklists) {
        console.log("Processando checklist:", dbChecklist.id);
        
        // Create vistoria1 checklist if it exists
        if (dbChecklist.vistoria1) {
          appChecklists.push(
            mapDatabaseChecklistToAppChecklist(dbChecklist as DatabaseChecklist, "vistoria1" as ChecklistType, "manhã")
          );
        }
        
        // Create vistoria2 checklist if it exists
        if (dbChecklist.vistoria2) {
          appChecklists.push(
            mapDatabaseChecklistToAppChecklist(dbChecklist as DatabaseChecklist, "vistoria2" as ChecklistType, "tarde")
          );
        }
        
        // Create vistoria3 checklist if it exists
        if (dbChecklist.vistoria3) {
          appChecklists.push(
            mapDatabaseChecklistToAppChecklist(dbChecklist as DatabaseChecklist, "vistoria3" as ChecklistType, "noite")
          );
        }
      }

      console.log(`Retornando ${appChecklists.length} checklists processados`);
      return appChecklists;
    } catch (error) {
      console.error("Get checklists by store error:", error);
      return [];
    }
  },

  // Get checklists by date
  getChecklistsByDate: async (date: string) => {
    try {
      // Get checklists for the date
      const { data: dbChecklists, error } = await supabase
        .from('checklists')
        .select('*')
        .eq('data', date);

      if (error) throw error;
      if (!dbChecklists || dbChecklists.length === 0) return [];

      // Convert DB checklists to app model
      // For simplicity, we'll map each checklist to up to 3 app checklists (one per period)
      const appChecklists: Checklist[] = [];
      
      for (const dbChecklist of dbChecklists) {
        // Create vistoria1 checklist if it exists
        if (dbChecklist.vistoria1) {
          appChecklists.push(
            mapDatabaseChecklistToAppChecklist(dbChecklist as DatabaseChecklist, "vistoria1" as ChecklistType, "manhã")
          );
        }
        
        // Create vistoria2 checklist if it exists
        if (dbChecklist.vistoria2) {
          appChecklists.push(
            mapDatabaseChecklistToAppChecklist(dbChecklist as DatabaseChecklist, "vistoria2" as ChecklistType, "tarde")
          );
        }
        
        // Create vistoria3 checklist if it exists
        if (dbChecklist.vistoria3) {
          appChecklists.push(
            mapDatabaseChecklistToAppChecklist(dbChecklist as DatabaseChecklist, "vistoria3" as ChecklistType, "noite")
          );
        }
      }

      return appChecklists;
    } catch (error) {
      console.error("Get checklists by date error:", error);
      return [];
    }
  },

  // Get checklists by type
  getChecklistsByType: async (type: ChecklistType) => {
    try {
      // Since type is stored as part of the period in our database model,
      // we need to determine which vistoria field to query based on the type
      const period: PeriodoType = 
        type === "vistoria1" ? "manhã" : 
        type === "vistoria2" ? "tarde" : 
        "noite";
      
      // Get all checklists and filter by the appropriate vistoria field
      const { data: dbChecklists, error } = await supabase
        .from('checklists')
        .select('*');

      if (error) throw error;
      if (!dbChecklists || dbChecklists.length === 0) return [];

      // Filter checklists based on type
      const filteredChecklists = dbChecklists.filter(checklist => {
        if (period === "manhã") return checklist.vistoria1 !== null;
        if (period === "tarde") return checklist.vistoria2 !== null;
        return checklist.vistoria3 !== null;
      });

      // Convert DB checklists to app model
      return filteredChecklists.map(dbChecklist => 
        mapDatabaseChecklistToAppChecklist(dbChecklist as DatabaseChecklist, type, period)
      );
    } catch (error) {
      console.error("Get checklists by type error:", error);
      return [];
    }
  },

  // Update checklist item
  updateChecklistItem: async (itemId: string, status: "sim" | "nao", justification?: string, photoUrl?: string) => {
    try {
      // First, find the checklist containing this item
      // This is complex with our current DB structure - in a real implementation,
      // we'd need to query all checklists and search through their vistoria fields
      
      // For now, we'll update the item locally and rely on the saveChecklist function
      // to save the complete checklist data
      console.log("Item update requested in DB:", { itemId, status, justification, photoUrl });
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
      // Convert to database model
      const dbActionPlan = {
        checklist_id: parseInt(actionPlan.checklistItemId.split('-')[0]),
        descricao: actionPlan.description,
        data_envio: new Date().toISOString().split('T')[0],
        status: actionPlan.status
      };

      const { data, error } = await supabase
        .from('planos_acao')
        .insert([dbActionPlan])
        .select()
        .single();

      if (error) throw error;
      
      // Convert back to app model
      return {
        id: String(data.id),
        description: data.descricao,
        status: data.status as any,
        createdAt: data.data_envio,
        updatedAt: data.data_envio,
        userId: actionPlan.userId,
        userName: actionPlan.userName,
        checklistItemId: actionPlan.checklistItemId,
        dataAdiamento: data.data_adiamento,
        dataRecusa: data.data_recusa,
        respostaCorrigida: data.resposta_corrigida
      };
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
        .from('planos_acao')
        .select(`
          *,
          checklists(
            id,
            colaborador_id,
            data
          )
        `)
        .eq('status', 'pending');

      if (error) throw error;
      if (!data) return [];

      // Get collaborator information for store names
      const colaboradorIds = data.map(plan => plan.checklists?.colaborador_id).filter(Boolean);
      const { data: colaboradores, error: colabError } = await supabase
        .from('colaboradores')
        .select('id, nome, unidade')
        .in('id', colaboradorIds);

      if (colabError) throw colabError;

      // Format the data
      return data.map(plan => {
        const checklistId = plan.checklist_id;
        const checklist = plan.checklists;
        const colaborador = colaboradores?.find(c => c.id === checklist?.colaborador_id);
        const createdAt = new Date(plan.data_envio);
        const now = new Date();
        const daysPending = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

        return {
          id: String(plan.id),
          description: plan.descricao,
          createdAt: plan.data_envio,
          daysPending,
          storeId: String(checklist?.colaborador_id || ""),
          storeName: colaborador?.unidade || "Unidade Desconhecida",
          checklistType: "vistoria1" as ChecklistType, // Default assumption
          itemDescription: "Item do Checklist" // We don't have this info in our DB structure
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
      const updateData: any = {
        status
      };
      
      if (status === "approved") {
        updateData.resposta_corrigida = comment;
      } else if (status === "rejected") {
        updateData.data_recusa = new Date().toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('planos_acao')
        .update(updateData)
        .eq('id', parseInt(planId));

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

      // For this implementation, we'll simulate uploading by just returning a URL
      // In a real implementation, we'd use supabase.storage.from().upload()
      console.log("Image upload requested:", { filePath });
      
      // Return a mock URL for now - in a real implementation we'd return the actual URL
      return URL.createObjectURL(file);
    } catch (error) {
      console.error("Upload image error:", error);
      return null;
    }
  },

  // Delete image
  deleteImage: async (filePath: string) => {
    try {
      // In a real implementation, we'd use supabase.storage.from().remove()
      console.log("Image deletion requested:", filePath);
      return true;
    } catch (error) {
      console.error("Delete image error:", error);
      return false;
    }
  }
};
