const Crawler = require("crawler");
const { response } = require("express");
const fs= require("fs");

// var c = new Crawler({
//     rateLimit: 1000, // `maxConnections` will be forced to 1
//     callback: function(err, res, done){
//         console.log(res.$("title").text());
//         done();
//     }
// });
 
const GetSitemapLinks = require("get-sitemap-links").default;

(async () => {
  const array = await GetSitemapLinks(
    "https://aem65-qa.ncr.com/sitemap.xml"
  );
  console.log(array.length);
  await fs.writeFileSync("sitemap.txt",array);
})();


// // c.queue(tasks);//between two tasks, minimum time gap is 1000 (ms)
// c.queue({
//     uri:"https://aem65-qa.ncr.com"
// });