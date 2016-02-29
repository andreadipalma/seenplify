*** Capture ***
Mobile app developed with PhoneGap for IOS. Needs a MacOSX Lion SO to be dev, built an deployed on a iOS phone.
Needed to capture and memorize accelerator sensor raw event data, then to move on the remote server that archives permanently. The application tries to send data on the remote server if a connection is available. Otherwise it stores the data on a local filesystem until the connection is restored.

*** json2csv ***
The application used to perform various manipulations on the raw data. Mainly it performs:
Must be invoked with the command:
>> node app.js <commands> <parameters>
a) [To convert raw event data in json from a source dir to csv format in a output dir ]
  >> node app.js -s './data-10-08-2015/' -o './csv-10-08-2015/' -x 'true'
b) [To merge feature files from a source dir to a single file into the output dir ]
  >> node app.js -s '../prepare_raw/output-10-08-2015/' -o './../prepare_raw/output-10-08-2015/'merged' -m 'true'
b) [To swap a specific feature label into a new label from a source dir to an output file ]
    >> node app.js -s '../prepare_raw/output-10-08-2015/featureXXX.csv' -o './../prepare_raw/output-10-08-2015/featureXXX_NEW.csv' -w 'SOURCE_LABEL, DEST LABEL'


*** prepare_raw ***
The application to calculate features starting from the raw event data. Application is written with Octave.

prepare.m -s <SOURCE_FILE.csv> -o <DEST_OUTPUT> -c <TYPE_OF_OPERATION> -m <TYPE_OF_TRACE>

TYPE_OF_OPERATION = {DISPLAY | FEATURES}

TYPE_OF_TRACE = {HV | SMA}

>> ./prepare.m -s ../json2csv/csv-10-08-2015/acceleration.data.log.1439223164678.csv -o ./output-10-08-2015/ -c DISPLAY -m HV

*** data_analysis ***
TO BE DONE
