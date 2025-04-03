require("dotenv").config();
const puppeteer = require("puppeteer-extra");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
// const { executablePath } = require("puppeteer");
puppeteer.use(StealthPlugin());

const queryData =
  "Find PhD research job openings in Europe that require an MSc in Animal Science, Health, Production, or Agricultural Science. Prioritize opportunities that match my skills in statistical analysis (Excel, R, SQL) and laboratory expertise (PCR, biochemical analysis). Extract detailed information, including job description, requirements, application links, location, and contact details of the poster.";

const scrapeJobs = async () => {
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    userDataDir: "C:/Users/Remi/AppData/Local/Google/Chrome/User Data",
    headless: false,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    args: ["--proxy-server=http://162.23.125.34:8080"],
  });

  const page = await browser.newPage();

  console.log("🔍 Searching for jobs...");

  // Go to Google Jobs Search
  await page.goto(
    `https://www.google.com/search?q=${encodeURIComponent(
      queryData +
        " site:linkedin.com OR site:indeed.com OR site:researchgate.net OR site:glassdoor.com OR site:academia.edu OR site:x.com OR site:google.com"
      // " site:findaphd.com OR site:jobs.ac.uk/phd"
    )}`,
    {
      waitUntil: "networkidle2",
    }
  );

  // Wait for search results
  await page.waitForSelector("h3");

  // Extract job post links and titles
  const jobs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("h3"))
      .map((el) => {
        const link = el.closest("a")?.href; // Get job post URL
        return { title: el.innerText, link };
      })
      .filter((job) => job.link); // Ensure links are present
  });

  console.log("✅ Found Jobs:", jobs);

  let jobDetails = [];

  for (let job of jobs) {
    const jobPage = await browser.newPage();
    try {
      console.log(`🔎 Scraping job: ${job.title}`);

      await jobPage.goto(job.link, { waitUntil: "domcontentloaded" });

      // Extract job description
      const jobData = await jobPage.evaluate(() => {
        let description =
          document.querySelector(
            "p, .description, .job-desc, .jobDescriptionContent"
          )?.innerText || "No description available";
        let requirements =
          document.querySelector(".qualifications, .requirements, .req-list")
            ?.innerText || "No requirements listed";
        return { description, requirements };
      });

      jobDetails.push({
        title: job.title,
        link: job.link,
        description: jobData.description,
        requirements: jobData.requirements,
      });

      await jobPage.close();
    } catch (error) {
      console.log(`⚠️ Error scraping ${job.title}:`, error.message);
    }
  }

  console.log("📌 Final Job Listings:", jobDetails);
  await browser.close();

  return jobDetails; // ✅ Return the job details
};

// Function to remove duplicates job post
const filterUniqueJobs = (jobs) => {
  const seen = new Set();
  return jobs.filter((job) => {
    const jobKey = `${job.title}-${job.link}`;
    if (seen.has(jobKey)) {
      return false;
    }
    seen.add(jobKey);
    return true;
  });
};

// Function to format the job listings into email content
// const formatEmailContent = (jobs) => {
//   let emailBody = `📢 **PhD Research Openings in Europe**\n\n`;
//   jobs.forEach((job, index) => {
//     emailBody += `**${index + 1}. ${job.title}**\n📄 Description: ${
//       job.description
//     }\n🔗 Apply Here: [${job.link}](${job.link})\n\n`;
//   });
//   return emailBody;
// };

const formatEmailContent = (jobs) => {
  let emailBody = `<h1>📢 PhD Research Openings in Europe</h1><ul>`;
  jobs.forEach((job, index) => {
    emailBody += `
      <li style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
        <h3><a href="${job.link}">${index + 1} ${job.title}</a></h3>
        ${
          job.location
            ? `<p><strong>📍 Location:</strong> ${job.location}</p>`
            : ""
        }
        ${
          job.description
            ? `<p><strong>📄 Description:</strong> ${job.description}</p>`
            : ""
        }
        ${
          job.requirements
            ? `<p><strong>📋 Requirements:</strong> ${job.requirements}</p>`
            : ""
        }
        <p><a href="${
          job.link
        }" style="color: #1a73e8; text-decoration: none;">🔗 Apply Here</a></p>
      </li>`;
  });
  emailBody += `</ul>`;
  return emailBody;
};

