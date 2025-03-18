const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");

const queryData =
  "Find PhD research job openings in Europe that require an MSc in Animal Science, Health, Production, or Agricultural Science. Prioritize opportunities that match my skills in statistical analysis (Excel, R, SQL) and laboratory expertise (PCR, biochemical analysis). Extract detailed information, including job description, requirements, application links, location, and contact details of the poster.";

const scrapeJobs = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  console.log("🔍 Searching for jobs...");

  // Go to Google Jobs Search
  await page.goto(
    `https://www.google.com/search?q=${encodeURIComponent(
      queryData +
        " site:linkedin.com OR site:indeed.com OR site:researchgate.net OR site:glassdoor.com OR site:academia.edu OR site:x.com OR site:google.com"
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
      user: "midea3671@gmail.com",
      pass: "hbkucsvqmohvuvyu",
    },
  });

  let mailOptions = {
    from: "midenotch@gmail.com",
    to: "midenotch@gmail.com", // Send to yourself for testing
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

cron.schedule("0 * /20 * * *", () => {
  console.log("⏳ Running scheduled job scraping...");
  scrapeJobs();
});

console.log("✅ Job scheduler started. It will run every 20 hours.");
