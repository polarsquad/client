"use strict";

angular.module('icServices', [
	// 'icApi',
	// 'smlLayout',
	// 'pascalprecht.translate'
])


.service('ic',[

	function(){

		function IcCoreService(){
		}

		return new IcCoreService()
	}
])



.service('icInit', [

	'icItemStorage',

	function(icItemStorage){

		var icInit = {}

		icInit.ready = icItemStorage.ready //Mock

		return icInit
	}

])





.provider('icSite', function(){

	this.config = 	{
							params: 	[],
							switches: 	[],
							sections:	[],
						}

	this.onRegister = function(){}

	this.registerParameter = function(new_parameter){
		/*
			parameter = 	{
								name:  	the key used to exposed value on icSite e.g. ic.site.%name
								encode:	function(value, ic)	to encode value into url string
								decode: function(path, ic) 	to decode value from url string	
								defaultValue: ...
							}
		 */
		this.config.params.push(new_parameter)
		this.onRegister()
		return this
	}

	this.registerSwitch = function(new_switch){
		/*
			swt =		{
								name: the key used to exposed value on icSite e.g. ic.site.switch.%name
								defaultValue: ...
							}
		 */
		this.config.switches.push(new_switch)
		this.onRegister()
		return this
	}

	this.registerSection = function(new_section){
		/*
			section = 		{
								name:  		the key used to exposed value on icSite e.g. ic.site.activeSection.%name resp. ic.site.displaySection.%name,
								template:	url,
								active: 	function(ic),
								show: 		function(ic),
							}
		 */
		this.config.sections.push(new_section)
		this.onRegister()
		return this
	}



	this.$get = [

		'$location',
		'$q',
		'$rootScope',
		'$timeout',
		'ic',

		function($location, $q, $rootScope, $timeout, ic){
			var icSite 					= 	this,
				adjustment_scheduled	= 	false

			icSite.activeSections 	=	{}
			icSite.visibleSections 	= 	{}



			//Params:

			function decodeParam(path, param){
				var value = param.decode(path, ic)

				return	!param.options || param.options.indexOf(value) != -1
						?	value
						:	param.defaultValue
			}

			function path2Params(path){
				icSite.config.params.forEach(function(param){
					try {
						$q.when(decodeParam(path, param))
						.then(function(value){ icSite[param.name] = value })
					} catch(e) {
						console.error('icSite path2Params', param.name ,e)
					}
				})

			}

			function encodeParam(value, param){
				if(param.options && param.options.indexOf(value) == -1)	value = null
				if(value ==  param.defaultValue) 						value = null

				return param.encode(value, ic)
			}

			function params2Path(){
				var path = ''

				icSite.config.params.forEach(function(param){
					try {
						var section = encodeParam(icSite[param.name], param)
						if(section)	path += '/' + param.encode(icSite[param.name], ic)
					} catch(e) {
						console.error('icSite params2Path', param.name,e)
					}
				})

				return path
			}

			icSite.updateFromPath = function(e,n,o){
				path2Params($location.path())

				return icSite
			}

			icSite.updatePath = function(){

				var current_path 	= $location.path(),
					new_path		= params2Path()
				
				if(current_path != new_path) $location.path(new_path)

				return icSite
			}


			icSite.updateUrl = function(){
				icSite.updatePath()
				icSite.updateSearch()

				return icSite
			}


			//Switches:


			function search2Switches(){
				var binary_str = parseInt($location.search().s || 0, 36).toString(2)

				icSite.config.switches.forEach(function(swt, index){
					icSite[swt.name] = !!parseInt(binary_str[swt.index])

				})


			}

			function switches2Search(){
				if(!icSite.config.switches.length) return null

				var arr = Array(1 + icSite.config.switches.reduce(function(max, swt){ return Math.max(max, swt.index) },0 )).fill(0),
					s	= '0'

				icSite.config.switches.forEach(function(swt){
					arr[swt.index] = icSite[swt.name] ? 1 : 0
				})

				s = parseInt(arr.join() , 2).toString(36)
				return 	s == '0'
						?	null
						:	s
			}


			icSite.updateSearch = function(){
				var current_s 	= $location.search().s,
					new_s		= switches2Search()
				
				if(current_s != new_s) $location.search('s', new_s)

				return icSite
			}

			icSite.updateFromSearch = function(){
				search2Switches()
				return icSite
			}


			//sections:


			icSite.updateActiveSections = function(){
				icSite.config.sections.forEach(function(section){
					icSite.activeSections[section.name] = section.active(ic)
				})

				return icSite
			}

			icSite.updateVisibleSections = function(){
				icSite.config.sections.forEach(function(section){
					icSite.visibleSections[section.name] = icSite.activeSections[section.name] && section.show(ic)
				})

				return icSite				
			}

			icSite.updateSections = function(){
				return	icSite
						.updateActiveSections()
						.updateVisibleSections()
			}

			icSite.onRegister = function(){ 
				$rootScope.$evalAsync(icSite.updateFromPath) 
				$rootScope.$evalAsync(icSite.updateFromSearch) 
			}

			icSite.adjust = function(){
				icSite.config.params.forEach(function(param){ icSite[param.name] 	= param.adjust 	? param.adjust(ic)	: icSite[param.name]	}),
				icSite.config.switches.forEach(function(swt){ icSite[swt.name]		= swt.adjust	? swt.adjust(ic)	: icSite[swt.name]		})


				$location.replace()

				return icSite
			}

			$rootScope.$watch(
				function(){
					return 	Array.prototype.concat(
								icSite.config.params.map(function(param){ return icSite[param.name] }),
								icSite.config.switches.map(function(swt){ return icSite[swt.name] 	})
							)
				},
				function(a, old){

					icSite
					.updateSections()
					.updateUrl()	

					if(!adjustment_scheduled){
						adjustment_scheduled = true

						window.requestAnimationFrame(function(){
							$rootScope.$apply(function(){
								icSite.adjust()
								adjustment_scheduled = false
							})
						})
						
					}
				},
				true
			)


			$rootScope.$watch(
				function(){ return $location.search().s},
				function(s){
					icSite.updateFromSearch()
				}
			)

			$rootScope.$on('$locationChangeSuccess', icSite.updateFromPath)

			return icSite
		}
	]
})


.provider('icAdmin', function(){

	var dpdActions = undefined

	this.setActions = function(ac){ dpdActions = ac }

	this.$get = [

		'$q',
		'icOverlays',

		function($q, icOverlays){
			var icAdmin = this

			if(!dpdActions) console.error('Service icAdmin:  dpdActions missing.')
			
			icAdmin.updateTranslations = function(){

				icOverlays.open('spinner')

				return $q.when(dpdActions.updateTranslations())
						.then(
							function(){
								return icOverlays.open('popup', 'INTERFACE.TRANSLATION_UPDATED')
							},

							function(){
								return icOverlays.open('popup', 'INTERFACE.UNABLE_TO_UPDATE_TRANSLATIONS')
							}
						)
			}		


			return icAdmin
		}
	]
})







.provider('icItemStorage', function(){

	var itemStorage = undefined

	this.setItemStorage = function(is){ itemStorage = is}

	this.$get = [

		'$q',
		'$rootScope',
		'icSite',

		function($q, $rootScope, icSite){
			if(!itemStorage) console.error('Service icItemStorage:  itemStorage missing.')

			var icItemStorage = itemStorage

			icItemStorage.addAsyncTrigger(function(){
				$rootScope.$apply()
			})

			icItemStorage.ready 		= 	$q.when(icItemStorage.downloadAll())
											.then(function(){
												icItemStorage.updateFilteredList()
											})


			$rootScope.$watch(
				function(){
					return !icItemStorage.refreshScheduled && icItemStorage.refreshRequired
				},
				function(refresh){


					if(!refresh) return null

					icItemStorage.refreshScheduled = true


					$rootScope.$evalAsync(function(){
						icItemStorage.refreshFilteredList()
						icItemStorage.refreshScheduled	=	false
					})

					return icItemStorage
				}
			)


			return icItemStorage
		}
	]
})


.provider('icTaxonomy',function(){

	var itemConfig 	= undefined,
		taxonomy	= undefined

	function IcCategory(config){
		this.name 	= config.name
		//make sure no tags appear twice
		this.tags	= config.tags.filter(function(v, i, s) { return s.indexOf(v) === i } )
	}

	function IcType(config){
		this.name	= config.name
	}

	this.setTaxonomy	= function(tx){ taxonomy 	= tx; return this}
	this.setItemConfig 	= function(ic){ itemConfig 	= ic; return this}


	this.$get = [
		function(){
			var icTaxonomy = this

			icTaxonomy.categories 	= []
			icTaxonomy.types		= []
			icTaxonomy.unsortedTags = taxonomy.unsortedTags

			if(!taxonomy) 	console.error('icTaxonomy: taxonomy missing. You should probably load taxonomy.js.')
			if(!itemConfig) console.error('icTaxonomy: itemConfig missing. You should probably load dpd-item-config.js.')


			icTaxonomy.addCategory = function(cat_config){
				icTaxonomy.categories.push(new IcCategory(cat_config))
				return icTaxonomy
			}


			taxonomy.categories.forEach(function(cat_config){
				icTaxonomy.addCategory(cat_config)
			})

			icTaxonomy.addType = function(type_config){
				icTaxonomy.types.push(new IcType(type_config))
				return icTaxonomy
			}

			taxonomy.types.forEach(function(type_config){
				icTaxonomy.addType(type_config)
			})

			icTaxonomy.addUnsortedTag = function(tag){
				icTaxonomy.unsortedTags.push(tag)
				return icTaxonomy
			}


			//Todo: move this into build script:
			//check if all tags are accounted for in categories:
			function checkTagsInCategories(){
				var tag_in_cat = {}

				icTaxonomy.categories.forEach(function(category){
					category.tags.forEach(function(tag){
						if(tag_in_cat[tag]) console.warn('icTaxonomy: tag in multiple categories:'+ tag + ' in '+ category.name + ' and ' + tag_in_cat[tag])
						tag_in_cat[tag] = category.name
					})
				})

				itemConfig.tags.forEach(function(tag){
					if(!tag_in_cat[tag]) console.warn('icTaxonomy: tag not accounted for in Catgories:', tag)
				})
			}

			checkTagsInCategories()
			

			icTaxonomy.getCategory = function(category_names){
				var single = (typeof category_name == 'string')
				
				if(single) category_names = [category_names]

				var result = 	icTaxonomy.categories.filter(function(category){
									return category_names.indexOf(category.name) != -1
								})
				return	result[0]
			}

			icTaxonomy.getType = function(type_names){
				var single = (typeof type_names == 'string')
				
				if(single) type_names = [type_names]

				var result = 	icTaxonomy.types.filter(function(type){
									return type_names.indexOf(type.name) != -1
								})
				return	result[0]
			}

			return icTaxonomy
		}
	]
})


