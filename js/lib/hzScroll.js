"use strict";

angular.module('hzScroll', [])



.directive('hzScroll',[

	'$window',
	'$timeout',

	function($window, $timeout){
		return {
			restrict:		'AE',


			link: function(scope, element, attrs){

				var scroll_stop = null,
					closest		= null

				element.css({ 
					'overflow-y': 	'hidden',
					'white-space':	'nowrap',
					'position':		'relative'
				})

				function getLeftPos(el){
					var margin_left = Number($window.getComputedStyle(el).marginLeft.replace('px',''))

					return el.offsetLeft-margin_left
				}


				function snap(){
					var pos_left		= 	getLeftPos(closest),
						snap_distance 	= 	Math.abs(element[0].scrollLeft - pos_left),
						snap_dir		= 	element[0].scrollLeft - pos_left > 0
											?	-1
											:	 1,
						scroll_by		=	1 + snap_distance*0.1,
						maxed			=	element[0].scrollLeft == element[0].scrollWidth - element[0].offsetWidth

					if(snap_distance == 0 || maxed) return null

					element[0].scrollLeft = snap_distance <= 10
											?	pos_left
											:	element[0].scrollLeft + snap_dir * scroll_by
					

					$window.requestAnimationFrame(snap)
				}



				element.on('scroll', function(){
					if(scroll_stop) $timeout.cancel(scroll_stop)

					scroll_stop = $timeout(function(){
						var nodes 			= element[0].childNodes,
							distance		= undefined,
							min_distance	= undefined

						for(var i = 0; i< nodes.length; i++){
							distance = Math.abs(getLeftPos(nodes[i])-element[0].scrollLeft)
							if(min_distance === undefined || distance < min_distance){
								closest = nodes[i]
								min_distance = distance
							}
						}

						$window.requestAnimationFrame(snap)
					}, 100, true)

				})
			}
		}
	}

])