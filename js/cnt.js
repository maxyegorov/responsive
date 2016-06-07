var app = angular.module('responsiveViewer', []);

app.filter('renderHTMLCorrectly', function($sce)
{
	return function(stringToParse)
	{
		return $sce.trustAsHtml(stringToParse);
	}
});

app.controller('appController', function($scope, $http, $timeout) {
	  
	/*$scope.getScreens = function (){
		var responsePromise = $http.get("screens.json");

	    responsePromise.success(function(data, status, headers, config) {
	        $scope.screens = data;
			$scope.doInit();
	    });
	    responsePromise.error(function(data, status, headers, config) {
	        alert("There was an ERROR! Please try again.");
	    });
	};*/
	$scope.screens = [
		{"id":"0","label":"iPhone 4","width":"320px","height":"480px"},
		{"id":"1","label":"iPhone 4 h","width":"480px","height":"320px"},
		{"id":"2","label":"iPhone 5","width":"320px","height":"568px"},
		{"id":"3","label":"iPhone 5 h","width":"568px","height":"320px"},
		{"id":"4","label":"iPhone 6","width":"375px","height":"667px"},
		{"id":"5","label":"iPhone 6 h","width":"667px","height":"375px"},
		{"id":"6","label":"iPhone 6 Plus","width":"414px","height":"736px"},
		{"id":"7","label":"iPhone 6 Plus h","width":"736px","height":"414px"},
		{"id":"8","label":"iPad","width":"768px","height":"1024px"},
		{"id":"9","label":"iPad h","width":"1024px","height":"768px"},
		{"id":"10","label":"Tab 4","width":"800px","height":"1280px"},
		{"id":"11","label":"Tab 4 h","width":"1280px","height":"800px"},
		{"id":"12","label":"Laptop","width":"1366px","height":"768px"},
		{"id":"13","label":"Desktop","width":"1920px","height":"1080px"}
	]; // Get the screen size options

	$scope.doInit = function (){
		$scope.windows = [];
		$scope.windows[0] = {"pos":"relative","index":"","x":"","y":"","width":$scope.screens[0].width,"height":$scope.screens[0].height,"wframe":"<iframe src=''></iframe>","screen":"0","scale":"100"};
		$scope.windows[1] = {"pos":"relative","index":"","x":"","y":"","width":$scope.screens[1].width,"height":$scope.screens[1].height,"wframe":"<iframe src=''></iframe>","screen":"1","scale":"100"};
	
		$scope.presets = [];
		for (var i = 0; i < localStorage.length; i++){
			$scope.presets[i] = localStorage.key(i);
		}
	};
	$scope.doInit(); // Setup the initial windows and get the presets from the local storage
	
	$scope.newWindow = function (){
		$scope.windows[$scope.windows.length] = {"pos":"relative","index":"","x":"","y":"","width":$scope.screens[0].width,"height":$scope.screens[0].height,"wframe":"<iframe src=''></iframe>","screen":"0","scale":"100"};
	} // Function to add a new window
	
	$scope.moving = false;
	$scope.wselected;
	$scope.mDown = function ($event,key){
		$scope.windows[key].pos = "absolute";
		$scope.windows[key].index = "999";
		$scope.wselected = key;
		$scope.moving = true;
	};
	$scope.mMove = function ($event){
		if($scope.moving == true){
			$scope.windows[$scope.wselected].x = ($event.pageX-8.5)+"px";
			$scope.windows[$scope.wselected].y = ($event.pageY-8.5)+"px";
		}
	};
	$scope.mUp = function (){
		if($scope.moving == true){
			$scope.moving = false;
			$scope.windows[$scope.wselected].index = "";
		}
	}; // Moving the windows
	
	$scope.closeWindow = function (key){
		var wclose = document.getElementById("window_"+key);
		wclose.className = wclose.className + " close";
		
		$timeout( function(){ $scope.windows.splice(key, 1); }, 500);
	}; // Function to remove a window
	
	$scope.changeWindow = function (key,skey){
		$scope.windows[key].width = $scope.screens[skey].width;
		$scope.windows[key].height = $scope.screens[skey].height;
	}; // Change the window screen size
	
	$scope.limitScale = function (key){
		if(parseInt($scope.windows[key].scale) > 100){
			$scope.windows[key].scale = 100;
		}
	} // Limit the scale to 100%
	$scope.changeScale = function (key,val){
		return parseInt(val) * ($scope.windows[key].scale/100)+"px";
	}; // Adjust window size to the scaled iframe
	$scope.changeInner = function (key,val){
		return "-"+(parseInt(val)-parseInt(val) * ($scope.windows[key].scale/100))/2+"px";
	}; // Adjust the margins of the iframe so it is positioned correctly
	
	$scope.urls = []; // Individual window urls
	$scope.gurl = ""; // Url to apply to all windows
	$scope.navigateTo = function ($event,key,url){
		if(key == "none"){ // Apply to all windows
			if(url.indexOf("http://") !=-1 || url.indexOf("file:///") !=-1 || url.indexOf("https://") !=-1){
				for(wkey in $scope.windows){
					$scope.windows[wkey].wframe = "<iframe src='"+url+"'></iframe>";
				}
			}
			else{
				for(wkey in $scope.windows){
					$scope.windows[wkey].wframe = "<iframe src='http://"+url+"'></iframe>";
				}
			}
		}
		else if($event == "blur" && url !== undefined || $event.keyCode == 13 && url !== undefined){ // Apply to individual windows
			if(url.indexOf("http://") !=-1 || url.indexOf("file:///") !=-1 || url.indexOf("https://") !=-1){
				$scope.windows[key].wframe = "<iframe src='"+url+"'></iframe>";
			}
			else{
				$scope.windows[key].wframe = "<iframe src='http://"+url+"'></iframe>";
			}
		}
	};
	
	$scope.spin = false;
	$scope.oldframe = [];
	$scope.refresh = function(){
		for(wkey in $scope.windows){
			$scope.spin = true;
			$scope.oldframe[wkey] = $scope.windows[wkey].wframe;
			$scope.windows[wkey].wframe = "";
			$scope.wfresh(wkey);
		}
	}; // Refresh windows each with it's own url
	$scope.wfresh = function(wkey){
		$timeout( function(){$scope.windows[wkey].wframe = $scope.oldframe[wkey];}, 200);
		$timeout( function(){$scope.spin = false;}, 500);
	}; // Separate function so the timeouts are individual to each window
	
	$scope.preset = "Select";
	$scope.getStore = function(){
		if($scope.preset !== "Select"){
			$scope.windows = JSON.parse(localStorage.getItem($scope.preset));
		}
	}; // Load selected preset
	
	$scope.sname = "";
	$scope.toStore = function(){
		localStorage.setItem($scope.sname, JSON.stringify($scope.windows));
		$scope.sname = "";
		
		$scope.presets = [];
		for (var i = 0; i < localStorage.length; i++){
			$scope.presets[i] = localStorage.key(i);
		}
	}; // Save the current state
	
	$scope.rname = "";
	$scope.rmStore = function(){
		localStorage.removeItem($scope.rname);
		$scope.rname = "";
		
		$scope.presets = [];
		for (var i = 0; i < localStorage.length; i++){
			$scope.presets[i] = localStorage.key(i);
		}
	}; // Remove specified preset
	
	$scope.exStore = function(){
		var exPresets = "{";
		for (var i = 0; i < localStorage.length; i++){
			exPresets += '"'+localStorage.key(i)+'"'+':'+localStorage.getItem(localStorage.key(i))+',';
		}
		exPresets = exPresets.substring(0, exPresets.length-1);
		exPresets += "}";
		alert(exPresets);
	};
	
	$scope.imStore = function(){
		window.localStorage.clear();
		var imPresets = JSON.parse( prompt("Place the presets below."));
		
		for(key in imPresets){
			localStorage.setItem(key, JSON.stringify(imPresets[key]));
		}
		
		$scope.presets = [];
		for (var i = 0; i < localStorage.length; i++){
			$scope.presets[i] = localStorage.key(i);
		}
	};
	
});