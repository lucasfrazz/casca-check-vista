
import { Checklist, ChecklistType, PendingActionPlan } from "@/types";

export interface ChecklistContextType {
  checklists: Checklist[];
  createChecklist: (type: ChecklistType, storeId: string) => Promise<Checklist | null>;
  saveChecklist: (checklist: Checklist) => Promise<void>;
  getChecklistsByStore: (storeId: string) => Promise<Checklist[]>;
  getChecklistsByDate: (date: string) => Promise<Checklist[]>;
  getChecklistsByType: (type: ChecklistType) => Promise<Checklist[]>;
  updateChecklistItem: (
    checklistId: string,
    itemId: string,
    status: "sim" | "nao",
    justification?: string,
    photoUrl?: string
  ) => Promise<void>;
  addActionPlan: (
    checklistId: string,
    itemId: string,
    description: string
  ) => Promise<void>;
  getPendingActionPlans: () => Promise<PendingActionPlan[]>;
  reviewActionPlan: (
    planId: string,
    checklistId: string,
    itemId: string,
    status: "approved" | "rejected",
    comment?: string
  ) => Promise<void>;
  uploadImage: (file: File, checklistId: string, itemId: string) => Promise<string | null>;
  loading: boolean;
}

export interface ChecklistActionProps {
  checklists: Checklist[];
  setChecklists: React.Dispatch<React.SetStateAction<Checklist[]>>;
  pendingPlans: PendingActionPlan[];
  setPendingPlans: React.Dispatch<React.SetStateAction<PendingActionPlan[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  user: any;
}
