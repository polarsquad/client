"use strict";

(function(){

	angular.module('icPreload',[])

	.provider('plImages', function(){

		var jsonFile = undefined

		this.setJsonFile = function(a){ jsonFile = a }

		this.$get = [

			'$q',
			'$http',

			function($q, $http){

				console.log(jsonFile)

				this.ready = 	Promise.resolve()
								.then(function()		{ return 	$http.get(jsonFile) } )
								.then(function(result)	{ return 	result.data })
								.then(function(images)	{ return 	Promise.all(images.map(function(url){
																		return new Promise(function(resolve, reject){

																			var img = new Image()

																			img.addEventListener('load', function(){
																				resolve()
																				img = null
																			})

																			img.src = url

																		})
																	}))
														}
								)

				return this

			}
		]

	})

	.provider('plTemplates',function(){

		var jsonFile = undefined

		this.setJsonFile = function(a){ jsonFile = a }


		this.$get = [

			'$q',
			'$http',
			'$templateCache',

			function($q, $http, $templateCache){


				this.ready = 	Promise.resolve()
								.then(function()			{ return 	$http.get(jsonFile) } )
								.then(function(result)		{ return 	result.data })
								.then(function(templates)	{ return 	Promise.all(templates.map(function(template){
																			$templateCache.put(template.name, template.content)																						
																		}))
															}
								)

				return this

			}
		]

	})

})()