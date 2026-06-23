import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ekqxnwnqbcbwuvrqyqqd.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrcXhud25xYmNid3V2cnF5cXFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4Mzg5MzEsImV4cCI6MjA4OTQxNDkzMX0.pHEVqmqIrtpop_BtI1HTiGllOXXK_QOeiRnM9dksdrE'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
