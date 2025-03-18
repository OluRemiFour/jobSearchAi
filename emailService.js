// const nodemailer = require("nodemailer");
// require("dotenv").config();

// /**
//  * Sends job recommendations to the user's registered email.
//  * @param {string} userEmail - The user's email address.
//  * @param {Array} jobListings - List of job recommendations.
//  */
// async function sendJobEmail(userEmail, jobListings) {
//   if (!jobListings || jobListings.length === 0) {
//     console.log("❌ No jobs found to send.");
//     return;
//   }

//   // Email transporter setup
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   // Format job listings for the email
//   const jobContent = jobListings
//     .map(
//       (job, index) =>
//         `<b>${index + 1}. ${job.title}</b> <br>
//          Company: ${job.company} <br>
//          Location: ${job.location} <br>
//          <a href="${job.applyLink}">Apply Here</a> <br><br>`
//     )
//     .join("");

//   // Email options
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: userEmail,
//     subject: "🚀 Job Recommendations for You!",
//     html: `<h3>Hello, here are your latest job recommendations:</h3> ${jobContent} <p>Good luck with your applications! 🚀</p>`,
//   };

//   // Send the email
//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log(`✅ Email sent: ${info.response}`);
//   } catch (error) {
//     console.error("❌ Email sending failed:", error);
//   }
// }

// // Example usage
// const exampleUserEmail = "innovativedesign67@gmail.com";
// const exampleJobListings = [
//   {
//     title: "Senior Node.js Developer",
//     company: "TechCorp",
//     location: "Remote",
//     applyLink: "https://example.com/job1",
//   },
//   {
//     title: "Full-Stack Developer",
//     company: "Web Solutions",
//     location: "New York, USA",
//     applyLink: "https://example.com/job2",
//   },
// ];

// sendJobEmail(exampleUserEmail, exampleJobListings);

const nodemailer = require("nodemailer");
require("dotenv").config(); // Load environment variables

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends an email using Nodemailer.
 * @param {string} to - Recipient email address.
 * @param {string} subject - Email subject.
 * @param {string} message - Email body.
 */
// async function sendJobEmail(to, subject, message) {
//   try {
//     const info = await transporter.sendMail({
//       from: `"Job Finder AI" <${process.env.SMTP_USER}>`, // Sender email
//       to, // Recipient email
//       subject, // Email subject
//       text: message, // Email content
//     });
//     console.log("✅ Email sent successfully:", info.messageId);
//   } catch (error) {
//     console.error("❌ Email sending failed:", error);
//   }
// }

async function sendJobEmail(to, jobs) {
  const message = jobs
    ?.map((job, index) => `${index + 1}. ${job.text}\nLink: ${job.link}`)
    .join("\n\n");

  try {
    const info = await transporter.sendMail({
      from: `"Job Finder AI" <${process.env.SMTP_USER}>`,
      to,
      subject: "Your Job Listings",
      text: `Here are your job recommendations:\n\n${message}`,
    });
    console.log("✅ Email sent successfully:", info.messageId);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
}

// Example Usage
sendJobEmail(
  "midenotch@gmail.com",
  "Job Recommendations",
  "Check out these job listings..."
);
