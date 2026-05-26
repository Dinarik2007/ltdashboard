import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Paperclip, Trash2, Send, FileText, ImageIcon, Pencil } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import type { Task, Profile, TaskComment, TaskAttachment } from "@/lib/tasks-types";
import { PRIORITY_COLORS, PRIORITY_LABELS, STATUS_LABELS, initials } from "@/lib/tasks-types";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  task: Task | null;
  profiles: Profile[];
  onEdit: () => void;
}

export function TaskDetailSheet({ open, onOpenChange, task, profiles, onEdit }: Props) {
  const { userId, canEdit, isAdmin } = useAuth();
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const profById = (id: string | null) => profiles.find((p) => p.id === id);
  const assignee = task ? profById(task.assignee_id) : null;

  useEffect(() => {
    if (!task) return;
    const load = async () => {
      const [c, a] = await Promise.all([
        supabase.from("task_comments").select("*").eq("task_id", task.id).order("created_at"),
        supabase.from("task_attachments").select("*").eq("task_id", task.id).order("created_at"),
      ]);
      setComments(c.data ?? []);
      setAttachments(a.data ?? []);
    };
    load();
    const ch = supabase.channel(`task-${task.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "task_comments", filter: `task_id=eq.${task.id}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "task_attachments", filter: `task_id=eq.${task.id}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [task?.id]);

  const addComment = async () => {
    if (!task || !newComment.trim() || !userId) return;
    setPosting(true);
    const { error } = await supabase.from("task_comments").insert({
      task_id: task.id, user_id: userId, comment: newComment.trim(),
    });
    setPosting(false);
    if (error) toast.error(error.message);
    else { setNewComment(""); toast.success("Комментарий добавлен"); }
  };

  const deleteComment = async (id: string) => {
    const { error } = await supabase.from("task_comments").delete().eq("id", id);
    if (error) toast.error(error.message); else toast.success("Удалено");
  };

  const uploadFile = async (file: File) => {
    if (!task || !userId) return;
    setUploading(true);
    const path = `${task.id}/${Date.now()}-${file.name}`;
    const up = await supabase.storage.from("task-attachments").upload(path, file);
    if (up.error) { setUploading(false); toast.error(up.error.message); return; }
    const { data: signed } = await supabase.storage.from("task-attachments").createSignedUrl(path, 60 * 60 * 24 * 365);
    const url = signed?.signedUrl ?? path;
    const { error } = await supabase.from("task_attachments").insert({
      task_id: task.id, file_url: url, file_name: file.name, uploaded_by: userId,
    });
    setUploading(false);
    if (error) toast.error(error.message); else toast.success("Файл загружен");
  };

  const deleteAttachment = async (a: TaskAttachment) => {
    const { error } = await supabase.from("task_attachments").delete().eq("id", a.id);
    if (error) toast.error(error.message); else toast.success("Вложение удалено");
  };

  const deleteTask = async () => {
    if (!task) return;
    if (!confirm("Удалить задачу безвозвратно?")) return;
    const { error } = await supabase.from("tasks").delete().eq("id", task.id);
    if (error) toast.error(error.message);
    else { toast.success("Задача удалена"); onOpenChange(false); }
  };

  if (!task) return null;

  const isImage = (name: string) => /\.(png|jpe?g|gif|webp|svg)$/i.test(name);

  const timeline = [
    { id: `created-${task.id}`, type: "created" as const, at: task.created_at, who: task.created_by },
    ...comments.map((c) => ({ id: c.id, type: "comment" as const, at: c.created_at, who: c.user_id, comment: c })),
  ].sort((a, b) => a.at.localeCompare(b.at));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-start justify-between gap-2 pr-8">
            <SheetTitle className="text-left">{task.title}</SheetTitle>
            {canEdit && (
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={onEdit} title="Редактировать"><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={deleteTask} title="Удалить"><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            )}
          </div>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={PRIORITY_COLORS[task.priority]}>
              {PRIORITY_LABELS[task.priority]}
            </Badge>
            <Badge variant="outline">{STATUS_LABELS[task.status]}</Badge>
            {task.task_type && <Badge variant="outline">{task.task_type}</Badge>}
            {task.due_date && <Badge variant="outline">до {format(new Date(task.due_date), "d MMM", { locale: ru })}</Badge>}
          </div>

          {task.description && (
            <div className="rounded-lg bg-muted/50 p-3 text-sm whitespace-pre-wrap">{task.description}</div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Исполнитель:</span>
            {assignee ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6"><AvatarFallback className="text-[10px]">{initials(assignee.full_name, assignee.email)}</AvatarFallback></Avatar>
                <span>{assignee.full_name || assignee.email}</span>
              </div>
            ) : <span className="text-muted-foreground">не назначен</span>}
          </div>

          {/* Attachments */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-semibold">Вложения ({attachments.length})</div>
              {canEdit && (
                <Button size="sm" variant="outline" disabled={uploading} onClick={() => fileRef.current?.click()}>
                  {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Paperclip className="h-3 w-3" />}
                  <span className="ml-1.5">Загрузить</span>
                </Button>
              )}
              <input ref={fileRef} type="file" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = "";
              }} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {attachments.map((a) => (
                <div key={a.id} className="group relative rounded-lg border bg-card p-2">
                  {isImage(a.file_name) ? (
                    <a href={a.file_url} target="_blank" rel="noreferrer">
                      <img src={a.file_url} alt={a.file_name} className="h-24 w-full rounded object-cover" />
                    </a>
                  ) : (
                    <a href={a.file_url} target="_blank" rel="noreferrer" className="flex h-24 flex-col items-center justify-center gap-1 rounded bg-muted/30 text-xs">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                      <span className="line-clamp-1 px-1">{a.file_name}</span>
                    </a>
                  )}
                  <div className="mt-1 flex items-center justify-between">
                    <span className="line-clamp-1 text-[10px] text-muted-foreground">{a.file_name}</span>
                    {canEdit && (
                      <button onClick={() => deleteAttachment(a)} className="opacity-0 transition group-hover:opacity-100">
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {attachments.length === 0 && (
                <div className="col-span-2 rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                  <ImageIcon className="mx-auto mb-1 h-4 w-4" />Файлы не прикреплены
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <div className="mb-2 text-sm font-semibold">История</div>
            <div className="space-y-3">
              {timeline.map((item) => {
                const who = profById(item.who);
                return (
                  <div key={item.id} className="flex gap-2.5">
                    <Avatar className="h-7 w-7"><AvatarFallback className="text-[10px]">{initials(who?.full_name, who?.email)}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2 text-xs">
                        <span className="font-medium">{who?.full_name || who?.email || "—"}</span>
                        <span className="text-muted-foreground">{format(new Date(item.at), "d MMM, HH:mm", { locale: ru })}</span>
                      </div>
                      {item.type === "created" ? (
                        <div className="text-xs text-muted-foreground">создал(а) задачу</div>
                      ) : (
                        <div className="group flex items-start gap-1">
                          <div className="flex-1 whitespace-pre-wrap rounded-lg bg-muted/50 p-2 text-sm">{item.comment.comment}</div>
                          {(isAdmin || item.who === userId) && (
                            <button onClick={() => deleteComment(item.id)} className="opacity-0 transition group-hover:opacity-100">
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {canEdit && (
            <div className="space-y-2 border-t pt-3">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Написать комментарий…"
                rows={2}
                maxLength={1000}
              />
              <Button size="sm" onClick={addComment} disabled={posting || !newComment.trim()} className="gradient-leaf text-white">
                {posting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                <span className="ml-1.5">Отправить</span>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}