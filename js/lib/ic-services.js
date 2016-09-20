"use strict";

angular.module('icServices', [
	'icApi',
	'smlLayout',
	'pascalprecht.translate'
])





/*

	Contains:

	* icConfigData,
	* icFilterConfig,
	* icSite,
	* icSearchResults
	...
*/





.service('icBootstrap',[

	'$rootScope',
	'$q',
	'$timeout',
	'icConfigData',
	'icLanguageConfig',


	function($rootScope, $q, $timeout, icConfigData, icLanguageConfig){


		var	documentReady = $q.defer()

		if(document.readyState == 'complete') {
			$timeout(function(){ documentReady.resolve() }, 50)
		} else {
			document.onload = function(){
				$timeout(function(){ documentReady.resolve() }, 50)
			}
		}



		$q.all([
			icConfigData.ready,
			icLanguageConfig,
			documentReady
		])
		.then(function(){
			$rootScope.icAppReady = true
		})
	}
])






.service('icConfigData',[

	'icApi',

	function(icApi){

		var icConfigData = 	{
								types:	[],
								topics:	[],
								availableLanguages: []
							}


		icConfigData.getTypeById = function(id){
			return icConfigData.types.filter(function(type){ return type.id == id })[0]
		}

		icConfigData.getTypeByUri = function(uri){
			return icConfigData.types.filter(function(type){ return type.uri == uri })[0]
		}

		icConfigData.getTopicById = function(id){
			return icConfigData.topics.filter(function(topic){ return topic.id == id })[0]
		}

		icConfigData.getTopicUri = function(uri){
			return icConfigData.topics.filter(function(topic){ return topic.uri == uri })[0]
		}


		icConfigData.ready	=	icApi.getConfigData()
								.then(function(result){
									icConfigData.types 				= result.types
									icConfigData.topics 			= result.topics
									icConfigData.targetGroups		= result.target_groups
									icConfigData.availableLanguages = result.langs 
									icConfigData.titles 			= result.titles
								})

		return icConfigData
	}
])






















.service('icFilterConfig', [

	function(){

		var icFilterConfig = 	{
						filterBy:	{
										type:			undefined,
										topic:			[],
										targetGroup:	[]
									},
						searchTerm: ''
					}


		icFilterConfig.matchFilter = function(key, haystack, empty_matches_all){
			 	

			var needles = 	typeof icFilterConfig.filterBy[key] == 'string'
	 						?	[icFilterConfig.filterBy[key]]
	 						:	icFilterConfig.filterBy[key]



			if(haystack === undefined || haystack == null || haystack.length == 0) 		return needles === undefined || needles.length == 0
			if(needles === undefined || needles.length == 0)							return empty_matches_all
		 	
		 	return	needles.some(function(needle){
						return 	typeof haystack == 'object'
								?	haystack.indexOf(needle) != -1
								:	haystack == needle
			 		})
		}


		icFilterConfig.toggleFilter = function(key, value){
			icFilterConfig.filterBy[key] = mergeParam(icFilterConfig.filterBy[key], value, 'toggle')

			return icFilterConfig
		}

		icFilterConfig.clearFilter = function(key){
			if(key === undefined){
				for(key in icFilterConfig.filterBy){
					icFilterConfig.clearFilter(key)
				}
			}else{

				var item = icFilterConfig.filterBy[key]

				icFilterConfig.filterBy[key] = 	typeof icFilterConfig.filterBy[key] == 'object'
												?	[]
												:	undefined
			}
			return icFilterConfig
		}
		


		icFilterConfig.cleared = function(){
			var cleared = true

			for(var key in icFilterConfig.filterBy){
				cleared = cleared && (!icFilterConfig.filterBy[key] || !icFilterConfig.filterBy[key].length)
			}			

			cleared = cleared && !icFilterConfig.searchTerm

			return cleared
		}


		icFilterConfig.active = function(){
			return !icFilterConfig.cleared()
		}
		
		return icFilterConfig

	}

])



