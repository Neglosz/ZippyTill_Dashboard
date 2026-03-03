const { createClient } = require('@supabase/supabase-client');
require('dotenv').config({ path: './backend/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkData() {
  const { data, error } = await supabase.from('orders').select('*').limit(5);
  if (error) console.error("Error:", error);
  else console.log("Orders sample:", data);

  const { count, error: countError } = await supabase.from('orders').select('*', { count: 'exact', head: true });
  console.log("Total orders count:", count);
}

checkData();