.service('icFilterConfig',[

	'$rootScope',
	'icSite',
	'icItemStorage',
	'icTaxonomy',
	
	function($rootScope, icSite, icItemStorage, icTaxonomy){
		var icFilterConfig = this

		icSite
		.registerParameter({
			name: 			'searchTerm',
			encode:			function(value, ic){
								if(!value) return ''
								return 's/'+value 
							},
			decode:			function(path, ic){
								var matches = path.match(/(^|\/)s\/([^\/]*)/)

								return (matches && matches[2]) || null
							}
		})
		.registerParameter({
			name:			'filterByCategory',
			encode:			function(value, ic){
								var j = value && value.join && value.join('-')								

								return j ? 'c/'+value.join('-')	: ''
							},
			decode:			function(path, ic){
								var matches = path.match(/(^|\/)c\/([^\/]*)/)

								return (matches && matches[2].split('-')) || []
							},
		})
		.registerParameter({
			name:			'filterByType',
			encode:			function(value, ic){
								var j = value && value.join && value.join('-')								

								return j ? 't/'+value.join('-')	: ''
							},
			decode:			function(path, ic){
								var matches = path.match(/(^|\/)t\/([^\/]*)/)

								return (matches && matches[2].split('-')) || []
							},
		})		
		.registerParameter({
			name:			'filterByUnsortedTag',
			encode:			function(value, ic){
								var j = value && value.join && value.join('-')								

								return j ? 'u/'+value.join('-')	: ''
							},
			decode:			function(path, ic){
								var matches = path.match(/(^|\/)u\/([^\/]*)/)

								return (matches && matches[2].split('-')) || []
							},
		})

		icFilterConfig.toggleType = function(type_name, toggle, replace){



			var pos 	= 	icSite.filterByType.indexOf(type_name),
				toggle 	= 	toggle === undefined
							?	pos == -1
							:	!!toggle

							
			if(replace) icFilterConfig.clearType()

			if(pos == -1 &&  toggle) 				return !!icSite.filterByType.push(type_name)
			if(pos != -1 && !toggle && !replace) 	return !!icSite.filterByType.splice(pos,1)

		}

		icFilterConfig.clearType = function(){
			while(icSite.filterByType.pop());
			return icFilterConfig
		}

		icFilterConfig.typeActive = function(type_name){
			return icSite.filterByType.indexOf(type_name) != -1
		}

		icFilterConfig.typeCleared = function(){
			return !icSite.filterByType.length
		}


		icFilterConfig.toggleCategory = function(category_name, toggle, replace){

			var pos 	= 	icSite.filterByCategory.indexOf(category_name),
				toggle 	= 	toggle === undefined
							?	pos == -1
							:	!!toggle

			if(replace) icFilterConfig.clearCategory()

			if(pos == -1 &&  toggle) 				return !!icSite.filterByCategory.push(category_name)
			if(pos != -1 && !toggle && !replace) 	return !!icSite.filterByCategory.splice(pos,1)
		}

		icFilterConfig.clearCategory = function(){
			while(icSite.filterByCategory.pop());
			return icFilterConfig
		}

		icFilterConfig.categoryActive = function(category_name){
			return icSite.filterByCategory.indexOf(category_name) != -1
		}

		icFilterConfig.categoryCleared = function(){
			return !icSite.filterByCategory.length
		}







		icFilterConfig.toggleUnsortedTag = function(tag, toggle){

			var pos 	= 	icSite.filterByUnsortedTag.indexOf(tag),
				toggle 	= 	toggle === undefined
							?	pos == -1
							:	!!toggle

			if(pos == -1 &&  toggle) return !!icSite.filterByUnsortedTag.push(tag)
			if(pos != -1 && !toggle) return !!icSite.filterByUnsortedTag.splice(pos,1)

		}

		icFilterConfig.clearUnsortedTag = function(){
			while(icSite.filterByUnsortedTag.pop());
			return icFilterConfig
		}

		icFilterConfig.unsortedTagActive = function(tag){
			return icSite.filterByUnsortedTag.indexOf(tag) != -1
		}

		icFilterConfig.unsortedTagCleared = function(){
			return !icSite.filterByUnsortedTag.length
		}


		$rootScope.$watch(
			function(){
				return 	[
							icItemStorage.getSearchTag(icSite.searchTerm),
							icSite.filterByType,
							icSite.filterByCategory,
							icSite.filterByUnsortedTag
						]
			},
			function(arr){
				icItemStorage.ready.then(function(){
					icItemStorage.updateFilteredList(arr, [
						null, 
						icTaxonomy.types.map(function(type){ return type.name }), 
						icTaxonomy.categories.map(function(category){ return category.name }), 
						null
					])
				})
			},
			true
		)

	}
])

.service('icConfigData', [

	function(){
		return window.config
	}
])


.provider('icLanguages', function(){

	var translationTableUrl = '',
		availableLanguages	= []

	this.setAvailableLanguages = function(languages){
		Array.prototype.push.apply(availableLanguages, languages)
		return this
	}

	this.setTranslationTableUrl = function(url){
		translationTableUrl = url
		return this
	}

	this.$get = [

		'$window',
		'$rootScope',
		'$q',
		'$http',
		'$translate',
		'icSite',

		function($window, $rootScope, $q, $http, $translate, icSite){

			var icLanguages 			= 	this

			icLanguages.availableLanguages	=	availableLanguages
			icLanguages.fallbackLanguage	=	undefined

			icLanguages.fallbackLanguage	= 	icLanguages.availableLanguages.indexOf('en') != -1
												?	'en'
												:	icLanguages.availableLanguages[0]

			icLanguages.ready = 	$http.get(translationTableUrl)
									.then(
										function(result){
											console.log(result)
											return result.data
										},
										function(){
											return $q.reject("Unable to load language data.")
										}
									)


			function objectKeysToUpperCase(obj){
				var up = {}

					for(var key in obj){

						up[key.toUpperCase()] = typeof obj[key] == 'object'
												?	objectKeysToUpperCase(obj[key])
												:	obj[key]
					}

				return up
			}


			icLanguages.getTranslationTable = function(lang){
				return	icLanguages.ready
						.then(function(translations){
							return objectKeysToUpperCase(translations)[lang.toUpperCase()]
						})
			}

			icLanguages.getStoredLanguage = function(){
				var l = $window.localStorage.getItem('language') 

				return	icLanguages.availableLanguages.indexOf(l) != -1
						?	l
						:	null
			}

			icSite.registerParameter({
				name: 		'currentLanguage',
				encode:		function(value,ic){
								if(!value) return ''
								return 'l/'+value 
							},

				decode:		function(path,ic){
								var matches = path.match(/(^|\/)l\/([^\/]*)/)

								return matches && matches[2]
							},

				adjust:		function(ic){
								return		ic.site.currentLanguage 
										|| 	icLanguages.getStoredLanguage()
										|| 	navigator.language.substr(0,2)
										|| 	icLanguages.fallbackLanguage
										|| 	'en'
							}	

			})


			$rootScope.$watch(
				function(){ return icSite.currentLanguage }, 
				function(){

					if(!icSite.currentLanguage) return null

					$translate.use(icSite.currentLanguage)
					$window.localStorage.setItem('language',icSite.currentLanguage)
				}
			)


			return	icLanguages
		}
	]
})



.service('icFavourites',[

	'$rootScope',
	'icItemStorage',
	'icTaxonomy',

	function($rootScope, icItemStorage, icTaxonomy){

		var icFavourites = this,
			items = JSON.parse(localStorage.getItem('icFavourites') || '[]')

		icFavourites.contains = function(item_or_id){
			if(!item_or_id) return false

			var id 		= 	item_or_id.id || item_or_id
				
			return items.indexOf(id) != -1
		}

		icFavourites.toggleItem = function(item_or_id, toggle){
			var id 		= 	item_or_id.id || item_or_id,
				pos 	= 	items.indexOf(id)

			toggle 	= 	toggle === undefined
						?	pos == -1
						:	!!toggle

			var add 	= (pos == -1 &&  toggle),
				remove 	= (pos != -1 && !toggle)

			if(add) 	items.push(id)		
			if(remove) 	items.splice(pos,1)

			if(add || remove) icItemStorage.updateItemInternals(item_or_id)
			return icFavourites
		}

		icFavourites.addItem = function(item_or_id){
			icFavourites.toggleItem(item_or_id, true)
		}

		icFavourites.removeItem = function(item_or_id){
			icFavourites.toggleItem(item_or_id, false)
		}

		icItemStorage.registerFilter('favourite', function(item){
			return icFavourites.contains(item) 
		})

		icTaxonomy.addUnsortedTag('favourite')

		$rootScope.$watch(
			function(){
				return items
			},
			function(){
				localStorage.setItem('icFavourites', JSON.stringify(items))				
			},
			true
		)

		return icFavourites
	}
])




.factory('icInterfaceTranslationLoader', [

	'icLanguages',

	function(icLanguages){
		return 	function(options){
					if(!options || !options.key) throw new Error('Couldn\'t use icInterfaceTranslationLoader since no language key is given!');
					return icLanguages.getTranslationTable(options.key)
				}
	}
])





.service('icOverlays', [

	'$q',

	function($q){
		var icOverlays 	= 	{
								show:		{},
								messages:	{},
								deferred:	{},
							},
			scope 		=	undefined,
			deferred	=	{}




		icOverlays.toggle = function(overlay_name, open, leave_others_open){

			if(overlay_name) {
				icOverlays.show[overlay_name] = open !== undefined 
												?	open 
												:	!icOverlays.show[overlay_name]

			}

			if(leave_others_open) return this

			for(var key in icOverlays.show){
				//close all other overlays
				if(key != overlay_name) 	delete icOverlays.show[key]

				if(!icOverlays.show[key]){
					delete icOverlays.messages[key]
				}
			}

			if(icOverlays.active()) return this

			//reject all promises 
			for(var key in icOverlays.show){
				if(icOverlays.deferred[key]){
					icOverlays.deferred[key].reject()
					delete icOverlays.deferred[key]
				}
			}

			return this
		}

		icOverlays.open = function(overlay_name, message, deferred, overwrite_messages){
			icOverlays.messages[overlay_name] = overwrite_messages
												? 	[]
												:	(icOverlays.messages[overlay_name] || [])

			if(icOverlays.messages[overlay_name].indexOf(message) == -1) icOverlays.messages[overlay_name].push(message)

			if(icOverlays.deferred[overlay_name] && icOverlays.deferred[overlay_name] != deferred) 
				icOverlays.deferred[overlay_name].reject()

			icOverlays.deferred[overlay_name] = deferred || $q.defer()
			

			icOverlays.toggle(overlay_name, true)

			return icOverlays.deferred[overlay_name].promise
		}

	
		icOverlays.active = function(){
			for(var key in icOverlays.show){
				if(icOverlays.show[key]) return true
			}

			return false
		}

		icOverlays.registerScope = function(s){
			if(scope) console.warn('icOverlays.registerScope: scope already registered.')
			scope = s
		}

		icOverlays.$digest = function(){
			scope.$digest()
		}


		return icOverlays
	}

 ])




