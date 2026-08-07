/**
 * GitHub Account Creation Simulation Application
 * Implements logic for personal account sign-up, social login, 
 * email verification, and 2FA configuration.
 */

class GitHubAccountManager {
    constructor() {
        this.users = new Map(); // Mock database
        // Mock set of enterprise managed user emails
        this.managedUsers = new Set(['admin@enterprise-corp.com', 'employee@enterprise-corp.com']);
    }

    /**
     * 1. Signing up with email and password
     */
    registerWithEmail(username, email, password) {
        console.log(`\n[Signup] Processing email registration for username: @${username} (${email})`);
        
        // Check managed user constraint
        if (this.managedUsers.has(email)) {
            throw new Error("Registration Failed: You can't sign up for a personal account with an email address already verified for a managed user account.");
        }

        // Check if username or email already exists
        if (this.users.has(username) || [...this.users.values()].some(u => u.email === email)) {
            throw new Error("Registration Failed: Username or email is already taken.");
        }

        const newUser = {
            username,
            email,
            password: this.hashPassword(password), // Mock hashing
            isEmailVerified: false,
            twoFactorEnabled: false,
            authType: 'email',
            createdAt: new Date().toISOString()
        };

        this.users.set(username, newUser);
        console.log(`[Success] Account created for @${username}. Verification email sent to ${email}.`);
        return newUser;
    }

    /**
     * 2. Signing up via Social Login (Google or Apple)
     */
    registerWithSocial(provider, email, fullName) {
        console.log(`\n[Signup] Processing social login via ${provider} for email: ${email}`);
        
        if (this.managedUsers.has(email)) {
            throw new Error("Registration Failed: Cannot use a managed user email for personal account registration via social login.");
        }

        // Generate a username based on full name or email prefix
        const baseName = fullName ? fullName.toLowerCase().replace(/\s+/g, '') : email.split('@')[0];
        const username = `${baseName}${Math.floor(Math.random() * 900) + 100}`;

        const newUser = {
            username,
            email,
            authType: provider,
            isEmailVerified: true, // Social providers usually provide pre-verified emails
            twoFactorEnabled: false,
            createdAt: new Date().toISOString()
        };

        this.users.set(username, newUser);
        console.log(`[Success] Social account created via ${provider} for @${username}. Email is pre-verified.`);
        return newUser;
    }

    /**
     * 3. Verifying Email Address
     */
    verifyEmail(username, code) {
        const user = this.users.get(username);
        if (!user) throw new Error("Verification Error: User not found.");

        // Simulate verification code check (e.g., '123456')
        if (code === '123456') {
            user.isEmailVerified = true;
            console.log(`[Verification] Email successfully verified for @${username}. Basic tasks (like repository creation) are now unlocked.`);
            return true;
        } else {
            console.log(`[Verification Error] Invalid verification code. Please check your inbox or troubleshooting steps.`);
            return false;
        }
    }

    /**
     * 4. Configuring Two-Factor Authentication (2FA) - Recommended Next Step
     */
    configureTwoFactorAuth(username, method = 'authenticator_app') {
        const user = this.users.get(username);
        if (!user) throw new Error("Security Error: User not found.");
        if (!user.isEmailVerified) throw new Error("Security Error: You must verify your email address before configuring 2FA.");

        user.twoFactorEnabled = true;
        console.log(`[Security] Two-factor authentication (2FA) successfully configured for @${username} using ${method}. Account secured.`);
        return true;
    }

    // Helper utility for mocking password security
    hashPassword(password) {
        return `hashed_${password}_secure`;
    }
}

// ==========================================
// Execution Example / Simulation Runner
// ==========================================

const githubApp = new GitHubAccountManager();

try {
    // Scenario A: Successful Standard Email Sign-up & Onboarding Flow
    console.log("=== SCENARIO 1: Email Registration & Setup ===");
    const user1 = githubApp.registerWithEmail("octocat", "octocat@github.com", "StrongPassword!2026");
    githubApp.verifyEmail("octocat", "123456"); // Simulating correct code entry
    githubApp.configureTwoFactorAuth("octocat", "TOTP Authenticator App");

    // Scenario B: Successful Social Login (Google)
    console.log("\n=== SCENARIO 2: Google Social Login ===");
    const user2 = githubApp.registerWithSocial("Google", "janedev@gmail.com", "Jane Developer");
    githubApp.configureTwoFactorAuth(user2.username, "SMS Security Key");

    // Scenario C: Blocked Managed User Registration Constraint
    console.log("\n=== SCENARIO 3: Managed User Restriction Check ===");
    githubApp.registerWithEmail("corpUser", "admin@enterprise-corp.com", "corporatePass123");

} catch (error) {
    console.error(`\n[Application Exception]: ${error.message}`);
}
