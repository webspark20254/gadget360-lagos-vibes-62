
-- 1) Roles infrastructure
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 2) PRODUCTS: lock down writes to admins
DROP POLICY IF EXISTS "Anyone can insert products" ON public.products;
DROP POLICY IF EXISTS "Anyone can update products" ON public.products;
DROP POLICY IF EXISTS "Anyone can delete products" ON public.products;

CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3) ORDERS: add WITH CHECK and restrict updatable fields via trigger
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;

CREATE POLICY "Users can update their own orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.prevent_sensitive_order_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow admins to change anything
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  -- Lock down sensitive fields for regular users
  IF NEW.status IS DISTINCT FROM OLD.status
     OR NEW.total_amount IS DISTINCT FROM OLD.total_amount
     OR NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.customer_email IS DISTINCT FROM OLD.customer_email THEN
    RAISE EXCEPTION 'Not allowed to modify protected order fields';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_protect_sensitive_fields ON public.orders;
CREATE TRIGGER orders_protect_sensitive_fields
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.prevent_sensitive_order_changes();

-- 4) CHAT_SESSIONS: restrict reads/updates to owners; allow inserts (anon ok)
DROP POLICY IF EXISTS "Anyone can view chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Anyone can update chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Anyone can create chat sessions" ON public.chat_sessions;

CREATE POLICY "Users can view their own chat sessions"
  ON public.chat_sessions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions"
  ON public.chat_sessions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can create a chat session"
  ON public.chat_sessions FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- 5) CHAT_MESSAGES: restrict reads to session owner; restrict inserts
DROP POLICY IF EXISTS "Anyone can view chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can insert chat messages" ON public.chat_messages;

CREATE POLICY "Owners can view their chat messages"
  ON public.chat_messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions s
      WHERE s.id = chat_messages.session_id
        AND s.user_id = auth.uid()
    )
  );

-- Inserts handled server-side via edge function (service_role); block client inserts
-- (no INSERT policy means no client can insert)

-- 6) PROFILES: restrict public read; only owner or authenticated users can read
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (true);

-- 7) Harden SECURITY DEFINER trigger functions: remove public EXECUTE
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
