-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Policy: Users can read their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Update followup table RLS policies
DROP POLICY IF EXISTS "Permitir leitura pública temporária" ON public.followup;
CREATE POLICY "Admins can view all followup data"
ON public.followup
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update chats table RLS policies
DROP POLICY IF EXISTS "Permitir leitura pública temporária" ON public.chats;
CREATE POLICY "Admins can view all chats"
ON public.chats
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update chats_new table RLS policies
DROP POLICY IF EXISTS "Permitir leitura pública temporária" ON public.chats_new;
CREATE POLICY "Admins can view all chats_new"
ON public.chats_new
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update n8n_chat_histories RLS policies
DROP POLICY IF EXISTS "Bloquear acesso temporariamente" ON public.n8n_chat_histories;
CREATE POLICY "Admins can view chat histories"
ON public.n8n_chat_histories
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update documents RLS policies
DROP POLICY IF EXISTS "Bloquear acesso temporariamente" ON public.documents;
CREATE POLICY "Admins can view documents"
ON public.documents
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to auto-assign admin role to first user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only assign admin role if email is admin (você precisará criar o usuário admin manualmente)
  IF NEW.email = 'admin@mt.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to handle new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();