.service('icLanguageConfig', [

	'$window',
	'$rootScope',
	'$translate',
	'icConfigData',
	'icApi',

	function($window, $rootScope, $translate, icConfigData, icApi){

		var icLanguageConfig 			= 	{
												availableLanguages:	[],
												currentLanguage:	undefined									
											}


		icConfigData.ready
		.then(function(){
			icLanguageConfig.availableLanguages = icConfigData.availableLanguages
		})

		function objectKeysToUpperCase(obj){
			var up = {}

				for(var key in obj){

					up[key.toUpperCase()] = typeof obj[key] == 'object'
											?	objectKeysToUpperCase(obj[key])
											:	obj[key]
				}

			return up
		}

		icLanguageConfig.ready = icApi.getInterfaceTranslations()

		icLanguageConfig.getTranslationTable = function(lang){
			return	icLanguageConfig.ready
					.then(function(translations){
						return objectKeysToUpperCase(translations)[lang.toUpperCase()]
					})
		}



		function guessLanguage(){
			icLanguageConfig.currentLanguage =	icLanguageConfig.currentLanguage 
												|| $window.localStorage.getItem('language') 
												|| (icConfigData.preferredLanguages && icConfigData.preferredLanguages[0])
												|| 'en'

			
		}

		guessLanguage()

		$rootScope.$watch(
			function(){ return icLanguageConfig.currentLanguage }, 
			function(){
				guessLanguage()

				$translate.use(icLanguageConfig.currentLanguage)
				$window.localStorage.setItem('language',icLanguageConfig.currentLanguage)
				$translate.use(icLanguageConfig.currentLanguage)
			}
		)


		return	icLanguageConfig
	}
])

.factory('icInterfaceTranslationLoader', [

	'icLanguageConfig',

	function(icLanguageConfig){
		return 	function(options){
					if(!options || !options.key) throw new Error('Couldn\'t use icInterfaceTranslationLoader since language key is given!');
					return icLanguageConfig.getTranslationTable(options.key)
				}
	}
])

.config([
	'$translateProvider',

	function($translateProvider){
		$translateProvider.useLoader('icInterfaceTranslationLoader')
		$translateProvider.useSanitizeValueStrategy('sanitizeParameters')
		$translateProvider.preferredLanguage('en')
	}
])




























/* icSite */


