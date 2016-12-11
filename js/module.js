registerController('DWallController', ['$api', '$scope', function($api, $scope) {
    $scope.running = false;
    $scope.listening = false;
    $scope.throbber = false;
    $scope.direction = 1;
    $scope.last = 0;
    $scope.cur = 0;
    $scope.enableDWall = (function() {
        $api.request({
            module: 'DWall',
            action: 'enable'
        }, function() {
            $scope.getDWallStatus();
        });
    });

    $scope.disableDWall = (function() {
        $scope.stopWS();
        $api.request({
            module: 'DWall',
            action: 'disable'
        }, function() {
            $scope.getDWallStatus();
        });
    });

    $scope.getDWallStatus = (function() {
        $api.request({
            module: 'DWall',
            action: 'getStatus'
        }, function(response) {
            $scope.running = response.running;
        });
    });

    $scope.startWS = (function() {
        $scope.throbber = true;
        $scope.ws = new WebSocket("ws://" + window.location.hostname + ":9999/");
        $scope.ws.onerror = (function() {
            $scope.ws.onclose = (function() {});
            $scope.startWS();
        });
        $scope.ws.onopen = (function() {
            $scope.ws.onerror = (function(){});
            $scope.listening = true;
            $scope.throbber = false;
        });
        $scope.ws.onclose = (function() {
            $scope.throbber = false;
            $scope.listening = false;
        });

        $scope.ws.onmessage = (function(message) {
            var data = JSON.parse(message.data);

            if (data['image'] !== undefined) {
                $("#img_container").prepend('<img src="' + encodeURI(data['image']) +'">');
            } else {
                $("#url_table").prepend("<tr><td>" + data['from'] + "</td><td></td></tr>").children().first().children().last().text(data['url']);
            }
            if (data['cookie'] !== undefined) {
                $("#cookie_table").prepend("<tr><td>" + data['from'] + "</td><td></td></tr>").children().first().children().last().text(data['cookie']);
            }
            if (data['post'] !== undefined) {
                $("#post_table").prepend("<tr><td>" + data['from'] + "</td><td></td></tr>").children().first().children().last().text(data['post']);
            }
        });
    });

    $scope.stopWS = (function() {
        if ($scope.ws !== undefined) {
            $scope.ws.onclose = (function() {});
            $scope.ws.close();
        } 
        $scope.listening = false;
    });

    $scope.$on('$destroy', function() {
        $scope.stopWS();
    });

    $scope.getDWallStatus();

    $("#img_container").css('min-height', $(".module-content").height()-50);
    $("#img_container").css('max-height', $(".module-content").height()-50);


    $scope.areEqual = (function(arr1, arr2) {
	if (arr1.constructor == Array && arr2.constructor == Array) {
		if (arr1.length == arr2.length) {
			for(var i = 0; i < arr1.length; i++) {
				if (arr1[i] != arr2[i]) {
					console.log("false")
					return false;
				}
			}
			return true;
		}		
	}
	return false;	

    });

    $scope.getPool = (function() {   
        $api.request({                                                    
            module: 'PineAP',                                                    
            action: 'getPool'                                             
        }, function(response) {                                           
            $scope.ssidPool = response.ssidPool;
	    //console.log($scope.ssids == response.ssidPool)                                 
            document.getElementById("SSIDArea").value = response.ssidPool;      
        });                                                                      
    }); 


    $scope.scrollPool = (function() {
	var area = document.getElementById("SSIDArea")
	//shift scrollview of textarea
	area.scrollTop = area.scrollTop + 1;
	// update tracking of scrolling
	$scope.last = $scope.cur;
	$scope.cur = area.scrollTop;

	if ($scope.cur == $scope.last) {
	    $scope.toTop()
	}
    });

   $scope.toTop = (function() {
	document.getElementById("SSIDArea").scrollTop = 0;
   });

   $scope.inverse = (function() {
	$scope.direction = -$scope.direction;
   });

    function log(a) {
	console.log(a)
    }

    function setPool() {
	$scope.getPool()
	var refreshId = window.setInterval($scope.getPool, 10000);
	var scrollId = window.setInterval($scope.scrollPool, 12);
    }


   $(document).ready(setPool())

}]);
