const rp = require("request-promise");
const cheerio = require('cheerio');
let restify = require('restify');
const server = restify.createServer();

String.prototype.format = function() {
  let a = this;
  for (let k in arguments) {
    a = a.replace("{" + k + "}", arguments[k]);
  }
  return a;
}

let str = '#body > table > tbody >\
              tr:nth-child(1) > td >\
              table:nth-child(3) > tbody >\
              tr > td:nth-child(2) > table >\
              tbody > tr:nth-child({0}) > td:nth-child({1})';


server.get("/:courseCode", function (req, res, next) {
  rp("http://www.sis.itu.edu.tr/tr/ders_programlari/LSprogramlar/prg.php?fb={0}".format(req.params.courseCode))
    .then( function (html) {
      const $ = cheerio.load(html);
      let data = {};
      for(let i = 3; $(str.format(i ,1)).text();i++)
      {
        let crn = $(str.format(i,1)).text();
        data[crn] = {};
        data[crn].capacity = $(str.format(i,9)).text();
        data[crn].enrolled = $(str.format(i,10)).text();
      }
      res.json(data);
    }
  );
});

server.get("/:courseCode/:crn", function (req, res, next) {
  rp("http://localhost/{0}".format(req.params.courseCode))
    .then( function (data) {
      data = JSON.parse(data);
      //console.log(data);
      let ans = {};
      for(let crn in data)
      {
        if ( ! data.hasOwnProperty(crn)) continue;
        
        if(req.params.crn == crn)
        {
          ans = data[crn];
          ans.crn = crn;
        }
      }
      res.json(ans);
    }
  );
});

server.listen(80);
