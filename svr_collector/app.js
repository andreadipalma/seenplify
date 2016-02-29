var express = require('express');
var fs = require('fs');
var	path = require('path');
var logger = require('morgan');
var cl_services = require('./collector-modules/cl_services');
var formidable = require('formidable');
var http = require("http");
var util = require('util');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(logger('combined'));  /* 'default', 'short', 'tiny', 'dev' */
//app.use(express.bodyParser()), //da capire che fa
//app.use(express.static(path.join(__dirname, 'html')));


http.createServer(app).listen(app.get('port'), function () {
                              console.log("Express server listening on port " + app.get('port') + " YEAH!!!");
                              //print("Arrived!");
                              });

// route to pages
app.use('/form', function (request, response) {
        console.log("request starting...");
        display_form(request, response);
        });


// route to pages
app.use('/html', function (request, response) {
        console.log("request starting...");
        var filePath = './html' + request.url;
        if (filePath == './html/')
		filePath += 'index.html';
        
        console.log(filePath);
        var extname = path.extname(filePath);
        var contentType = 'text/html';
        switch (extname) {
		case '.js':
        contentType = 'text/javascript';
        break;
		case '.css':
        contentType = 'text/css';
        break;
        }
        
        fs.exists(filePath, function(exists) {
                  if (exists) {
                  fs.readFile(filePath, function(error, content) {
                              if (error) {
                              response.status(500).send();
                              }
                              else {
                              response.set('Content-Type', 'text/html');
                              response.status(200).send(content);
                              }
                              });
                  }
                  else {
                  response.status(404).send();
                  }
                  });
        });

// route to REST services
app.post('/api/upload', function (req, res) {
         
         if (req.url == '/api/upload' && req.method.toLowerCase() == 'post') {
         // parse a file upload
         var form = new formidable.IncomingForm();
         
         form.parse(req, function(err, fields, files) {
                    res.writeHead(200, {'content-type': 'text/plain'});
                    res.write('Received upload:\n\n');
                    res.end(util.inspect(files));
                    });
         }
         return;
});

app.post('/collector/add', cl_services.addPoint);
app.get('/collector/points', cl_services.findAll);



/*
 * Display upload form
 */
function display_form(req, res) {
    res.set('Content-Type', 'text/html');
    res.status(200).send(
                 '<form action="/api/upload" method="post" enctype="multipart/form-data">'+
                 '<input type="file" name="upload-file" multiple="multiple">'+
                 '<input type="submit" value="Upload">'+
                 '</form>'
                 );
    res.end();
}

/*
 * Write chunk of uploaded file
 */
function write_chunk(request, fileDescriptor, chunk, isLast, closePromise) {
    // Pause receiving request data (until current chunk is written)
    request.pause();
    // Write chunk to file
    sys.debug("Writing chunk");
    posix.write(fileDescriptor, chunk).addCallback(function() {
                                                   sys.debug("Wrote chunk");
                                                   // Resume receiving request data
                                                   request.resume();
                                                   // Close file if completed
                                                   if (isLast) {
                                                   sys.debug("Closing file");
                                                   posix.close(fileDescriptor).addCallback(function() {
                                                                                           sys.debug("Closed file");
                                                                                           
                                                                                           // Emit file close promise
                                                                                           closePromise.emitSuccess();
                                                                                           });
                                                   }
                                                   });
}

/*
 * Handle file upload
 */
function upload_file(req, res) {
    // Request body is binary
    res.setEncoding('binary');
    //req.setBodyEncoding("binary");
    
    // Handle request as multipart
    var stream = new multipart.Stream(req);
    
    // Create promise that will be used to emit event on file close
    var closePromise = new events.Promise();
    
    // Add handler for a request part received
    stream.addListener("part", function(part) {
                       sys.debug("Received part, name = " + part.name + ", filename = " + part.filename);
                       
                       var openPromise = null;
                       
                       // Add handler for a request part body chunk received
                       part.addListener("body", function(chunk) {
                                        // Calculate upload progress
                                        var progress = (stream.bytesReceived / stream.bytesTotal * 100).toFixed(2);
                                        var mb = (stream.bytesTotal / 1024 / 1024).toFixed(1);
                                        
                                        sys.debug("Uploading " + mb + "mb (" + progress + "%)");
                                        
                                        // Ask to open/create file (if not asked before)
                                        if (openPromise == null) {
                                        sys.debug("Opening file");
                                        openPromise = posix.open("./uploads/" + part.filename, process.O_CREAT | process.O_WRONLY, 0600);
                                        }
                                        
                                        // Add callback to execute after file is opened
                                        // If file is already open it is executed immediately
                                        openPromise.addCallback(function(fileDescriptor) {
                                                                // Write chunk to file
                                                                write_chunk(req, fileDescriptor, chunk, 
                                                                            (stream.bytesReceived == stream.bytesTotal), closePromise);
                                                                });
                                        });
                       });
    
    // Add handler for the request being completed
    stream.addListener("complete", function() {
                       sys.debug("Request complete");
                       
                       // Wait until file is closed
                       closePromise.addCallback(function() {
                                                
                                                res.set('Content-Type', 'text/html');
                                                res.status(200).send("Thanks for playing!");
                                                res.finish();
                                                
                                                sys.puts("\n=> Done");
                                                });
                       });
}

/*
 * Handles page not found error
 */
function show_404(req, res) {
    res.sendHeader(404, {"Content-Type": "text/plain"});
    res.sendBody("You r doing it rong!");
    res.finish();
}
