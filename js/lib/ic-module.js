"use strict";

var icm = 	angular.module('InfoCompassModule',[
			"icApi"
		])




.controller('InfoCompassCtrl',[
	
	'$scope',
	'icSite',
	'icFilterConfig',

	function($scope, icSite, icFilterConfig){
		$scope.icSite 			= icSite
		$scope.icFilterConfig	= icFilterConfig //Muss das wirklich?

		$scope.$watch(function(){console.log('digest!')})
	}

])


.service('icSite', [

	'$rootScope',
	'$location',
	'icFilterConfig',

	function($rootScope, $location, icFilterConfig){
		var icSite 		= 	{
								fullItem:		false,
								page:			'main',
								params:			{
													'^':	'main',			// first param reserved for pages
													item:	undefined,		// item for full view
													c:		undefined,		// category filter
													s:		undefined,		// serach term
												}
							}

 		
		icSite.getNewPath = function(obj){
			var path 		= 	$location.path()

			for(var key in obj){
				var current_param_regex	= 	new RegExp('\/'+key+'\/([^/]+)(?=$|\/)'),
					current_value		=	path.match(current_param_regex) && path.match(current_param_regex)[1],
					new_param_str		=	obj[key] && obj[key] != current_value
											?	'/'+key+'/'+obj[key]
											:	''


				path	=	path.match(current_param_regex)
							?	path.replace(current_param_regex, new_param_str)
							:	path.replace(/\/$/,'') + new_param_str
			}

			return path						
		}

		icSite.updatePath = function(key, value){
			//TODO: Maybe prevent rerender

			$location.path(icSite.getNewPath(key, value))
			
			return this
		}

		icSite.addSearchTermToPath = function(search_term){
			icSite.updatePath({s:encodeURIComponent(search_term)})
		}

		icSite.getParamsFromPath = function(){

			for(var key in icSite.params){
				var regex 	= new RegExp('\/'+key+'\/([^/]+)'),
					matches	= $location.path().match(regex)

				icSite.params[key] = matches && matches[1]
			}

			var first_matches = $location.path().match(/^\/([^\/]+)/)
			icSite.params['^'] = first_matches && first_matches[1]

			return this
		}




		icSite.updateFromPath = function(){
			icSite.getParamsFromPath()

			icSite.fullItem 	= 	!!icSite.params.item

			icSite.pageUrl 		= 	icSite.params['^'] in icSite.params
									?	'pages/main.html'
									:	'pages/'+(icSite.params['^'] || 'main')+'.html'

			//update icFilterconfig
			icFilterConfig.filterBy.category	=	icSite.params.c || undefined

			return this
		}

 		$rootScope.$on('$locationChangeStart', icSite.updateFromPath)
 		$rootScope.$watch(function(){ return icFilterConfig.searchTerm }, icSite.addSearchTermToPath)

		return icSite
	}
								
])















.service('icFilterConfig', [

	function(){

		var icFilterConfig = 	{
						filterBy:	{
										category:	undefined,
									},
						searchTerm: ''
					}

		
		icFilterConfig.cleared = function(){
			var cleared = true

			for(var key in icFilterConfig.filterBy){
				cleared = cleared && !icFilterConfig.filterBy[key]
			}			

			cleared = cleared && !icFilterConfig.searchTerm

			return cleared
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

	function($q, $rootScope, $timeout, icApi, icFilterConfig){

		var searchResults = {}

		searchResults.data 		= []
		searchResults.listCalls = []
		searchResults.itemCalls = []



		searchResults.storeItem = function(new_item){

			var stored_item 	= searchResults.data.filter(function(item){ return item.id == new_item.id })[0]


			if(stored_item){
				angular.merge(stored_item, new_item)
			} else {
				searchResults.data.push(new_item)
			}

			return this
		}





		searchResults.listLoading = function(){

			searchResults.listCalls	 = 	searchResults.listCalls.filter(function(call){
											return call.$$state.status == 0
										})

			return searchResults.listCalls.length > 0
		}


		searchResults.download = function(){
			var currentCall = icApi.mockApiList(icFilterConfig)

			searchResults.listCalls.push(currentCall)

			return 	currentCall
					.then(
						function(result){
							result.forEach(function(item){
								searchResults.storeItem(item)
							})
						}
					)
		}


		searchResults.itemLoading = function(id){
			searchResults.itemCalls[id] = 	(searchResults.itemCalls[id] || [])
											.filter(function(call){
												return call.$$state.status == 0
											})

			return searchResults.itemCalls[id].length > 0
		}



		searchResults.downloadItem = function(id){

			var currentCall = icApi.mockApiItem(id)

			searchResults.itemCalls[id] = searchResults.itemCalls[id] || []
			searchResults.itemCalls[id].push(currentCall)

			return 	currentCall
					.then(
						function(item){
							searchResults.storeItem(item)
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

		function deepSearch(obj,str){
			var found = false

			for(var key in obj){
				found = 	found	
							||
							(	
								typeof obj == 'obj'
			 					?	deepSearch(obj[key], str)
			 					:	String(obj[key]).match(str)
			 				)
			}

			return found
		}

		searchResults.getFilteredList = function(additional_filters){
			var filters 	= angular.merge({}, icFilterConfig.filterBy, additional_filters),
				search_term	= icFilterConfig.searchTerm

			console.log('getfilteredlist')

			return	searchResults.data
					.filter(function(item){
						var passed = true

						for(var key in filters){
							passed = passed && !filters[key] || item[key] == filters[key]
						}
						return passed		
					})					
					.filter(function(item){
						//TODO prevent cycles

						return deepSearch(item, search_term)
					})

		}

		$rootScope.$watch(
			function(){ return icFilterConfig 		}, 
			function(){ searchResults.download()	},
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
			}
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
								icDetails: 	"<",
								icCategory:	"<"
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
					scope.item = icSearchResults.getItem(id)
					icSearchResults.downloadItem(id)
				})

			}
		}
	}
])





.directive('noTextNodes', [
	function(){
		return {
			restrict:	'AE',

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
