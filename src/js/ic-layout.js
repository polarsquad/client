"use strict";


angular.module('icLayout', [])





.provider('icLayout', function(){

	var modes 		=	[]


	this.setModes = function(config){
		//config example:
		//[			
		// 	{
		// 		name:		'XS',	
		// 		width: 		20,
		// 		stretch:	true,
		// 		fold:		false
		// 	},	
		// 	{
		// 		name:		'S',
		// 		width:		48,
		// 		stretch:	true,
		// 		fold:		10,
		// 	},
		// 	{
		// 		name:		'M',
		// 		width:		64,
		// 		stretch:	false
		// 		fold:		10,
		// 	},
		// 	{
		// 		name:		'L',
		// 		width:		80,
		// 		stretch:	false
		// 		fold:		10,
		// 	},
		// 	{
		// 		name:		'XL',
		// 		width:		120,
		// 		stretch:	false
		// 		fold:		10,
		// 	}
		// ]
		 
		modes = config

	}

	this.$get = [

					'$window',
					'$rootScope',

					function($window, $rootScope){

						var icLayout 	= 	this,
							html		=	document.getElementsByTagName('html')[0],
							body		=	document.getElementsByTagName('body')[0],
							last_width	=	undefined,
							$_window	=	angular.element($window),
							$_html		=	angular.element(html),
							$_body		=	angular.element(body)
						
						const localStorageItem = 'icFontSiteAdjusted'
						

						icLayout.defaultRem		= 	undefined
						icLayout.adjustRem		=	undefined
						icLayout.modes			= 	modes.sort(function(mode1, mode2){
														return mode1.width > mode2.width
													})
						icLayout.mode			= 	undefined



						icLayout.getScrollbarWidth = function(){
							var div		= 	angular.element('<div></div>')
											.css({
												'width': 		'100px',
												'height':		'100px',
												'position':		'absolute',
												'overflow-y':	'scroll'
											})

							$_body.append(div)

							icLayout.scrollbarWidth	=	(100-div[0].clientWidth)

							div.remove()

							return icLayout.scrollbarWidth
						}


						icLayout.toggleFontSize = function(){

							let fontSizeWasAdjusted = this.adjustRem && this.adjustRem != 1

							this.adjustRem = 	fontSizeWasAdjusted
												?	undefined
												:	1.5



							html.classList.toggle('ic-font-size-adjusted', !fontSizeWasAdjusted)					

							$window.localStorage.setItem(localStorageItem, !fontSizeWasAdjusted) 

							this.adjust()
						}

						icLayout.getRem = function(resetFontSize){
							var rem, old_font_size, fontSizeAdjusted

							fontSizeAdjusted = this.adjustRem && this.adjustRem != 1

							if(resetFontSize){
								old_font_size 		= html.style.fontSize
								html.style.fontSize	= 'initial'
							}

							rem = eval($window.getComputedStyle(html).fontSize.replace(/px/,''))

							if(resetFontSize){
								html.style.fontSize = old_font_size
							}

							return 	fontSizeAdjusted
									?	rem * this.adjustRem
									:	rem
						}



						icLayout.setRem = function(size){

							if(size) return html.style.fontSize = size+'px'
							
							html.style.fontSize = 	(!icLayout.adjustRem  || icLayout.adjustRem ==1) 
													?	'initial'
													:	icLayout.adjustRem +'em' 
						}

						icLayout.adjust = function(){

							icLayout.defaultRem 		= icLayout.getRem(true)
							
							var rem_count	=	$window.innerWidth/icLayout.defaultRem
								

							icLayout.mode 	= 	icLayout.modes.reduce(function(best_so_far,mode){
														return 		mode.width <= rem_count
																&&	mode.width > best_so_far.width
																?	mode
																:	best_so_far
												}, icLayout.modes[0])
												


							icLayout.modes.forEach(function(mode){
								$_html.toggleClass(mode.name, mode == icLayout.mode)
							})

							if(rem_count < icLayout.mode.width ||	icLayout.mode.stretch){
								icLayout.setRem($window.innerWidth/icLayout.mode.width)
								$_html.addClass('modified-rem')
								$_html.removeClass('initial-rem')

							} else{
								icLayout.setRem()
								$_html.addClass('initial-rem')
								$_html.removeClass('modified-rem')
							}

							
						}

						icLayout.getScrollbarWidth() 
						if(icLayout.scrollbarWidth != 0) $_html.addClass('scrollbar-takes-space')


						$_window.on('resize', function(){ 
							if($window.innerWidth == last_width) return null
							$window.requestAnimationFrame( () => {
								icLayout.adjust()
								$rootScope.$digest() //Todo ist das nötig?
							})
							last_width = $window.innerWidth
							//icLayout.defaultWidth = last_width
						})
					
						//icLayout.defaultWidth = $window.innerWidth //todo


						if($window.localStorage.getItem(localStorageItem) === true) icLayout.toggleFontSize()

						$rootScope.icLayout = icLayout

						return icLayout
					}
				]
})

.run([

	'icLayout',

	function(icLayout){
		icLayout.adjust()
	}
])