//updating core Service


.run([
	'ic',
	'icInit',
	'icSite',
	'icItemStorage',
	'icLayout',
	'icTaxonomy',
	'icFilterConfig',
	'icLanguages',
	'icFavourites',
	'icOverlays',
	'icAdmin',

	function(ic, icInit, icSite, icItemStorage, icLayout, icTaxonomy, icFilterConfig, icLanguages, icFavourites, icOverlays, icAdmin){
		ic.init			= icInit
		ic.site			= icSite
		ic.itemStorage 	= icItemStorage
		ic.layout		= icLayout
		ic.taxonomy		= icTaxonomy
		ic.filterConfig	= icFilterConfig
		ic.languages	= icLanguages
		ic.favourites	= icFavourites
		ic.overlays		= icOverlays
		ic.admin		= icAdmin

		console.dir(ic)
	}
])






// .service('icSearchResults', [

// 	'$q',
// 	'$rootScope',
// 	'$timeout',
// 	'icApi',
// 	'icFilterConfig',
// 	'icConfigData',
// 	'icLanguages',
// 	'icItem',

// 	function($q, $rootScope, $timeout, icApi, icFilterConfig, icConfigData, icLanguages, icItem){

// 		var searchResults 				= {}

// 		searchResults.data 				= []
// 		searchResults.offset			= 0
// 		searchResults.limit				= 10000 //todo
// 		searchResults.itemCalls 		= []
// 		searchResults.filteredList		= []
// 		searchResults.noMoreItems		= false
// 		searchResults.meta				= {}
// 		// searchResults.currentRun		= []
// 		searchResults.fullItemDownloads = {}
// 		searchResults.sorting			= false
// 		searchResults.currentListCall	= undefined
// 		searchResults.ready				= true
		

// 		searchResults.storeItem = function(new_item_data){

// 			if(!new_item_data.id){
// 				console.warn('searchResults.storeItem: missing id.')
// 				return null
// 			}

// 			var	item = searchResults.data.filter(function(item){ return item.id == String(new_item_data.id) })[0]

// 			if(!item) searchResults.data.push(item = new icItem())

// 			item.importData(new_item_data)

// 			return item
// 		}

// 		searchResults.removeItem = function(item){
// 			var pos = searchResults.data.indexOf(item)

// 			if(pos != -1) searchResults.data.splice(pos, 1)

// 			searchResults.filterList()

// 		}

// 		searchResults.addNewItem = function(){
// 			var id 		= "new_"+new Date().getTime(),
// 				item 	= undefined 


// 			item 		= searchResults.storeItem({id:id})
// 			item.state	= 'new'

// 			return item
// 		}


// 		searchResults.getItem = function(id){
// 			if(!id) return null

// 			var stored_item = searchResults.data.filter(function(item){ return item.id == String(id) })[0] 

// 			if(!stored_item){
// 				var preliminary_item = {id:id}
// 				stored_item = searchResults.storeItem(preliminary_item)
// 				stored_item.preliminary = true
// 			}

// 			return 	stored_item					
// 		}


// 		searchResults.resetStats = function(){
// 			// searchResults.meta 		= {}
// 			searchResults.offset 		= 0
// 			//searchResults.currentRun	= [] 
// 			return searchResults
// 		}

// 		searchResults.listLoading = function(){
// 			return searchResults.sorting || (searchResults.currentListCall && searchResults.currentListCall.$$state.status == 0)
// 		}



// 		searchResults.download = function(all){

// 			if(!all){
// 				if( icFilterConfig.cleared() ) console.warn('icSearchResults: download without paramters.')

// 				var parameters = {}

// 				// if(icFilterConfig.filterBy.type) 						parameters.type 			= icFilterConfig.filterBy.type
// 				// if(icFilterConfig.filterBy.topics.length != 0)			parameters.topics 			= icFilterConfig.filterBy.topics
// 				// if(icFilterConfig.filterBy.state)						parameters.status			= icFilterConfig.filterBy.state
// 				// if(icFilterConfig.filterBy.targetGroups.length != 0)	parameters.target_groups 	= icFilterConfig.filterBy.targetGroups
// 				// if(icFilterConfig.orderBy)								parameters.order_by			= icFilterConfig.orderBy
// 				if(icFilterConfig.searchTerm)							parameters.query			= icFilterConfig.searchTerm
				
// 				// parameters.asc = icFilterConfig.reverse ? 0 : 1

// 			}


// 			var call = 	icConfigData.ready
// 						.then(function(){ return  all || searchResults.ready })
// 						.then(function(){
// 							if(searchResults.currentListCall) searchResults.currentListCall.cancel()

// 							searchResults.currentListCall =	icApi.getList(
// 																searchResults.limit, 
// 																searchResults.offset, 
// 																parameters
// 															)

// 							return searchResults.currentListCall
// 						})


// 			return 	call
// 					.then(function(result){

// 						result.items = result.items || []

// 						result.items.forEach(function(item_data){
// 							//searchResults.currentRun.push(
// 								searchResults.storeItem(item_data)
// 							//) 
// 						})
						

// 						// searchResults.offset 		+= 	result.items.length
// 						// searchResults.noMoreItems 	= 	result.items 	&& result.items.length == 0 //TODO!! < limit, aber gefiltere suche noch komisch

// 						// if(searchResults.noMoreItems) return result
							

// 						searchResults.filterList()

// 					})
// 		}



// 		searchResults.itemLoading = function(id){

// 			searchResults.itemCalls[id] = 	(searchResults.itemCalls[id] || [])
// 											.filter(function(call){
// 												return call.$$state.status == 0
// 											})

// 			if(searchResults.itemCalls[id].length == 0) delete searchResults.itemCalls[id]

// 			return !!searchResults.itemCalls[id]
// 		}


// 		searchResults.loading = function(){
// 			if(searchResults.listLoading()) return true

// 			for(var id in searchResults.itemCalls){
// 				if(searchResults.itemLoading(id)) return true
// 			}

// 			return false
// 		}


// 		searchResults.downloadItem = function(id, force){
// 			if(!id) return $q.reject('missing id')
// 			//if(searchResults.fullItemDownloads[id] && !force) return $q.resolve(searchResults.getItem(id))

// 			var currentCall = icApi.getItem(id)

// 			searchResults.itemCalls[id] = searchResults.itemCalls[id] || []
// 			searchResults.itemCalls[id].push(currentCall)

// 			return 	currentCall
// 					.then(
// 						function(result){
// 							var item_data 	= result.item,
// 								item		= searchResults.storeItem(item_data)


// 							delete item.preliminary

// 							searchResults.fullItemDownloads[item_data.id] = true
// 						}
// 					)
// 		}


// 		searchResults.clearFilteredList = function(){
// 			while(searchResults.filteredList.length > 0) searchResults.filteredList.pop()
// 		}

// 		searchResults.filterList = function(){


// 			var searchTerm = icFilterConfig.searchTerm && icFilterConfig.searchTerm.replace(/(^\s*|\s*$)/,'')	


// 			icConfigData.ready
// 			.then(function FilterListWhenReady(){

// 				var	results_by_type	=	{}

				
					
// 				results_by_type.any = 	icFilterConfig.cleared()
// 										?	[]
// 										:	searchResults.data
// 											.filter(function(item){
// 												return item.meta.state != 'new' && icFilterConfig.matchItem(item, 'type') //ignore type
// 											})

// 				searchResults.meta.total = results_by_type.any.length		

// 				icConfigData.types.forEach(function(type){
// 					results_by_type[type] 	= 	results_by_type.any
// 												.filter(function(item){
// 													return item.type == type
// 												})
// 					searchResults.meta[type]	=	results_by_type[type].length
// 				})

// 				searchResults.sortFilteredList(results_by_type[icFilterConfig.filterBy.type || 'any'])
// 			})

// 			return searchResults
// 		}


// 		//nochmal überlegen und abstrahieren!:
// 		searchResults.sortingWorker = {
// 			worker:		undefined,
// 			deferred:	undefined,
// 			run:		function(config){
// 							var self = this

// 							if(self.worker) 	self.worker.terminate()
// 							if(self.deferred)	self.deferred.reject()

// 							self.worker 	= new Worker("/workers/sorting_worker.js")
// 							self.deferred	= $q.defer()




// 							config.list = 	config.list.map(function(item){
// 												var mini_item = {}

// 												mini_item.id 				= item.id 
// 												mini_item[config.orderBy] 	= item[config.orderBy]


// 												return mini_item
// 											})


// 							self.worker.postMessage(config)
// 							self.worker.onmessage = function(e){
// 								self.deferred.resolve(e.data)
// 								self.worker 	= undefined
// 								self.deferred 	= undefined
// 							}

// 							return self.deferred.promise
// 						}
// 		}


// 		searchResults.sortFilteredList = function(list){


// 			icConfigData.ready
// 			.then(function(){

// 				searchResults.sorting = true

// 				var keyMap = {
// 						'created_on':		'creationDate',
// 						'last_edit_on': 	'lastEdit',
// 						'title':			'title',
// 						'start_date':		'startDate' 
// 					}

// 				searchResults.sortingWorker.run({
// 					orderBy:	keyMap[icFilterConfig.orderBy],
// 					filterBy:	null,
// 					reverse:	icFilterConfig.reverse,
// 					language:	icSite.currentLanguage,
// 					list: 		list || searchResults.filteredList || []
// 				})
// 				.then(function applySort(map){	
// 				 	searchResults.clearFilteredList()

// 				 	searchResults.data.forEach(function(item){
// 				 		if(item.id in map) searchResults.filteredList[map[item.id]] = item
// 				 	})

// 				})
// 				.finally(function(){
// 					searchResults.sorting = false
// 				})
				
