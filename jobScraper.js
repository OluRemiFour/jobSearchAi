require("dotenv").config();
const express = require("express");
const app = express();
const puppeteer = require("puppeteer-extra");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const PORT = process.env.PORT || 4000;
puppeteer.use(StealthPlugin());

const proxyList = [
  "139.59.1.14:80",
  "18.185.52.173:20202",
  "50.19.39.56:20201",
  "51.84.68.245:20202",
  "72.52.87.199:3128",
  "51.17.115.67:20202",
  "54.73.154.213:20201",
  "18.181.208.20:20201",
  "3.75.101.111:20201",
  "18.141.156.100:20202",
  "91.134.55.236:8080",
  "13.208.207.166:20202",
  "51.17.42.250:20202",
  "18.175.166.238:20201",
  "15.236.186.15:45554",
  "51.17.5.160:20201",
  "15.168.10.111:20201",
  "15.152.54.90:20202",
  "15.237.27.182:20201",
  "51.20.137.15:20202",
  "43.201.58.184:20202",
  "18.207.97.58:20201",
  "3.79.206.9:20202",
  "16.171.52.52:20202",
  "34.226.195.206:20202",
  "15.152.50.120:20202",
  "54.233.45.198:20202",
  "98.81.33.66:20002",
  "51.84.57.200:20202",
  "18.163.90.139:8001",
  "15.235.10.31:28003",
  "13.37.59.99:3128",
  "13.36.104.85:80",
  "13.36.113.81:3128",
  "74.82.60.199:3128",
  "13.37.73.214:80",
  "23.94.136.205:80",
  "44.218.183.55:80",
  "34.76.73.21:80",
  "54.67.125.45:3128",
  "43.159.134.4:13001",
  "43.159.130.175:13001",
  "43.135.136.234:13001",
  "170.106.183.233:13001",
  "170.106.195.109:13001",
  "49.51.198.19:13001",
  "43.135.136.212:13001",
  "49.51.180.75:13001",
  "43.135.177.13:13001",
  "170.106.84.182:13001",
  "43.153.95.171:13001",
  "43.153.113.65:13001",
  "170.106.83.59:13001",
  "43.153.46.29:13001",
  "43.130.57.214:13001",
  "43.153.99.158:13001",
  "158.255.77.166:80",
  "43.153.27.33:13001",
  "3.122.84.99:3128",
  "3.124.133.93:3128",
  "187.28.39.178:80",
  "18.228.198.164:80",
  "43.153.121.25:13001",
  "43.153.36.171:13001",
  "170.106.108.142:13001",
  "18.142.74.251:80",
  "54.151.37.26:3128",
  "43.200.243.146:3128",
  "13.247.19.136:80",
  "3.79.155.249:20202",
  "13.246.215.127:3128",
  "51.17.27.173:3128",
  "13.244.174.75:3128",
  "15.237.115.153:20201",
  "13.247.14.165:80",
  "195.114.209.50:80",
  "213.32.30.21:8080",
  "13.48.109.48:3128",
  "99.80.11.54:3128",
  "51.17.58.162:3128",
  "3.97.176.251:3128",
  "51.16.179.113:1080",
  "16.16.239.39:3128",
  "43.135.164.2:13001",
  "49.51.195.196:13001",
  "43.153.66.252:13001",
  "170.106.173.107:13001",
  "94.23.9.170:80",
  "49.51.73.96:13001",
  "43.153.98.125:13001",
  "54.248.238.110:80",
  "43.153.8.210:13001",
  "51.254.78.223:80",
  "43.153.11.82:13001",
  "63.35.64.177:3128",
  "77.91.70.115:39427",
  "43.135.147.140:13001",
  "204.236.137.68:80",
  "176.9.239.181:80",
  "162.223.90.130:80",
];

const queryData =
  "Find PhD research job openings in Europe that require an MSc in Animal Science, Health, Production, or Agricultural Science. Prioritize opportunities that match my skills in statistical analysis (Excel, R, SQL) and laboratory expertise (PCR, biochemical analysis). Extract detailed information, including job description, requirements, application links, location, and contact details of the poster.";
