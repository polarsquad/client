"use strict";

(function(){

	function loadJSON(filename) {   
		
		return new Promise(function(resolve, reject){

			var xobj = new XMLHttpRequest()
				xobj.overrideMimeType("application/json")

			xobj.open('GET', filename, true)
			xobj.onreadystatechange = function () {
				if (xobj.readyState == 4 && xobj.status == "200") {
					resolve(JSON.parse(xobj.responseText))
				}
			};
			xobj.send(null);  

		})


	 }

	 function getBuildNumber(){
	 	return new Promise(function(resolve, reject){

			var xobj = new XMLHttpRequest()
				xobj.overrideMimeType("application/text")

			xobj.open('GET', 'build', true)
			xobj.onreadystatechange = function () {
				if (xobj.readyState == 4 && xobj.status == "200") {
					resolve(xobj.responseText)
				}
			};
			xobj.send(null);  

		})

	 }

	var icConfig 	= undefined,
		build		= undefined 

	Promise.all([
		loadJSON('config.json'),
		getBuildNumber()
	])
	.then(function(result){

		icConfig 	= result[0]
		build		= result[1]

		angular.module("InfoCompass",[
			'monospaced.qrcode',
			'ngSanitize',
			'icLayout',
			'icServices',
			'icDirectives',
			'icFilters',
			'icUiDirectives',	
			'icMap',
			'icPreload',
		])
		.constant('icConfig', icConfig)

		.config([

			'$locationProvider',

			function($locationProvider){
				$locationProvider
				.html5Mode({
					enabled:		true
				})
			}
				
		])

		.config([

			'plImagesProvider',

			function(plImagesProvider){
				plImagesProvider.setJsonFile('preload-images.json')
			}
		])

		.config([

			'plStylesProvider',

			function(plStylesProvider){
				plStylesProvider.setFiles([
					['/styles_'+build+'/styles.css'],
					[icConfig.externalCss]
				])
			}
		])
			

		.config([

			'plTemplatesProvider',

			function(plTemplatesProvider){
				plTemplatesProvider.setJsonFile('preload-templates.json')
			}
		])

		.config([

			'icStatsProvider',

			function(icStatsProvider){
				icStatsProvider.setUrl(icConfig.statsLocation)
			}
		])

		.config([
			'icMainMapProvider',

			function(icMainMapProvider){
				if(icConfig.map) icMainMapProvider.setDefaults(icConfig.map)
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
					adjust:			function(ic){
										return		ic.site.activeItem
												||	ic.site.list
												?	null 
												:	ic.site.page
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
										if(ic.site.activeSections.item) return false						
										if(ic.site.activeSections.list) return false						
										if(ic.site.expandMap)			return false

										return true
									}				
				})
				.registerSection({
					name:			'filter',
					template:		'partials/ic-section-filter.html',
					active:			function(ic){
										return 	ic.site.list || ic.site.expandMap
									},

					show:			function(ic){		

										if(ic.layout.mode.name == 'XS') 	return false
										if(ic.layout.mode.name == 'S')		return ic.site.activeSections.item ? false : true
										if(ic.layout.mode.name == 'M')		return ic.site.activeSections.item ? false : true

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

										if(ic.site.expandMap) 				return false		
										if(ic.layout.mode.name == 'XS') 	return 	ic.site.activeSections.item ? false : true
										if(ic.layout.mode.name == 'S') 		return 	ic.site.activeSections.item ? false : true


												

										return 	true
									}				
				})

				.registerSection({
					name:			'item',
					template:		'partials/ic-section-item.html',
					active:			function(ic){
										return 	!!ic.site.activeItem
									},
					show:			function(ic){

										if(ic.site.expandMap) 				return false		
											
										return true
									}				
				})
				.registerSection({
					name:			'map',
					template:		'partials/ic-section-map.html',
					active:			function(ic){
										return 	true
									},
					show:			function(ic){
										if(ic.site.expandMap)				return true

										if(ic.layout.mode.name == 'XS')		return false
										if(ic.layout.mode.name == 'S')		return false
										if(ic.layout.mode.name == 'M')		return !ic.site.activeSections.page &&  !ic.site.activeSections.item
										if(ic.layout.mode.name == 'L')		return !ic.site.activeSections.page &&  !ic.site.activeSections.item

										return	true
									}				
				})
				
				.registerSwitch({
					name:			'expandMap',
					index:			0
				})		

				.registerSwitch({
					name:			'editItem',
					index:			1,
					adjust:			function(ic){
										return	ic.site.activeItem && ic.site.activeItem.internal.new
												?	true
												:	ic.site.editItem
									}
				})
			}
		])


		.config([

			'$compileProvider',

			function($compileProvider){
				$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|whatsapp|mailto|tel|tg):/)
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
			'$translateProvider',

			function($translateProvider){
				$translateProvider.useLoader('icInterfaceTranslationLoader')
				$translateProvider.useSanitizeValueStrategy('sanitizeParameters')
				$translateProvider.preferredLanguage('de')
			}
		])



		.config([

			'icTaxonomyProvider',

			function(icTaxonomyProvider){

				// if(!(window.ic && window.ic.itemConfig)) 
				// 	console.error('icTaxonomyProvider:  missing ic.itemConfig. Please load ic-item-config.js.')
				if(!(window.ic && window.ic.taxonomy)) 
					console.error('icTaxonomyProvider:  missing ic.taxonomy. Please load taxonomy.js.')

				icTaxonomyProvider
				//.setItemConfig(window.ic.itemConfig)
				.setTaxonomy(window.ic.taxonomy)
			}
		])

		.config([

			'icItemConfigProvider',

			function(icItemConfigProvider){

				if(!(window.ic && window.ic.itemConfig)) 
					console.error('icTaxonomyProvider:  missing ic.itemConfig. Please load ic-item-config.js.')
				
				icItemConfigProvider
				.setItemConfig(window.ic.itemConfig)
			}
		])


		.config([
			'icLanguagesProvider',

			function(icLanguageProvider){

				if(!icConfig) console.log('Missing Config!') //TODO

				var	available_languages = 	icConfig.languages && icConfig.languages.length != 0
											?	icConfig.languages
											:	(console.warn('icLanguagesProvider: config does not provide available languages!') || ['de', 'en', 'none'])

				icLanguageProvider
				.setAvailableLanguages(available_languages)
				.setTranslationTableUrl(icConfig.backendLocation+'/translations.json')
				.setFallbackLanguage('de')
			}
		])



		.config([

			'icLayoutProvider',

			function(icLayoutProvider){
				icLayoutProvider.setModes([			
					{
						name:		'XS',	
						width: 		24,
						stretch:	true,
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
						width:		96,
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
			'$location',
			'ic',

			function($rootScope, $location, ic){

				$rootScope.ic = ic


				$rootScope.$watch(function(){
				})

			}
		])
		
		angular.bootstrap(document, ['InfoCompass']);

	})

})()
