"use strict";



//used by icFilterConfig and icSite:

function mergeParam(ce, ne, mode){


	if(ne === null || ne === undefined || ne === '') return null

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
				?	null
				:	ne
	}

}




angular.module('InfoCompassModule',[
	"icApi",
	"smlLayout"
])


.config([
	'icApiProvider',
	'smlLayoutProvider',

	function(icApiProvider, smlLayoutProvider){

		icApiProvider.setBase('http://213.187.84.22:3000')

		smlLayoutProvider.setModes([			
			{
				name:		'XS',	
				width: 		23,
				stretch:	true
			},	
			{
				name:		'S',
				width:		48,
				stretch:	true
			},
			{
				name:		'M',
				width:		64,
				stretch:	false
			},
			{
				name:		'L',
				width:		80,
				stretch:	false
			},
			{
				name:		'XL',
				width:		120,
				stretch:	false
			}
		])
	}
])


.controller('InfoCompassCtrl',[
	
	'$scope',
	'icSite',
	'icFilterConfig',
	'smlLayout',
	'icConfigData',


	function($scope, icSite, icFilterConfig, smlLayout, icConfigData){
		$scope.icSite 			= icSite
		$scope.icFilterConfig	= icFilterConfig 	//Muss das wirklich?
		$scope.smlLayout		= smlLayout 		//Muss das wirklich?
		$scope.icConfigData		= icConfigData 

		//$scope.$watch(function(){console.log('digest!')})
	}

])



.service('icConfigData',[

	'icApi',

	function(icApi){
		var icConfigData = {}


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

		icSite.updatePath = function(obj){
			//TODO: Maybe prevent rerender

			$location.path(icSite.getNewPath(obj))
			
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

		//Todo this triggers to many digests:

		$rootScope.$on('$locationChangeStart', icSite.updateFromPath)
		$rootScope.$watch(function(){ return icFilterConfig }, 			icSite.addFilterParamsToPath, true)

		return icSite
	}
								
])







/* sections */



.directive('icSectionFilter',[

	function(){
		return {
			restrict: 		"AE",
			templateUrl:	"partials/section-filter.html",
			scope:			{},

			link: function(){
			}
		}
	}
])


.directive('icSectionList',[

	'icSite',
	'smlLayout',

	function(icSite, smlLayout){
		return {
			restrict: 		"AE",
			templateUrl:	"partials/section-list.html",
			scope:			{
								icShowFilter:	'<'
							},

			link: function(scope, element, attrs){
				scope.icSite 	= icSite
				scope.smlLayout	= smlLayout
			}
		}
	}
])


.directive('icSectionItem',[
	
	'icSite',

	function(icSite){
		return {
			restrict: 		"AE",
			templateUrl:	"partials/section-item.html",
			scope:			{},

			link: function(scope, element, attrs){
				scope.icSite = icSite
			}
		}
	}
])

/*header*/


.service('icHeaders', [

	function(){

		var icHeaders =	{
							mainHeader: 	undefined,
							localHeaders: 	[]
						}

		icHeaders.registerMain = function(el){
			if(icHeaders.mainHeader){
				console.error('icHeaders: only one main header allowed.')
				return null
			}

			icHeaders.mainHeader	=	el


			while(icHeaders.localHeaders.length){
				var el 	= icHeaders.localHeaders.shift()
				icHeaders.mainHeader.append(el)
			}
		}

		icHeaders.deregisterMain = function(){
			icHeaders.mainHeader = undefined
		}

		icHeaders.registerLocal = function(el){
			if(icHeaders.mainHeader){
				icHeaders.mainHeader.append(el)
			} else {
				icHeaders.localHeaders.push(el)
			}
		}

		return icHeaders
	}
])

.directive('icHeader',[

	'$rootScope',
	'icFilterConfig',
	'icHeaders',
	'icSite',

	function($rootScope, icFilterConfig, icHeaders, icSite){
		return {
			restrict: 		"AE",
			templateUrl:	"partials/ic-header.html",
			scope:			{},

			link: function(scope, element, attr){
				
				scope.icSite			= icSite
				scope.icFilterConfig	= icFilterConfig
				scope.searchTerm		= icFilterConfig.searchTerm
				icFilterConfig

				scope.update = function(){
					var input = element[0].querySelector('#search-term')
					
					input.focus()
					input.blur()

					icFilterConfig.searchTerm = scope.searchTerm
				}

				icHeaders.registerMain(element)

				scope.$on('$destroy', function(){
					icHeaders.deregisterMain(scope.$id)
				})
			}
		}
	}
])

.directive('icLocalHeader',[

	'icHeaders',

	function(icHeaders){
		return {
			restrict: 		"AE",
			scope:			{},

			link: function(scope, element, attr, ctrl, transclude){
				icHeaders.registerLocal(element)

				scope.$on('$destroy', function(){
					element.remove()
				})
			}
		}
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
							item.type 	= icFilterConfig.filterBy.type //todo		
							item.brief 	= item.description_short && item.description_short['en'] //todo
							searchResults.storeItem(item)
						})

						searchResults.offset 		+= 	searchResults.limit
						searchResults.meta 			= 	result.items[0] && result.items[0].meta //todo
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

			var currentCall = icApi.getItem(id)

			searchResults.itemCalls[id] = searchResults.itemCalls[id] || []
			searchResults.itemCalls[id].push(currentCall)

			return 	currentCall
					.then(
						function(result){
							searchResults.storeItem(result.item)
						}
					)
		}

		searchResults.getItem = function(id){
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

		searchResults.filterList = function(additional_filters){

			if(additional_filters) console.warn('additional filters no longer supported')

			// var filters 	= angular.merge({}, icFilterConfig.filterBy, additional_filters),
			// 	search_term	= icFilterConfig.searchTerm

			
			while(searchResults.filteredList.length > 0) searchResults.filteredList.pop()

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

		$rootScope.$watch(
			function(){ return icFilterConfig }, 
			function(){ 
				searchResults.offset = 0

				searchResults
				.filterList()
				.download()
				.then(function(){
					searchResults.filterList()
				})	
			},
			true
		)


		return searchResults
	}
])















