// src/lib/types.ts
export interface Note {
    id: string;
    user_id: string;
    title: string;
    content: string;
    summary?: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface User {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  }
  