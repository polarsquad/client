"use strict";

angular.module("InfoCompass",[
	'icServices',
	'icDirectives',
	'icUiDirectives',
])

.config([

	'$locationProvider',

	function($locationProvider,preloadImagesProvider){
		$locationProvider
		.html5Mode({
			enabled:		true
		})
	}
		
])

.config([

	'icSiteProvider',

	function(icSiteProvider){
		icSiteProvider
		.registerParameter({
			name: 			'list',
			encode:			function(value, ic){
								if(!value) return ''
								return 'list' 
							},
			decode:			function(path, ic){
								var matches = path.match(/(^|\/)list(\/|$)/)

								return !!matches
							}
		})

		.registerParameter({
			name: 			'activeItem',
			encode:			function(value, ic){
								return 	value && value.id
										?	'item/'+value.id 
										:	''
							},
			decode:			function(path, ic){
								var matches = path.match(/(^|\/)item\/([^\/].*)/)

								return	matches && matches[2]
										?	ic.itemStorage.getItem(matches[2])
										:	null
							}
		})

		.registerParameter({
			name: 			'page',
			encode:			function(value, ic){
								if(!value) return ''
								return 'p/'+value 
							},
			decode:			function(path, ic){
								var matches = path.match(/(^|\/)p\/([^\/].*)$/)

								return matches && matches[2]
							}
		})
	}
])

.run([
	'$rootScope',
	'$q',
	'ic',

	function($rootScope, $q, ic, icSite, icInit, icItemStorage){

		$rootScope.ic = ic
		console.log(ic)
		console.log($rootScope)
	}
])

