import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, MessageSquare, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import type { Task, Profile } from "@/lib/tasks-types";
import { PRIORITY_COLORS, PRIORITY_LABELS, initials } from "@/lib/tasks-types";

interface Props {
  task: Task;
  assignee?: Profile;
  commentCount?: number;
  attachmentCount?: number;
  onClick: () => void;
  disabled?: boolean;
}

export function TaskCard({ task, assignee, commentCount = 0, attachmentCount = 0, onClick, disabled }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id, disabled,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(disabled ? {} : listeners)}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="cursor-pointer rounded-xl border border-border/60 bg-card p-3 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-medium text-foreground line-clamp-2">{task.title}</div>
        <Badge variant="outline" className={`shrink-0 text-[10px] ${PRIORITY_COLORS[task.priority]}`}>
          {PRIORITY_LABELS[task.priority]}
        </Badge>
      </div>
      {task.task_type && (
        <div className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">{task.task_type}</div>
      )}
      <div className="mt-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {task.due_date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />{format(new Date(task.due_date), "d MMM", { locale: ru })}
            </span>
          )}
          {commentCount > 0 && (
            <span className="flex items-center gap-0.5"><MessageSquare className="h-3 w-3" />{commentCount}</span>
          )}
          {attachmentCount > 0 && (
            <span className="flex items-center gap-0.5"><Paperclip className="h-3 w-3" />{attachmentCount}</span>
          )}
        </div>
        {assignee && (
          <Avatar className="h-6 w-6" title={assignee.full_name || assignee.email || ""}>
            <AvatarFallback className="bg-accent text-accent-foreground text-[9px]">
              {initials(assignee.full_name, assignee.email)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
}