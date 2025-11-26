-- Enable RLS on numeros table
ALTER TABLE public.numeros ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can read numeros" ON public.numeros;
DROP POLICY IF EXISTS "Authenticated users can insert numeros" ON public.numeros;
DROP POLICY IF EXISTS "Authenticated users can update numeros" ON public.numeros;
DROP POLICY IF EXISTS "Authenticated users can delete numeros" ON public.numeros;
DROP POLICY IF EXISTS "Permitir leitura pública numeros" ON public.numeros;

-- Create policy for authenticated users to read
CREATE POLICY "Authenticated users can read numeros"
  ON public.numeros
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create policy for authenticated users to insert
CREATE POLICY "Authenticated users can insert numeros"
  ON public.numeros
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy for authenticated users to update
CREATE POLICY "Authenticated users can update numeros"
  ON public.numeros
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Create policy for authenticated users to delete
CREATE POLICY "Authenticated users can delete numeros"
  ON public.numeros
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Optional: If you want to allow public read access (for development/testing)
-- Uncomment the following policy and comment out the authenticated read policy above
-- CREATE POLICY "Permitir leitura pública numeros"
--   ON public.numeros
--   FOR SELECT
--   USING (true);

