const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '../frontend/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
  console.log("Inspecting 'profiles' table...");
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (error) {
    if (error.code === 'PGRST100') {
      console.log("Table 'profiles' not found or no permission.");
    } else {
      console.error("Error fetching from profiles:", error);
    }
  } else if (data && data.length > 0) {
    console.log("Available columns in 'profiles':", Object.keys(data[0]).join(', '));
  } else {
    console.log("Table 'profiles' is empty.");
    // Fallback try to select anything
    const { data: cols, error: colError } = await supabase.rpc('get_table_columns', { table_name: 'profiles' });
    if (colError) {
        console.log("RPC get_table_columns failed, trying select * with head only");
        const { data: headData, error: headError } = await supabase.from('profiles').select('*').limit(0);
        if (headError) {
            console.error("Head error:", headError);
        } else {
            // Unfortunately select * limit 0 doesn't return column names in the response if it's empty
            console.log("Cannot determine columns from empty table using select *");
        }
    } else {
        console.log("Columns from RPC:", cols);
    }
  }
}

inspectSchema();
