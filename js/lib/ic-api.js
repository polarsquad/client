angular.module('icApi', [])

.config([

	'$httpProvider',

	function($httpProvider){

		$httpProvider.useApplyAsync(true)

	}
])




.service('icUser', [

	function(icApi){
		var icUser = this

		icUser.name 		= undefined 
		icUser.role			= 'guest'
		icUser.authToken	= undefined

		if(!window.localStorage) console.warn('icUser: Browser does not support localStorage!')

		icUser.store = function(){
			var storeMe = 	{
								name: 		icUser.name,
								role: 		icUser.role,
								authToken:	icUser.authToken
							}
			window.localStorage.icUser = JSON.stringify(storeMe)
		}

		icUser.get = function(){
			var stored = JSON.parse(window.localStorage.icUser || '{}')

			icUser.name 		= stored.name
			icUser.role 		= stored.role
			icUser.authToken 	= stored.authToken

		}


		icUser.set = function(obj){
			icUser.name 		= obj.name
			icUser.role 		= obj.role
			icUser.authToken	= obj.authToken
			icUser.store()
		}

		icUser.clear = function(){
			icUser.name 		= undefined
			icUser.role 		= 'guest'
			icUser.authToken	= undefined
			icUser.store()
		}

		var rights = 	{
							'guest':	[],
							'editor':	['edit']
						}

		icUser.can = function(task){
			return 	rights[icUser.role] &&  (rights[icUser.role].indexOf(task) != -1)						
		}


		icUser.get()

		return icUser
	}
])





.provider('icApi', function(){

	var base = '/'

	this.setBase = function(url){
		base = url
		return this
	}

	this.$get = [

		'$rootScope',
		'$http',
		'$timeout',
		'$q',
		'icUser',

		function($rootScope, $http, $timeout, $q, icUser){

			var icApi = {}


			icApi.call = function(method, path, data){

				return 	$http({
							method: 			method,
							url:				base.replace(/\/$/g, '')+'/'+(path.replace(/^\//g,'')),
							params:				method == 'GET' ? data : undefined,
							data:				method == 'GET' ? undefined : data,
							headers:			{
													'Accept':			'application/json',
													'Authorization':	icUser.authToken
												},
							paramSerializer: 	'$httpParamSerializerJQLike'
						})
						.then(
							function(result){
								return result.data
							}, 
							function(result){
								if(result.status == 305){
									$rootScope.$broadcast('loginRequired', 'Acces denied')
								}
								return $q.reject(result)
							}
						)

			}

			icApi.get 	= function(path, data){ return icApi.call('GET', 	path, data)}
			icApi.put 	= function(path, data){ return icApi.call('PUT', 	path, data)}
			icApi.post 	= function(path, data){ return icApi.call('POST',	path, data)}


			icApi.getConfigData = function(){
				return icApi.get('/frontend/init')
			}


			icApi.login = function(username, password){
				return 	$q.resolve({name: username, role:'editor', authToken: 'sahdkjdfhkdsfh213'})
						// icApi.post('/login', {username: username, password: password})
						.then(function(result){
							icUser.set(result)
						})
			}

			icApi.logout = function(){
				console.log('logout')
				return 	$q.resolve()
						//icApi.get('/logout')
						.then(function(){
							icUser.clear()
						})

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