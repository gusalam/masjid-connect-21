-- Create donasi table for homepage display
CREATE TABLE public.donasi (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_donatur TEXT NOT NULL,
  nominal NUMERIC NOT NULL,
  tanggal_donasi DATE NOT NULL DEFAULT CURRENT_DATE,
  status_tampil BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.donasi ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view displayed donations
CREATE POLICY "Everyone can view displayed donations"
ON public.donasi
FOR SELECT
USING (status_tampil = true);

-- Policy: Admins and Bendahara can manage all donations
CREATE POLICY "Admins and Bendahara can manage donations"
ON public.donasi
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'bendahara'::app_role));

-- Add realtime support
ALTER PUBLICATION supabase_realtime ADD TABLE public.donasi;

-- Trigger for updated_at
CREATE TRIGGER update_donasi_updated_at
  BEFORE UPDATE ON public.donasi
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();