.directive('icSearchResultList', [

	'icSearchResults',
	'icFilterConfig',

	function(icSearchResults, icFilterConfig){
		return {
			restrict:		'AE',
			templateUrl: 	'partials/ic-search-result-list.html',
			scope:			{
								icHref:			"&",
								icActive:		"&",
								icExtraFilter:	"<"
							},

			link: function(scope, element, attrs){
				scope.icSearchResults 	= icSearchResults 
				scope.icFilterConfig	= icFilterConfig

				scope.$on('icScrollBump', function(){
					icSearchResults.download()
				})
			}
		}
	}
])







.directive('icScrollBump', [

	'$timeout',
	'$window',

	function($timeout, $window){

		return {
			restrict: 	'A',
			transclude: true,
			scope:		true,
			template:	'<div class = "shuttle" ng-transclude></div>',

			link: function(scope, element, attrs, controller){

				var shuttle		= element.find('div').eq(0),
					bumper 		= angular.element('<div class = "bumper"></div>'),
					bumping		= false,
					scroll_stop = null,
					ignore_next_scroll = false

				element.append(bumper)
			

				if($window.getComputedStyle(element[0]).position == 'static') 
					element.css('position', 'relative')

				shuttle.css({
					'min-height':			'100%',
					'transform': 			'translateY(0px)',
					'transition-property':	'transform',
				})

				bumper.css({
					'padding':				'0',
					'height': 				'50%',
					'width':				'auto',
				})

				function reset(){
					bumping = false

					var client_height	= element[0].clientHeight,
						scroll_top		= element[0].scrollTop,
						bottom			= shuttle[0].offsetTop + shuttle[0].offsetHeight,
						overflow		= bottom - scroll_top - client_height


					if(overflow < 0){

						function swap(e){
							if(e.originalTarget != shuttle[0]) return null

							shuttle.css({
								'transform': 			'translateY(0px)',
								'transition-duration':	'0ms'
							})

							element[0].scrollTop += overflow
							ignore_next_scroll = true

							shuttle.off('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', swap)

						}

						shuttle.on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', swap)


						window.requestAnimationFrame(function(){
							shuttle.css({
								'transition-duration':	'1000ms',
								'transform':			'translateY('+(-overflow)+'px)'
							})
						})
					}
					
				}

				function bump(){

					var client_height	= element[0].clientHeight,
						scroll_top		= element[0].scrollTop,
						bottom			= shuttle[0].offsetTop + shuttle[0].offsetHeight,
						overflow		= bottom - scroll_top - client_height

					if(overflow > client_height) return null

					if(!bumping) scope.$broadcast('icScrollBump')
					bumping = true
				
				}


				element.on('scroll', function(event){
					if(ignore_next_scroll){
						ignore_next_scroll = false
						return null
					}

					$window.requestAnimationFrame(bump)


					if(scroll_stop) $timeout.cancel(scroll_stop)
					scroll_stop = $timeout(reset, 200, false)

				})
			},
		}
	}
])






.directive('icPreviewItem',[

	function(){
		return {

			restrict: 		'AE',
			templateUrl: 	'partials/ic-preview-item.html',
			scope:			{
								icTitle:	"<",
								icBrief: 	"<",
								icType:		"<",
								icTopic:	"<"
							},

			link: function(scope, element, attrs){
			}
		}
	}
])




