"use strict";

angular.module('hzScroll', [])



.directive('hzScroll',[

	'$window',
	'$timeout',

	function($window, $timeout){
		return {
			restrict:		'AE',
			transclude:		true,
			scope:			true,
			template:		'<button ng-if = "hzButtons" ng-click ="left()"></button> <div class ="wrapper"><div class = "shuttle" ng-transclude></div></div> <button ng-if = "hzButtons" ng-click ="right()"></button>',


			link: function(scope, element, attrs, controller, transclude){

				var wrapper		= element.find('div').eq(0),
					shuttle		= wrapper.find('div'),
					scroll_stop = null

				scope.hzButtons 	= 'hzButtons' 	in attrs
				scope.noTextNodes 	= 'noTextNodes'	in attrs 


				element.css({
					'overflow':				'hidden'
				})

				wrapper.css({ 
					'position':		'relative',
					'overflow-y': 	'hidden',
					'overflow-x':	'scroll',
					'will-change':	'scroll-position'
				})

				shuttle.css({
					'display':				'inline-block',
					'white-space':			'nowrap',
					'overflow-x':			'visible',
					'position':				'relative',
					'transition-property':	'transform',
				})



				if(scope.noTextNodes !== undefined){
					var nodes 		= shuttle[0].childNodes,
						text_nodes 	= []

					for (var i = 0; i < nodes.length; i++) {
					    if(nodes[i].nodeType == 3) text_nodes.push(nodes[i])
					} 


					text_nodes.forEach(function(node){
						shuttle[0].removeChild(node)
					})
				}


				scope.left = function(){
					snap(-1)
				}

				scope.right = function(){
					snap( 1)
				}


				function getLeftPos(el){
					var margin_left = Number($window.getComputedStyle(el).marginLeft.replace('px',''))

					return el.offsetLeft-margin_left
				}

				function getRightPos(el){
					var margin_right = Number($window.getComputedStyle(el).marginRight.replace('px',''))

					return el.offsetLeft + el.clientWidth + margin_right
				}

				function getNearestNodeFromLeft(){
					var nodes 					= 	shuttle[0].childNodes,
						nodes_array				= 	Array.prototype.slice.call(nodes),
						pos_left				=	wrapper[0].scrollLeft,
						nearest_node_from_left 	= 	nodes_array.reduce(function(nearest_so_far, node){
														return 	Math.abs(getLeftPos(node)-pos_left) 
																<
																Math.abs(getLeftPos(nearest_so_far)-pos_left)
																?	node
																:	nearest_so_far

													}, nodes_array[0])
						
					return 	nearest_node_from_left
								
				}

				function snap(node_index_dir){					

					$window.requestAnimationFrame(function(){ 

						var max_right,
							max_left,
							target,
							pos_left,
							pos_right,
							pos,
							snap_distance


						target			=	getNearestNodeFromLeft()

						if(node_index_dir == -1) target = target.previousSibling || target
						if(node_index_dir ==  1) target = target.nextSibling || target


						pos_left		=	getLeftPos(target)
						pos_right		=	getRightPos(shuttle[0].lastChild)

						max_right		=	pos_right - pos_left <= wrapper[0].clientWidth
						max_left		=	target == shuttle[0].firstChild

						pos				=	max_right
											?	pos_right
											:	pos_left


						snap_distance 	= 	max_right
											?	wrapper[0].scrollLeft - pos + wrapper[0].clientWidth
											:	wrapper[0].scrollLeft - pos


						element.toggleClass('max-left', 	max_left)
						element.toggleClass('max-right', 	max_right)

						if(snap_distance == 0) return null


						shuttle.css({
							'transform':			'translateX('+snap_distance+'px)',
							'transition-duration':	'400ms'
						})

						shuttle.one('transitionend webkitTransitionEnd oTransitionEnd', function(){
							var matches 	=	shuttle.css('transform').match(/\((.*)px\)/),
								translateX 	= 	matches ? Number(matches[1]) : 0,
								scroll_to	=	wrapper[0].scrollLeft - translateX


							wrapper[0].scrollLeft = scroll_to
							
							shuttle.css({
								'transform':			'translateX(0px)',
								'transition-duration':	'0ms'
							})
						})
					})
				}

				snap()

				wrapper.on('scroll', function(){
					if(scroll_stop) $timeout.cancel(scroll_stop)

					scroll_stop = $timeout(snap, 100, true)

				})
			}
		}
	}

])