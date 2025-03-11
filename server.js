const express = require("express");
const bodyParser = require("body-parser");
const cron = require("node-cron");
const { scrapeJobs } = require("./jobScraper"); // Import job scraper
const { sendJobEmail } = require("./emailService"); // Import email sender
const { matchJobsWithAI } = require("./aiJobMatcher"); // Import AI job matcher

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

let userPreferences = [];

// 📌 API to collect user job preferences
app.post("/submit-preference", (req, res) => {
  const { email, role, location, jobType, phdStatus } = req.body;

  if (!email || !role || !location || !jobType) {
    return res.status(400).json({ error: "All fields are required." });
  }

  userPreferences.push({ email, role, location, jobType, phdStatus });
  res.json({ message: "✅ Preferences saved successfully!" });
});

// 🕒 Schedule job scraping & email sending (runs every 24 hours)
cron.schedule(
  "0 8 * * *",
  async () => {
    console.log("⏳ Running automated job search and email process...");

    for (const user of userPreferences) {
      try {
        let jobs = await scrapeJobs(user.role, user.location, user.jobType);
        let rankedJobs = await matchJobsWithAI(jobs, user); // AI ranks the jobs
        await sendJobEmail(user.email, rankedJobs);
      } catch (error) {
        console.error(`❌ Error processing jobs for ${user.email}:`, error);
      }
    }
  },
  { timezone: "UTC" }
);

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