// 			})

// 			return searchResults
// 		}

// 		// searchResults.getPreviousId = function(id){
// 		// 	var pos = false,
// 		// 		i	= 0

// 		// 	while(pos === false && i < searchResults.filteredList.length){
// 		// 		pos = (searchResults.filteredList[i].id == id) && i
// 		// 		i++
// 		// 	}


// 		// 	return 	pos !== false && searchResults.filteredList[pos-1] && searchResults.filteredList[pos-1].id
// 		// }

// 		// searchResults.getNextId = function(id){
// 		// 	var pos = false,
// 		// 		i	= 0


// 		// 	while(pos === false && i < searchResults.filteredList.length){
// 		// 		pos = (searchResults.filteredList[i].id == id) && i
// 		// 		i++
// 		// 	}



// 		// 	if(pos == searchResults.filteredList.length-1){
// 		// 		searchResults.download()
// 		// 	}

// 		// 	return 	pos !== false && searchResults.filteredList[pos+1] && searchResults.filteredList[pos+1].id
// 		// }


// 		searchResults.ready = searchResults.download('ALL')

// 		$rootScope.$watch(
// 			function(){ return 	[
// 									icFilterConfig.filterBy, 
// 									icFilterConfig.searchTerm
// 								] }, 
// 			function(previous, current){ 
// 				if(!icFilterConfig.cleared()){
// 					//with this the interface feels snappier:
// 					window.requestAnimationFrame(function (){
// 						searchResults
// 						.resetStats()
// 						.filterList()

// 						if(previous[1] != current[1])
// 						searchResults.download()
						
// 						$rootScope.$apply()
// 					})
// 				}
// 			},
// 			true
// 		)

// 		$rootScope.$watch(
// 			function(){ return [icFilterConfig.orderBy, icFilterConfig.reverse, icSite.currentLanguage] }, 
// 			function WatchSortFilteredList(p){ 
// 				if(!icFilterConfig.cleared()){
// 					//with this the interface feels snappier:
// 					//$rootScope.$evalAsync(function(){
// 						searchResults
// 						.sortFilteredList()
// 					//})
// 				}
// 			},
// 			true
// 		)

	


// 		return searchResults
// 	}
// ])











// .service('icSiteX', [

// 	'$rootScope',
// 	'$location',
// 	'$translate',
// 	'$timeout',
// 	'icInit',
// 	'icApi',
// 	'smlLayout',
// 	'icFilterConfig',
// 	'icSearchResults',
// 	'icLanguages',
// 	'icOverlays',
// 	'icUser',

// 	function($rootScope, $location, $translate, $timeout, icInit, icApi, smlLayout, icFilterConfig, icSearchResults, icLanguages, icOverlays, icUser){
// 		var icSite 		= 	{
// 								//fullItem:				false,
// 								page:					'main',
// 								//showFilter:			false,
// 								//expandMap:				false,
// 								activeItem:				null,
// 								params:					{
// 															item:	'',			// item for full view
// 															t:		'',			// type filter
// 															s:		'',			// search term
// 															l:		'',			// language
// 															so:		'',			// sorting
// 															d:		'',			// direction
// 															st:		'',			// state, "public", "draft"...
// 															tp:		[],			// topics
// 															tg:		[],			// target groups
// 														},
// 								switches:				{
// 															expandMap:	false
// 														},

// 								availableSections:	['page', 'filter', 'list', 'map', 'item'],

// 								activeSections:		{
// 															page:	true
// 														},

// 								displayedSections:	{
// 															page:	true
// 														}
// 							},
// 							scheduledUpdate,
// 							updateFromParamsScheduled,
// 							setPath


	// 	function path2Params(str){
	// 		var result = {}

	// 		for(var key in icSite.params){
	// 			var regex 		= 	new RegExp('\/'+key+'\/([^/]+)'),
	// 				matches		= 	str.match(regex),
	// 				value_str 	= 	(matches && matches[1])

	// 			if(typeof icSite.params[key] == 'object'){
	// 				//Array:
	// 				result[key] = 	value_str
	// 								?	value_str.split('-')
	// 								:	[]
	// 			} else {
	// 				//String:
	// 				result[key] = 	value_str
	// 								?	value_str
	// 								:	''
	// 			}
	// 		}


	// 		return result
	// 	}



	// 	function params2Path(obj, mode){
	// 		if(!obj) return '/'

	// 		var path = ''

	// 		for(var key in icSite.params){

	// 			var item = 	key in obj
	// 						?	mergeParam(icSite.params[key], obj[key], mode)
	// 						:	icSite.params[key]


	// 			if(!item)									continue
	// 			if(typeof item == 'object' && !item.length)	continue
				

	// 			var value_str = 	typeof item == 'object'
	// 								?	item.join('-')
	// 								:	item

	// 			path += 	'/' + key + '/'+value_str

	// 		}

	// 		return path
	// 	}


	// 	function getParamsFromPath(){
	// 		var path = $location.path()

	// 		if(path != setPath){
	// 			icSite.params 	= path2Params(path)
	// 			setPath 		= undefined
	// 		}
	// 	}

		
	// 	icSite.getNewPath = function(obj, mode){
	// 		return params2Path(obj, mode)
	// 	}


	// 	function schedulePathUpdate(replace){

	// 		if(scheduledUpdate) $timeout.cancel(scheduledUpdate)

	// 		scheduledUpdate = 	$timeout(function(){

	// 								setPath = params2Path({}, 'replace')

	// 								replace
	// 								?	$location.path(setPath).replace()
	// 								:	$location.path(setPath)

	// 							}, 500, true)

	// 		return this
	// 	}

	
	// 	function updateFilterParams(){
	// 		icSite.params.s		= icFilterConfig.searchTerm
	// 		icSite.params.t		= icFilterConfig.filterBy.type
	// 		icSite.params.tp	= icFilterConfig.filterBy.topics
	// 		icSite.params.tg	= icFilterConfig.filterBy.targetGroups
	// 		icSite.params.st	= icFilterConfig.filterBy.state
	// 		icSite.params.so	= icFilterConfig.orderBy
	// 		icSite.params.r		= icFilterConfig.reverse ? 1 : 0
	// 	}

	// 	function updateLanguageParams(){
	// 		icSite.params.l	= icSite.currentLanguage
	// 	}


	// 	icSite.openItem = function(i){
	// 		var id = i.id || i 

	// 		icSite.params.item = id
	// 		return icSite
	// 	}

	// 	icSite.clearItem = function(){
	// 		icSite.params.item 	= undefined
	// 		return icSite
	// 	}

	// 	icSite.setItem = function(i){
	// 		icSite.params.item = i.id || i
	// 		return icSite
	// 	}

	// 	icSite.clearParams = function(){
	// 		$location.path('/')
	// 		return icSite
	// 	}

	// 	icSite.toggleSwitch = function(switch_name, state){
	// 		icSite.switches[switch_name]	=	state == undefined
	// 										?	!icSite.switches[switch_name]
	// 										:	state
	// 		return icSite
	// 	}


	// 	function updateSections(){
			
	// 		//active sections
	// 		icSite.availableSections.forEach(function(key){ delete icSite.activeSections[key]})

	// 		if(icSite.params.item)			icSite.activeSections.item 		= true
	// 		if(icFilterConfig.active())		icSite.activeSections.list 		= true
	// 		if(icFilterConfig.active())		icSite.activeSections.filter 	= true
	// 		if(icSite.pageUrl)				icSite.activeSections.page 		= true
	// 		if(icFilterConfig.active())		icSite.activeSections.map 		= true
	// 		if(icSite.activeSections.item)	icSite.activeSections.map 		= true
			
	// 		//displayed sections:
	// 		icSite.availableSections.forEach(function(key){ 
	// 			if(icSite.show(key)){
	// 				icSite.displayedSections[key] = true
	// 			} else {
	// 				delete icSite.displayedSections[key]
	// 			}
	// 		})

	// 		return icSite
	// 	}


	// 	function updateFromParams(){

	// 		//icSite.fullItem 	= 	!!icSite.params.item

	// 		icSite.pageUrl 							= 	'pages/main.html'
	// 		icSite.activeItem						=	icSearchResults.getItem(icSite.params.item)

	// 		//update icFilterconfig
	// 		icFilterConfig.filterBy.type			=	icSite.params.t 	|| undefined
	// 		icFilterConfig.filterBy.topics			=	icSite.params.tp 	|| []
	// 		icFilterConfig.filterBy.targetGroups	=	icSite.params.tg 	|| []
	// 		icFilterConfig.filterBy.state			=	icSite.params.st 	|| undefined
	// 		icFilterConfig.orderBy					=	icSite.params.so	|| (['events', 'services'].indexOf(icSite.params.t) == -1 ? 'title' : 'start_date') //TODO
	// 		icFilterConfig.reverse					=	!!icSite.params.r	|| false

	// 		icFilterConfig.searchTerm				=	decodeURIComponent(icSite.params.s) || ''


	// 		//updateLanguage
	// 		if(!icSite.currentLanguage){
	// 			icSite.currentLanguage = icSite.params.l
	// 		}	

	// 		if(icSite.params.l && icSite.currentLanguage != icSite.params.l){
	// 			icSite.currentLanguage = icSite.params.l
	// 			icInit.ready
	// 			.then(function(){
	// 				icOverlays.toggle('languageMenu', true)
	// 			})
	// 		}
			

	// 		//update Sections:
	// 		updateSections()


	// 		return this
	// 	}

	// 	icSite.useLocalHeader = function(str){
	// 		switch(smlLayout.mode.name){
	// 			case "XS": 	return false; 			break;
	// 			case "S": 	return false; 			break;
	// 			case "M": 	return str == 'item'; 	break;
	// 			case "L": 	return str == 'item'; 	break;
	// 			case "XL": 	return str == 'item'; 	break;
	// 		}			
	// 	}


	// 	icSite.show = function(str){


	// 		switch(smlLayout.mode.name){
	// 			case "XS":

	// 				switch(str){
	// 					case "page":	return		  'page' 	in icSite.activeSections	
	// 											&&	!('item' 	in icSite.activeSections)
	// 											&&	!('list' 	in icSite.activeSections)
	// 											&&  !('map'		in icSite.activeSections)
	// 					break;

	// 					case "list":	return		'list'	in icSite.activeSections
	// 											&&	!('item'	in icSite.activeSections)
	// 											&&	!icSite.switches.expandMap
	// 					break;

	// 					case "filter":	return		false
	// 					break;

	// 					case "item":	return		'item'	in icSite.activeSections
	// 											&&	!icSite.switches.expandMap
	// 					break;

	// 					case "map":		return		icSite.switches.expandMap
	// 											// ||	'map'	in icSite.activeSections
	// 											// &&	!('item'	in icSite.activeSections)
	// 					break;
	// 				}

	// 				// if('item'	in icSite.activeSections) return str == 'item'
	// 				// if('list'	in icSite.activeSections) return str == 'list'
	// 				// if('page'	in icSite.activeSections) return str == 'page'

	// 			break;
				

	// 			case "S":

	// 				switch(str){
	// 					case "page":	return		  'page' 	in icSite.activeSections	
	// 											&&	!('item' 	in icSite.activeSections)
	// 											&&	!('list' 	in icSite.activeSections)
	// 											&&  !('map'		in icSite.activeSections)
	// 					break;

	// 					case "list":	return		'list'	in icSite.activeSections
	// 											&&	!('item'	in icSite.activeSections)
	// 											&&	!icSite.switches.expandMap
	// 					break;

	// 					case "filter":	return		'filter'in icSite.activeSections
	// 											&&	!('item'	in icSite.activeSections)
	// 					break;

	// 					case "item":	return		'item'	in icSite.activeSections
	// 											&&	!icSite.switches.expandMap
	// 					break;

	// 					case "map":		return		icSite.switches.expandMap
	// 											// ||	'map'	in icSite.activeSections
	// 											// &&	!('item'	in icSite.activeSections)
	// 					break;
	// 				}

	// 			break;
				
				
	// 			case "M":	

	// 				switch(str){
	// 					case "page":	return		 'page' 	in icSite.activeSections	
	// 											&&	!('item' 	in icSite.activeSections)
	// 											&&	!('list' 	in icSite.activeSections)
	// 											&&  !('map'		in icSite.activeSections)
	// 					break;

	// 					case "list":	return		'list'	in icSite.activeSections
	// 											&&	!icSite.switches.expandMap
	// 					break;

	// 					case "filter":	return		'filter'in icSite.activeSections
	// 											&&	!('item'	in icSite.activeSections)
	// 					break;

	// 					case "item":	return		'item'	in icSite.activeSections
	// 											&&	!icSite.switches.expandMap
	// 					break;
						
	// 					case "map":		return		icSite.switches.expandMap
	// 											||	'map'	in icSite.activeSections
	// 											&&	!('item'	in icSite.activeSections)
	// 					break;
	// 				}		

	// 			break;
				
				
	// 			case "L":


	// 				switch(str){
	// 					case "page":	return		  'page' 	in icSite.activeSections	
	// 											&&	!('item' 	in icSite.activeSections)
	// 											&&	!('list' 	in icSite.activeSections)
	// 											&&  !('map'		in icSite.activeSections)
	// 					break;

	// 					case "list":	return		'list'	in icSite.activeSections
	// 											&&	!icSite.switches.expandMap
	// 					break;

	// 					case "filter":	return		'filter'in icSite.activeSections
	// 					break;

	// 					case "item":	return		'item'	in icSite.activeSections
	// 											&&	!icSite.switches.expandMap
	// 					break;

	// 					case "map":		return		'map'	in icSite.activeSections
	// 					break;
	// 				}



	// 				// if(
	// 				// 		'item'	in icSite.activeSections
	// 				// 	&&	'list'	in icSite.activeSections
	// 				// ){

	// 				// 	return str == 'item'|| (str == 'list' && !icSite.switches.expandMap) || str == 'filter'
	// 				// }

	// 				// if('item'	in icSite.activeSections) return str == 'item'
	// 				// if('list'	in icSite.activeSections) return str == 'list' || str == 'filter'
	// 				// if('page' 	in icSite.activeSections) return str == 'page'

	// 			break;
				
				
	// 			case "XL":

	// 				switch(str){
	// 					case "page":	return		  'page' 	in icSite.activeSections	
	// 											&&	!('item' 	in icSite.activeSections)
	// 											&&	!('list' 	in icSite.activeSections)
	// 											&&  !('map'		in icSite.activeSections)
	// 					break;

	// 					case "list":	return		'list'	in icSite.activeSections
	// 											&&	!icSite.switches.expandMap
	// 					break;

	// 					case "filter":	return		'filter'in icSite.activeSections
	// 					break;

	// 					case "item":	return		'item'	in icSite.activeSections
	// 											&&	!icSite.switches.expandMap
	// 					break;

	// 					case "map":		return		'map'	in icSite.activeSections
	// 					break;
	// 				}


	// 			break;

	// 		}
	// 		return false
	// 	}



	// 	//setup
	// 	getParamsFromPath()		

	// 	$rootScope.$on('$locationChangeSuccess', 							getParamsFromPath)
	// 	$rootScope.$watch(function(){ return icFilterConfig }, 				updateFilterParams, true)
	// 	$rootScope.$watch(function(){ return icSite.currentLanguage },	updateLanguageParams)
	// 	$rootScope.$watch(function(){ return smlLayout.mode.name },			updateSections)
	// 	$rootScope.$watch(function(){ return icSite.switches.expandMap },			updateSections)

	// 	$rootScope.$watch(
	// 		function(){ return icSite.params},				
	// 		function(){
	// 			updateFromParams()
	// 			updateSections()
	// 			schedulePathUpdate()
	// 		},
	// 		true
	// 	)

	// 	$rootScope.$on('loginRequired', function(event, message){ 
	// 		icOverlays.open('login', message)
	// 		.then(function(){
	// 			//window.location.reload()
	// 		})
	// 	})

	// 	return icSite
	// }
								
