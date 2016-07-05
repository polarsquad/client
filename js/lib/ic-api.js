angular.module('icApi', [])



.service('icApi', [

	'$http',
	'$timeout',
	'$q',

	function($http, $timeout, $q){

		var api = {}

		api.mockApiList = function(){
			var deferred 	= $q.defer(),
				categories 	= ['event', 'location', 'information', 'opportunity']

			console.log('fetching list...')

			$timeout(function(){
				var limit = Math.random()*3+1,
					result  = []

				for(var i = 0; i < limit ; i++){
					result.push({
						id: 		(Math.random() + '').replace(/\./,''), 
						title:  	(Math.random() + '').replace(/0/,'A'), 
						details:	(Math.random() + '').replace(/0|\./g,'B').substr(0, Math.random()*16 +4) + ' Beschreibungstext lore ipsum dolor ', 
						category:	categories[Math.floor(Math.random()*4)]
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
						details:	(Math.random() + '').replace(/0/,'Y'), 
						extra:		('EXTRA-'+Math.random()*2).replace(/\./,'')
				})
			}, 1000) 

			return deferred.promise
		}

		return api
	}
])