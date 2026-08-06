export function getAuthErrorMessage(error) {
  if (!error) {
    return "Something went wrong. Please try again.";
  }

  const message =
    typeof error === "string" ? error : error instanceof Error ? error.message : "";

  if (message.toLowerCase().includes("invalid login credentials")) {
    return "Incorrect matric number or password.";
  }

  if (message.toLowerCase().includes("user already registered")) {
    return "An account with this email already exists.";
  }

  if (message.toLowerCase().includes("database error saving new user")) {
    return "We couldn't create your account at the moment. Please try again.";
  }

  if (message.toLowerCase().includes("matric number not found")) {
    return "No account was found with that matric number.";
  }

  if (message.toLowerCase().includes("email not set for this account")) {
    return "This account is incomplete. Please contact support.";
  }

  if (message.toLowerCase().includes("duplicate key value")) {
    return "This record already exists.";
  }

  return "Something went wrong. Please try again.";
}
