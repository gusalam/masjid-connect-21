-- Allow public to view financial transactions for transparency
CREATE POLICY "Everyone can view financial transactions"
ON public.financial_transactions
FOR SELECT
TO public
USING (true);