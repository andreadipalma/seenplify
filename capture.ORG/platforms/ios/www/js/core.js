
    alert("Fake break!");
    document.addEventListener("deviceready", init, false);

	function init() {
            console.log('Javascript OK');
        
			$("#coordBtn").click(function(){
				console.log("test navigator.geolocation works well");
				navigator.geolocation.getCurrentPosition(onSuccessGeo, onErrorGeo);
				console.log("executed geolocation command");		
			});
			
			$("#accBtn").click(function(){
				console.log("test navigator.accelerometer works well");
				navigator.accelerometer.getCurrentAcceleration(onSuccessAcc, onErrorAcc);
				console.log("executed accelerometer command");		
			});
        
            $("#backBtn").click(function(){
                           console.log("test cordova.plugins.backgroundMode works well");
                           cordova.plugins.backgroundMode.enable();
                           console.log("executed background mode command");
                           });
        
            function onSuccessGeo(position) {
				$('#geocoords').empty();
				$('#geocoords').append('Latitude: '  + position.coords.latitude      + '<br />' +
									   'Longitude: ' + position.coords.longitude     + '<br />');
				console.log("position is " + position.coords.latitude + " - " + position.coords.longitude);
			}

			// onError Callback receives a PositionError object
			function onErrorGeo(error) {
				alert('code: '    + error.code    + '\n' +
					  'message: ' + error.message + '\n');
				console.log("error");
			}

			function onSuccessAcc(acceleration) {
				alert('Acceleration X: ' + acceleration.x + '\n' +
						  'Acceleration Y: ' + acceleration.y + '\n' +
						  'Acceleration Z: ' + acceleration.z + '\n' +
						  'Timestamp: '      + acceleration.timestamp + '\n');					  				
				};

			function onErrorAcc() {
				alert('onError!');
			};

			var options = { frequency: 3000 };  // Update every 3 seconds
			//var watchID = navigator.accelerometer.watchAcceleration(onSuccess, onError, options);

			
			// Enable background mode
			try {
				cordova.plugins.backgroundMode.enable();
				console.log("executed background command");
			} catch (e) {
				console.log("ERROR!!! " + e);
			} 
			// Called when background mode has been activated
			 
			cordova.plugins.backgroundMode.onactivate = function () {
				setTimeout(function () {
                    alert ("Tick passed");
					// Modify the currently displayed notification
					console.log("entered");
					cordova.plugins.backgroundMode.configure({
						text:'Running in background for more than 5s now.'
					});
				}, 5000);
			}

			console.log("called settimeout");
		}
		

		// Options: throw an error if no update is received every 30 seconds.
		//
	