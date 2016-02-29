#!/usr/bin/env node

var json2csv = require('json2csv');
var path = require('path');
var Q = require('q');
var sourceDir = './data/';
var destDir = './csv/';
var mergeOpt = 'false';
var convertOpt = 'false';
var validateOpt = 'false';
var destDir = './csv/';
var mergeOpt = 'false';
var classesOpt = [];
var labelsOpt = [];
var swapOpt = 'false';
var filterOpt = 'false';
var upperOpt = 0;
var pkg = require(path.join(__dirname, 'package.json'));

cd /Hacking/codehacks/json2csv
// Download online data from the server
node app.js -o './data-28-02-2016/' -d 'true'

// Run convert json data to csv for all the directories starting with 'data'
// TASK: the first file is longer than the others for a registration, and is incompatible with calculations.
node app.js -s './data-10-08-2015/' -o './csv-10-08-2015/' -x 'true' -t 200
node app.js -s './data-13-06-2015/' -o './csv-13-06-2015/' -x 'true' -t 200

cd ../prepare_raw

// Creare features for all the csv files in the directories starting with 'csv'.
./prepare.m -s ../json2csv/csv-10-08-2015/ -o ./output-10-08-2015/ -c FEATURES -m HV
./prepare.m -s ../json2csv/csv-13-06-2015/ -o ./output-13-06-2015/ -c FEATURES -m HV
./prepare.m -s ../json2csv/csv-01-06-2015/ -o ./output-01-06-2015/ -c FEATURES -m HV // to be eliminated

mkdir ./temp_output

cp "./output-10-08-2015/feature*.cvs"
node ../json2csv/app.js -s output-26-02-2016/ -o merged/ -m true

// Create a new version of the training file for the first classificator
node ../json2csv/app.js -s merged/ -o merged/ -w true -l Drive,Steady

// Create a new version of the training file for the first classificator
node ../json2csv/app.js -s merged/ -o merged/ -w true -l Walk,Move

// Create a new version of the training file for the first classificator
node ../json2csv/app.js -s merged/ -o merged/ -w true -l Run,Move

// Create a new version of the training file for the first classificator
node ../json2csv/app.js -s merged/ -o merged/ -w true -l Stop,Steady

rm -R ./temp_output
