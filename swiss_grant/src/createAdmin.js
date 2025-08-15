import { createClient } from "@supabase/supabase-js";

// 1️⃣ Set your Supabase URL and Service Role Key (from Settings → API)
const SUPABASE_URL = "https://YOUR_PROJECT_REF.supabase.co";
const SUPABASE_SERVICE_KEY = "YOUR_SERVICE_ROLE_KEY";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const adminEmail = "admin@grantapp.com";
const adminPassword = "Admin123!";
const adminFullName = "Admin User";

async function createAdmin() {
  try {
    // Create the admin user in Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // immediately confirms the email
    });

    if (authError) {
      console.error("Error creating admin in Auth:", authError.message);
      return;
    }

    console.log("Admin created in Auth:", authData);

    const userId = authData.user.id;

    // Insert into profiles table
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .insert([{ id: userId, full_name: adminFullName, role: "admin" }]);

    if (profileError) {
      console.error("Error inserting admin profile:", profileError.message);
      return;
    }

    console.log("Admin profile added successfully:", profileData);
    console.log(`You can now log in with email: ${adminEmail} and password: ${adminPassword}`);
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

createAdmin();
