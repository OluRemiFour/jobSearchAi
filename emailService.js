const nodemailer = require("nodemailer");
require("dotenv").config();

/**
 * Sends job recommendations to the user's registered email.
 * @param {string} userEmail - The user's email address.
 * @param {Array} jobListings - List of job recommendations.
 */
async function sendJobEmail(userEmail, jobListings) {
  if (!jobListings || jobListings.length === 0) {
    console.log("❌ No jobs found to send.");
    return;
  }

  // Email transporter setup
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Format job listings for the email
  const jobContent = jobListings
    .map(
      (job, index) =>
        `<b>${index + 1}. ${job.title}</b> <br> 
         Company: ${job.company} <br> 
         Location: ${job.location} <br> 
         <a href="${job.applyLink}">Apply Here</a> <br><br>`
    )
    .join("");

  // Email options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: "🚀 Job Recommendations for You!",
    html: `<h3>Hello, here are your latest job recommendations:</h3> ${jobContent} <p>Good luck with your applications! 🚀</p>`,
  };

  // Send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent: ${info.response}`);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
}

// Example usage
const exampleUserEmail = "user@example.com";
const exampleJobListings = [
  {
    title: "Senior Node.js Developer",
    company: "TechCorp",
    location: "Remote",
    applyLink: "https://example.com/job1",
  },
  {
    title: "Full-Stack Developer",
    company: "Web Solutions",
    location: "New York, USA",
    applyLink: "https://example.com/job2",
  },
];

sendJobEmail(exampleUserEmail, exampleJobListings);
