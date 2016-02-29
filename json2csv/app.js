#!/usr/bin/env node

var json2csv = require('json2csv');
var path = require('path');
var https = require('https');
var Q = require('q');
var sourceDir = './data/';
var destDir = './csv/';
var mergeOpt = 'false';
var convertOpt = 'false';
var validateOpt = 'false';
//var destDir = './csv/';
var mergeOpt = 'false';
var classesOpt = [];
var labelsOpt = [];
var swapOpt = 'false';
var filterOpt = 'false';
var downloadOpt = 'false';
var upperOpt = 0;
var cutOpt = 0;
var pkg = require(path.join(__dirname, 'package.json'));

// Parse command line options
var program = require('commander');

var FileUtility = function(program) {
  var self = this;
  this.source = program.source || sourceDir;
  this.dest = program.output || destDir;
  this.merge = program.merge || mergeOpt;
  this.convert = program.convert || convertOpt;
  this.classes = program.classes || classesOpt;
  this.upper = program.upper || upperOpt;
  this.swap = program.swap || swapOpt;
  this.labels = program.labels || labelsOpt;
  this.validate = program.validate || validateOpt;
  this.filter = program.filter || filterOpt;
  this.download = program.download || downloadOpt;
  this.cut = program.cutrows || cutOpt;

  this.run = function() {
    if (this.merge === "true") {
      this.mergeFiles();
    } else if (this.swap === "true") {
      if ((this.labels === []) || (this.labels.length != 2))   {
        console.log('Missing pair of labels to be swapped');
        throw new Error("Missing pair of labels to be swapped");
      }
      this.swapLabels();
    } else if (this.validate === "true") {
      this.countFields();
    } else if (this.filter === "true") {
      this.filterFields();
    } else if (this.convert === "true") {
      this.doConvert();
    } else if (this.download === "true"){
      this.downloadAndStore();
    }
    else {
      console.log('Missing valid command');
      throw new Error("Missing valid command");
    }
  };


  this.downloadAndStore = function() {
    var fs = require('fs');
    var querystring = require('querystring');
    var deferred = Q.defer();
    var url = "demo-project-andreadp.c9.io";

    // Check the directory has been set then create it
    if (this.dest !== "undefined" || this.dest !== null) {
          if (!fs.existsSync(this.dest)) {
              fs.mkdirSync(__dirname + '/' + this.dest);
          }
    }

    // Invoke the REST service on the online server to download the data
    var params = querystring.stringify({
          user: 'adp'
        });

    var postheaders = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(params)
    };

    var options = {
      host: url,
      port: 8080,
      path: '/api/download',
      method: 'POST',
      headers: postheaders,
      encoding: null
    };

    var file = fs.createWriteStream(__dirname + '/' + this.dest + '/' + 'backup.tar.gz');

    var req = https.request(options, function(res) {
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.pipe(file);

      // OR add the encoding to each write
      res.on('finish', function () {
        file.close();
        console.log('BODY: ' + chunk);
        deferred.resolve("OK");
      });

      res.on('error', function (err) {
        console.log('ANDYError: ' + err.message);
        deferred.reject(err);
      });
    });

    req.write(params);
    req.end();

    // uncompress and untar the downloaded data

    // Finish the procedure
    return deferred.promise;
  };

  // Scan the directory in which the script was called. It will
  // add the 'files/' prefix to all files and folders, so that
  // download links point to our /files route

  this.doConvert = function() {
    var fs = require('fs');

    fs.readdir(this.source, function(err, files) {
      console.log('Starting reading dir');
      if (err) {
        console.log('Error caught: ' + err);
        throw err;
      }
      var LineByLineReader = require('line-by-line');
      var c = 0;

      var filterFiles = function(fileName) {
        var re = /^acceleration\.data\.log\./;

        console.log("filename: " + fileName + " " + re.test(fileName));
        return (re.test(fileName));
      };

      if (self.upper > 0) {
        files = files.splice(0, self.upper);
      }

      files.filter(filterFiles).forEach(function(file) {
        var buffer = '';
        var count = 0;
        var fileCounter = 0;

        console.log('File name: ' + self.source + file);
        console.log('Row limit: ' + self.cut);
        var lr = new LineByLineReader(self.source + file);

        lr.on('error', function(err) {
          console.log('Caugth error: ' + err);
        });

        lr.on('line', function(line) {
          // pause emitting of lines...
          lr.pause();
          try {
            count++;
            lineJSON = JSON.parse(line);
            buffer += (lineJSON.x / -9.81) + "," + (lineJSON.y / -9.81) + "," +
              (lineJSON.z / -9.81) + "," + lineJSON.timestamp + "," +
              lineJSON.trainingLabel + "\n";

            if ((self.cut >= 0) && ((count % self.cut) === 0)) {
              console.log('going to write intermediate file');
              var finalBuffer = "x,y,z,timestamp,label\n" + buffer;
              fs.writeFile(self.dest + file + "_"+ (++fileCounter) + ".csv", finalBuffer,
                  function(err) {
                    if (err) throw err;
                    console.log('intermediate file saved');
                    buffer = '';
                  });
            }
          } catch (ex) {
            console.log('Caugth exception on file: ' + file + ' at line: ' + count);
            //throw (ex);
          }
          lr.resume();
        });

        lr.on('end', function() {
          // All lines are read, file is closed now
          var finalBuffer = "x,y,z,timestamp,label\n" + buffer;
          if (!fs.existsSync(self.dest)){
              fs.mkdirSync(self.dest);
          }
          fs.writeFile(self.dest + file + ".csv", finalBuffer,
              function(err) {
                if (err) throw err;
                console.log('file saved');
              });
          });
      });
    });
  };

  function sortByKey(array) {
    console.log('Sort by file name: ' + array);

    return array.sort(function(a, b) {
      // Extract file number from the file name
      var x = parseInt((a.match(/\d+/g) !== null) ? a.match(/\d+/g)[0] : 0);
      var y = parseInt((b.match(/\d+/g) !== null) ? b.match(/\d+/g)[0] : 1);
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
  }

  this.swapLabel = function(file, callback) {
    console.log('Swap Labels');
    var LineByLineReader = require('line-by-line');
    //var deferred = Q.defer();
    var fs = require('fs');
    var buffer = "";
    var fileCount = 0;
    var count = 0;

    console.log("File name: " + file);
    if (file.match(/\.csv$/g) !== null) {
      try {
        var lr = new LineByLineReader(self.source + file);
        var sourceLabel = self.labels[0];
        var destLabel = self.labels[1];
        console.log("Source label: " + sourceLabel + " Dest label: " + destLabel);

        lr.on('error', function(err) {
          // 'err' contains error object
          console.log('Error XXX: ' + count);
          callback("Error: " + err);
        });

        lr.on('line', function(line) {
          // pause emitting of lines...
          lr.pause();
          var newLine = '';

          try {
            buffer += line.replace(sourceLabel, destLabel) + "\n";
          } catch (ex) {
            console.log('Caugth exception at line: ' + newLine);
            throw (ex);
          }

          lr.resume();
        });

        lr.on('end', function() {
          // All lines are read, file is closed now
          fs.writeFile(self.dest + file, buffer, function(err) {
            if (err) throw err;
            console.log('file saved');
            callback();
          });
        });
      } catch (ex) {
        console.log('Error ');
      }
    }
  };


  this.swapLabels = function() {
    var fs = require('fs');

    fs.readdir(self.source, function(err, files) {
      console.log('Found files:' +files);
      if (err) {
        console.log('Error caught: ' + err);
        throw err;
      }
      files = sortByKey(files);

      // Include the async package
      // Make sure you add "async" to your package.json
      var async = require("async");
      var firstFile = '';

      // 1st para in async.each() is the array of items
      async.each(files, self.swapLabel,
        // 3rd param is the function to call when everything's done
        function(results) {
          console.log("Done!");
        });
    });
  };


  this.moveFirst = function(file) {
    var fs = require('fs');
    var deferred = Q.defer();

    console.log('Move first file name: ' + self.source + file);
    try {
      var source = fs.createReadStream(self.source + file);
      var dest = fs.createWriteStream(self.dest + file);

      source.pipe(dest);
      source.on('end', function() {
        deferred.resolve("Completed");
      });
      source.on('error', function(err) {
        deferred.reject("Error");
      });
    } catch (ex) {
      console.log('Error moving the first file to: ' + self.dest + file);
      deferred.reject("Error: " + ex);
    }
    return deferred.promise;
  };

  this.filterFilesByClass = function(file, callback) {
    var LineByLineReader = require('line-by-line');
    var fs = require('fs');
    console.log("Filter file name: " + file);

    var count = 0;
    try {
      var lr = new LineByLineReader(self.source + file);

      lr.on('error', function(err) {
        // 'err' contains error object
        console.log('Error XXX: ' + count + " err=" + err);

      });

      lr.on('line', function(line) {
        // pause emitting of lines...
        //lr.pause();

        if (count === 0) {
          buffer = line;
          //console.log(self.classes.length);
          var responseAsync = true;
          if (self.classes.length > 0) {
            var fields = buffer.split(',');
            var lastField = fields[fields.length - 1].replace(
              /[\n\r]+/g, '').trim();
            if (lastField !== 'class') {
              console.log(self.classes.indexOf(lastField) > -1);

              responseAsync = (self.classes.indexOf(lastField) > -1);
            } else {
              //lr.resume
            }
          }
          count++;
          callback(responseAsync);
        }

      });

      lr.on('end', function() {
        // All lines are read, file is closed now

      });
    } catch (ex) {
      console.log('Error ');
    }
  };

  this.setBaseDir = function(files, dir) {
    files.forEach(files, function(file) {
      return dir + "/" + file;
    });
  };

  this.stripLines = function(files, type, sourceDir, destDir, deferred) {
    var LineByLineReader = require('line-by-line');
    var fs = require('fs');
    var fileCount = 0;

    console.log('Stripping ' + type);
    files.forEach(function(file) {
      console.log("File name: " + file);
      var count = 0;

      try {
        var buffer = "";
        var lr = new LineByLineReader(sourceDir + file);

        lr.on('error', function(err) {
          // 'err' contains error object
          console.log('Error XXX: ' + count);
          deferred.reject("Error: " + err);
        });

        lr.on('line', function(line) {
          // pause emitting of lines...
          lr.pause();

          if (type === 'header') {
            if (count !== 0) {
              buffer += line + "\n";

            } else {
              //lr.resume
              count++;
            }
          } else if (type === 'blank') {

            if (line !== '') {
              buffer += line + "\n";
            }
            count++;
          }
          lr.resume();
        });

        lr.on('end', function() {
          // All lines are read, file is closed now
          fs.writeFile(destDir + file, buffer, function(err) {
            if (err) throw err;
            fileCount++;
            //console.log(fileCount);
            if (fileCount === files.length) {
              console.log('completed');
              deferred.resolve("Completed");
            }
          });
        });
      } catch (ex) {
        console.log('Error ');
      }
    });
    return deferred.promise;
  };

  this.countFields = function() {
    var LineByLineReader = require('line-by-line');
    var fs = require('fs');
    var deferred = Q.defer();
    var rowNumber = 0;

    console.log('Read source file: ' + self.source);
    try {
      var lr = new LineByLineReader(self.source);

      lr.on('error', function(err) {
        console.log('Error XXX: ' + count);
      });

      lr.on('line', function(line) {
        var countFields = line.split(",").length;
        console.log("Row: " + (rowNumber++) + " Num Fields: " +
          countFields);
      });

      lr.on('end', function() {});
    } catch (ex) {
      console.log('Error ' + ex);
    }
    return deferred.promise;
  };

  this.filterFields = function() {
    var LineByLineReader = require('line-by-line');
    var fs = require('fs');
    var deferred = Q.defer();
    var rowNumber = 0;
    var buffer = '';

    console.log('Read source file: ' + self.source);
    try {
      var lr = new LineByLineReader(self.source);

      lr.on('error', function(err) {
        console.log('Error XXX: ' + err);
      });

      lr.on('line', function(line) {
        var fields = line.split(",");
        var deletedFields = fields.splice(11, 34);
        var newLine = fields.join(",") + "\n";
        buffer += newLine;
        console.log(fields.length);
      });

      lr.on('end', function() {
        // All lines are read, file is closed now
        fs.writeFile(self.dest, buffer, function(err) {
          if (err) throw err;
          console.log('file saved');
        });
      });
    } catch (ex) {
      console.log('Error ' + ex);
    }
    return deferred.promise;
  };

  this.mergeFiles = function() {

    // File concatenation facility
    var buildify = require('buildify');
    var fs = require('fs');

    fs.readdir(self.source, function(err, files) {
      //console.log('Starting reading dir');
      if (err) {
        console.log('Error caught: ' + err);
        throw err;
      }
      files = sortByKey(files);

      if (self.upper > 0) {
        files = files.splice(0, self.upper);
      }
      // Include the async package
      // Make sure you add "async" to your package.json
      var async = require("async");
      var firstFile = '';

      // 1st para in async.each() is the array of items
      async.filter(files, self.filterFilesByClass,
        // 3rd param is the function to call when everything's done
        function(results) {
          console.log("completed!");
          console.log("Results " + results);
          self.moveFirst(results[0])

          .then(function() {
              var deferred = Q.defer();
              console.log("Stripping headers...");
              firstFile = results.splice(0, 1);
              console.log("files length: " + results.length);
              self.stripLines(results, 'header', self.source, self.dest,
                deferred);
              return deferred.promise;
            })
            .then(function() {
              var deferred = Q.defer();
              console.log("Compacting data files...");
              try {
                buildify()
                  .setDir(self.dest)
                  .load(firstFile)
                  .concat(results)
                  .save('./output.csv');
                console.log("Completed.");
                deferred.resolve("Resolved");
              } catch (ex) {
                console.log("ERROR" + ex);
                throw ex;
              }
              return deferred.promise;
            })
            .then(function() {
              var deferred = Q.defer();
              console.log("Stripping blank lines...");
              self.stripLines(['output.csv'], 'blank', self.dest,
                self.dest, deferred);
              return deferred.promise;
            })
            .finally(function() {
              var deferred = Q.defer();
              console.log("Removing temporary moved files...");
              async.each(files,
                  // 2nd param is the function that each item is passed to
                  function(file, callback){
                    // Check whether the file is output.csv otherwise remove it
                    console.log("Removing temporary file: " + file);
                    if (file !== 'output.csv') {
                      fs.unlink(self.dest + file, function (){
                        console.log(">>>>> Removed temporary file: " + file);
                        callback();
                      });
                    };
                  },
                  // 3rd param is the function to call when everything's done
                  function(err){
                    // All tasks are done now
                    if (err) throw err;
                    console.log(">>>>> Finished to remove temporary files");
                  }
            );
          });
        });
      });
    };
};

program
  .version(pkg.version)
  .option('-s, --source <path_to_source_files>',
    'Source directory for data files')
  .option('-o, --output <path_to_output_files>',
    'Target directory for output files')
  .option('-t, --cutrows <max_num_of_rows_to_store_csv_file>',
    'The maximum number of rows to be stored in the csv file. If a data file is larger than is split in multiple csv files', parseInt)
  .option('-u, --upper <max_num_of_files_to_load>',
    'The maximum files to be loaded', parseInt)
  .option('-c, --classes <classes_to_be_loaded>',
    'The name of labels of the classes to be loaded',
    function list(val) {
      return val.split(',');
    })
  .option('-x, --convert <convert_command>',
        'Get the source files with raw data and convert it from json to csv')
  .option('-m, --merge <merge_command>',
    'Get the source files with calculated features merged into a single compound file'
  )
  .option('-l, --labels <labels_to_be_changed>', 'The name of labels of to swap',
    function list1(val) {
      return val.split(',');
    })
  .option('-v, --validate <validate_the_feature_file>',
    'Run a count of the number of field for each data row')
  .option('-w, --swap <swap_command>',
    'Swap the label into the source files with the new one and store into output dir'
  )
  .option('-f, --filter <filter_command>',
    'Filter out columns from the source files')
  .option('-d, --download <download>',
      'Download data from the online server and store into data directory with timestamp')
  .parse(process.argv);

var utility = new FileUtility(program);
utility.run();
