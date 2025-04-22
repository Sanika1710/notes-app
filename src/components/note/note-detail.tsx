import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Note } from '@/lib/types';
import { format } from 'date-fns';

interface NoteDetailProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (note: Note) => void;
}

export function NoteDetail({ note, isOpen, onClose, onEdit }: NoteDetailProps) {
  if (!note) return null;
  
  const formattedDate = format(new Date(note.updated_at), 'MMMM dd, yyyy');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{note.title}</DialogTitle>
          <p className="text-sm text-gray-500">{formattedDate}</p>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <div className="prose max-w-none">
            {note.content.split('\n').map((paragraph, i) => (
              <p key={i} className="mb-4">{paragraph}</p>
            ))}
          </div>
          
          {note.summary && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium mb-2">AI Summary</h3>
              <p className="text-sm text-gray-700">{note.summary}</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose} className="mr-2">
            Close
          </Button>
          <Button onClick={() => {
            onClose();
            if (note) onEdit(note);
          }}>
            Edit Note
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}