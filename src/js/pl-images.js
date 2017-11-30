angular.module('plImages',[])

.provider('plImages',function(){

	var urls = []

	this.setUrls = function(a){
		urls = a
	}

	this.$get = [

		'$q',

		function($q){

			this.ready = 	$q.resolve(Promise.all(urls.map(function(url){
								return 	new Promise(function(resolve, reject){
											var img	= new Image()

											img.addEventListener('load', function(){
												resolve()
												img = null
											})

											img.src = url
										})
							})))

			return this

		}
	]

})