var LocalStorageStore = function() {
    var accelerations = [];
    var positions = [];
    var orientations = [];
    var timeWindowHours = 10;

    this.findByTimeRange = function(type, searchKey) {
        var data = JSON.parse(window.localStorage.getItem(type));
        var results = data.filter(function(element) {
                                  var timestamp;
                                  switch (type) {
                                  case ("acceleration"):
                                    timestamp = element.timestamp;
                                  break;
                                  case ("position"):
                                    timestamp = element.timestamp;
                                  break;
                                  case ("orientation"):
                                    //timestamp = element.timestamp;
                                  break;
                                  }
                                  return checkMyDateWithinRange(timestamp) === true;
                                  });
        return results;
    };
    
    this.flush = function(type, data) {
         callLater(function() {
                    var oldData = JSON.parse(window.localStorage.getItem("acceleration"));
                    if (oldData !== null) {
                        window.localStorage.setItem(type, JSON.stringify(oldData.concat(data)));
                   } else {
                        window.localStorage.setItem(type, JSON.stringify(data));
                   }
                }, data);
    };

    // Used to simulate async calls. This is done to provide a consistent interface with stores (like WebSqlStore)
    // that use async data access APIs
    var callLater = function(callback, data) {
        if (callback) {
            setTimeout(function() {
                       callback(data);
                       });
        }
    };
        
    var checkMyDateWithinRange = function(myDate) {
            var startDate = new Date();
            var endDate = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), startDate.getHours() - this.timeWindowHours, startDate.getMinutes(), startDate.getSeconds(), startDate.getMilliseconds());

            if (startDate < myDate && myDate < endDate) {
                console.log("ok");
                return true;
            }
            console.log("false");
            return false;
    };
};