// Function to send email using Nodemailer
const sendTestEmail = async (jobArray) => {
  const refinedJobs = filterUniqueJobs(jobArray);
  const emailContent = formatEmailContent(refinedJobs);

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  let mailOptions = {
    from: process.env.SMTP_USER,
    to: process.env.SMTP_USER, // Send to yourself for testing
    subject: "PhD Research Openings in Europe",
    text: emailContent, // Plain text format
    html: `<pre>${emailContent}</pre>`, // HTML format
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("✅ Email Sent: " + info.response);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

// Run the script and send the email with the scraped data
(async () => {
  const jobDetails = await scrapeJobs(); // ✅ Fetch job details
  await sendTestEmail(jobDetails); // ✅ Pass the data correctly
})();

cron.schedule("*/20 * * * *", () => {
  console.log("⏳ Running scheduled job scraping...");
  scrapeJobs();
});

// ---------------------------------------------------------

// require("dotenv").config();
// const puppeteer = require("puppeteer-extra");
// const nodemailer = require("nodemailer");
// const cron = require("node-cron");
// const StealthPlugin = require("puppeteer-extra-plugin-stealth");
// puppeteer.use(StealthPlugin());

// const queryData =
//   "Find PhD research job openings in Europe that require an MSc in Animal Science, Health, Production, or Agricultural Science. Prioritize opportunities that match my skills in statistical analysis (Excel, R, SQL) and laboratory expertise (PCR, biochemical analysis). Extract detailed information, including job description, requirements, application links, location, and contact details of the poster.";

// // const scrapeJobs = async () => {
// //   console.log("🚀 Starting job scraper...");
// //   const possiblePaths = [
// //     "/usr/bin/chromium-browser",
// //     "/usr/bin/chromium",
// //     "/usr/bin/google-chrome-stable",
// //     "/opt/render/project/src/node_modules/puppeteer/.local-chromium/linux-*/chrome-linux/chrome",
// //   ];

// //   let browser;
// //   let lastError;

// //   for (const path of possiblePaths) {
// //     try {
// //       console.log(`🔧 Trying Chromium path: ${path}`);
// //       browser = await puppeteer.launch({
// //         headless: "new",
// //         executablePath: path,
// //         args: [
// //           "--no-sandbox",
// //           "--disable-setuid-sandbox",
// //           "--disable-dev-shm-usage",
// //           "--single-process",
// //           "--disable-accelerated-2d-canvas",
// //           "--disable-gpu",
// //         ],
// //       });
// //       console.log("✅ Browser launched successfully");
// //       break;
// //     } catch (error) {
// //       lastError = error;
// //       console.log(`⚠️ Failed with path ${path}: ${error.message}`);
// //     }
// //   }

// //   if (!browser) {
// //     console.error("❌ All Chromium paths failed:", lastError);
// //     throw new Error("Could not launch browser with any known path");
// //   }
// //   try {
// //     const page = await browser.newPage();
// //     await page.setUserAgent(
// //       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
// //     );

// //     console.log("🔍 Searching for jobs...");
// //     await page.goto(
// //       `https://www.google.com/search?q=${encodeURIComponent(
// //         queryData +
// //           " site:linkedin.com OR site:indeed.com OR site:researchgate.net OR site:glassdoor.com OR site:academia.edu OR site:x.com OR site:google.com"
// //       )}`,
// //       {
// //         waitUntil: "networkidle2",
// //         timeout: 60000,
// //       }
// //     );

// //     // Wait for search results
// //     await page.waitForSelector("h3", { timeout: 30000 });

// //     // Extract job post links and titles
// //     const jobs = await page.evaluate(() => {
// //       return Array.from(document.querySelectorAll("h3"))
// //         .map((el) => {
// //           const link = el.closest("a")?.href;
// //           return { title: el.innerText, link };
// //         })
// //         .filter((job) => job.link);
// //     });

// //     console.log("✅ Found Jobs:", jobs.length);

// //     let jobDetails = [];
// //     const maxJobsToScrape = 5; // Limit for Render's resources

// //     for (let i = 0; i < Math.min(jobs.length, maxJobsToScrape); i++) {
// //       const job = jobs[i];
// //       const jobPage = await browser.newPage();

// //       try {
// //         console.log(
// //           `🔎 Scraping job ${i + 1}/${Math.min(
// //             jobs.length,
// //             maxJobsToScrape
// //           )}: ${job.title.substring(0, 50)}...`
// //         );

// //         await jobPage.goto(job.link, {
// //           waitUntil: "domcontentloaded",
// //           timeout: 30000,
// //         });

// //         // Random delay to appear more human
// //         await jobPage.waitForTimeout(2000 + Math.random() * 3000);

// //         const jobData = await jobPage.evaluate(() => {
// //           const description =
// //             document.querySelector(
// //               "p, .description, .job-desc, .jobDescriptionContent"
// //             )?.innerText || "No description available";

// //           const requirements =
// //             document.querySelector(".qualifications, .requirements, .req-list")
// //               ?.innerText || "No requirements listed";

// //           const location =
// //             document.querySelector(".location, .job-location, .jobs-location")
// //               ?.innerText || "Location not specified";

// //           return { description, requirements, location };
// //         });

// //         jobDetails.push({
// //           title: job.title,
// //           link: job.link,
// //           description:
// //             jobData.description.substring(0, 300) +
// //             (jobData.description.length > 300 ? "..." : ""),
// //           requirements:
// //             jobData.requirements.substring(0, 300) +
// //             (jobData.requirements.length > 300 ? "..." : ""),
// //           location: jobData.location,
// //         });
// //       } catch (error) {
// //         console.log(`⚠️ Error scraping ${job.title}:`, error.message);
// //       } finally {
// //         await jobPage.close();
// //       }
// //     }

// //     console.log("📌 Final Job Listings:", jobDetails.length);
// //     return jobDetails;
// //   } finally {
// //     await browser.close();
// //   }
// // };

// const scrapeJobs = async () => {
//   console.log("🚀 Starting job scraper...");

//   let browser;
//   try {
//     browser = await puppeteer.launch({
//       headless: "new",
//       args: [
//         "--no-sandbox",
//         "--disable-setuid-sandbox",
//         "--disable-dev-shm-usage",
//         "--single-process",
//         "--disable-accelerated-2d-canvas",
//         "--disable-gpu",
//       ],
//     });

//     console.log("✅ Browser launched successfully");
//   } catch (error) {
//     console.error("❌ Failed to launch browser:", error);
//     throw new Error("Could not launch browser.");
//   }

//   try {
//     const page = await browser.newPage();
//     await page.setUserAgent(
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
//     );

//     console.log("🔍 Searching for jobs...");
//     await page.goto(
//       `https://www.google.com/search?q=${encodeURIComponent(
//         queryData +
//           " site:linkedin.com OR site:indeed.com OR site:researchgate.net OR site:glassdoor.com OR site:academia.edu OR site:x.com OR site:google.com"
//       )}`,
//       {
//         waitUntil: "networkidle2",
//         timeout: 60000,
//       }
//     );

//     // Wait for search results
//     await page.waitForSelector("h3", { timeout: 30000 });

//     const jobs = await page.evaluate(() => {
//       return Array.from(document.querySelectorAll("h3"))
//         .map((el) => {
//           const link = el.closest("a")?.href;
//           return { title: el.innerText, link };
//         })
//         .filter((job) => job.link);
//     });

//     console.log("✅ Found Jobs:", jobs.length);
//     return jobs;
//   } finally {
//     await browser.close();
//   }
// };

// const filterUniqueJobs = (jobs) => {
//   const seen = new Set();
//   return jobs.filter((job) => {
//     const jobKey = `${job.title}-${job.link}`;
//     if (seen.has(jobKey)) {
//       return false;
//     }
//     seen.add(jobKey);
//     return true;
//   });
// };

// const formatEmailContent = (jobs) => {
//   let emailBody = `<h1>📢 PhD Research Openings in Europe</h1><ul>`;
//   jobs.forEach((job, index) => {
//     emailBody += `
//       <li style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
//         <h3><a href="${job.link}">${index + 1}. ${job.title}</a></h3>
//         ${
//           job.location
//             ? `<p><strong>📍 Location:</strong> ${job.location}</p>`
//             : ""
//         }
//         ${
//           job.description
//             ? `<p><strong>📄 Description:</strong> ${job.description}</p>`
//             : ""
//         }
//         ${
//           job.requirements
//             ? `<p><strong>📋 Requirements:</strong> ${job.requirements}</p>`
//             : ""
//         }
//         <p><a href="${
//           job.link
//         }" style="color: #1a73e8; text-decoration: none;">🔗 Apply Here</a></p>
//       </li>`;
//   });
//   emailBody += `</ul>`;
//   return emailBody;
// };

// const sendEmail = async (jobArray) => {
//   if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
//     console.log("ℹ️ Email not configured - skipping email send");
//     return;
//   }

//   const refinedJobs = filterUniqueJobs(jobArray);
//   const emailContent = formatEmailContent(refinedJobs);

//   let transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,
//     },
//   });

//   let mailOptions = {
//     from: process.env.SMTP_USER,
//     to: process.env.SMTP_USER,
//     subject: "PhD Research Openings in Europe",
//     html: emailContent,
//   };

//   try {
//     let info = await transporter.sendMail(mailOptions);
//     console.log("✅ Email sent:", info.messageId);
//   } catch (error) {
//     console.error("❌ Error sending email:", error);
//   }
// };

// // Main execution
// (async () => {
//   try {
//     const jobDetails = await scrapeJobs();
//     await sendEmail(jobDetails);
//     process.exit(0);
//   } catch (error) {
//     console.error("🔥 Fatal error:", error);
//     process.exit(1);
//   }
// })();

// Schedule job (commented out for initial testing)
// cron.schedule("0 8 * * *", () => {
//   console.log("⏳ Running scheduled job scraping...");
//   scrapeJobs().then(sendEmail);
// }, {
//   timezone: "Europe/London"
// });
