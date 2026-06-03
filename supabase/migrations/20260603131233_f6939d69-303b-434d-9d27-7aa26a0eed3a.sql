DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;

CREATE POLICY "Authenticated users can insert their own orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);