// ])



// /*

// 	Contains:

// 	* icConfigData,
// 	* icFilterConfig,
// 	* icSite,
// 	* icSearchResults
// 	...

// */














// .service('icFilterConfig', [

// 	'$rootScope',

// 	function($rootScope){

// 		var icFilterConfig = 	{
// 						filterBy:	{
// 										type:			undefined,
// 										topics:			[],
// 										targetGroups:	[],
// 										state:			undefined,
// 									},
// 						orderBy:	"", // title, start_date
// 						reverse:	false,
// 						searchTerm: ''
// 					}




// 		icFilterConfig.matchFilter = function(key, haystack, empty_matches_all){
			
// 			//called to often
// 			var needles = 	typeof icFilterConfig.filterBy[key] == 'string'
// 	 						?	[icFilterConfig.filterBy[key]]
// 	 						:	icFilterConfig.filterBy[key]



// 			if(haystack === undefined || haystack == null || haystack.length == 0) 		return needles === undefined || needles.length == 0
// 			if(needles === undefined || needles.length == 0)							return empty_matches_all
		 	
// 		 	return	needles.some(function(needle){
// 						return 	typeof haystack == 'object'
// 								?	haystack.indexOf(needle) != -1
// 								:	haystack == needle
// 			 		})
// 		}

// 		function deepSearch(haystack, needle, prio){


// 			if(!needle) 	return true
// 			if(!haystack)	return false

// 			needle 	= 	typeof needle == 'string' 
// 						?	new RegExp(needle.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi')
// 						:	needle


// 			switch(typeof haystack){
// 				case 'function':
// 					return false
// 				break;

// 				case 'object':
// 					if( prio && (prio in haystack) && deepSearch(haystack[prio], needle, prio) ) return true
// 					for(var key in haystack){
// 						if(key != prio && deepSearch(haystack[key], needle, prio)) return true
// 					}
// 				break;

// 				default:
// 					return String(haystack).match(needle) != null
// 				break;
// 			}
	
// 			return false
// 		}


// 		icFilterConfig.matchItem = function(item, ignore_key){

// 			for(var key in icFilterConfig.filterBy){
// 				if(key == ignore_key) continue
// 				if(!icFilterConfig.matchFilter(key, item[key], true)) return false
// 			}

// 			var ds = deepSearch(item, icFilterConfig.searchTerm, 'queries')

// 			return	ds
// 		}


// 		icFilterConfig.addFilter = function(key, value){
// 			icFilterConfig.filterBy[key] = mergeParam(icFilterConfig.filterBy[key], value, 'add')

// 			return icFilterConfig
// 		}

// 		icFilterConfig.toggleFilter = function(key, value){
// 			icFilterConfig.filterBy[key] = mergeParam(icFilterConfig.filterBy[key], value, 'toggle')

// 			return icFilterConfig
// 		}

// 		// icFilterConfig.sortBy = function(key, direction){
// 		// 	icFilterConfig.orderBy 		= key
// 		// 	icFilterConfig.direction	= direction

// 		// 	return icFilterConfig
// 		// }

// 		icFilterConfig.clearFilter = function(key){
// 			if(key === undefined){
// 				for(key in icFilterConfig.filterBy){
// 					icFilterConfig.clearFilter(key)
// 				}
// 				icFilterConfig.orderBy 		= ''
// 				icFilterConfig.searchTerm 	= ''
// 				icFilterConfig.reverse 		= false
// 			}else{

// 				var item = icFilterConfig.filterBy[key]

// 				icFilterConfig.filterBy[key] = 	typeof icFilterConfig.filterBy[key] == 'object'
// 												?	[]
// 												:	undefined
// 			}
// 			return icFilterConfig
// 		}
		


// 		icFilterConfig.cleared = function(){
// 			var cleared = true

// 			for(var key in icFilterConfig.filterBy){
// 				cleared = cleared && (!icFilterConfig.filterBy[key] || !icFilterConfig.filterBy[key].length)
// 			}			

// 			cleared = 		cleared 
// 						&& 	!icFilterConfig.searchTerm

// 			return cleared
// 		}


// 		icFilterConfig.active = function(){
// 			return !icFilterConfig.cleared()
// 		}


// 		$rootScope.$watch(
// 			function(){ return icFilterConfig.filterBy.type },
// 			function(){
// 				icFilterConfig.orderBy	=	['services', 'events'].indexOf(icFilterConfig.filterBy.type) == -1
// 											?	'title'
// 											:	'start_date'
// 			}
// 	)


		
// 		return icFilterConfig

// 	}

// ])















// /* icSite */


// .service('icSite', [

// 	'$rootScope',
// 	'$location',
// 	'$translate',
// 	'$timeout',
// 	'icInit',
// 	'icApi',
// 	'smlLayout',
// 	'icFilterConfig',
// 	'icSearchResults',
// 	'icLanguages',
// 	'icOverlays',
// 	'icUser',

