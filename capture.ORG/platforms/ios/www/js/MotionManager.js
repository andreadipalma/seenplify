/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var MotionManager = function(storageRef) {
    
    var storage = storageRef;
    
    this.startAccMonitoring = function() {
        this.accWatchID = navigator.accelerometer.watchCurrentPosition(this.onAccSuccess, this.onAccError);
    };
    
    this.stopAccMonitoring = function() {
        navigator.geolocation.clearWatch(this.accWatchID);
    };
    this.getAcc = function() {
        navigator.accelerometer.getCurrentAcceleration(this.onAccSuccess, this.onAccError);
    };
    
    this.startGyroMonitoring = function() {
        //TODO:
    };
    this.stopGyroMonitoring = function() {
        //TODO:
    };
    this.getGyro = function() {
        navigator.accelerometer.getCurrentAcceleration(this.onGyroSuccess, this.onGyroError);
    };
    this.getLocation = function() {
        navigator.geolocation.getLocation(this.onGeoSuccess, this.onGeoError);
    };
    
    this.onAccSuccess = function(acceleration){
        alert('Acceleration X: ' + acceleration.x + '\n' +
              'Acceleration Y: ' + acceleration.y + '\n' +
              'Acceleration Z: ' + acceleration.z + '\n' +
              'Timestamp: '      + acceleration.timestamp + '\n');
        this.storage.flush("acceleration", acceleration);
    };
    this.onAccError = function(acceleration){
        
    };
    this.onGeoSuccess = function(position){
        $('#geocoords').empty();
        $('#geocoords').append('Latitude: '  + position.coords.latitude      + '<br />' +
                               'Longitude: ' + position.coords.longitude     + '<br />');
        console.log("position is " + position.coords.latitude + " - " + position.coords.longitude);
        this.storage.flush("position", position);
    };
    this.onGeoError = function(position){
        
    };
    this.onGyroSuccess = function(orientation){
        $('#geocoords').empty();
        $('#geocoords').append('Latitude: '  + position.coords.latitude      + '<br />' +
                               'Longitude: ' + position.coords.longitude     + '<br />');
        console.log("position is " + position.coords.latitude + " - " + position.coords.longitude);
        this.storage.flush("position", position);
    };
    this.onGyroError = function(orientation){
        
    };
};
