const fs = require("fs");
const GetSitemapLinks = require("get-sitemap-links").default;
const puppeteer = require("puppeteer");
// const sitemapUrl = "https://aem65-qa.ncr.com/sitemap.xml";

// fetch sitemap of website
async function sitemapFetch() {
  // const sitemapArray = await GetSitemapLinks(sitemapUrl);
  const sitemapArray=["http://127.0.0.1:5500/index.html",
  "https://aem65-qa.ncr.com/privacy/privacy-page-russian"]
  console.log(sitemapArray.length);
  // await fs.writeFileSync("sitemap.txt", sitemapArray);
  return sitemapArray;
}

// open each page from Sitemap and fetch href on each page and save in data.json
async function grabAllLink(page, link) {
  // Storing the JSON format data in myObject
  var data = fs.readFileSync("data.json");
  var myObject = JSON.parse(data);

  // fetch all Href on page
  const hrefs = await page.$$eval("a", (list) => list.map((elm) => elm.href));
  console.log(hrefs);
  myObject.push({ page: link, links: hrefs });
  // Writing to our JSON file
  var newData2 = JSON.stringify(myObject);
  fs.writeFile("data.json", newData2, (err) => {
    // Error checking
    if (err) throw err;
    console.log("New data added");
  });
}

// traverse Sitemap using puppeteer
async function traverseSitemap() {
  const sitemap = await sitemapFetch();
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  for (const link of sitemap) {
    console.log(link);
    // visit the page
    await page.goto(`${link}`, { waitUntil: "networkidle2" });
    await grabAllLink(page, link);
  }
}

traverseSitemap();

module.exports.traverseWebsite = traverseSitemap;
