//this project aiims to find jobs available for the required profile nd location.This project will create an excel
// file that will contain all the jobs available and details like experiance , companyy name, location and also the link for the job
let url = "https://www.shine.com/";
const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

// all the npm packages that will be required in this project

//creating folder that will contain excel sheets

let jobFolPath = path.join(__dirname, "JOBS");
dirCreator(jobFolPath);

let location = process.argv.slice(2, 3);
let profile = process.argv.slice(3);

let link =
  url +
  "job-search/" +
  profile +
  "-jobs-in" +
  location +
  "?q=" +
  profile +
  "&loc=" +
  location;
console.log(link);

let input = process.argv.slice(2);

// profile name and the joblocation have been taken out from the command line input

//providing various functionality for this project
if (input[0] == "help") {
  help();
} else if (input[0] == "jobSearch") {
  request(link, cb);
} else {
}

//callback function
function cb(err, response, html) {
  if (err) {
    console.log(err);
  } else {
    //   console.log(html)
    getInfo(html);
  }
}

//get info function will scrape out all the information required for particular job types
function getInfo(html) {
  let $ = cheerio.load(html);
  let companyArray = $(".jobCard_jobCard_cName__mYnow > span");
  let ProfileArray = $('h2[itemprop="name"]');
  let locArray = $(
    ".jobCard_jobCard_lists_item__YxRkV.jobCard_locationIcon__zrWt2"
  );
  let expArray = $(".jobCard_jobCard_lists_item__YxRkV.jobCard_jobIcon__3FB1t");
  let additionalInfoArray = $(".jobCard_jobCard_jobDetail__jD82J");
  let applyLinkArray = $('meta[itemprop="url"]');

  //if no data exist then the function is returned
  if (companyArray.length == 0) {
    console.log(`No results found. Please enter diiferent location or profile`);
    return;
  }

  //this loop will iterate through each job  and will convert the binary data
  for (let i = 0; i < companyArray.length; i++) {
    let companyName = $(companyArray[i]).text();
    let jobProfile = $(ProfileArray[i]).text();
    let loc = $(locArray[i]).text();
    let experience = $(expArray[i]).text();
    let AdditionalInfo = $(additionalInfoArray[i]).text();
    let applyLink = $(applyLinkArray[i]).attr("content");

    // creating file path for the excel sheet
    let jobPath = path.join(__dirname, "JOBS", profile + "." + location);

    let filePath = path.join(jobPath + ".xlsx");

    let content = reader(filePath, profile);

    let jobObject = {
      companyName,
      jobProfile,
      loc,
      experience,
      AdditionalInfo,
      applyLink,
    };
    content.push(jobObject);
    excelWriter(filePath, content, profile);
  }
}

function excelWriter(filePath, jsonData, sheetName) {
  let newWB = xlsx.utils.book_new();
  let newWS = xlsx.utils.json_to_sheet(jsonData);

  var wscols = [
    {wch:30},
    {wch:30},
    {wch:20},
    {wch:20},
    {wch:30},
    {wch:100}
];

newWS['!cols'] = wscols;
  xlsx.utils.book_append_sheet(newWB, newWS, sheetName);
  xlsx.writeFile(newWB, filePath);
}



function reader(filePath, sheetName) {
  if (fs.existsSync(filePath) == false) {
    return [];
  }
  let wb = xlsx.readFile(filePath);
  //which excel filw to read
  let excelData = wb.Sheets[sheetName];
  //pass the sheet name
  let ans = xlsx.utils.sheet_to_json(excelData);
  //conversion from sheet to json

  return ans;
}

function help() {
  console.log(`List of all the commands->

                          1.jobSearch --> node  main.js jobSearch  locationName ProfileOfTheJob
                          (node main.js jobSearch delhi php developer)
                          
                          2. help --> node main.js help`);
}

function dirCreator(filePath) {
  if (fs.existsSync(filePath) == false) {
    fs.mkdirSync(filePath);
  }
}
