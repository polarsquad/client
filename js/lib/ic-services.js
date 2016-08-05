

angular.module('icServices', [
	'icApi',
	'smlLayout'
])





/*

	Contains:

	* icConfigData,
	* icFilterConfig,
	* icSite,
	* icSearchResults

*/







.service('icConfigData',[

	'icApi',

	function(icApi){
		var icConfigData = 	{
								types:	[],
								topics:	[]
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
									icConfigData.types 		= result.types
									icConfigData.topics 	= result.topics

									icConfigData.types.forEach(function(type){
										type.icon_url = '/images/'+type.ontology_uri+'.svg'
									})
								})

		return icConfigData
	}
])






















.service('icFilterConfig', [

	function(){

		var icFilterConfig = 	{
						filterBy:	{
										type:		undefined,
										topic:		[]
									},
						searchTerm: ''
					}


		icFilterConfig.matchFilter = function(key, needle, empty_matches_all){
			 	

			 var item = icFilterConfig.filterBy[key]

			 if(empty_matches_all && (!item || item.length == 0) ) return true

			 if(!needle)			return !item || item.length == 0
			 if(!item) 				return false

			 needle = String(needle)


			 return 	typeof item == 'object'
						?	icFilterConfig.filterBy[key].indexOf(needle) != -1
 						:	icFilterConfig.filterBy[key] == needle
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



















/* icSite */


.service('icSite', [

	'$rootScope',
	'$location',
	'icApi',
	'smlLayout',
	'icFilterConfig',

	function($rootScope, $location, icApi, smlLayout, icFilterConfig){
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
														ln:		[],			// language
													},
								activeComponents:	{
														page:	true
													}
							}

		function path2Params(str){
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



		function params2Path(obj, mode){
			if(!obj) return '/'

			var path = ''


			for(var key in icSite.params){

				var item = 	key in obj
							?	mergeParam(icSite.params[key], obj[key], mode)
							:	icSite.params[key]


				if(item === null || !item.length)	continue
				
				var value_str = 	typeof item == 'object'
									?	item.join('-')
									:	item

				path += 	'/' + key + '/'+value_str

			}

			return path
		}


		icSite.getParamsFromPath = function(){
			icSite.params = path2Params($location.path())
			return icSite
		}

		
		icSite.getNewPath = function(obj, mode){
			return params2Path(obj, mode)
		}

		icSite.updatePath = function(obj, mode){
			//TODO: Maybe prevent rerender

			$location.path(icSite.getNewPath(obj, mode))
			
			return this
		}

	
		icSite.addFilterParamsToPath = function(){
			icSite.updatePath({ 
				s:	encodeURIComponent(icFilterConfig.searchTerm||''),
				t:	icFilterConfig.filterBy.type,
				tp:	icFilterConfig.filterBy.topic 
			}, 'replace')
		}


		//rename to 'sections'
		icSite.updateCompontents = function(){
			icSite.activeComponents = {}

			if(icSite.params.item)			icSite.activeComponents.item 	= true
			if(icFilterConfig.active())		icSite.activeComponents.list 	= true
			if(icSite.showFilter)			icSite.activeComponents.filter 	= true
			if(icSite.pageUrl)				icSite.activeComponents.page 	= true
			//map
		}

		icSite.updateFromPath = function(){
			
			icSite.getParamsFromPath()


			icSite.fullItem 	= 	!!icSite.params.item

			icSite.pageUrl 		= 	'pages/main.html'


			//update icFilterconfig
			icFilterConfig.filterBy.type	=	icSite.params.t 	|| undefined
			icFilterConfig.filterBy.topic	=	icSite.params.tp 	|| []

			icSite.updateCompontents()

			return this
		}

		//Todo: check if needed
		icSite.toggleFilter = function(state){
			console.warn('icSite.toggleFilter: solve differently')
			return null

			icSite.showFilter =	typeof state == "boolean"
								?	state
								:	!icSite.showFilter

			icSite.updateCompontents()
			return icSite
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

		$rootScope.$on('$locationChangeSuccess', 				icSite.updateFromPath)
		$rootScope.$watch(function(){ return icFilterConfig }, 	icSite.addFilterParamsToPath, true)

		return icSite
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


		searchResults.storeItem = function(new_item){

			var stored_item 	= searchResults.data.filter(function(item){ return item.id == new_item.id })[0]

			new_item.topic 	= 		icConfigData.getTopicById(new_item.primary_topic_id)
								&&	icConfigData.getTopicById(new_item.primary_topic_id).ontology_uri
			new_item.type 	= 		icConfigData.getTypeById(new_item.type_id)
								&&	icConfigData.getTypeById(new_item.type_id).ontology_uri
			new_item.brief	= 		(new_item.definition && new_item.definition['en']) || (new_item.topic + ' [missing item definition]')


			if(stored_item){
				angular.merge(stored_item, new_item)
			} else {
				searchResults.data.push(new_item)
			}

			return this
		}





		searchResults.listLoading = function(){
			return searchResults.listCalls.length > 0
		}


		searchResults.download = function(){

			var currentCall = 	icConfigData.ready
								.then(function(){
									return	icApi.getList(
												searchResults.limit, 
												searchResults.offset, 
												{
													type: 	icFilterConfig.filterBy.type,
													topic:	icFilterConfig.filterBy.topic,
													query:	icFilterConfig.searchTerm
												},
												!!icFilterConfig.searchTerm									
											)
								})

			searchResults.listCalls.push(currentCall)

			return 	currentCall
					.then(function(result){
						result.items.forEach(function(item){
							item.id 	= String(item.id)
							item.type 	= icFilterConfig.filterBy.type //todo		
							item.brief 	= item.description_short && item.description_short['en'] //todo
							searchResults.storeItem(item)
						})

						searchResults.offset 		+= 	searchResults.limit
						searchResults.meta 			= 	result.meta
						searchResults.noMoreItems 	= 	result.items 	&& result.items.length == 0

						searchResults.filterList()

						searchResults.listCalls = searchResults.listCalls.filter(function(call){ return call != currentCall })
					})
		}


		searchResults.itemLoading = function(id){
			searchResults.itemCalls[id] = 	(searchResults.itemCalls[id] || [])
											.filter(function(call){
												return call.$$state.status == 0
											})

			return searchResults.itemCalls[id].length > 0
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

		searchResults.getItem = function(id){
			if(!id) return null

			var stored_item = searchResults.data.filter(function(item){ return item.id == id })[0] 

			if(!stored_item){
				var preliminary_item = {id:id}
				searchResults.storeItem(preliminary_item)
			}

			return 	stored_item
					?	stored_item
					:	preliminary_item
		}

		function deepSearch(obj,needle){

			needle 	= 	typeof needle == 'string' 
						?	new RegExp(needle, 'gi')
						:	needle

			for(var key in obj){

				if(	
					typeof obj == 'obj'
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

		searchResults.filterList = function(additional_filters){

			if(additional_filters) console.warn('additional filters no longer supported')

			// var filters 	= angular.merge({}, icFilterConfig.filterBy, additional_filters),
			// 	search_term	= icFilterConfig.searchTerm

			searchResults.clearFilteredList()			

			Array.prototype.push.apply(searchResults.filteredList, 
				searchResults.data
				.filter(function(item){
					var passed = true

					for(var key in icFilterConfig.filterBy){
						passed = passed && icFilterConfig.matchFilter(key, item[key], true)
					}

					return passed		
				})					
				.filter(function(item){
					//TODO prevent cycles
					return deepSearch(item, icFilterConfig.searchTerm && icFilterConfig.searchTerm.replace(/(^\s*|\s*$)/,''))
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

			return 	pos !== false && searchResults.filteredList[pos+1] && searchResults.filteredList[pos+1].id
		}



		$rootScope.$watch(
			function(){ return icFilterConfig }, 
			function(){ 

				searchResults.offset = 0

				searchResults.clearFilteredList()

				//with this the interface feels snappier:
				$timeout(function(){
					searchResults
					.filterList()
					.download()
				}, 0)
			},
			true
		)


		return searchResults
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

