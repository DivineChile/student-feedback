import { createClient } from "./supabaseClient";

const supabase = createClient();

export async function signUpStudent({ email, password, fullName, matricNumber }) {
  // 1️⃣ Create auth account
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  const user = data.user;

  if (!user) {
    throw new Error("User creation failed");
  }

  // 2️⃣ Update profile created by trigger
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      matric_number: matricNumber,
      email: email,
    })
    .eq("id", user.id);

  if (profileError) throw profileError;

  return user;
}

export async function signInStudent(matricNumber, password) {
  // 1️⃣ Get email from matric number using RPC
  const { data: email, error: lookupError } = await supabase.rpc("get_email_by_matric", {
    p_matric: matricNumber,
  });

  if (lookupError) {
    throw new Error("Unable to verify matric number.");
  }

  if (!email) {
    throw new Error("Matric number not found.");
  }

  // 2️⃣ Sign in using email
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return data.user;
}

export async function signInAdmin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) throw error;

  return data.user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}

export async function getUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;

  return data.user;
}
