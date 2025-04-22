import axios from 'axios';
import { supabase } from './supabase';
import { Note } from './types';

// Notes API
export const getNotes = async (): Promise<Note[]> => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const getNoteById = async (id: string): Promise<Note> => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createNote = async (note: Partial<Note>): Promise<Note> => {
  const { data, error } = await supabase
    .from('notes')
    .insert([note])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateNote = async (id: string, note: Partial<Note>): Promise<Note> => {
  const { data, error } = await supabase
    .from('notes')
    .update({ ...note, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteNote = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const summarizeText = async (text: string): Promise<string> => {
  try {
    const response = await axios.post('/api/summarize', { text });
    return response.data.summary;
  } catch (error) {
    console.error('Error summarizing text:', error);
    throw new Error('Failed to summarize text');
  }
};