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

	.provider('plStyles', function(){

		var jsonFile 	= undefined,
			files		= undefined

		this.setJsonFile 	= function(a){ jsonFile 	= a }
		this.setFiles		= function(f){ files 		= f }	 

		this.$get = [

			'$q',
			'$http',

			function($q, $http){

				function loadStyles(files){
					return		Promise.all(files.map(function(url){
									return new Promise(function(resolve, reject){
										var l = document.createElement('link')

											l.setAttribute('rel',	'stylesheet')
											l.setAttribute('type',	'text/css')
											l.setAttribute('href',	url)
											l.addEventListener('load', resolve )
											document.head.appendChild(l)

									})
								}))
				}
				
				this.ready = 	Promise.resolve()
								.then( function()		{	return 	{data : files} || $http.get(jsonFile) })
								.then( function(result)	{	return 	result.data })
								.then( function(styles)	{	
									if(typeof styles 		== 'string') styles = [styles]
									if(typeof styles[0] 	== 'string') styles = [styles]	
									
									var queue = Promise.resolve()

									styles.forEach(function(filenames){ 
										return queue.then(function(){ loadStyles(filenames) }) 
									})

								})
								.catch(console.log)

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