export type ProjectStatus = 
  | 'analysis' 
  | 'estimation' 
  | 'proposal' 
  | 'negotiation' 
  | 'won' 
  | 'lost' 
  | 'in_progress' 
  | 'completed' 
  | 'abandoned';

export type ProjectType = 'commercial' | 'internal';

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  startDate: Date;
  endDate?: Date;
  description: string;
  billable: boolean;
  type: ProjectType;
}

export interface Developer {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  position: string;
  technicalSkills: string[];
}

export interface Assignment {
  id: string;
  developerId: string;
  projectId: string;
  timeAllocation: number; // Percentage (0-100)
  startDate: Date;
  endDate?: Date;
  isIndefinite: boolean;
} 