const scrapeJobs = async () => {
  const browser = await puppeteer.launch({
    headless: process.env.NODE_ENV === "development" ? false : true,
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    // userDataDir: "C:/Users/Remi/AppData/Local/Google/Chrome/User Data",
    // executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    // args: ["--proxy-server=http://162.23.125.34:8080"],
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
  // await page.waitForSelector("h3");

  // Extract job post links and titles
  // const jobs = await page.evaluate(() => {
  //   return Array.from(document.querySelectorAll("h3"))
  //     .map((el) => {
  //       const link = el.closest("a")?.href; // Get job post URL
  //       return { title: el.innerText, link };
  //     })
  //     .filter((job) => job.link); // Ensure links are present
  // });

  // console.log("✅ Found Jobs:", jobs);

  // Wait for search results to load
  await page.waitForSelector("body"); // Make sure the body is fully loaded

  // Dynamically extract job titles by selecting heading tags like h1, h2, h3, etc.
  const jobs = await page.evaluate(() => {
    const jobElements = Array.from(
      document.querySelectorAll(
        "h1, h2, h3, h4, h5, h6, .job-title, .job-listing"
      ) // Dynamically target heading tags and classes
    );

    return jobElements
      .map((el) => {
        const link = el.closest("a")?.href; // Get job post URL
        return { title: el.innerText.trim(), link };
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
// const scrapeJobs = async () => {
//   const randomProxy = proxyList[Math.floor(Math.random() * proxyList.length)];
//   console.log(randomProxy);
//   const browser = await puppeteer.launch({
//     headless: process.env.NODE_ENV === "development" ? false : true,
//     args: [
//       "--disable-setuid-sandbox",
//       "--no-sandbox",
//       "--single-process",
//       "--no-zygote",
//       "--disable-blink-features=AutomationControlled",
//       // "--proxy-server=http://162.23.125.34:8080",
//       // `--proxy-server=http://${randomProxy}`,
//     ],
//     userDataDir:
//       process.env.NODE_ENV === "development"
//         ? "C:/Users/Remi/AppData/Local/Google/Chrome/User Data"
//         : null,
//     executablePath:
//       process.env.NODE_ENV === "development"
//         ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
//         : null,
//   });

//   const page = await browser.newPage();

//   await page.setUserAgent(
//     // "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
//     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36"
//   );
//   await page.setViewport({ width: 1280, height: 800 });
//   await page.setJavaScriptEnabled(true);

//   console.log("🔍 Searching for jobs...");

//   // Go to Google Jobs Search
//   await page.goto(
//     `https://www.google.com/search?q=${encodeURIComponent(
//       queryData +
//         " site:linkedin.com OR site:indeed.com OR site:researchgate.net OR site:glassdoor.com OR site:academia.edu OR site:x.com OR site:google.com"
//       // " site:findaphd.com OR site:jobs.ac.uk/phd"
//     )}`,
//     {
//       waitUntil: "networkidle2",
//     }
//   );

//   await page.waitForTimeout(3000 + Math.random() * 6000);
//   await page.mouse.move(200 + Math.random() * 100, 200 + Math.random() * 100);
//   await page.keyboard.press("ArrowDown");

// // Wait for search results to load
// await page.waitForSelector("body"); // Make sure the body is fully loaded

// // Dynamically extract job titles by selecting heading tags like h1, h2, h3, etc.
// const jobs = await page.evaluate(() => {
//   const jobElements = Array.from(
//     document.querySelectorAll(
//       "h1, h2, h3, h4, h5, h6, .job-title, .job-listing"
//     ) // Dynamically target heading tags and classes
//   );

//   return jobElements
//     .map((el) => {
//       const link = el.closest("a")?.href; // Get job post URL
//       return { title: el.innerText.trim(), link };
//     })
//     .filter((job) => job.link); // Ensure links are present
// });

// console.log("✅ Found Jobs:", jobs);

//   let jobDetails = [];

//   for (let job of jobs) {
//     const jobPage = await browser.newPage();
//     try {
//       console.log(`🔎 Scraping job: ${job.title}`);

//       await jobPage.goto(job.link, { waitUntil: "domcontentloaded" });

//       // Extract job description and requirements dynamically using multiple possible selectors
//       const jobData = await jobPage.evaluate(() => {
//         let description =
//           document.querySelector(
//             "p, .description, .job-desc, .jobDescriptionContent"
//           )?.innerText || "No description available";

//         let requirements =
//           document.querySelector(".qualifications, .requirements, .req-list")
//             ?.innerText || "No requirements listed";

//         return { description, requirements };
//       });

//       jobDetails.push({
//         title: job.title,
//         link: job.link,
//         description: jobData.description,
//         requirements: jobData.requirements,
//       });

//       await jobPage.close();
//     } catch (error) {
//       console.log(`⚠️ Error scraping ${job.title}:`, error.message);
//     }
//   }

//   console.log("📌 Final Job Listings:", jobDetails);
//   // await browser.close();

//   return jobDetails; // ✅ Return the job details
// };

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
      <p style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
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
      </p>`;
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

app.get("/", (req, res) => {
  res.send("Job Scraper is running...");
});

app.get("/health", (req, res) => {
  res.status(200).send("Job Health Ping");
});

// npm install random-useragent
// const randomUseragent = require('random-useragent');
// randomUseragent.getRandom(); // gets a random user agent string

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
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
