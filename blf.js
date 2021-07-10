var fs = require("fs");
const ObjectsToCsv = require("objects-to-csv");
var request = require("request");
var successLinkSet = new Set();
var i = 1;
var brokenlinks = [];
var ignoreUrl = ["linkedin", "test", "Test", "prototype"];
function getLinkAndHit() {
  fs.readFile("data.json", async (err, data) => {
    if (err) throw err;
    let links = JSON.parse(data);
    for (const link of links) {
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
          "====== Testing, prototype or linkedin page ======" +
            basePage +
            "======================"
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
              "====== linkedin page Skipped======" +
                pageUrl +
                "======================"
            );
          } else {
            if (!successLinkSet.has(pageUrl)) {
              await new Promise((resolve) => setTimeout(resolve, 800));
              isBroken(pageUrl, basePage);
            } else {
              console.log("skipped");
            }
          }
        }
      }
    }
    ConvertToCsv();
  });
}

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
        brokenlinks.push({ sno: i, link: url, page: page });
        console.log(
          "status code: " +
            statusCode +
            " Page url: " +
            url +
            "-- base page " +
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
  const BrokenlinkCSV = new ObjectsToCsv(brokenlinks);
  await BrokenlinkCSV.toDisk(`brokenlink123.csv`);
  console.log(await BrokenlinkCSV.toString());
  // zipper.sync.zip("./images").compress().save(`Ncr_com_brokenlink_${date.getDate()+"-"+String(parseInt(date.getMonth())+1)+"-"+date.getFullYear()}.zip`);
}

getLinkAndHit();

module.exports.getLinkAndHit = getLinkAndHit;

// var url = 'http://www.allaboutcookies.org/manage-cookies/' // input your url here
// function isBroken(url){
// // use a timeout value of 10 seconds
// var timeoutInMilliseconds = 10*1000
// var opts = {
//   url: url,
//   timeout: timeoutInMilliseconds
// }

// request(opts, function (err, res, body) {
//   if (err) {
//     console.dir(err)
//     return
//   }
//   var statusCode = res.statusCode
//   console.log('status code: ' + statusCode)
// })
// }

// function openPage(data){
//     for(const links of data){
//         // console.log(links[1]);
//         let arr = links[1];
//         const obj = JSON.parse(arr);
//         console.log(obj.count);
//         // for(const link of links){
//         //     console.log(link[1]);

//         // }
//         // isBroken(link[0]);
//     }
// }
