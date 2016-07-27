"use strict";


var cdL = angular.module('smlLayout', [])





.provider('smlLayout', function(){

	var modes 		=	[]


	this.setModes = function(config){
		//config example:
		//[			
		// 	{
		// 		name:		'XS',	
		// 		width: 		20,
		// 		stretch:	true
		// 	},	
		// 	{
		// 		name:		'S',
		// 		width:		48,
		// 		stretch:	true
		// 	},
		// 	{
		// 		name:		'M',
		// 		width:		64,
		// 		stretch:	false
		// 	},
		// 	{
		// 		name:		'L',
		// 		width:		80,
		// 		stretch:	false
		// 	},
		// 	{
		// 		name:		'XL',
		// 		width:		120,
		// 		stretch:	false
		// 	}
		// ]
		 
		modes = config

	}

	this.$get = [

					'$window',
					'$rootScope',

					function($window, $rootScope){

						var smlLayout 	= 	this,
							html		=	document.getElementsByTagName('html')[0],
							body		=	document.getElementsByTagName('body')[0],
							last_width	=	undefined,
							$_window	=	angular.element($window),
							$_html		=	angular.element(html),
							$_body		=	angular.element(body)
						

						smlLayout.defaultRem	= 	undefined
						smlLayout.modes			= 	modes.sort(function(mode1, mode2){
														return mode1.width > mode2.width
													})
						smlLayout.mode			= 	undefined



						smlLayout.getScrollbarWidth = function(){
							var div		= 	angular.element('<div></div>')
											.css({
												'width': 		'100px',
												'height':		'100px',
												'position':		'absolute',
												'overflow-y':	'scroll'
											})

							$_body.append(div)

							var scrollbar_width	=	(100-div[0].clientWidth)

							div.remove()

							return scrollbar_width
						}


						smlLayout.getRem = function(resetFontSize){
							var rem, old_font_size

							if(resetFontSize){
								old_font_size 		= html.style.fontSize
								html.style.fontSize	= 'initial'
							}

							rem = eval($window.getComputedStyle(html).fontSize.replace(/px/,''))

							if(resetFontSize){
								html.style.fontSize = old_font_size
							}

							return rem
						}



						smlLayout.setRem = function(size){
							html.style.fontSize = 	size
													?	size+'px'
													:	'initial'
						}



						smlLayout.adjust = function(){

							smlLayout.defaultRem 		= smlLayout.getRem(true)
							
							var rem_count	=	$window.innerWidth/smlLayout.defaultRem
								

							smlLayout.mode 	= 	smlLayout.modes.reduce(function(best_so_far,mode){
														return 		mode.width < rem_count
																&&	mode.width > best_so_far.width
																?	mode
																:	best_so_far
												}, smlLayout.modes[0])
												


							smlLayout.modes.forEach(function(mode){
								$_html.toggleClass(mode.name, mode == smlLayout.mode)
							})

							if(rem_count < smlLayout.mode.width ||	smlLayout.mode.stretch){
								smlLayout.setRem($window.innerWidth/smlLayout.mode.width)
								$_html.addClass('modified-rem')
								$_html.removeClass('initial-rem')

							} else{
								smlLayout.setRem()
								$_html.addClass('initial-rem')
								$_html.removeClass('modified-rem')
							}


							$rootScope.$digest() //Todo ist das nötig?
						}

						if(smlLayout.getScrollbarWidth() != 0) $_html.addClass('scrollbar-takes-space')



						$_window.on('resize', function(){ 
							if($window.innerWidth == last_width) return null
							$window.requestAnimationFrame(smlLayout.adjust)
							last_width = $window.innerWidth
						})

						$rootScope.smlLayout = smlLayout

						return smlLayout
					}
				]
})

.run([

	'smlLayout',

	function(smlLayout){
		smlLayout.adjust()
	}
])