// 	function($rootScope, $location, $translate, $timeout, icInit, icApi, smlLayout, icFilterConfig, icSearchResults, icLanguages, icOverlays, icUser){
// 		var icSite 		= 	{
// 								//fullItem:				false,
// 								page:					'main',
// 								//showFilter:			false,
// 								//expandMap:				false,
// 								activeItem:				null,
// 								params:					{
// 															item:	'',			// item for full view
// 															t:		'',			// type filter
// 															s:		'',			// search term
// 															l:		'',			// language
// 															so:		'',			// sorting
// 															d:		'',			// direction
// 															st:		'',			// state, "public", "draft"...
// 															tp:		[],			// topics
// 															tg:		[],			// target groups
// 														},
// 								switches:				{
// 															expandMap:	false
// 														},

// 								availableSections:	['page', 'filter', 'list', 'map', 'item'],

// 								activeSections:		{
// 															page:	true
// 														},

// 								displayedSections:	{
// 															page:	true
// 														}
// 							},
// 							scheduledUpdate,
// 							updateFromParamsScheduled,
// 							setPath


// 		function path2Params(str){
// 			var result = {}

// 			for(var key in icSite.params){
// 				var regex 		= 	new RegExp('\/'+key+'\/([^/]+)'),
// 					matches		= 	str.match(regex),
// 					value_str 	= 	(matches && matches[1])

// 				if(typeof icSite.params[key] == 'object'){
// 					//Array:
// 					result[key] = 	value_str
// 									?	value_str.split('-')
// 									:	[]
// 				} else {
// 					//String:
// 					result[key] = 	value_str
// 									?	value_str
// 									:	''
// 				}
// 			}


// 			return result
// 		}



// 		function params2Path(obj, mode){
// 			if(!obj) return '/'

// 			var path = ''

// 			for(var key in icSite.params){

// 				var item = 	key in obj
// 							?	mergeParam(icSite.params[key], obj[key], mode)
// 							:	icSite.params[key]


// 				if(!item)									continue
// 				if(typeof item == 'object' && !item.length)	continue
				

// 				var value_str = 	typeof item == 'object'
// 									?	item.join('-')
// 									:	item

// 				path += 	'/' + key + '/'+value_str

// 			}

// 			return path
// 		}


// 		function getParamsFromPath(){
// 			var path = $location.path()

// 			if(path != setPath){
// 				icSite.params 	= path2Params(path)
// 				setPath 		= undefined
// 			}
// 		}

		
// 		icSite.getNewPath = function(obj, mode){
// 			return params2Path(obj, mode)
// 		}


// 		function schedulePathUpdate(replace){

// 			if(scheduledUpdate) $timeout.cancel(scheduledUpdate)

// 			scheduledUpdate = 	$timeout(function(){

// 									setPath = params2Path({}, 'replace')

// 									replace
// 									?	$location.path(setPath).replace()
// 									:	$location.path(setPath)

// 								}, 500, true)

// 			return this
// 		}

	
// 		function updateFilterParams(){
// 			icSite.params.s		= icFilterConfig.searchTerm
// 			icSite.params.t		= icFilterConfig.filterBy.type
// 			icSite.params.tp	= icFilterConfig.filterBy.topics
// 			icSite.params.tg	= icFilterConfig.filterBy.targetGroups
// 			icSite.params.st	= icFilterConfig.filterBy.state
// 			icSite.params.so	= icFilterConfig.orderBy
// 			icSite.params.r		= icFilterConfig.reverse ? 1 : 0
// 		}

// 		function updateLanguageParams(){
// 			icSite.params.l	= icSite.currentLanguage
// 		}


// 		icSite.openItem = function(i){
// 			var id = i.id || i 

// 			icSite.params.item = id
// 			return icSite
// 		}

// 		icSite.clearItem = function(){
// 			icSite.params.item 	= undefined
// 			return icSite
// 		}

// 		icSite.setItem = function(i){
// 			icSite.params.item = i.id || i
// 			return icSite
// 		}

// 		icSite.clearParams = function(){
// 			$location.path('/')
// 			return icSite
// 		}

// 		icSite.toggleSwitch = function(switch_name, state){
// 			icSite.switches[switch_name]	=	state == undefined
// 											?	!icSite.switches[switch_name]
// 											:	state
// 			return icSite
// 		}


// 		function updateSections(){
			
// 			//active sections
// 			icSite.availableSections.forEach(function(key){ delete icSite.activeSections[key]})

// 			if(icSite.params.item)			icSite.activeSections.item 		= true
// 			if(icFilterConfig.active())		icSite.activeSections.list 		= true
// 			if(icFilterConfig.active())		icSite.activeSections.filter 	= true
// 			if(icSite.pageUrl)				icSite.activeSections.page 		= true
// 			if(icFilterConfig.active())		icSite.activeSections.map 		= true
// 			if(icSite.activeSections.item)	icSite.activeSections.map 		= true
			
// 			//displayed sections:
// 			icSite.availableSections.forEach(function(key){ 
// 				if(icSite.show(key)){
// 					icSite.displayedSections[key] = true
// 				} else {
// 					delete icSite.displayedSections[key]
// 				}
// 			})

// 			return icSite
// 		}


// 		function updateFromParams(){

// 			//icSite.fullItem 	= 	!!icSite.params.item

// 			icSite.pageUrl 							= 	'pages/main.html'
// 			icSite.activeItem						=	icSearchResults.getItem(icSite.params.item)

// 			//update icFilterconfig
// 			icFilterConfig.filterBy.type			=	icSite.params.t 	|| undefined
// 			icFilterConfig.filterBy.topics			=	icSite.params.tp 	|| []
// 			icFilterConfig.filterBy.targetGroups	=	icSite.params.tg 	|| []
// 			icFilterConfig.filterBy.state			=	icSite.params.st 	|| undefined
// 			icFilterConfig.orderBy					=	icSite.params.so	|| (['events', 'services'].indexOf(icSite.params.t) == -1 ? 'title' : 'start_date') //TODO
// 			icFilterConfig.reverse					=	!!icSite.params.r	|| false

// 			icFilterConfig.searchTerm				=	decodeURIComponent(icSite.params.s) || ''


// 			//updateLanguage
// 			if(!icSite.currentLanguage){
// 				icSite.currentLanguage = icSite.params.l
// 			}	

// 			if(icSite.params.l && icSite.currentLanguage != icSite.params.l){
// 				icSite.currentLanguage = icSite.params.l
// 				icInit.ready
// 				.then(function(){
// 					icOverlays.toggle('languageMenu', true)
// 				})
// 			}
			

// 			//update Sections:
// 			updateSections()


// 			return this
// 		}

// 		icSite.useLocalHeader = function(str){
// 			switch(smlLayout.mode.name){
// 				case "XS": 	return false; 			break;
// 				case "S": 	return false; 			break;
// 				case "M": 	return str == 'item'; 	break;
// 				case "L": 	return str == 'item'; 	break;
// 				case "XL": 	return str == 'item'; 	break;
// 			}			
// 		}


// 		icSite.show = function(str){


// 			switch(smlLayout.mode.name){
// 				case "XS":

// 					switch(str){
// 						case "page":	return		  'page' 	in icSite.activeSections	
// 												&&	!('item' 	in icSite.activeSections)
// 												&&	!('list' 	in icSite.activeSections)
// 												&&  !('map'		in icSite.activeSections)
// 						break;

// 						case "list":	return		'list'	in icSite.activeSections
// 												&&	!('item'	in icSite.activeSections)
// 												&&	!icSite.switches.expandMap
// 						break;

// 						case "filter":	return		false
// 						break;

// 						case "item":	return		'item'	in icSite.activeSections
// 												&&	!icSite.switches.expandMap
// 						break;

// 						case "map":		return		icSite.switches.expandMap
// 												// ||	'map'	in icSite.activeSections
// 												// &&	!('item'	in icSite.activeSections)
// 						break;
// 					}

// 					// if('item'	in icSite.activeSections) return str == 'item'
// 					// if('list'	in icSite.activeSections) return str == 'list'
// 					// if('page'	in icSite.activeSections) return str == 'page'

// 				break;
				

// 				case "S":

// 					switch(str){
// 						case "page":	return		  'page' 	in icSite.activeSections	
// 												&&	!('item' 	in icSite.activeSections)
// 												&&	!('list' 	in icSite.activeSections)
// 												&&  !('map'		in icSite.activeSections)
// 						break;

// 						case "list":	return		'list'	in icSite.activeSections
// 												&&	!('item'	in icSite.activeSections)
// 												&&	!icSite.switches.expandMap
// 						break;

// 						case "filter":	return		'filter'in icSite.activeSections
// 												&&	!('item'	in icSite.activeSections)
// 						break;

// 						case "item":	return		'item'	in icSite.activeSections
// 												&&	!icSite.switches.expandMap
// 						break;

// 						case "map":		return		icSite.switches.expandMap
// 												// ||	'map'	in icSite.activeSections
// 												// &&	!('item'	in icSite.activeSections)
// 						break;
// 					}

// 				break;
				
				
// 				case "M":	

// 					switch(str){
// 						case "page":	return		 'page' 	in icSite.activeSections	
// 												&&	!('item' 	in icSite.activeSections)
// 												&&	!('list' 	in icSite.activeSections)
// 												&&  !('map'		in icSite.activeSections)
// 						break;

// 						case "list":	return		'list'	in icSite.activeSections
// 												&&	!icSite.switches.expandMap
// 						break;

// 						case "filter":	return		'filter'in icSite.activeSections
// 												&&	!('item'	in icSite.activeSections)
// 						break;

// 						case "item":	return		'item'	in icSite.activeSections
// 												&&	!icSite.switches.expandMap
// 						break;
						
// 						case "map":		return		icSite.switches.expandMap
// 												||	'map'	in icSite.activeSections
// 												&&	!('item'	in icSite.activeSections)
// 						break;
// 					}		

// 				break;
				
				
// 				case "L":


// 					switch(str){
// 						case "page":	return		  'page' 	in icSite.activeSections	
// 												&&	!('item' 	in icSite.activeSections)
// 												&&	!('list' 	in icSite.activeSections)
// 												&&  !('map'		in icSite.activeSections)
// 						break;

// 						case "list":	return		'list'	in icSite.activeSections
// 												&&	!icSite.switches.expandMap
// 						break;

// 						case "filter":	return		'filter'in icSite.activeSections
// 						break;

// 						case "item":	return		'item'	in icSite.activeSections
// 												&&	!icSite.switches.expandMap
// 						break;

// 						case "map":		return		'map'	in icSite.activeSections
// 						break;
// 					}



// 					// if(
// 					// 		'item'	in icSite.activeSections
// 					// 	&&	'list'	in icSite.activeSections
// 					// ){

