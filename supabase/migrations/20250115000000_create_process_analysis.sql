-- Create process_analysis table for document summarization
CREATE TABLE IF NOT EXISTS public.process_analysis (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  titulo TEXT,
  resumo TEXT,
  ponto_chave_1 TEXT,
  ponto_chave_2 TEXT,
  ponto_chave_3 TEXT,
  ponto_chave_4 TEXT,
  ponto_chave_5 TEXT,
  documento_original TEXT,
  status TEXT DEFAULT 'processado'
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_process_analysis_created_at ON public.process_analysis(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_process_analysis_status ON public.process_analysis(status);

-- Enable RLS
ALTER TABLE public.process_analysis ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read
CREATE POLICY "Authenticated users can read process analysis"
  ON public.process_analysis
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create policy for authenticated users to insert
CREATE POLICY "Authenticated users can insert process analysis"
  ON public.process_analysis
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy for authenticated users to update
CREATE POLICY "Authenticated users can update process analysis"
  ON public.process_analysis
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_process_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_process_analysis_updated_at
  BEFORE UPDATE ON public.process_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_process_analysis_updated_at();

-- Add comment to table
COMMENT ON TABLE public.process_analysis IS 'Tabela para armazenar análises e sumários de processos/documentos gerados por automação';




