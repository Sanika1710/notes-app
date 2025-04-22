'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { getNotes, deleteNote } from '@/lib/api';
import { NoteCard } from '@/components/note/note-card';
import { NoteForm } from '@/components/note/note-form';
import { NoteDetail } from '@/components/note/note-detail';
import { UserNav } from '@/components/layout/user-nav';
import { Note } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { Plus, ArrowLeft } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/');
      }
    };
    checkAuth();
  }, [router]);

  // Set up auth listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_OUT') {
          router.push('/');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Fetch notes using React Query
  const { 
    data: notes, 
    isLoading, 
    isError,
    error 
  } = useQuery({
    queryKey: ['notes'],
    queryFn: getNotes,
  });

  // Delete note mutation
  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success("Your note has been successfully deleted");
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(`Failed to delete note: ${error.message}`);
      } else {
        toast.error("Failed to delete note");
      }
    },
  });

  const handleDeleteNote = (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsCreating(false);
  };

  const handleViewNote = (note: Note) => {
    setViewingNote(note);
    setIsViewOpen(true);
  };

  const handleSaveComplete = () => {
    setIsCreating(false);
    setEditingNote(null);
    // Refresh the notes list
    queryClient.invalidateQueries({ queryKey: ['notes'] });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingNote(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Notes</h2>
        <p className="text-gray-600 mb-6">{(error as Error).message || "Something went wrong"}</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['notes'] })}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Notes App</h1>
          <UserNav />
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isCreating || editingNote ? (
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={handleCancel} 
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Notes
            </Button>
            <NoteForm 
              note={editingNote || undefined} 
              onSave={handleSaveComplete} 
              onCancel={handleCancel} 
            />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">My Notes</h2>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" /> New Note
              </Button>
            </div>
            
            {notes && notes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note) => (
                  <NoteCard 
                    key={note.id} 
                    note={note} 
                    onEdit={handleEditNote} 
                    onDelete={handleDeleteNote}
                    onViewDetails={handleViewNote}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
                <p className="text-gray-500 mb-6">Create your first note to get started</p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Create Note
                </Button>
              </div>
            )}
          </>
        )}
        
        <NoteDetail 
          note={viewingNote} 
          isOpen={isViewOpen} 
          onClose={() => setIsViewOpen(false)}
          onEdit={handleEditNote}
        />
      </main>
    </div>
  );
}
