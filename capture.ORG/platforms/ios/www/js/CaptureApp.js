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

alert("Fake break");

var app = {
    storageManager: null,
    motion: null,
    backgroundDelay: null,
    
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        try {
            this.storageManager = new LocalStorageStore();
            this.motion = new MotionManager(this.storageManager);
        } catch (ex) {
            console.log("ERROR!!! " + ex);
        }
    },
  
    showAlert: function (message, title) {
        if (navigator.notification) {
            navigator.notification.alert(message, null, title, 'OK');
        } else {
            alert(title ? (title + ": " + message) : message);
        }
    },
    
    backgroundEnable: function() {
        cordova.plugins.backgroundMode.onactivate = this.getMeasure;
    },
    
    getMeasure: function() {
        setTimeout(function () {
                   this.showAlert("Info message", "Tick passed");
                   // Modify the currently displayed notification
                   console.log("entered");
                   cordova.plugins.backgroundMode.configure({
                                                            text:'Running in background for more than 5s now.'
                                                            });
                   // Get sensor measures
                   this.motion.getAcc();
                   this.motion.getGyro();
                   // Set a new event
                   setTimeout(this.getMeasure, this.backgroundDelay);
        }, this.backgroundDelay);
        console.log("called settimeout");
    },
    
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, true);
        
    },
    
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        document.addEventListener('pause', this.onPause, false);
        document.addEventListener('resume', this.onResume, false);
        window.plugin.backgroundMode.disable();
    
        $("#coordBtn").click(function(){
                             console.log("test navigator.geolocation works well");
                             this.motion.getLocation();
                             console.log("executed geolocation command");
                             });
        
        $("#accBtn").click(function(){
                           console.log("test navigator.accelerometer works well");
                           this.motion.getAcc();
                           console.log("executed accelerometer command");
                           });
        
        $('#backBtn').bind('click', { parentObj: this }, function(e) {
                           var parentObj = e.data.parentObj;
                           // the rest of your code goes here
                           console.log("test cordova.plugins.backgroundMode works well");
                           this.backgroundEnable();
                           
                           // Change button state
                           if ($("#backBtn").text() === 'Start') {
                           $("#backBtn").changeButtonText('Stop');
                           } else {
                           $("#backBtn").changeButtonText('Start');
                           }
                           console.log("executed background mode command");
                           
                           });
        
        /*
         
         $("#backBtn").click(function(){
         console.log("test cordova.plugins.backgroundMode works well");
         this.backgroundEnable();
         
         // Change button state
         if ($("#backBtn").text() === 'Start') {
         $("#backBtn").changeButtonText('Stop');
         } else {
         $("#backBtn").changeButtonText('Start');
         }
         console.log("executed background mode command");
         });
         */


    },

    onResume: function(){
        window.plugin.backgroundMode.disable();
    },
    
    onPause: function(){
        window.plugin.backgroundMode.enable();
    },
    
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        /*
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
        console.log('Received Event: ' + id);
         */
    }
};
