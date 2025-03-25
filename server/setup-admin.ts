import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

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
    
    // Check if admin user already exists
    const existingAdmin = await storage.getUserByUsername(adminUsername);
    
    if (existingAdmin) {
      console.log("Admin user already exists, updating credentials...");
      await storage.updateUser(existingAdmin.id, {
        email: adminEmail,
        password: await hashPassword(adminPassword),
        displayName: adminDisplayName,
        isAdmin: true,
        // Make sure subscription tier is enterprise, the highest level
        subscriptionTier: "enterprise"
      });
      console.log("Admin user updated successfully");
    } else {
      console.log("Creating new admin user...");
      await storage.createAdminUser({
        username: adminUsername,
        password: await hashPassword(adminPassword),
        displayName: adminDisplayName,
        email: adminEmail,
        isAdmin: true,
        subscriptionTier: "enterprise"
      });
      console.log("Admin user created successfully");
    }
  } catch (error) {
    console.error("Error setting up admin user:", error);
  }
}