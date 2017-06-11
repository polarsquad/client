"use strict";

angular.module("InfoCompass",[
	'monospaced.qrcode',
	'ngSanitize',
	'icLayout',
	'icServices',
	'icDirectives',
	'icFilters',
	'icUiDirectives',	
	'icMap',
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
			options:		['home', 'tags', 'about', 'legal', 'contact', 'tiles', 'partner', 'network'],
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
			name:			'filter',
			template:		'partials/ic-section-filter.html',
			active:			function(ic){
								return 	ic.site.list
							},

			show:			function(ic){		
								if(ic.site.activeItem) return false						
								return 	true
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
								if(ic.site.expandMap) return false				
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
								return true
							}				
		})
		.registerSection({
			name:			'map',
			template:		'partials/ic-section-map.html',
			active:			function(ic){
								return 	ic.site.list && !ic.site.activeItem
							},
			show:			function(ic){
								return ic.site.list
							}				
		})
		.registerSwitch({
			name:			'expandMap',
			index:			0
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
				console.error('icItemStorageProvider:  missing ic.itemStorage. Please load dpd-item-storage.js.')

		icItemStorageProvider.setItemStorage(window.ic.itemStorage)
	}
])

.config([

	'icAdminProvider',

	function(icAdminProvider){
		if(!(window.ic && window.ic.actions)) 
				console.error('icAdminProvider:  missing ic.actions. Please load dpd-actions.js.')

		icAdminProvider.setActions(window.ic.actions)
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
	'icLanguagesProvider',

	function(icLanguageProvider){

		if(!window.config) console.log('Missing Config!') //TODO

		icLanguageProvider
		.setAvailableLanguages(['de', 'en', 'ru', 'tr'])
		.setTranslationTableUrl(window.config.backendLocation+'/translations.json')
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

