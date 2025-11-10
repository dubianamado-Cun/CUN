export interface Ticket {
  [key: string]: any; // To allow dynamic access for various columns from uploaded file
  
  // Known properties with specific types for analysis
  id?: number | string;
  asunto?: string;
  creation_time: Date;
  modification_time: Date;
  status?: string;
  category?: string;
  sub_category?: string;
  is_first_call_resolution?: boolean;
  reassignments?: number;
  sentiment?: 'positive' | 'negative' | 'neutral' | string;
  year?: number;
  creation_month_name?: string;
  ticket_owner_name?: string;
  regional_sede?: string;
  programa?: string;
  ultimo_agente?: string;
  vencido?: string;
}