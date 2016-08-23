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

			var api = {}

			// api.acceptLanguage = 'en'

			api.call = function(method, path, data){

				return 	$http({
							method: 	method,
							url:		base.replace(/\/$/g, '')+'/'+(path.replace(/^\//g,'')),
							params:		method == 'GET' ? data : undefined,
							data:		method == 'GET' ? undefined : data,
							headers:	{
											'Accept':			'application/json',
											// 'Accept-Language':	api.acceptLanguage
										}
						})
						.then(function(result){
							return result.data
						})
			}

			api.get = function(path, data){ return api.call('GET', path, data)}


			api.getConfigData = function(){
				return api.get('/frontend/init')
			}


			api.getList = function(limit, offset, filter, search){

				var params = 	angular.merge({
									limit:		limit,
									offset:		offset
								},
								filter)

				return	api.get('/items', params)
			}

			api.getItem = function(id){
				return	api.get('/items/'+id)
			}


			api.getInterfaceTranslations = function(lang){
				return	api.get('/frontend/locale', lang ? {lang:lang} : {})
			}


			api.mockApiList = function(config, offset, limit){
				offset 	= offset 	|| 0
				limit	= limit 	|| 12

				var deferred 	= $q.defer(),
					types 	= ['event', 'location', 'information', 'opportunity']

				console.log('fetching list...')

				$timeout(function(){
					var result  = []

					for(var i = 0; i < limit ; i++){
						result.push({
							id: 		(Math.random() + '').replace(/\./,''), 
							title:  	(Math.random() + '').replace(/0/,'A'), 
							brief:		(Math.random() + '').replace(/0|\./g,'B').substr(0, Math.random()*16 +4) + ' Beschreibungstext lore ipsum dolor ', 
							type:		types[Math.floor(Math.random()*4)]
						})
					} 

					deferred.resolve(result)
				}, 1000) 

				return deferred.promise
			}


			api.mockApiItem = function(id){
				var deferred = $q.defer()

				console.log('fetching item...')


				$timeout(function(){
					deferred.resolve({
							id: 		id, 
							//title:  	(Math.random() + '').replace(/0/,'X'), 
							details:	Array.apply(null, {length: parseInt(Math.random()*30)+20})
										.map(function(){
											return btoa(btoa(String(Math.random()))).replace(/=/g, "").slice(-parseInt(Math.random()*10+1))
										})
										.join(' '),
							categories: [1,2,3,4,5],
							address:	"Basestr. 64",
							phone:		"007123455678789",
							email:		"test@example.com",
							website:	"http://www.example.com",
							hours:		["17:00 - 19:00"]

					})
				}, 1000) 

				return deferred.promise
			}

			return api
		}
	]

	return this
})