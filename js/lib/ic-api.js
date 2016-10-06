angular.module('icApi', [])

.config([

	'$httpProvider',

	function($httpProvider){

		$httpProvider.useApplyAsync(true)

	}
])



.provider('icApi', function(){

	var base = '/'

	this.setBase = function(url){
		base = url
		return this
	}

	this.$get = [

		'$http',
		'$timeout',
		'$q',

		function($http, $timeout, $q){

			var icApi = {}

			// icApi.acceptLanguage = 'en'

			icApi.call = function(method, path, data){

				return 	$http({
							method: 			method,
							url:				base.replace(/\/$/g, '')+'/'+(path.replace(/^\//g,'')),
							params:				method == 'GET' ? data : undefined,
							data:				method == 'GET' ? undefined : data,
							headers:			{
													'Accept':			'application/json',
												},
							paramSerializer: 	'$httpParamSerializerJQLike'
						})
						.then(function(result){
							return result.data
						})
			}

			icApi.get = function(path, data){ return icApi.call('GET', path, data)}
			icApi.put = function(path, data){ return icApi.call('PUT', path, data)}


			icApi.getConfigData = function(){
				return icApi.get('/frontend/init')
			}


			icApi.getList = function(limit, offset, filter, search){

				var params = 	angular.merge({
									limit:		limit,
									offset:		offset
								},
								filter)

				return	icApi.get('/items', params)
			}

			icApi.getItem = function(id){
				return	icApi.get('/items/'+id)
			}


			icApi.getInterfaceTranslations = function(lang){
				return	icApi.get('/frontend/locale', lang ? {lang:lang} : {})
			}

			icApi.updateItem = function(id, item_data){
				return 	icApi.put('/items/'+id, item_data)
			}


			return icApi
		}
	]

	return this
})