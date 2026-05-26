
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'viewer');
CREATE TYPE public.employee_position AS ENUM ('marketolog', 'product_manager', 'smm_manager', 'designer');
CREATE TYPE public.task_status AS ENUM ('todo', 'in_progress', 'review', 'done');
CREATE TYPE public.task_priority AS ENUM ('low', 'med', 'high');

-- ============ UPDATED_AT HELPER ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  position public.employee_position,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ USER_ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============ has_role (security definer) ============
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- ============ handle_new_user trigger ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email) VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;
  IF NEW.email = 'dgolub@lamatorf.ru' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
      ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'viewer')
      ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Bootstrap: создать профили для уже существующих пользователей + назначить роли
INSERT INTO public.profiles (id, email)
  SELECT id, email FROM auth.users
  ON CONFLICT (id) DO NOTHING;
INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'admin'::public.app_role FROM auth.users WHERE email = 'dgolub@lamatorf.ru'
  ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'viewer'::public.app_role FROM auth.users
  WHERE email IS DISTINCT FROM 'dgolub@lamatorf.ru'
    AND id NOT IN (SELECT user_id FROM public.user_roles)
  ON CONFLICT DO NOTHING;

-- ============ RLS: profiles ============
CREATE POLICY "Авторизованные видят профили" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Свой профиль или admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin может создавать профили" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin удаляет профили" ON public.profiles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ RLS: user_roles ============
CREATE POLICY "Авторизованные видят роли" ON public.user_roles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin назначает роли" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin меняет роли" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin снимает роли" ON public.user_roles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ TASKS ============
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status public.task_status NOT NULL DEFAULT 'todo',
  priority public.task_priority NOT NULL DEFAULT 'med',
  task_type TEXT,
  due_date DATE,
  position INTEGER NOT NULL DEFAULT 0,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
CREATE TRIGGER trg_tasks_updated BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_assignee ON public.tasks(assignee_id);

CREATE POLICY "Авторизованные видят задачи" ON public.tasks
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/editor создают задачи" ON public.tasks
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "Admin/editor меняют задачи" ON public.tasks
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "Admin/editor удаляют задачи" ON public.tasks
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));

-- ============ TASK_COMMENTS ============
CREATE TABLE public.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments REPLICA IDENTITY FULL;
CREATE INDEX idx_task_comments_task ON public.task_comments(task_id);

CREATE POLICY "Авторизованные видят комменты" ON public.task_comments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/editor пишут комменты" ON public.task_comments
  FOR INSERT TO authenticated
  WITH CHECK (
    (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'))
    AND user_id = auth.uid()
  );
CREATE POLICY "Свой коммент или admin удаляет" ON public.task_comments
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- ============ TASK_ATTACHMENTS ============
CREATE TABLE public.task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments REPLICA IDENTITY FULL;
CREATE INDEX idx_task_attachments_task ON public.task_attachments(task_id);

CREATE POLICY "Авторизованные видят вложения" ON public.task_attachments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/editor добавляют вложения" ON public.task_attachments
  FOR INSERT TO authenticated
  WITH CHECK (
    (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'))
    AND uploaded_by = auth.uid()
  );
CREATE POLICY "Admin/editor удаляют вложения" ON public.task_attachments
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));

-- ============ REALTIME ============
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_attachments;

-- ============ STORAGE ============
INSERT INTO storage.buckets (id, name, public) VALUES ('task-attachments', 'task-attachments', false)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Авторизованные читают вложения задач" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'task-attachments');
CREATE POLICY "Admin/editor загружают вложения задач" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'task-attachments'
    AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'))
  );
CREATE POLICY "Admin/editor удаляют вложения задач" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'task-attachments'
    AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'))
  );
