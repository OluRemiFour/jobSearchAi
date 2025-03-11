const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const ai = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

/**
 * Uses AI to match jobs based on user preferences.
 * @param {Array} jobListings - List of scraped jobs.
 * @param {Object} user - User's job preferences.
 * @returns {Array} Ranked job listings.
 */
async function matchJobsWithAI(jobListings, user) {
  if (!jobListings || jobListings.length === 0) return [];

  const prompt = `
  You are a job recommendation AI. The user has the following preferences:
  - Role: ${user.role}
  - Location: ${user.location}
  - Job Type: ${user.jobType} (${user.phdStatus ? "PhD Candidate" : "Regular"})
  Your task is to rank the following jobs based on relevance:

  ${jobListings
    .map(
      (job, index) =>
        `Job ${index + 1}: ${job.title} at ${job.company}, Location: ${
          job.location
        }, Apply: ${job.applyLink}`
    )
    .join("\n")}

  Return a JSON array with job recommendations ranked from most to least relevant.
  `;

  try {
    const model = ai.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("❌ AI Matching Failed:", error);
    return jobListings; // Return original list if AI fails
  }
}

module.exports = { matchJobsWithAI };
