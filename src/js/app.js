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
								return 	value 
										?	'list' 
										:	''
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
								return 'p/'+value 
							},
			decode:			function(path, ic){
								var matches = path.match(/(^|\/)p\/([^\/]*)/)

								return matches && matches[2]
							},
			options:		['home', 'tags'],
			defaultValue:	'home'
		})



		.registerSection({
			name:			'page',
			template:		'partials/ic-section-page.html',
			active:			function(ic){
								return ic.site.page
							},
			show:			function(ic){
								if(ic.site.activeItem) 	return false						
								if(ic.site.list) 		return false						

								return 		 ic.site.page
										&&	!ic.site.activeSections['list']
							}				
		})

		.registerSection({
			name:			'list',
			template:		'partials/ic-section-list.html',
			active:			function(ic){
								return 	ic.site.list
							},

			show:			function(ic){		
								if(ic.site.activeItem) return false						
								return 	true
							}				
		})

		.registerSection({
			name:			'item',
			template:		'partials/ic-section-item.html',
			active:			function(ic){
								return 	ic.site.activeItem
							},
			show:			function(ic){
								return ic.site.activeItem
							}				
		})
	}
])


.config([

	'$compileProvider',

	function($compileProvider){
  		$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|whatsapp|mailto):/)
  	}
])


.config([

	'icItemStorageProvider',

	function(icItemStorageProvider){
		if(!(window.ic && window.ic.itemStorage)) 
				console.error('icItemStorageProvider:  missing ic.itemStorage. Please load ic-item-storage-dpd.js.')

		icItemStorageProvider.setItemStorage(window.ic.itemStorage)
	}
])


.config([
	'$translateProvider',

	function($translateProvider,plImagesProvider){
		$translateProvider.useLoader('icInterfaceTranslationLoader')
		$translateProvider.useSanitizeValueStrategy('sanitizeParameters')
		$translateProvider.preferredLanguage('de')
	}
])



.config([

	'icTaxonomyProvider',

	function(icTaxonomyProvider){

		if(!(window.ic && window.ic.itemConfig)) 
			console.error('icTaxonomyProvider:  missing ic.itemConfig. Please load ic-item-config.js.')
		if(!(window.ic && window.ic.taxonomy)) 
			console.error('icTaxonomyProvider:  missing ic.taxonomy. Please load taxonomy.js.')

		icTaxonomyProvider
		.setItemConfig(window.ic.itemConfig)
		.setTaxonomy(window.ic.taxonomy)
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
	'ic',

	function($rootScope, ic){

		$rootScope.ic = ic

	}
])