.directive('icFullItem',[

	'icSearchResults',

	function(icSearchResults){

		return {
			restrict:		'AE',
			templateUrl:	'partials/ic-full-item.html',
			scope:			{
								icId:		"<"
							},

			link: function(scope, element, attrs){

				scope.icSearchResults = icSearchResults

				scope.$watch('icId', function(id){
					if(!id) return null
					scope.item = icSearchResults.getItem(id)
					icSearchResults.downloadItem(id)
				})

			}
		}
	}
])



.directive('icInfoTag',[

	function(){

		return {
			restrict:		'AE',
			templateUrl:	'partials/ic-info-tag.html',
			scope:			{
								icTitle:		"<",
								icContent:		"<",
								icIcon:			"<"
							},

			link: function(scope, element, attrs){
			}
		}
	}
])



.filter('icColor', function(){
	return 	function(str){
				switch(str){
					case 'information': return "blue"; 		break;
					case 'events':		return "purple";	break;
					case 'places':		return "orange";	break;
					case 'services':	return "yellow";	break;
					default:			return "white";		break
				}
			}
})


.filter('icIcon', function(){
	return 	function(str, color){
			var c = color ?  'color' : 'white'

			switch(str){
				case 'information': return "/images/icon_type_information_"+c+".svg"; 		break;
				case 'events':		return "/images/icon_type_events_"+c+".svg";				break;
				case 'places':		return "/images/icon_type_places_"+c+".svg";				break;
				case 'services':	return "/images/icon_type_services_"+c+".svg";			break;

				case 'city':		return "/images/icon_topic_city_"+c+".svg";			break;
				case 'education':	return "/images/icon_topic_education_"+c+".svg";	break;
				case 'encounters':	return "/images/icon_topic_encounters_"+c+".svg";	break;
				case 'health':		return "/images/icon_topic_health_"+c+".svg";		break;
				case 'leisure':		return "/images/icon_topic_leisure_"+c+".svg";		break;
				case 'work':		return "/images/icon_topic_work_"+c+".svg";			break;

				default:			return "/images/icon_nav_close.svg";				break;
			}
		}
})



.directive('icTile', [

	'icColorFilter',

	function(icColorFilter){


		return {
			restrict:		'AE',
			transclude:		true,
			templateUrl:	'/partials/ic-tile.html',

			scope:			{
								icType:		"<",
								icImage:	"<",
								icIcon:		"<",
								icTitle:	"<",
								icBrief:	"<"
							},

			link: function(scope, element, attrs){
				element.addClass('bg-'+icColorFilter(scope.icType))

				scope.$watch('icType', function(new_value, old_value){
					element.removeClass	('bg-'+icColorFilter(old_value))
					element.addClass	('bg-'+icColorFilter(new_value))
				})
			}
		
		}

	}
])








.directive('noTextNodes', [
	function(){
		return {
			restrict:	'AE',
			priority:	1000,

			link: function(scope, element, attrs){

				var nodes 		= element[0].childNodes,
					text_nodes 	= []

				for (var i = 0; i < nodes.length; i++) {
						if(nodes[i].nodeType == 3) text_nodes.push(nodes[i])
				} 

				text_nodes.forEach(function(node){
					element[0].removeChild(node)
				})

			}
		}
	}
])



.directive('icSpinner', [

	'$timeout',

	function($timeout){
		return {
			restrict:	'AE',
			template:	'<div class = "foreground"></div><div class = "background">',
			scope:		{
							active:	"="
						},

			link: function(scope, element, attrs){

				var to = undefined 

				scope.$watch('active', function(active){
					if(to) $timeout.cancel(to)

					active
					?	element.addClass('active')
					:	to = $timeout(function(){ element.removeClass('active') }, 1000, false)
				})
			}
		}
	}
])



.directive('icFilterInterface', [

	'icFilterConfig',
	'icConfigData',

	function(icFilterConfig, icConfigData){
		return {
			restrict: 		'AE',
			templateUrl:	'partials/ic-filter-interface.html',
			scope:			{},

			link: function(scope, element,attrs){
				scope.open 				= false
				scope.icFilterConfig 	= icFilterConfig
				scope.icConfigData 		= icConfigData
				scope.expand			= {}


				scope.toggleSortPanel = function(){
					scope.open = 	scope.open != 'sort'
									?	'sort'
									:	false
				}

				scope.toggleFilterPanel = function(){
					scope.open = 	scope.open != 'filter'
									?	'filter'
									:	false
				}
			}
		}
	}
])


.directive('icQuickFilter', [

	'icFilterConfig',
	'icConfigData',

	function(icFilterConfig, icConfigData){
		return {
			restrict: 		'AE',
			templateUrl:	'partials/ic-quick-filter.html',
			scope:			{},

			link: function(scope, element,attrs){
				scope.icFilterConfig 	= icFilterConfig
				scope.icConfigData 		= icConfigData
			}
		}
	}
])