import { createClient } from "./supabaseClient";

const supabase = createClient();

export async function signUpStudent({ email, password, fullName, matricNumber }) {
  // 1️⃣ Create the auth account. full_name + matric_number ride along as user
  //    metadata so the handle_new_user trigger writes the complete profile row
  //    in the same transaction — there's no follow-up UPDATE that could
  //    half-fail and strand an account with a NULL matric number.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        matric_number: matricNumber,
      },
    },
  });

  if (error) throw error;

  const user = data.user;

  if (!user) {
    throw new Error("User creation failed");
  }

  // 2️⃣ With email confirmation off, signUp signs the new user straight in. We
  //    want them to log in explicitly with their matric number, so clear that
  //    session before the form redirects to /login. Non-fatal: the account
  //    already exists either way.
  await supabase.auth.signOut().catch(() => {});

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
