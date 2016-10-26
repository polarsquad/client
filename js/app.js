"use strict";

angular.module("InfoCompass",[
	'InfoCompassModule',
])

.config([

	'$locationProvider',

	function($locationProvider){
		 $locationProvider
		 .html5Mode({
		 	enabled:		true
		 })
	}
		
])

.run([
	'$rootScope',
	'$animate',
	'$location',

	function($rootScope, $animate, $location){

		$animate.enabled(false)

		//$rootScope.Mock = new Mock() //todo
		// $rootScope.$watch(function(){
		// 	console.log('root digest!')
		// 	//console.dir($rootScope.$$watchers)
		// })
	}
])


