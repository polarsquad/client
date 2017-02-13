angular.module('plImages',[])

.provider('plImages',function(){

	var urls = []

	this.setUrls = function(a){
		urls = a
	}

	this.$get = [

		'$q',

		function($q){

			var self		= this, 
				deferred 	= $q.defer(),
				promises 	= []

			urls.forEach(function(url){
				var img 		= new Image(),
					deferred	= $q.defer()


				promises.push(deferred.promise)	

				img.addEventListener('load', function(){
					deferred.resolve()
					img = null
				})

				img.src = url

			})

			self.ready = $q.all(promises)

			return self

		}
	]

})