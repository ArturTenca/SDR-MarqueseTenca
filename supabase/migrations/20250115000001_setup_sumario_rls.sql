-- Enable RLS on sumario table
ALTER TABLE public.sumario ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can read sumario" ON public.sumario;
DROP POLICY IF EXISTS "Authenticated users can insert sumario" ON public.sumario;
DROP POLICY IF EXISTS "Authenticated users can update sumario" ON public.sumario;
DROP POLICY IF EXISTS "Permitir leitura pública sumario" ON public.sumario;

-- Create policy for authenticated users to read
CREATE POLICY "Authenticated users can read sumario"
  ON public.sumario
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create policy for authenticated users to insert
CREATE POLICY "Authenticated users can insert sumario"
  ON public.sumario
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy for authenticated users to update
CREATE POLICY "Authenticated users can update sumario"
  ON public.sumario
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Optional: If you want to allow public read access (for development/testing)
-- Uncomment the following policy and comment out the authenticated read policy above
-- CREATE POLICY "Permitir leitura pública sumario"
--   ON public.sumario
--   FOR SELECT
--   USING (true);




