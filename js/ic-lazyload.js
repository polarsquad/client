(function(){
	var lazyLoadScripts 	= 	[
									//"mock/mock.js",
									// "js/lib/angular.min.js",
									"js/lib/angular.js",
									"js/lib/angular-sanitize.min.js",
									"js/lib/angular-translate.min.js",
									"js/lib/qrcode.js",
									"js/lib/qrcode_UTF8.js",
									"js/lib/angular-qrcode.js",
									"js/lib/smlLayout.js",
									"js/lib/ic-api.js",
									"js/ic-init.js",
									"js/lib/ic-services.js",
									"js/lib/ic-directives.js",
									"js/lib/ic-module.js",
									"js/app.js",
									"partials/templates.js"
								],

		lazyLoadStyles		=	[
									{ src: "styles/partials.css" },
									{ src: "styles/layout.css" } ,
									{ src: "styles/typography_and_colors.css" },
									{ src: "styles/print.css", media: 'print'},
									{ src: "styles/preload_images.css" },
								]
	
		var numberOfStylesLoaded 	= 0,
			icStylesLoaded			= false
			icScriptsLoaded			= false


		window.addEventListener('load', function(){

			//styles:

			lazyLoadStyles.forEach(function(style){
				var link = document.createElement('link')

				link.rel	= 'stylesheet'
				link.href 	= style.src
				link.media 	= style.media || 'all'

				link.addEventListener('load', function(){
					numberOfStylesLoaded ++

					if(numberOfStylesLoaded == lazyLoadStyles.length){
						icStylesLoaded = true
						start()
					}
				})

				document.head.appendChild(link)
			})

			//scripts:

			function addScript(pos){
				var	script = document.createElement('script')

				script.src = lazyLoadScripts[pos]

				script.addEventListener('load', function(){
					if(pos < lazyLoadScripts.length-1){
						addScript(pos+1)
					} else {
						icScriptsLoaded = true
						start()
					}
				})

				document.head.appendChild(script)
			}

			addScript(0)

		})

		window.addEventListener('icStylesLoaded', 	start)
		window.addEventListener('icScriptsLoaded', 	start)

		function start(){
			if(icStylesLoaded && icScriptsLoaded){
				angular.bootstrap(document, ['InfoCompass'])
			}
		}


})()