"use strict";

angular.module("InfoCompass",[
	'ngAnimate',
	'lcEvents',
	'InfoCompassModule',
])

.config([

	'$locationProvider',

	function($locationProvider){
		 //$locationProvider.html5Mode(true)
	}
		
])

.run([
	'$rootScope',

	function($rootScope){
		$rootScope.Mock = new Mock()
	}
])


