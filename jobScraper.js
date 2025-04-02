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
  // const browser = await puppeteer.launch({
  //   headless: false,
  //   executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  //   userDataDir: "C:/Users/Remi/AppData/Local/Google/Chrome/User Data",
  //   // args: ["--proxy-server=http://162.23.125.34:8080"],
  // });
  const browser = await puppeteer.launch({
    headless: "new", // Recommended headless mode
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--single-process",
    ],
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

// Function to remove duplicates
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
const formatEmailContent = (jobs) => {
  let emailBody = `📢 **PhD Research Openings in Europe**\n\n`;
  jobs.forEach((job, index) => {
    emailBody += `**${index + 1}. ${job.title}**\n📄 Description: ${
      job.description
    }\n🔗 Apply Here: [${job.link}](${job.link})\n\n`;
  });
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

// --------------------------------------------------------------
// -------------------------------------------------------------
// require("dotenv").config();
// const puppeteer = require("puppeteer-extra");
// const nodemailer = require("nodemailer");
// const StealthPlugin = require("puppeteer-extra-plugin-stealth");
// const randomUserAgent = require("random-useragent");

// puppeteer.use(StealthPlugin());

// const queryData =
//   "Find PhD research job openings in Europe that require an MSc in Animal Science or Animal Production and health, or Animal genetics. Prioritize opportunities that match my skills in statistical analysis (Excel, R, SQL) and laboratory expertise (PCR, biochemical analysis, or molecular analysis). Extract detailed information, including job description, requirements, application links, location, and contact details of the poster.";

// const scrapeJobs = async (queryData) => {
//   const browser = await puppeteer.launch({
//     headless: false, // Set to true for production
//     args: ["--no-sandbox", "--disable-setuid-sandbox"],
//   });

//   try {
//     const page = await browser.newPage();

//     // Set a random user agent to avoid detection
//     await page.setUserAgent(randomUserAgent.getRandom());

//     // await page.setUserAgent(
//     //   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36"
//     // );

//     console.log("🔍 Searching for jobs...");

//     const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
//       queryData +
//         " (site:linkedin.com OR site:indeed.com OR site:researchgate.net OR site:glassdoor.com OR site:academia.edu OR site:x.com)"
//     )}`;

//     await page.goto(searchUrl, { waitUntil: "networkidle2" });

//     // Check if CAPTCHA appears
//     if (await page.$("form[action='/sorry/index']")) {
//       console.log("⚠️ CAPTCHA detected! Please solve it manually.");
//       await page.waitForTimeout(80000); // Give user 30 seconds to solve manually
//     }

//     let jobs = [];
//     let hasNextPage = true;

//     while (hasNextPage) {
//       await page.waitForSelector("h3");

//       const jobsOnPage = await page.evaluate(() => {
//         return Array.from(document.querySelectorAll("h3"))
//           .map((el) => {
//             const link = el.closest("a")?.href;
//             return { title: el.innerText, link };
//           })
//           .filter((job) => job.link);
//       });

//       jobs.push(...jobsOnPage);

//       // Check for "Next" button
//       const nextButton = await page.$("a[aria-label='Next']");
//       if (nextButton) {
//         await nextButton.click();
//         await page.waitForTimeout(5000); // Wait for new page to load
//       } else {
//         hasNextPage = false;
//       }
//     }

//     console.log("✅ Found Jobs:", jobs);
//     return jobs;
//   } catch (error) {
//     console.error("❌ Error during scraping:", error);
//     return [];
//   } finally {
//     await browser.close();
//   }
// };

// const sendTestEmail = async (jobArray) => {
//   if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
//     console.error("❌ SMTP credentials are missing. Check your .env file.");
//     return;
//   }

//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,
//     },
//   });

//   const emailContent = jobArray
//     .map((job, index) => `📌 ${index + 1}. ${job.title} - ${job.link}`)
//     .join("\n");

//   const mailOptions = {
//     from: process.env.SMTP_USER,
//     to: process.env.SMTP_USER,
//     subject: "PhD Research Openings in Europe",
//     text: `📢 **PhD Research Openings in Europe**\n\n${emailContent}`,
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("✅ Email Sent: " + info.response);
//   } catch (error) {
//     console.error("❌ Error sending email:", error);
//   }
// };

// // Run the script
// (async () => {
//   const jobDetails = await scrapeJobs(queryData);
//   if (jobDetails.length > 0) {
//     await sendTestEmail(jobDetails);
//   } else {
//     console.log("❌ No jobs found.");
//   }
// })();
// ----------------------------------------------------------------
