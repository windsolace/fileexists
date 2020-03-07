const csv = require('csv-parser');
const fs = require('fs');
const urlExists = require('url-exists');
const Parser = require('json2csv').Parser;

console.log("Process started to check files. . .");
var startTime = process.hrtime();
var results = readCSV();
testLink(results);

/**
 * Take a excel json input and tests url
 */
function testLink(input) {
    input.then((data)=>{
        var fileCount = 0;
        var fileExists = 0;
        var fileNotExists = 0;
        var report=[];

        data.forEach(obj=>{
            // console.log(obj);
            urlExists(obj.url, (error,exists)=> {
                console.log(obj.url);
                console.log(exists);
                if(exists === true) {
                    fileExists++;
                    var readableName = obj.name.trim() ? decodeURI(obj.name) : obj.url; //use url if name is empty, for cases when testing url
                    report.push({
                        'link':'=HYPERLINK("'+obj.url+'","'+readableName+'")',
                        'exists':'O'
                    })
                }
                else {
                    fileNotExists++;
                    report.push({
                        'link':'=HYPERLINK("'+obj.url+'")',
                        'exists':'X'
                    })
                }
    
                //conclude process
                if(fileExists+fileNotExists == data.length) {
                    var endTime = process.hrtime(startTime);
                    console.log("=================================");
                    console.info(fileCount + " Files Processed");
                    console.info("Success : " + fileExists+"/"+fileCount);
                    console.info("Failed: "+fileNotExists+"/"+fileCount);
                    console.info("Time elapse: " + endTime[0] + "s");
                    console.log("=================================");

                    return new Promise((resolve,reject)=> {
                        // resolve(report);
                        generateReport(report);
                    });
                }
                
            });
            fileCount++;
           
        }); 
    })
}

/**
 * Generates CSV with 2 columns
 * - link : outputs name of uridecoded pdf file if exists, otherwise use original url
 * - exists : outputs either 'O' or 'X' to indicate whether a file/url exists
 * @param report 
 */
function generateReport(report) {
    var headers = ['link','exists'];
    var opts = {headers};
    var parser = new Parser(opts);
    var csv = parser.parse(report)

    console.log("Generating report . . .");
    fs.writeFile('report.csv',csv,'utf8', (err)=>{
        if(err) console.error("Something went wrong writing to file: " + err);
        else console.info("Report generated.");
    });
}

/**
 * Read a CSV file and return json as Promise
 */
function readCSV() {
    
    return new Promise((resolve,reject) => {
        var fileData = [];
        console.log("reading file");
        fs.createReadStream('input.csv')
        .pipe(csv())
        .on('data',(data) => {
            fileData.push(data);
        })
        .on('end', ()=> {
            console.log('csv successfully processed');
            resolve(fileData);
        })
    });
}
