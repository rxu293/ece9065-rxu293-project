var pairs = {pairs:[]};
var publicURL = "http://localhost" + ":3000/api/";
var app = angular.module('myApp', ['ngRoute']);



app.controller('myCon', function($scope, $http){
	$scope.curTable = '';
	$scope.showAllCourses = function(){
		$http.get(publicURL + 'courses').then(function(response){
			$scope.curTable = 'allcourses';
			$scope.allcourses = response.data;
		});
	};

	$scope.getCodesByGivenSubject = function(){
		$http.get(publicURL + 'courses/' + $scope.code_subject).then(function mySuccess(response){
			$scope.curTable = 'codes_table';
			$scope.codesbysubject = response.data;
		},function myError(response){
			alert(response.data.msg);
		});
	};

	$scope.getTimeEntry = function(){
		let req = publicURL + 'courses/' + $scope.time_subject + "/" + $scope.time_course;
		if ($scope.time_component) req += "/" + $scope.time_component;
		$http.get(req)
		.then(function mySuccess(response){
			$scope.curTable = 'time_table';
			$scope.timetable = response.data;
		},function myError(response){
			alert(response.data.msg);
		});
	};

	$scope.addSchedule = function(){
		let sendData = {schedule_name: $scope.inputschedule};
		$http({
			method: 'POST',
			data: sendData,
			url: publicURL + 'schedule/',
			headers: new Headers({
    			'Content-Type': 'application/json'
  			})
		}).then(function mySuccess(response){
				alert(response.data.msg);
			},function myError(response){
				alert(response.data.msg);
			});
	}

	$scope.addtoList = function(){
		pairs.pairs.push({subject: $scope.pair_subject, catalog_nbr:$scope.pair_course, 
			start_time: $scope.pair_starttime, end_time: $scope.pair_endtime});
		alert("added to list successfully");
	}

	$scope.addtoSchedule = function(){
		let sendData = pairs;
		$http({
			method: 'POST',
			data: sendData,
			url: publicURL + 'schedule/' + $scope.pair_schedule,
			headers: new Headers({
    			'Content-Type': 'application/json'
  			})
		}).then(function mySuccess(response){
				$scope.curTable = 'schedule_detail_table';
				$scope.schedule_detail = response.data;
			},function myError(response){
				alert(response.data.msg);
			});
	}

	$scope.showSchedule = function(){
		$http.get(publicURL + 'schedule/' + $scope.inputschedule).then(function mySuccess(response){
			$scope.curTable = 'schedule_detail_table';
			$scope.schedule_detail = response.data;
		},function myError(response){
			alert(response.data.msg);
		});
	}

	$scope.deleteSchedule = function(){
		$http.delete(publicURL + 'schedule/' + $scope.inputschedule).then(function mySuccess(response){
			alert(response.data.msg);
		},function myError(response){
			alert(response.data.msg);
		});
	}

	$scope.getAllSchedules = function(){
		$http.get(publicURL + 'schedule').then(function mySuccess(response){
			$scope.curTable = 'schedule_count_table';
			$scope.schedule_counts = response.data;
		},function myError(response){
			alert(response.data.msg);
		});
	}

	$scope.deleteAllSchedules = function(){
		$http.delete(publicURL + 'schedule').then(function mySuccess(response){
			alert(response.data.msg);
		},function myError(response){
			alert(response.data.msg);
		});
	}
});	
