// Supabase anon key / 토스페이먼츠 client key는 공개되어도 안전한 값입니다 (RLS로 보호됨).
const SUPABASE_URL = "https://fckjgpvqbljbvxahycqm.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZja2pncHZxYmxqYnZ4YWh5Y3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MDA2MDUsImV4cCI6MjEwNDk3NjYwNX0.5d39Pj-gxJRuOPn0ftnZZkUwn0fSPihnaQ8Glk3jnJ8";
const TOSS_CLIENT_KEY = "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
