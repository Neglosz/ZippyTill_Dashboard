import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cwvqefsiapnarjbugllt.supabase.co";
const supabaseKey = "sb_publishable_Dzttx4y51RaGTUeYB4gudg_eaV8daUW"; // From .env

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
  console.log("--- Checking customers_info ---");
  const { data: customers, error: dbError } = await supabase
    .from("customers_info")
    .select("name, image_url")
    .limit(5);

  if (dbError) {
    console.error("DB Error:", dbError);
  } else {
    console.log("Customers found:", customers);
  }

  console.log('\n--- Checking Storage Bucket "customers" ---');
  const { data: files, error: storageError } = await supabase.storage
    .from("customers")
    .list("", { limit: 100, search: "" }); // List root

  if (storageError) {
    console.error("Storage Error (Root):", storageError);
  } else {
    console.log('Files in root of "customers":', files);

    // If there are folders, list inside the first one
    const folder = files.find((f) => f.id === null); // Folders usually have id null or are indicated by metadata
    // Supabase list returns objects. Folders might look like { name: 'folder', id: null, ... }

    if (files.length > 0) {
      // Try recursive listing or just peeking into a presumed folder if any item looks like a folder (no metadata often implies folder or check name)
      // Let's just try to list one valid looking folder if we saw one in the screenshot (UUIDs)
      for (const file of files) {
        if (!file.metadata) {
          // Likely a folder
          console.log(`\nListing contents of folder: ${file.name}`);
          const { data: subfiles } = await supabase.storage
            .from("customers")
            .list(file.name);
          console.log(subfiles);
        }
      }
    }
  }
}

debug();
