var fs = require('fs');
var csv = require('csv-parse');
const ObjectsToCsv = require('objects-to-csv');
const puppeteer = require('puppeteer');
const zipper = require("zip-local");
const date = new Date();

var inputFile='brokenlink123.csv';
var data = [];
var newData=[];

// Read CSV file with name brokenlink.csv
function TakeScreenShots(){
  fs.createReadStream(inputFile)
    .pipe(csv())
    .on('data', function (row) {
      data.push(row)
    })
    .on('end', function () {
      console.log('Data loaded')
      openPage(data);
    })
}

// Function to open page and Take Screenshots
async function openPage(data){
    const browser = await puppeteer.launch({headless:true});
    const page = await browser.newPage();
    // Adjustments particular to this page to ensure we hit desktop breakpoint.
    page.setViewport({width: 1366, height: 800, deviceScaleFactor: 1});
    for(const link of data){
      try{
          await page.goto(`${link[2]}`, {waitUntil: 'networkidle2'});
          let pathName = link[2].split("/");

          async function screenshotDOMElement(opts = {}) {
              const padding = 'padding' in opts ? opts.padding : 0;
              const path = 'path' in opts ? opts.path : null;
              const selector = `a[href='${link[1]}']`;
              if (!selector)
                  throw Error('Please provide a selector.');
              console.log(link[0]+". Page : "+link[2]);
              const rect = await page.evaluate(selector => {
                  const element = document.querySelector(selector);
                  if (!element)
                      return null;
                  
                  // Highlight Element
                  element.style.color="red";
                  element.style.backgroundColor="yellow";
                  const {x, y, width, height} = element.getBoundingClientRect();
                  return {left: x, top: y, width, height, id: element.id};
              }, selector);

              if (!rect){            
                  newData.push({'Sno':link[0],'link':link[1],'page':link[2],'Selector':selector,'Screenshot':'No'});
                  throw Error(`Could not find element that matches selector: ${selector}.`);
              }
              else{
                newData.push({'Sno':link[0],'link':link[1],'page':link[2],'Selector':selector,'Screenshot':'Yes'});
              }

              return await page.screenshot({
                  path,
                  clip: {
                      x: rect.left - padding,
                      y: rect.top - padding,
                      width: rect.width + padding * 10,
                      height: rect.height + padding * 10
                  }
        });
    }

    await screenshotDOMElement({
        path: `./images/Screenshots/${link[0]+" "+pathName[pathName.length-1]}.png`,
        selector: 'header aside',
        padding: 50
    });}
    catch(e){
      continue;
    }
  }
  // create new CSV File and make Zip of Images and csv
  (async ()=>{
    const BrokenlinkCSV = new ObjectsToCsv(newData);
    await BrokenlinkCSV.toDisk(`./images/Ncr_com_brokenlink_${date.getDate()+"-"+String(parseInt(date.getMonth())+1)+"-"+date.getFullYear()}.csv`);
    console.log(await BrokenlinkCSV.toString());
    zipper.sync.zip("./images").compress().save(`Ncr_com_brokenlink_${date.getDate()+"-"+String(parseInt(date.getMonth())+1)+"-"+date.getFullYear()}.zip`);
  })();
    browser.close();
};

TakeScreenShots();
module.exports.TakeScreenShots = TakeScreenShots;