.service('icSite', [

	'$rootScope',
	'$location',
	'$translate',
	'$timeout',
	'icApi',
	'smlLayout',
	'icFilterConfig',
	'icLanguageConfig',
	'icOverlays',

	function($rootScope, $location, $translate, $timeout, icApi, smlLayout, icFilterConfig, icLanguageConfig, icOverlays){
		var icSite 		= 	{
								fullItem:			false,
								page:				'main',
								showFilter:			false,
								params:				{
														item:	'',			// item for full view
														t:		'',			// type filter
														s:		'',			// search term
														so:		'',			// sorting
														tp:		[],			// topics
														tg:		[],			// target groups
														ln:		'',			// language
													},
								activeComponents:	{
														page:	true
													}
							},
			scheduledUpdate

		icSite.path2Params = function(str){
			var result = {}

			for(var key in icSite.params){
				var regex 		= 	new RegExp('\/'+key+'\/([^/]+)'),
					matches		= 	str.match(regex),
					value_str 	= 	(matches && matches[1])

				if(typeof icSite.params[key] == 'object'){
					//Array:
					result[key] = 	value_str 
									?	value_str.split('-')
									:	[]
				} else {
					//String:
					result[key] = 	value_str
									?	value_str
									:	''
				}
			}

			return result
		}



		icSite.params2Path = function(obj, mode){
			if(!obj) return '/'

			var path = ''


			for(var key in icSite.params){

				var item = 	key in obj
							?	mergeParam(icSite.params[key], obj[key], mode)
							:	icSite.params[key]


				if(!item || !item.length)	continue
				
				var value_str = 	typeof item == 'object'
									?	item.join('-')
									:	item

				path += 	'/' + key + '/'+value_str

			}

			return path
		}


		icSite.getParamsFromPath = function(){
			icSite.params = icSite.path2Params($location.path())
			return icSite
		}

		
		icSite.getNewPath = function(obj, mode){
			return icSite.params2Path(obj, mode)
		}


		icSite.schedulePathUpdate = function(obj){
			//TODO: Maybe prevent rerender

			if(scheduledUpdate) $timeout.cancel(scheduledUpdate)


			scheduledUpdate = 	$timeout(function(){
									$location.path(icSite.params2Path({}, 'replace'))
								}, 500)

			return this
		}

	
		icSite.addFilterParamsToPath = function(){
			icSite.params.s 	= encodeURIComponent(icFilterConfig.searchTerm||'')
			icSite.params.t		= icFilterConfig.filterBy.type
			icSite.params.tp	= icFilterConfig.filterBy.topic
			icSite.params.tg	= icFilterConfig.filterBy.targetGroup

			icSite
			.updateCompontents()
			.schedulePathUpdate()
		}

		icSite.addLanguageParamsToPath = function(){
			icSite.params.ln	= icLanguageConfig.currentLanguage

			icSite.schedulePathUpdate()
		}

		icSite.addItemToPath = function(id){
			icSite.params.item 	= id
			
			icSite
			.updateCompontents()
			.schedulePathUpdate()
		}

		icSite.clearItem = function(){
			icSite.addItemToPath(undefined)
		}


		//rename to 'sections'
		icSite.updateCompontents = function(){
			icSite.activeComponents = {}

			if(icSite.params.item)			icSite.activeComponents.item 	= true
			if(icFilterConfig.active())		icSite.activeComponents.list 	= true
			if(icSite.showFilter)			icSite.activeComponents.filter 	= true
			if(icSite.pageUrl)				icSite.activeComponents.page 	= true
			//map
			
			return icSite
		}

		icSite.updateFromPath = function(){

			$timeout.cancel(scheduledUpdate)
			
			icSite.getParamsFromPath()


			icSite.fullItem 	= 	!!icSite.params.item

			icSite.pageUrl 		= 	'pages/main.html'


			//update icFilterconfig
			icFilterConfig.filterBy.type		=	icSite.params.t 	|| undefined
			icFilterConfig.filterBy.topic		=	icSite.params.tp 	|| []
			icFilterConfig.filterBy.targetGroup	=	icSite.params.tg 	|| []

			icFilterConfig.searchTerm			=	decodeURIComponent(icSite.params.s) || ''



			//updateLanguage
			if(!icLanguageConfig.currentLanguage){
				icLanguageConfig.currentLanguage = icSite.params.ln
			}	

			if(icSite.params.ln && icLanguageConfig.currentLanguage != icSite.params.ln){
				icLanguageConfig.currentLanguage = icSite.params.ln
				icOverlays.toggle('languageMenu', true)
			}
			

			icSite.updateCompontents()

			return this
		}

	

		icSite.show = function(str){
			switch(smlLayout.mode.name){
				case "XS":

					if('item'	in icSite.activeComponents) return str == 'item'
					if('filter'	in icSite.activeComponents) return str == 'filter'
					if('list'	in icSite.activeComponents) return str == 'list'
					if('page'	in icSite.activeComponents) return str == 'page'

				break;
				

				case "S":

					if('item'	in icSite.activeComponents) return str == 'item'
					if('list'	in icSite.activeComponents) return str == 'list' || str == 'filter'
					if('page'	in icSite.activeComponents) return str == 'page'

				break;
				
				
				case "M":			

					if(
							'item'	in icSite.activeComponents
						&&	'list'	in icSite.activeComponents
					){
						return str == 'item'|| str == 'list'
					}

					if('item'	in icSite.activeComponents) return str == 'item'
					if('list'	in icSite.activeComponents) return str == 'list' || str == 'filter'
					if('page' 	in icSite.activeComponents) return str == 'page'

				break;
				
				
				case "L":

					if(
							'item'	in icSite.activeComponents
						&&	'list'	in icSite.activeComponents
					){

						return str == 'item'|| str == 'list' || str == 'filter'
					}

					if('item'	in icSite.activeComponents) return str == 'item'
					if('list'	in icSite.activeComponents) return str == 'list' || str == 'filter'
					if('page' 	in icSite.activeComponents) return str == 'page'

				break;
				
				
				case "XL":

					if(
							'item'	in icSite.activeComponents
						&&	'list'	in icSite.activeComponents
					){

						return str == 'item'|| str == 'list' || str == 'filter'
					}

					if('item'	in icSite.activeComponents) return str == 'item'
					if('list'	in icSite.activeComponents) return str == 'list' || str == 'filter'
					if('page' 	in icSite.activeComponents) return str == 'page'

				break;

			}
			return false
		}



		//setup
		
		icSite.updateFromPath()


		$rootScope.$on('$locationChangeSuccess', 					icSite.updateFromPath)
		$rootScope.$watch(function(){ return icFilterConfig }, 		icSite.addFilterParamsToPath, true)
		$rootScope.$watch(function(){ return icLanguageConfig }, 	icSite.addLanguageParamsToPath, true)

		return icSite
	}
								
])






