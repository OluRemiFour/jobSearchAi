const puppeteer = require("puppeteer");
require("dotenv").config();

/**
 * Scrapes job listings from Google Jobs based on user criteria.
 * @param {Object} jobCriteria - AI-generated job search filters.
 * @returns {Promise<Array>} - List of job results.
 */
async function scrapeGoogleJobs(jobCriteria) {
  const { skills, jobType, location } = jobCriteria;
  const searchQuery = `${skills.join(" ")} ${jobType} jobs in ${location}`;

  // Launch headless browser
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Google Jobs Search URL
  const googleJobsUrl = `https://www.google.com/search?q=${encodeURIComponent(
    searchQuery
  )}&ibp=htl;jobs`;

  console.log(`🔍 Scraping jobs from: ${googleJobsUrl}`);

  // Go to Google Jobs page
  await page.goto(googleJobsUrl, { waitUntil: "domcontentloaded" });

  // Extract job details
  const jobListings = await page.evaluate(() => {
    const jobs = [];
    document.querySelectorAll(".BjJfJf").forEach((job) => {
      jobs.push({
        title: job.querySelector(".BjJfJf")?.innerText || "N/A",
        company: job.querySelector(".vNEEBe")?.innerText || "N/A",
        location: job.querySelector(".Qk80Jf")?.innerText || "N/A",
        applyLink: job.querySelector("a")?.href || "N/A",
      });
    });
    return jobs;
  });

  // Close browser
  await browser.close();

  return jobListings.slice(0, 5); // Return top 5 jobs
}

// Example AI-generated job criteria
const aiGeneratedCriteria = {
  skills: ["JavaScript", "Node.js"],
  jobType: "Remote",
  location: "United States",
};

// Call the function to test
scrapeGoogleJobs(aiGeneratedCriteria).then((jobResults) => {
  console.log("📌 Scraped Job Listings:", jobResults);
});