// 					// 	return str == 'item'|| (str == 'list' && !icSite.switches.expandMap) || str == 'filter'
// 					// }

// 					// if('item'	in icSite.activeSections) return str == 'item'
// 					// if('list'	in icSite.activeSections) return str == 'list' || str == 'filter'
// 					// if('page' 	in icSite.activeSections) return str == 'page'

// 				break;
				
				
// 				case "XL":

// 					switch(str){
// 						case "page":	return		  'page' 	in icSite.activeSections	
// 												&&	!('item' 	in icSite.activeSections)
// 												&&	!('list' 	in icSite.activeSections)
// 												&&  !('map'		in icSite.activeSections)
// 						break;

// 						case "list":	return		'list'	in icSite.activeSections
// 												&&	!icSite.switches.expandMap
// 						break;

// 						case "filter":	return		'filter'in icSite.activeSections
// 						break;

// 						case "item":	return		'item'	in icSite.activeSections
// 												&&	!icSite.switches.expandMap
// 						break;

// 						case "map":		return		'map'	in icSite.activeSections
// 						break;
// 					}


// 				break;

// 			}
// 			return false
// 		}



// 		//setup
// 		getParamsFromPath()		

// 		$rootScope.$on('$locationChangeSuccess', 							getParamsFromPath)
// 		$rootScope.$watch(function(){ return icFilterConfig }, 				updateFilterParams, true)
// 		$rootScope.$watch(function(){ return icSite.currentLanguage },	updateLanguageParams)
// 		$rootScope.$watch(function(){ return smlLayout.mode.name },			updateSections)
// 		$rootScope.$watch(function(){ return icSite.switches.expandMap },			updateSections)

// 		$rootScope.$watch(
// 			function(){ return icSite.params},				
// 			function(){
// 				updateFromParams()
// 				updateSections()
// 				schedulePathUpdate()
// 			},
// 			true
// 		)

// 		$rootScope.$on('loginRequired', function(event, message){ 
// 			icOverlays.open('login', message)
// 			.then(function(){
// 				//window.location.reload()
// 			})
// 		})

// 		return icSite
// 	}
								
// ])













// //Todo: icItem should be able to download itself


// .service('icItem', [

// 	'icApi',
// 	'icUser', //Workaround, icItem should no require user information

// 	function(icApi, icUser){
// 		return function IcItem(item_data){
// 			var icItem					=	this,
// 				rawStringProperties 	= 	{
// 												id:				'id',
// 												title:			'title',
// 												type:			'type',
// 												imageUrl:		'image_url',
// 												zip:			'zip_code',
// 												location:		'place',
// 												country:		'country',
// 												name:			'name',
// 												website:		'website',
// 												facebook:		'facebook',
// 												twitter:		'twitter',
// 												//instagram:		'instagram',
// 												primaryTopic:	'primary_topic',
// 												address:		'address', 
// 												phone:			'phone', 
// 												email:			'email',
// 												price:			'price',
// 												maxParticipants:'max_participants',
// 												hours:			'times',
// 												state:			'status',
// 												lastEdit:		'last_edit_on',
// 												creationDate:	'created_on',
// 												startDate:		'start_date',
// 												dateComment:	'date_comment',
// 												endDate:		'end_date',
// 												latitude:		'latitude',
// 												longitude:		'longitude',
// 												comment:		'comment',
// 											},

// 				rawHashes				=	{
// 												definition:		'definitions',
// 												description:	'descriptions_full',
// 												meta:			'meta'
// 											},

// 				rawArrays				=	{
// 												topics:			'topics',
// 												targetGroups:	'target_groups'
// 											}

// 			for(var key in rawStringProperties)	{ icItem[key] = "" }								
// 			for(var key in rawHashes)			{ icItem[key] = {} }								
// 			for(var key in rawArrays)			{ icItem[key] = [] }								


// 			//special properties:

// 			icItem.queries 		= 	[]


// 			icItem.importData = function(item_data){


// 				var data = item_data

// 				if(!data) return icItem


// 				//temporary workaround:			
// 				;(data.contacts||[]).forEach(function(obj){
// 					data[Object.keys(obj)[0]] = obj[Object.keys(obj)[0]]
// 				})

// 				// Fallbacks:
// 				data.primary_topic = data.primary_topic || (data.topics && data.topics[0])



// 				//Strings:			
// 				for( key in rawStringProperties)	{ icItem[key] = data[rawStringProperties[key]] 	=== undefined ? icItem[key]	: (data[rawStringProperties[key]] || "") }
// 				for( key in rawArrays)				{ icItem[key] = data[rawArrays[key]] 			=== undefined ? icItem[key] : (data[rawArrays[key]] || []) }
// 				for( key in rawHashes)				{ angular.merge(icItem[key], data[rawHashes[key]]) }


// 				//special properties:
				
// 				// if(data.coordinates && data.coordinates.length == 2){
// 				// 	icItem.latitude = data.coordinates[0]
// 				// 	icItem.logitude = data.coordinates[1]
// 				// }

// 				if(data.query) angular.merge(icItem.queries, [data.query])

// 				return icItem
// 			}

// 			icItem.getExternalKey = function(internal_key){
// 				return 		rawStringProperties[internal_key]
// 						||	rawHashes[internal_key]
// 						||	rawArrays[internal_key]
// 			}		

// 			icItem.exportData = function(){
// 				var export_data = {}

// 				for(var key in rawStringProperties)	{ export_data[rawStringProperties[key]] = icItem[key] }
// 				for(var key in rawHashes)			{ export_data[rawHashes[key]] 			= icItem[key] }							
// 				for(var key in rawArrays)			{ export_data[rawArrays[key]] 			= icItem[key] }

// 				//workaround, TODO: 
// 				if(!export_data.status){
// 					export_data.status = 	icUser.can('edit_items') || icUser.can('add_new_items')
// 											?	'draft'
// 											:	'suggestion'
// 				}

// 				return export_data
// 			}


// 			function getData(key, subkey){
// 				var export_data = icItem.exportData(),
// 					data		= {},
// 					e_key		= rawStringProperties[key] || rawHashes[key] || rawArrays[key],
// 					e_subkey	= subkey


// 				if(e_key)		data[e_key] 			= {}
// 				if(e_subkey)	data[e_key][e_subkey]	= {}

// 				if(subkey){
// 					data[e_key][e_subkey] = export_data[e_key][e_subkey]
// 					return 	data

// 							// this should not be here?!
// 							// icApi.updateItem(icItem.id, data)
// 							// .then(function(item_data){
// 							// 	return item_data
// 							// })
// 				}

// 				if(key){
// 					data[e_key] = export_data[e_key]
// 					return 	data

// 							// this should not be here?!
// 							// icApi.updateItem(icItem.id, data)
// 							// .then(function(item_data){
// 							// 	return item_data
// 							// })
// 				}

// 				return export_data
// 			}

// 			icItem.update = function(key, subkey){

// 				return 	icApi.updateItem(icItem.id, getData(key, subkey))
// 						.then(function(item_data){
// 							return item_data
// 						})
// 			}


// 			icItem.submitAsNew = function(){
// 				return icApi.newItem(getData(null, null))
// 			}


// 			icItem.delete = function(){
// 				return icApi.deleteItem(icItem.id)
// 			}

// 			if(!!item_data) icItem.importData(item_data)

// 		}
// 	}	
// ])









// .service('icSearchResults', [

// 	'$q',
// 	'$rootScope',
// 	'$timeout',
// 	'icApi',
// 	'icFilterConfig',
// 	'icConfigData',
// 	'icLanguages',
// 	'icItem',

// 	function($q, $rootScope, $timeout, icApi, icFilterConfig, icConfigData, icLanguages, icItem){

// 		var searchResults 				= {}

// 		searchResults.data 				= []
// 		searchResults.offset			= 0
// 		searchResults.limit				= 10000 //todo
// 		searchResults.itemCalls 		= []
// 		searchResults.filteredList		= []
// 		searchResults.noMoreItems		= false
// 		searchResults.meta				= {}
// 		// searchResults.currentRun		= []
// 		searchResults.fullItemDownloads = {}
// 		searchResults.sorting			= false
// 		searchResults.currentListCall	= undefined
// 		searchResults.ready				= true
		

// 		searchResults.storeItem = function(new_item_data){

// 			if(!new_item_data.id){
// 				console.warn('searchResults.storeItem: missing id.')
// 				return null
// 			}

// 			var	item = searchResults.data.filter(function(item){ return item.id == String(new_item_data.id) })[0]

// 			if(!item) searchResults.data.push(item = new icItem())

// 			item.importData(new_item_data)

// 			return item
// 		}

// 		searchResults.removeItem = function(item){
// 			var pos = searchResults.data.indexOf(item)

// 			if(pos != -1) searchResults.data.splice(pos, 1)

// 			searchResults.filterList()

// 		}

// 		searchResults.addNewItem = function(){
// 			var id 		= "new_"+new Date().getTime(),
// 				item 	= undefined 


// 			item 		= searchResults.storeItem({id:id})
// 			item.state	= 'new'

// 			return item
// 		}


// 		searchResults.getItem = function(id){
// 			if(!id) return null

// 			var stored_item = searchResults.data.filter(function(item){ return item.id == String(id) })[0] 

// 			if(!stored_item){
// 				var preliminary_item = {id:id}
// 				stored_item = searchResults.storeItem(preliminary_item)
// 				stored_item.preliminary = true
// 			}

// 			return 	stored_item					
// 		}


// 		searchResults.resetStats = function(){
// 			// searchResults.meta 		= {}
// 			searchResults.offset 		= 0
// 			//searchResults.currentRun	= [] 
// 			return searchResults
// 		}

// 		searchResults.listLoading = function(){
// 			return searchResults.sorting || (searchResults.currentListCall && searchResults.currentListCall.$$state.status == 0)
// 		}



// 		searchResults.download = function(all){

// 			if(!all){
// 				if( icFilterConfig.cleared() ) console.warn('icSearchResults: download without paramters.')

// 				var parameters = {}

// 				// if(icFilterConfig.filterBy.type) 						parameters.type 			= icFilterConfig.filterBy.type
// 				// if(icFilterConfig.filterBy.topics.length != 0)			parameters.topics 			= icFilterConfig.filterBy.topics
// 				// if(icFilterConfig.filterBy.state)						parameters.status			= icFilterConfig.filterBy.state
// 				// if(icFilterConfig.filterBy.targetGroups.length != 0)	parameters.target_groups 	= icFilterConfig.filterBy.targetGroups
// 				// if(icFilterConfig.orderBy)								parameters.order_by			= icFilterConfig.orderBy
// 				if(icFilterConfig.searchTerm)							parameters.query			= icFilterConfig.searchTerm
				
