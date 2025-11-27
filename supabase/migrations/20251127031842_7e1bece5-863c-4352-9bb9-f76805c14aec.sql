-- Update RLS policy to allow bendahara to manage assets
DROP POLICY IF EXISTS "Admins can manage assets" ON public.assets;

CREATE POLICY "Admins and Bendahara can manage assets"
ON public.assets
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'bendahara'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'bendahara'::app_role));