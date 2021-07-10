const fs= require("fs");
const GetSitemapLinks = require("get-sitemap-links").default;
const puppeteer = require('puppeteer');
// const brokenLinkFinder = require("./blf");

async function sitemapFetch(){
  const sitemapArray  = await GetSitemapLinks(
    "https://aem65-qa.ncr.com/sitemap.xml"
  );
  console.log(sitemapArray.length);
  await fs.writeFileSync("sitemap.txt",sitemapArray);
  return sitemapArray;
};

async function grabAllLink(page,link){
    // Storing the JSON format data in myObject
    var data = fs.readFileSync("data.json");
    var myObject = JSON.parse(data);

    const hrefs = await page.$$eval("a", (list) => list.map((elm) => elm.href));
    console.log(hrefs);
    myObject.push({"page":link,"links":hrefs})
    // Writing to our JSON file
    var newData2 = JSON.stringify(myObject);
    fs.writeFile("data.json", newData2, (err) => {
      // Error checking
      if (err) throw err;
      console.log("New data added");
    });
  
    // brokenLinkFinder.getLinkAndHit();
}

async function traverseSitemap(){
    const sitemap = await sitemapFetch();
    const browser = await puppeteer.launch({headless:true});   
    const page = await browser.newPage();
    for(const link of sitemap)
    {
        console.log(link);
        await page.goto(`${link}`, {waitUntil: 'networkidle2'});
        await grabAllLink(page,link);
    }
}

traverseSitemap();

module.exports.traverseWebsite = traverseSitemap;