// 				// parameters.asc = icFilterConfig.reverse ? 0 : 1

// 			}


// 			var call = 	icConfigData.ready
// 						.then(function(){ return  all || searchResults.ready })
// 						.then(function(){
// 							if(searchResults.currentListCall) searchResults.currentListCall.cancel()

// 							searchResults.currentListCall =	icApi.getList(
// 																searchResults.limit, 
// 																searchResults.offset, 
// 																parameters
// 															)

// 							return searchResults.currentListCall
// 						})


// 			return 	call
// 					.then(function(result){

// 						result.items = result.items || []

// 						result.items.forEach(function(item_data){
// 							//searchResults.currentRun.push(
// 								searchResults.storeItem(item_data)
// 							//) 
// 						})
						

// 						// searchResults.offset 		+= 	result.items.length
// 						// searchResults.noMoreItems 	= 	result.items 	&& result.items.length == 0 //TODO!! < limit, aber gefiltere suche noch komisch

// 						// if(searchResults.noMoreItems) return result
							

// 						searchResults.filterList()

// 					})
// 		}



// 		searchResults.itemLoading = function(id){

// 			searchResults.itemCalls[id] = 	(searchResults.itemCalls[id] || [])
// 											.filter(function(call){
// 												return call.$$state.status == 0
// 											})

// 			if(searchResults.itemCalls[id].length == 0) delete searchResults.itemCalls[id]

// 			return !!searchResults.itemCalls[id]
// 		}


// 		searchResults.loading = function(){
// 			if(searchResults.listLoading()) return true

// 			for(var id in searchResults.itemCalls){
// 				if(searchResults.itemLoading(id)) return true
// 			}

// 			return false
// 		}


// 		searchResults.downloadItem = function(id, force){
// 			if(!id) return $q.reject('missing id')
// 			//if(searchResults.fullItemDownloads[id] && !force) return $q.resolve(searchResults.getItem(id))

// 			var currentCall = icApi.getItem(id)

// 			searchResults.itemCalls[id] = searchResults.itemCalls[id] || []
// 			searchResults.itemCalls[id].push(currentCall)

// 			return 	currentCall
// 					.then(
// 						function(result){
// 							var item_data 	= result.item,
// 								item		= searchResults.storeItem(item_data)


// 							delete item.preliminary

// 							searchResults.fullItemDownloads[item_data.id] = true
// 						}
// 					)
// 		}


// 		searchResults.clearFilteredList = function(){
// 			while(searchResults.filteredList.length > 0) searchResults.filteredList.pop()
// 		}

// 		searchResults.filterList = function(){


// 			var searchTerm = icFilterConfig.searchTerm && icFilterConfig.searchTerm.replace(/(^\s*|\s*$)/,'')	


// 			icConfigData.ready
// 			.then(function FilterListWhenReady(){

// 				var	results_by_type	=	{}

				
					
// 				results_by_type.any = 	icFilterConfig.cleared()
// 										?	[]
// 										:	searchResults.data
// 											.filter(function(item){
// 												return item.meta.state != 'new' && icFilterConfig.matchItem(item, 'type') //ignore type
// 											})

// 				searchResults.meta.total = results_by_type.any.length		

// 				icConfigData.types.forEach(function(type){
// 					results_by_type[type] 	= 	results_by_type.any
// 												.filter(function(item){
// 													return item.type == type
// 												})
// 					searchResults.meta[type]	=	results_by_type[type].length
// 				})

// 				searchResults.sortFilteredList(results_by_type[icFilterConfig.filterBy.type || 'any'])
// 			})

// 			return searchResults
// 		}


// 		//nochmal überlegen und abstrahieren!:
// 		searchResults.sortingWorker = {
// 			worker:		undefined,
// 			deferred:	undefined,
// 			run:		function(config){
// 							var self = this

// 							if(self.worker) 	self.worker.terminate()
// 							if(self.deferred)	self.deferred.reject()

// 							self.worker 	= new Worker("/workers/sorting_worker.js")
// 							self.deferred	= $q.defer()




// 							config.list = 	config.list.map(function(item){
// 												var mini_item = {}

// 												mini_item.id 				= item.id 
// 												mini_item[config.orderBy] 	= item[config.orderBy]


// 												return mini_item
// 											})


// 							self.worker.postMessage(config)
// 							self.worker.onmessage = function(e){
// 								self.deferred.resolve(e.data)
// 								self.worker 	= undefined
// 								self.deferred 	= undefined
// 							}

// 							return self.deferred.promise
// 						}
// 		}


// 		searchResults.sortFilteredList = function(list){


// 			icConfigData.ready
// 			.then(function(){

// 				searchResults.sorting = true

// 				var keyMap = {
// 						'created_on':		'creationDate',
// 						'last_edit_on': 	'lastEdit',
// 						'title':			'title',
// 						'start_date':		'startDate' 
// 					}

// 				searchResults.sortingWorker.run({
// 					orderBy:	keyMap[icFilterConfig.orderBy],
// 					filterBy:	null,
// 					reverse:	icFilterConfig.reverse,
// 					language:	icSite.currentLanguage,
// 					list: 		list || searchResults.filteredList || []
// 				})
// 				.then(function applySort(map){	
// 				 	searchResults.clearFilteredList()

// 				 	searchResults.data.forEach(function(item){
// 				 		if(item.id in map) searchResults.filteredList[map[item.id]] = item
// 				 	})

// 				})
// 				.finally(function(){
// 					searchResults.sorting = false
// 				})
				
// 			})

// 			return searchResults
// 		}

// 		// searchResults.getPreviousId = function(id){
// 		// 	var pos = false,
// 		// 		i	= 0

// 		// 	while(pos === false && i < searchResults.filteredList.length){
// 		// 		pos = (searchResults.filteredList[i].id == id) && i
// 		// 		i++
// 		// 	}


// 		// 	return 	pos !== false && searchResults.filteredList[pos-1] && searchResults.filteredList[pos-1].id
// 		// }

// 		// searchResults.getNextId = function(id){
// 		// 	var pos = false,
// 		// 		i	= 0


// 		// 	while(pos === false && i < searchResults.filteredList.length){
// 		// 		pos = (searchResults.filteredList[i].id == id) && i
// 		// 		i++
// 		// 	}



// 		// 	if(pos == searchResults.filteredList.length-1){
// 		// 		searchResults.download()
// 		// 	}

// 		// 	return 	pos !== false && searchResults.filteredList[pos+1] && searchResults.filteredList[pos+1].id
// 		// }


// 		searchResults.ready = searchResults.download('ALL')

// 		$rootScope.$watch(
// 			function(){ return 	[
// 									icFilterConfig.filterBy, 
// 									icFilterConfig.searchTerm
// 								] }, 
// 			function(previous, current){ 
// 				if(!icFilterConfig.cleared()){
// 					//with this the interface feels snappier:
// 					window.requestAnimationFrame(function (){
// 						searchResults
// 						.resetStats()
// 						.filterList()

// 						if(previous[1] != current[1])
// 						searchResults.download()
						
// 						$rootScope.$apply()
// 					})
// 				}
// 			},
// 			true
// 		)

// 		$rootScope.$watch(
// 			function(){ return [icFilterConfig.orderBy, icFilterConfig.reverse, icSite.currentLanguage] }, 
// 			function WatchSortFilteredList(p){ 
// 				if(!icFilterConfig.cleared()){
// 					//with this the interface feels snappier:
// 					//$rootScope.$evalAsync(function(){
// 						searchResults
// 						.sortFilteredList()
// 					//})
// 				}
// 			},
// 			true
// 		)

	


// 		return searchResults
// 	}
// ])


// .service('icItemEdit', [

// 	'icItem',

// 	function(icItem){
// 		return function icItemEdit(id){
// 			var icItemEdit 	= new icItem({id:id}),
// 				badFields	= []

// 			icItemEdit.setInvalidKeys = function(external_keys){
// 				badFields = []
// 				for(var i in external_keys || []){
// 					badFields.push(external_keys[i])
// 				}
// 			}

// 			icItemEdit.isInvalidKey = function(key){
// 				return badFields.indexOf(icItemEdit.getExternalKey(key)) != -1
// 			}

// 			icItemEdit.isValidKey = function(key){
// 				return !icItemEdit.isInvalidKey(key)
// 			}

// 			icItemEdit.validateKey = function(key){
// 				badFields = badFields.filter(function(external_key){
// 								return external_key != icItemEdit.getExternalKey(key)
// 							})
// 			}

// 			return icItemEdit
// 		}
// 	}
// ])


// .service('icItemEdits', [

// 	'icItemEdit',

// 	function icItemEdits(icItemEdit){
// 		var data 		= [],
// 			icItemEdits = this

// 		icItemEdits.open = function(id){
// 			var item = 	data.filter(function(itemEdit){
// 							return itemEdit.id == id
// 						})[0]
// 			if(!item){
// 				item = new icItemEdit(id)
// 				data.push(item)
// 			}

// 			return item
// 		}

// 		icItemEdits.clear = function(id){
// 			data = 	data.filter(function(itemEdit){
// 						return itemEdit.id != id
// 					})
// 		}


// 		return icItemEdits
// 	}
// ])


// //used by icFilterConfig and icSite: (echt in icSite?)

// function mergeParam(ce, ne, mode){


// 	if(ne === null || ne === undefined || ne === ''){
// 		return 	mode == 'replace'
// 				?	typeof ce == 'object' ? [] : ''
// 				:	ce
// 	} 

// 	if(typeof ce == 'object'){

// 		ce = 	ce.map(function(item){ return String(item) })
// 		ne = 	typeof ne == 'object' 
// 				? 	ne.map(function(item){ return String(item) }) 
// 				: 	[String(ne)]

// 		switch(mode){
// 			case 'toggle':
// 				return	Array.prototype.concat(
// 							ce.filter(function(item){ return ne.indexOf(item) < 0 }),
// 							ne.filter(function(item){ return ce.indexOf(item) < 0 })
// 						)
// 			break

// 			case 'add':
// 				return	Array.prototype.concat(
// 							ce,
// 							ne.filter(function(item){ return ce.indexOf(item) < 0 })
// 						)
// 			break

// 			default:
// 				return ne
// 		}
// 	}

// 	if(typeof cs != 'object') {

// 		ne = String(ne)
// 		ce = String(ce)

// 		return 	mode == 'toggle' && ne == ce
// 				?	''
// 				:	ne
// 	}

// }

