import { supabase } from "./db";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { createUser, getUserByUsername, updateUser } from "./supabase-service";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function setupAdminUser() {
  try {
    // Admin credentials
    const adminEmail = "admin@socialtizemg.com";
    const adminPassword = "Elijah9386$";
    const adminUsername = "admin";
    const adminDisplayName = "Administrator";
    
    console.log("Checking for existing admin user...");
    
    // Check if admin user already exists
    const existingAdmin = await getUserByUsername(adminUsername);
    
    if (existingAdmin) {
      console.log("Admin user already exists, updating credentials...");
      await updateUser(existingAdmin.id, {
        email: adminEmail,
        password: await hashPassword(adminPassword),
        display_name: adminDisplayName,
        is_admin: true,
        subscription_tier: "enterprise"
      });
      console.log("Admin user updated successfully");
    } else {
      console.log("Creating new admin user...");
      await createUser({
        username: adminUsername,
        password: await hashPassword(adminPassword),
        display_name: adminDisplayName,
        email: adminEmail,
        is_admin: true,
        subscription_tier: "enterprise",
        subscription_status: "active"
      });
      console.log("Admin user created successfully");
    }
  } catch (error) {
    console.error("Error setting up admin user:", error);
  }
}