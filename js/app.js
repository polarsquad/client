"use strict";

angular.module("InfoCompass",[
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
	'$animate',

	function($rootScope, $animate){

		$animate.enabled(false)

		$rootScope.Mock = new Mock() //todo
		$rootScope.$watch(function(){
			console.log('root digest!')
			console.dir($rootScope.$$watchers)
		})
	}
])