.service('icOverlays', [

	'$q',

	function($q){
		var icOverlays 	= 	{
								show:	{}
							},
			scope 		=	undefined,
			deferred	=	{}



		icOverlays.toggle = function(overlay_name, open){

			//TODO: what's deferred for?

			//deferred[overlay_name] = deferred[overlay_name] || $q.defer()


			if(overlay_name) {
				icOverlays.show[overlay_name] = open !== undefined 
												?	open 
												:	!icOverlays.show[overlay_name]

				// if(icOverlays.show[overlay_name]){
				// 	deferred[overlay_name].reject()
				// 	deferred[overlay_name]	=	$q.defer()
				// } else {
				// 	deferred[overlay_name].resolve() 
				// }

			} else {
				for(var key in icOverlays.show){
					delete icOverlays.show[key]
					// deferred[overlay_name].resolve()
				}
			}

			// return  deferred[overlay_name].promise
			return this
		}

	
		icOverlays.active = function(){
			var active = false

			for(var key in icOverlays.show){
				if(icOverlays.show[key]) active = true
			}

			return active
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























.service('icSearchResults', [

	'$q',
	'$rootScope',
	'$timeout',
	'icApi',
	'icFilterConfig',
	'icConfigData',

	function($q, $rootScope, $timeout, icApi, icFilterConfig, icConfigData){

		var searchResults 			= {}

		searchResults.data 			= []
		searchResults.offset		= 0
		searchResults.limit			= 15
		searchResults.listCalls 	= []
		searchResults.itemCalls 	= []
		searchResults.filteredList	= []
		searchResults.noMoreItems	= false
		searchResults.meta			= undefined


		searchResults.storeItem = function(new_item_data){


			new_item_data			= new_item_data || {}

			var stored_item 		= searchResults.data.filter(function(item){ return item.id == String(new_item_data.id) })[0],
				new_item			= {}



			new_item.id				= String(new_item_data.id)
			new_item.title			= new_item_data.title
			new_item.definition		= new_item_data.definitions
			new_item.type			= new_item_data.type
			new_item.topic 			= new_item_data.topics
			new_item.targetGroup	= new_item_data.target_groups
			new_item.primary_topic	= new_item_data.primary_topic || (new_item_data.topics && new_item_data.topics[0])
			new_item.imageUrl		= new_item_data.image_url
			new_item.description	= new_item_data.descriptions_full
			new_item.zip			= new_item_data.zip_code
			new_item.location		= new_item_data.place
			new_item.contacts		= {}

			if(new_item_data.query){
				if(stored_item){
					stored_item.query = stored_item.query || []
					stored_item.query.push(new_item_data.query)
				}else{
					new_item.query = []
					new_item.query.push(new_item_data.query)
				}
			}


			//TODO;
			;(new_item_data.contacts || []).forEach(function(contact){
				for(var key in contact){
					new_item.contacts[key] = contact[key]
				}
			})


			Array('address', 'phone', 'email', 'website').forEach(function(key){
				new_item[key] 			= new_item_data[key]
			})


			for(var key in new_item){
				if(
						new_item[key] === null
					||	new_item[key] === undefined
					||	new_item[key].length  == 0
				){
					delete new_item[key]
				}
			}


			if(stored_item){
				angular.merge(stored_item, new_item)
			} else {
				searchResults.data.push(new_item)
			}

			return stored_item || new_item
		}

		searchResults.getItem = function(id){
			if(!id) return null

			var stored_item = searchResults.data.filter(function(item){ return item.id == String(id) })[0] 

			if(!stored_item){
				var preliminary_item = {id:id}
				stored_item = searchResults.storeItem(preliminary_item)
			}

			return 	stored_item					
		}




		searchResults.listLoading = function(){
			searchResults.listCalls = 	(searchResults.listCalls || [])
										.filter(function(call){
											return call.$$state.status == 0
										})

			return searchResults.listCalls.length > 0
		}


		searchResults.download = function(){
			if(
					!icFilterConfig.filterBy.type
				&&	icFilterConfig.filterBy.topic.length == 0
				&&	icFilterConfig.filterBy.targetGroup.length == 0
				&&	!icFilterConfig.searchTerm
			){
				console.warn('icSearchResults: download without paramters.')
			}

			var parameters = {}

			if(icFilterConfig.filterBy.type) 					parameters.type 			= icFilterConfig.filterBy.type
			if(icFilterConfig.filterBy.topic.length != 0)		parameters.topics 			= icFilterConfig.filterBy.topic
			if(icFilterConfig.filterBy.targetGroup.length != 0)	parameters.target_groups 	= icFilterConfig.filterBy.targetGroup
			if(icFilterConfig.searchTerm)						parameters.query			= icFilterConfig.searchTerm

			var currentCall = 	icConfigData.ready
								.then(function(){
									return	icApi.getList(
												searchResults.limit, 
												searchResults.offset, 
												parameters
											)
								})

			searchResults.listCalls.push(currentCall)

			return 	currentCall
					.then(function(result){
						result.items = result.items || []
						result.items.forEach(function(item){
							searchResults.storeItem(item)
						})

						searchResults.offset 		+= 	result.items.length
						searchResults.meta 			= 	result.meta
						searchResults.noMoreItems 	= 	result.items 	&& result.items.length == 0

						searchResults.filterList()

					})
		}



		searchResults.itemLoading = function(id){


			searchResults.itemCalls[id] = 	(searchResults.itemCalls[id] || [])
											.filter(function(call){
												return call.$$state.status == 0
											})

			if(searchResults.itemCalls[id] == 0) delete searchResults.itemCalls[id]

			return !!searchResults.itemCalls[id]
		}


		searchResults.loading = function(){
			if(searchResults.listLoading()) return true

			for(var id in searchResults.itemCalls){
				if(searchResults.itemLoading(id)) return true
			}

			return false
		}


		searchResults.downloadItem = function(id){
			if(!id) return $q.reject('missing id')

			var currentCall = icApi.getItem(id)

			searchResults.itemCalls[id] = searchResults.itemCalls[id] || []
			searchResults.itemCalls[id].push(currentCall)

			return 	currentCall
					.then(
						function(result){
							var item = result.item

							item.id 	= String(item.id)
							item.type 	= icFilterConfig.filterBy.type //todo		
							item.brief 	= item.description_short && item.description_short['en'] //todo

							searchResults.storeItem(item)
						}
					)
		}


		function deepSearch(obj,needle){


			needle 	= 	typeof needle == 'string' 
						?	new RegExp(needle.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi')
						:	needle

			for(var key in obj){

				if(	
					typeof obj[key] == 'object'
					?	deepSearch(obj[key], needle)
					:	String(obj[key]).match(needle) != null
				){
					return true
				}

			}

			return false
		}

		searchResults.clearFilteredList = function(){
			while(searchResults.filteredList.length > 0) searchResults.filteredList.pop()
		}

		searchResults.filterList = function(){

			var searchTerm = icFilterConfig.searchTerm && icFilterConfig.searchTerm.replace(/(^\s*|\s*$)/,'')	

			searchResults.clearFilteredList()

			Array.prototype.push.apply(
				searchResults.filteredList, 
				searchResults.data
				.filter(function(item){

					var passed 		= true

					for(var key in icFilterConfig.filterBy){
						passed = 		passed 
									&& 	icFilterConfig.matchFilter(key, item[key], true)
					}

					return passed		
				})					
				.filter(function(item){
					//TODO prevent cycles

					return 	searchTerm
							?	deepSearch(item, searchTerm)
							:	true
				})
			)

			return searchResults

		}

		searchResults.getPreviousId = function(id){
			var pos = false,
				i	= 0

			while(pos === false && i < searchResults.filteredList.length){
				pos = (searchResults.filteredList[i].id == id) && i
				i++
			}


			return 	pos !== false && searchResults.filteredList[pos-1] && searchResults.filteredList[pos-1].id
		}

		searchResults.getNextId = function(id){
			var pos = false,
				i	= 0


			while(pos === false && i < searchResults.filteredList.length){
				pos = (searchResults.filteredList[i].id == id) && i
				i++
			}



			if(pos == searchResults.filteredList.length-1){
				searchResults.download()
			}

			return 	pos !== false && searchResults.filteredList[pos+1] && searchResults.filteredList[pos+1].id
		}



		$rootScope.$watch(
			function(){ return icFilterConfig }, 
			function(){ 

				searchResults.offset = 0

				searchResults.clearFilteredList()


				if(!icFilterConfig.cleared()){
					//with this the interface feels snappier:
					$timeout(function(){
						searchResults
						.filterList()
						.download()
					}, 0)
				}
			},
			true
		)


		return searchResults
	}
])



.service('icItemEdits', [


	function(){
		var data 		= {},
			icItemEdits = {}

		icItemEdits.open = function(id){
			data[id] = data[id] || {}
			return data[id]
		}

		icItemEdits.clear = function(id){
			data[id] = {}
		}


		return icItemEdits
	}
])












//used by icFilterConfig and icSite: (echt in icSite?)

function mergeParam(ce, ne, mode){


	if(ne === null || ne === undefined || ne === ''){
		return 	mode == 'replace'
				?	typeof ce == 'object' ? [] : ''
				:	ce
	} 

	if(typeof ce == 'object'){

		ce = 	ce.map(function(item){ return String(item) })
		ne = 	typeof ne == 'object' 
				? 	ne.map(function(item){ return String(item) }) 
				: 	[String(ne)]

		switch(mode){
			case 'toggle':
				return	Array.prototype.concat(
							ce.filter(function(item){ return ne.indexOf(item) < 0 }),
							ne.filter(function(item){ return ce.indexOf(item) < 0 })
						)
			break

			case 'add':
				return	Array.prototype.concat(
							ce,
							ne.filter(function(item){ return ce.indexOf(item) < 0 })
						)
			break

			default:
				return ne
		}
	}

	if(typeof cs != 'object') {

		ne = String(ne)
		ce = String(ce)

		return 	mode == 'toggle' && ne == ce
				?	''
				:	ne
	}

}

