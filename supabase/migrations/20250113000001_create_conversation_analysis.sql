-- Create conversation_analysis table
CREATE TABLE IF NOT EXISTS conversation_analysis (
  id SERIAL PRIMARY KEY,
  remotejID TEXT NOT NULL,
  avg_response_time_hours DECIMAL(10,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  avg_messages_per_lead INTEGER DEFAULT 0,
  peak_activity_hours INTEGER[] DEFAULT '{}',
  top_keywords JSONB DEFAULT '[]',
  sentiment_analysis JSONB DEFAULT '{"positive": 0, "neutral": 0, "negative": 0}',
  followup_effectiveness JSONB DEFAULT '{"followup1": 0, "followup2": 0}',
  total_conversations INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(remotejID)
); 

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_conversation_analysis_remotejid ON conversation_analysis(remotejID);
CREATE INDEX IF NOT EXISTS idx_conversation_analysis_created_at ON conversation_analysis(created_at);

-- Enable RLS
ALTER TABLE conversation_analysis ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Allow authenticated users to read conversation analysis" ON conversation_analysis
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert conversation analysis" ON conversation_analysis
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update conversation analysis" ON conversation_analysis
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversation_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_conversation_analysis_updated_at
  BEFORE UPDATE ON conversation_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_analysis_updated_at();
