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
		icUser.role			= undefined
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
			icUser.name 		= obj.username //make configurable
			icUser.role 		= obj.role
			icUser.authToken	= obj.auth_token
			icUser.store()

			return icUser
		}

		icUser.clear = function(){
			icUser.name 		= undefined
			icUser.role 		= undefined
			icUser.authToken	= undefined
			icUser.store()
		}

		var rights = 	{
							undefined:	['suggest_new_items', 'suggest_item_edits'],
							'editor':	['add_new_items', 'edit_items', 'delete_items']
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

				var cancel_call =	 $q.defer(),
					call		=	$http({
										method: 			method,
										url:				base.replace(/\/$/g, '')+'/'+(path.replace(/^\//g,'')),
										params:				method == 'GET' ? data : undefined,
										data:				method == 'GET' ? undefined : data,
										headers:			{
																'Accept':			'application/json',
																'Auth-Token':		icUser.authToken
															},
										paramSerializer: 	'$httpParamSerializerJQLike',
										timeout: 			cancel_call.promise,
									})
									.then(
										function(result){
											return result.data
										}, 
										function(result){
											if(result.status == 305){
												$rootScope.$broadcast('loginRequired', 'INTERFACE.ACCESS_DENIED')
											}
											return $q.reject(result)
										}
									)

				call.cancel = function(){
					cancel_call.resolve("user cancelled")
				}

				return call

			}

			icApi.get 		= function(path, data){ return icApi.call('GET', 	path, data)}
			icApi.put 		= function(path, data){ return icApi.call('PUT', 	path, data)}
			icApi.post 		= function(path, data){ return icApi.call('POST',	path, data)}
			icApi.delete 	= function(path, data){ return icApi.call('DELETE',	path, data)}


			icApi.getConfigData = function(){
				return icApi.get('/frontend/init')
			}


			icApi.login = function(username, password){
				return 	icApi.post('/users/sessions', {username: username, password: password})
						.then(
							function(result){
								return icUser.set(result.user)
							},
							function(result){
								return $q.reject(result.data && result.data.error)
							}
						)
			}

			icApi.logout = function(){
				return 	icApi.delete('/users/sessions')
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
						.then(
							function(result){
								return result.item
							},
							function(result){
								return $q.reject(result)
							}
						)
			}

			icApi.newItem = function(item_data){
				return 	icApi.post('/items', item_data)
						.then(
							function(result){
								return result.item
							},
							function(result){
								return $q.reject(result)
							}
						)
			}

			icApi.deleteItem = function(id){
				return 	icApi.delete('/items/'+id)
			}


			return icApi
		}
	]

	return this
})