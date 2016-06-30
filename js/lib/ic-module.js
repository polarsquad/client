icm = 	angular.module('InfoCompassModule',[
			"icApi"
		])




.controller('InfoCompassCtrl',[
	
	'$scope',
	'$location',
	'icFilterConfig',

	function($scope, $location, icFilterConfig){
		$scope.stateParams 	= 	{}
		$scope.icFilterConfig = icFilterConfig

		$scope.resetCurrentItemId = function(){
			icFilterConfig.currentItemId = undefined
			var current_path 	= $location.path(),
				new_path		= current_path.replace(/\/item\/[^\/]+/,'')

			$location.path(new_path)
		}
 		
		$scope.$on('$locationChangeStart', function(){
			var matches = $location.path().match(/\/item\/([^\/]+)/)
			if(matches) icFilterConfig.currentItemId = matches[1]
		})

	}

])



.service('icFilterConfig', [


	function($location, $rootScope){

		var self = 	{
						currentItemId: 	undefined
					}

		
		return self

	}

])


.service('icSearchResults', [

	'$q',
	'$rootScope',
	'$timeout',
	'icapi',

	function($q, $rootScope, $timeout, icApi){

		var searchResults = {}

		searchResults.data = {}
		searchResults.listCalls = []
		searchResults.itemCalls = []




		










		searchResults.addItem = function(lang, item){
			searchResults.data[lang] 			= searchResults.data[lang] || {}
			searchResults.data[lang][item.id]	= searchResults.data[lang][item.id] || {}

			for(key in item){
				searchResults.data[lang][item.id][key] 	= item[key]	
			}

			return this
		}





		searchResults.listLoading = function(){

			searchResults.listCalls	 = 	searchResults.listCalls.filter(function(call){
											return call.$$state.status == 0
										})

			return searchResults.listCalls.length > 0
		}


		searchResults.get = function(){
			var currentCall = icApi.mockApiList()

			searchResults.listCalls.push(currentCall)

			return 	currentCall
					.then(
						function(result){
							result.forEach(function(item){
								searchResults.addItem('de', item)
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



		searchResults.getItem = function(id, lang){

			var currentCall = icApi.mockApiItem(id, lang)

			searchResults.itemCalls[id] = searchResults.itemCalls[id] || []
			searchResults.itemCalls[id].push(currentCall)

			return 	currentCall
					.then(
						function(item){
							searchResults.addItem('de', item)
						}
					)
		}



		return searchResults
	}
])



.directive('icSearchResultList', [

	'icSearchResults',

	function(icSearchResults){
		return {
			restrict:		'AE',
			templateUrl: 	'partials/ic-search-result-list.html',
			scope:			true,

			link: function(scope, element, attrs){
				scope.icSearchResults = icSearchResults 

				icSearchResults.get()
				.then(function(){
					//scope.$digest()
				})
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
								icDetails: 	"<"
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
								icId:		"="
							},

			link: function(scope, element, attrs){

				scope.icSearchResults = icSearchResults

				scope.$watch('icId', function(id){
					icSearchResults.getItem(id)
				})

			}
		}
	}
])
