import { chromium } from "playwright";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const projectDir = "D:\\Culture First App\\culturefirst";
const repoName = "culturefirst";
const vercelProjectName = "culturefirst";

async function deployToVercel() {
  console.log("🚀 Starting CultureFirst deployment automation...\n");

  // Step 1: Initialize Git Repository
  console.log("📝 Step 1: Initializing Git repository...");
  try {
    execSync("git init", { cwd: projectDir });
    execSync('git config user.email "deployment@culturefirst.dev"', {
      cwd: projectDir,
    });
    execSync('git config user.name "CultureFirst Deployment"', {
      cwd: projectDir,
    });
    execSync("git add .", { cwd: projectDir });
    execSync('git commit -m "Initial commit: CultureFirst MVP deployment"', {
      cwd: projectDir,
    });
    console.log("✅ Git repository initialized\n");
  } catch (error) {
    console.error("⚠️  Git initialization (may already be initialized):", error);
  }

  // Step 2: Launch Browser
  console.log("🌐 Step 2: Launching browser...");
  const browser = await chromium.launch({ headless: false });
  const context = await browser.createBrowserContext();
  const page = await context.newPage();

  try {
    // Step 3: GitHub - Create Repository
    console.log("📦 Step 3: Creating GitHub repository...");
    await page.goto("https://github.com/new", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    // Fill in repository details
    const repoNameInput = await page.locator('input[name="repository_name"]');
    await repoNameInput.fill(repoName);

    const descriptionInput = await page.locator('textarea[name="description"]');
    await descriptionInput.fill(
      "CultureFirst - Organizational culture review platform for Bangladesh"
    );

    // Select Public
    const publicRadio = await page.locator('input[value="public"]');
    await publicRadio.click();

    console.log("⏳ Waiting for you to click 'Create repository' on GitHub...");
    console.log(
      "   (Playwright automation paused - please complete the CAPTCHA and click Create)"
    );
    await page.waitForTimeout(30000); // Wait for manual interaction

    // Step 4: Get Repository URL
    console.log("🔗 Step 4: Getting repository URL from GitHub...");
    const repoUrl = page.url(); // Should be the new repo page
    console.log(`Repository URL: ${repoUrl}`);

    // Step 5: Push to GitHub
    console.log("📤 Step 5: Pushing code to GitHub...");
    const githubUrl = `https://github.com/${repoUrl.split("/")[3]}/${repoName}.git`;
    console.log(`Pushing to: ${githubUrl}`);

    try {
      execSync(`git remote add origin ${githubUrl}`, { cwd: projectDir });
    } catch {
      execSync(`git remote set-url origin ${githubUrl}`, { cwd: projectDir });
    }

    execSync("git branch -M main", { cwd: projectDir });
    console.log(
      "⏳ Please authenticate with GitHub if prompted in the browser..."
    );
    // This would require credentials - user will need to authenticate

    // Step 6: Vercel Deployment
    console.log("🚀 Step 6: Setting up Vercel deployment...");
    await page.goto("https://vercel.com/dashboard", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    const addNewButton = await page.locator('button:has-text("Add New")');
    await addNewButton.click();

    const importProjectButton = await page.locator('button:has-text("Project")');
    await importProjectButton.click();

    console.log(
      "⏳ Please select your GitHub repository on Vercel and click Import..."
    );
    await page.waitForTimeout(10000);

    // Step 7: Configure Environment Variables
    console.log("⚙️  Step 7: Configuring environment variables...");
    console.log("📝 Please add these environment variables in Vercel:");
    console.log(
      "   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, etc."
    );
    console.log("   (See VERCEL_DEPLOYMENT.md for full list)");

    console.log("⏳ Waiting for deployment to complete...");
    await page.waitForTimeout(120000); // Wait 2 minutes for deployment

    // Step 8: Verify Deployment
    console.log("✅ Step 8: Verifying deployment...");
    const deploymentUrl = page.url();
    console.log(`🎉 Deployment complete! URL: ${deploymentUrl}`);

    // Take screenshot
    await page.screenshot({ path: "deployment-complete.png" });
    console.log("📸 Screenshot saved to deployment-complete.png");
  } finally {
    await browser.close();
  }

  console.log("\n✨ Deployment automation complete!");
}

deployToVercel().catch(console.error);
