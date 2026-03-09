const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
  console.log("Inspecting 'profiles' table columns...");
  
  // Try to select one row to see keys
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (error) {
    console.error("Error fetching from profiles (select *):", error);
    
    // Try individual columns to see which one fails
    const cols = ['id', 'full_name', 'phone', 'role', 'created_at', 'avatar_url', 'username', 'updated_at'];
    for (const col of cols) {
      const { error: e } = await supabase.from('profiles').select(col).limit(1);
      if (e) {
        console.log(`Column '${col}': FAILED (${e.message})`);
      } else {
        console.log(`Column '${col}': OK`);
      }
    }
  } else if (data && data.length > 0) {
    console.log("Found row! Available columns:", Object.keys(data[0]).join(', '));
  } else {
    console.log("Table 'profiles' is empty or no matched row.");
    // Try selecting id to see if it works
    const { error: e } = await supabase.from('profiles').select('id').limit(1);
    if (e) {
      console.log("Even 'id' failed:", e.message);
    } else {
      console.log("'id' column exists.");
      // Test others
      const testCols = ['full_name', 'phone', 'role', 'created_at', 'avatar_url'];
      for (const col of testCols) {
        const { error: e2 } = await supabase.from('profiles').select(col).limit(1);
        console.log(`Column '${col}': ${e2 ? 'MISSING' : 'EXISTS'}`);
      }
    }
  }
}

inspectSchema();
