// Import required modules
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config(); // Load environment variables

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Ensure you have your API key in a .env file

/**
 * AI Function to Process User Bio and Job Preferences
 * @param {Object} userProfile - The user's details (name, skills, experience, job preference, location)
 * @returns {Promise<String>} - AI-generated job search criteria
 */
async function processUserProfile(userProfile) {
  try {
    // Validate that all required user data is present
    if (
      !userProfile.name ||
      !userProfile.skills ||
      !userProfile.experience ||
      !userProfile.jobType ||
      !userProfile.location
    ) {
      throw new Error(
        "Missing required user details. Please provide name, skills, experience, job type, and location."
      );
    }

    // AI prompt: Structured way to communicate with the AI model
    const prompt = `
      You are an AI Job Matching Agent. Based on the user's profile, generate a structured job search request.
      
      User Profile:
      - Name: ${userProfile.name}
      - Skills: ${userProfile.skills.join(", ")}
      - Experience: ${userProfile.experience} years
      - Preferred Job Type: ${
        userProfile.jobType
      } (Remote/Hybrid/Onsite/Full-time)
      - Preferred Location: ${userProfile.location}

      Instructions:
      - Identify relevant job roles based on the user’s skills and experience.
      - Consider ${userProfile.jobType} jobs in ${userProfile.location}.
      - If the user has a PhD or research background, suggest academic opportunities.
      - Return a structured job search query in JSON format.
    `;

    // Send the prompt to Google Gemini AI
    // const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiGeneratedJobQuery = response.text();

    return aiGeneratedJobQuery; // This is the AI-processed job search criteria
  } catch (error) {
    console.error("Error processing user profile:", error.message);
    return null;
  }
}

// Example user profile data
const exampleUser = {
  name: "John Doe",
  skills: ["JavaScript", "Node.js", "Express", "React"],
  experience: 3, // Years of experience
  jobType: "Remote",
  location: "Nigeria",
  education: "Master's Degree", // Could also be PhD
};

// Call the function to test
processUserProfile(exampleUser).then((jobQuery) => {
  console.log("Generated Job Search Criteria:", jobQuery);
});
