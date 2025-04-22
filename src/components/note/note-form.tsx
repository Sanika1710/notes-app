import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Note } from '@/lib/types';
import { updateNote, createNote, summarizeText } from '@/lib/api';
import { toast } from "sonner"; // ✅ Updated
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface NoteFormProps {
    note?: Note;
    onSave: () => void;
    onCancel: () => void;
}

export function NoteForm({ note, onSave, onCancel }: NoteFormProps) {
    const [title, setTitle] = useState(note?.title || '');
    const [content, setContent] = useState(note?.content || '');
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setContent(note.content);
        }
    }, [note]);

    const handleSummary = async () => {
        if (content.trim().length < 50) {
            toast.error("Please add more content to generate a summary");
            return;
        }

        setIsSummarizing(true);
        try {
            const summary = await summarizeText(content);
            toast.success("Summary is generated and will be added to your note automatically.");
            return summary;
        } catch {
            toast.error("Failed to generate summary. Please try again later");
            return null;
        } finally {
            setIsSummarizing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            toast.error("Please fill in both title and content");
            return;
        }

        setIsSaving(true);
        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) throw new Error("Not authenticated");

            let summary = note?.summary;

            if (content !== note?.content) {
                summary = (await handleSummary()) || undefined;
            }

            if (note?.id) {
                await updateNote(note.id, { title, content, summary });
                toast.success("Note updated successfully");
            } else {
                await createNote({ title, content, user_id: userData.user.id, summary });
                toast.success("Note created successfully");
            }

            onSave();
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message || "Failed to save note");
            } else {
                toast.error("An unknown error occurred.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="w-full">
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>{note?.id ? 'Edit Note' : 'Create New Note'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-medium">Title</label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Note title"
                            disabled={isSaving}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="content" className="text-sm font-medium">Content</label>
                        <Textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your note here..."
                            className="min-h-[200px] resize-y"
                            disabled={isSaving}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between mt-4">
                    <Button variant="outline" onClick={onCancel} disabled={isSaving}>
                        Cancel
                    </Button>
                    <div className="flex space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleSummary}
                            disabled={isSaving || isSummarizing || content.length < 50}
                        >
                            {isSummarizing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Summarizing...
                                </>
                            ) : "Generate Summary"}
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : note?.id ? "Update Note" : "Save Note"}
                        </Button>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
