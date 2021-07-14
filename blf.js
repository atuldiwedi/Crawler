const fs = require("fs");
const ObjectsToCsv = require("objects-to-csv");
const request = require("request");
let successLinkSet = new Set();
let i = 1;
let brokenlinks = [];
// List of ingnore url
const ignoreUrl = ["linkedin", "test", "Test", "prototype"];

// get link from data.json
function getLinkAndHit() {
  fs.readFile("data.json", async (err, data) => {
    if (err) throw err;
    let links = JSON.parse(data);
    for (const link of links) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      console.log("--------" + link.page + "----------------");
      let basePage = link.page;
      if (
        ignoreUrl.some((ele) => {
          console.log(ele, basePage.search(ele));
          if (basePage.search(ele) > -1) {
            return true;
          }
        })
      ) {
        console.log(
          "====== Ignored ======" + basePage + "======================"
        );
      } else {
        for (const pageUrl of link.links) {
          if (
            ignoreUrl.some((ele) => {
              if (pageUrl.search(ele) > -1) {
                return true;
              }
            })
          ) {
            console.log(
              "====== ignored ======" + pageUrl + "==================="
            );
          } else {
            if (!successLinkSet.has(pageUrl)) {
              await new Promise((resolve) => setTimeout(resolve, 800));
              isBroken(pageUrl, basePage);
            } else {
              console.log("Already checked");
            }
          }
        }
      }
    }
    console.log(brokenlinks);
    ConvertToCsv();
  });
}

// check the page is broken or not
async function isBroken(url, page) {
  // use a timeout value of 10 seconds
  var timeoutInMilliseconds = 10 * 1000;
  var opts = {
    url: url,
    timeout: timeoutInMilliseconds,
  };

  await request(opts, function (err, res, body) {
    try {
      if (err) {
        // console.dir(err)
        return;
      }
      var statusCode = res.statusCode;
      if (statusCode === 200) {
        successLinkSet.add(url);
        console.log("status code: " + statusCode + " Page url: " + url);
      } else {
        var brokenLinkJson = fs.readFileSync("brokenlink.json");
        var myObject = JSON.parse(brokenLinkJson);
        brokenlinks.push({ sno: i, link: url, page: page });
        myObject.push({ sno: i, link: url, page: page });
        // Writing to our JSON file
        var newData2 = JSON.stringify(myObject);
        fs.writeFile("brokenlink.json", newData2, (err) => {
          // Error checking
          if (err) throw err;
        });
        console.log(
          "status code: " +
            statusCode +
            " Page url: " +
            url +
            " -- base page " +
            page
        );
        i++;
      }
    } catch (e) {
      console.log(e);
    }
  });
}

// create new CSV File and make Zip of Images and csv
async function ConvertToCsv() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const BrokenlinkCSV = new ObjectsToCsv(brokenlinks);
  await BrokenlinkCSV.toDisk(`brokenlink.csv`);
  console.log(await BrokenlinkCSV.toString());
  // zipper.sync.zip("./images").compress().save(`Ncr_com_brokenlink_${date.getDate()+"-"+String(parseInt(date.getMonth())+1)+"-"+date.getFullYear()}.zip`);
}

getLinkAndHit();

module.exports.getLinkAndHit = getLinkAndHit;
