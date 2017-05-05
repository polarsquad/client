"use strict";

angular.module("InfoCompass",[
	'icLayout',
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
								var matches = path.match(/(^|\/)item\/([^\/]*)/)

								return	matches && matches[2]
										?	ic.itemStorage.getItem(matches[2])
										:	null
							}
		})

		.registerParameter({
			name: 			'page',
			encode:			function(value, ic){
								if(!value) return ''
								console.log('encode', value)
								return 'p/'+value 
							},
			decode:			function(path, ic){
								var matches = path.match(/(^|\/)p\/([^\/]*)/)

								return matches && matches[2]
							},
			options:		['home', 'tags'],
			defaultValue:	'home'
		})

		.registerParameter({
			name: 			'searchTerm',
			encode:			function(value, ic){
								if(!value) return ''
								return 's/'+value 
							},
			decode:			function(path, ic){
								var matches = path.match(/(^|\/)s\/([^\/]*)/)

								return matches && matches[2]
							}
		})


		.registerSection({
			name:			'page',
			active:			function(ic){
								return ic.site.page
							},
			show:			function(ic){
								return 		 ic.site.page
										&&	!ic.site.searchTerm
							}				
		})

		.registerSection({
			name:			'list',
			active:			function(ic){
								return ic.site.searchTerm
							},
			show:			function(ic){
								return ic.site.searchTerm
							}				
		})
	}
])


.config([

	'icItemStorageProvider',

	function(icItemStorageProvider){
		if(!(window.ic && window.ic.itemStorage)) 
				console.error('Service icItemStorage:  missing ic.itemStorage. Please load ic-item-storage-dpd.js.')

		icItemStorageProvider.config(window.ic.itemStorage)
	}
])



.config([

	'icLayoutProvider',

	function(icLayoutProvider){
		icLayoutProvider.setModes([			
			{
				name:		'XS',	
				width: 		23,
				stretch:	false,
			},	
			{
				name:		'S',
				width:		48,
				stretch:	false,
			},
			{
				name:		'M',
				width:		64,
				stretch:	false,
			},
			{
				name:		'L',
				width:		80,
				stretch:	false,
			},
			{
				name:		'XL',
				width:		120,
				stretch:	false,
			}
		])
	}

])

.run([
	'$rootScope',
	'$q',
	'$location',
	'ic',

	function($rootScope, $q, $location, ic){

		$rootScope.ic = ic
		console.log(ic)
		console.log($rootScope)
		console.log($location)
	}
])

