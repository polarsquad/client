"use strict";


var cdL = angular.module('cdLayout', [])



.service('cdLayout', [

	'$window',
	'$rootScope',

	function($window, $rootScope){

		var self		=	this,
			html		=	document.getElementsByTagName('html')[0],
			body		=	document.getElementsByTagName('body')[0],
			$_window	=	angular.element($window),
			$_html		=	angular.element(html),
			$_body		=	angular.element(body)


		this.hideNarrowColumn	= 	false
		this.scrollbarWidth		=	undefined // see bloew this.getScrollbarWidth()
		this.defaultRem			=	undefined // see bewlo this.getRem(true)

		this.defaultConfig		= 	{
										container:			$_html,
										columnWidth:		20,
										narrowColumnWidth:	10
									}

		this.config				= 	{}

		
		this.configure = function(obj)	{
			this.config = this.defaultConfig

			for(var key in this.defaultConfig){
				if(obj[key] !== undefined) this.config[key] = obj[key] 
			}

			return this
		}


		this.getScrollbarWidth = function(){
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


		this.getRem = function(resetFontSize){
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

		this.setRem = function(font_size){
			font_size = parseInt(font_size)
						?	font_size+'px'
						:	font_size

			$_html.css('font-size', font_size);

			return this
		}



		this.getInitialColumnCount = function(){

			var	width			= 	this.config.container[0].clientWidth,
				icc				= 	(width - this.config.narrowColumnWidth * self.defaultRem - self.scrollbarWidth) / (this.config.columnWidth * this.defaultRem + this.scrollbarWidth)

			return icc
		}


		this.setup = function(config){

			if(config) this.configure(config)

			var self = this

			requestAnimationFrame(function(){
				var	icc				=	self.getInitialColumnCount(self.scrollbarWidth, self.defaultRem)


				self.setRem('initial')
				self.hideNarrowColumn	= 	false

				
				if(icc <2 && icc > 1)	self.setRem(
											(self.config.container[0].clientWidth - 2 * self.scrollbarWidth) /
											(self.config.columnWidth + self.config.narrowColumnWidth)
										)

				if(icc < 1)				self.setRem(
											(self.config.container[0].clientWidth-self.scrollbarWidth) /
											(self.config.columnWidth)
										),self.hideNarrowColumn = true

				self.columnCount	= 	Math.floor(icc)

				self.updateClasses()

				$_window.one('resize', function(){ 
					self.setup() 
				})
					$rootScope.$apply()
			})


			this.scrollbarWidth		=	this.getScrollbarWidth()
			this.defaultRem			=	this.getRem(true)

			return this
		}


		this.updateClasses = function(){
			html.classList.toggle('cd-hide-narrow-column',	this.hideNarrowColumn)
			html.classList.toggle('cd-single-column',		this.columnCount < 2)
		}


		return this
	}

])


.directive('cdContainer',[

	'cdLayout',

	function(cdLayout){
		return {
			restrict: 	'AE',
			scope: 		true,

			link: function(scope, element, attrs){

				//remove text nodes:				
				
				var nodes 		= element[0].childNodes,
					text_nodes 	= []

				for (var i = 0; i < nodes.length; i++) {
				    if(nodes[i].nodeType == 3) text_nodes.push(nodes[i])
				} 

				text_nodes.forEach(function(node){
					element[0].removeChild(node)
				})

				element.css('display', 'block')

			},

			controller: function($scope, $element, $attrs){
				cdLayout.setup({
					container:			$element,
					columnWidth:		Number($attrs.cdColumnWidth),
					narrowColumnWidth:	Number($attrs.cdNarrowColumnWidth),	
				})

				$scope.cdLayout = cdLayout
			}
		}
	}

])
