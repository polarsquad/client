"use strict";


angular.module('icUiDirectives', [
	//translate...
])


.directive('icClick',[
	function(){
		return {
			restrict:	'A',

			link: function(scope, element, attrs){

				function trigger(e){
					e.stopPropagation()
					scope.$eval(attrs.icClick)
					scope.$digest()					
				}

				element.on('click', trigger)
				scope.$on('$destroy', function(){ element.off('click', trigger) })
			}
		}
	}
])



.directive('icScrollRepeatLimit',[

	'$timeout',

	function($timeout){
		return {
			restrict:	'A',

			link: function(scope, element, attrs){
				var container 	= element[0],
					step_size	= parseInt(attrs.icScrollRepeatLimitStepSize) || 10,
					l			= attrs.icScrollRepeatLimitAs || 'icScrollRepeatLimit'


				while( (container = container.parentElement) && !container.hasAttribute('ic-scroll-repeat-limit-container')){}

				if(!container) return null
				container = angular.element(container)


				scope[l] = step_size


				scope.icScrollRepeatLimitIncrease = function(){
					scope[l] += step_size
				}

				function updateLimit(){
					var surplus = element[0].getBoundingClientRect().bottom-container[0].getBoundingClientRect().bottom


					if(surplus < container[0].clientHeight)		scope[l] += step_size
					if(surplus > 2*container[0].clientHeight)	scope[l] -= step_size
					
					
					scope.$apply()
					
					return true
				}


				function onScroll(){
					container.off('scroll', onScroll)
					window.requestAnimationFrame(function(){
						updateLimit()
						window.setTimeout(function(){
							onScroll()
							container.on('scroll', onScroll)
						}, 250)	
					})
				}


				scope.$watch(
					function(){
						return [scope.$eval(attrs.icScrollRepeatLimit), scope[l]]
					}, 
					function(obj){
						var max = obj[0]
						scope[l] 			= Math.max(Math.min(max, scope[l]), step_size)
						scope.noMoreItems 	= max == scope[l]
						scope.noScroll 		= container[0].clientHeight == container[0].scrollHeight

					}, true
				)

				container.on('scroll', onScroll)

				// TODO ensure container doesnt change size!
				// 
				//bad: onScroll()
			
			}
		}
	}

])


.service('icScrollSnapAnchors',[

	function(){
		var anchors = {}

		this.registerAnchor = function(anchor_name, element){
			element = element[0] || element
			if(anchors[anchor_name]) consone.warn('icScrollSnapAnchors: anchor with that name already exists: '+ anchor_name)
			anchors[anchor_name] = element
			return this
		}

		this.deRegisterAnchor = function(anchor_name){
			if(!anchors[anchor_name]) consone.warn('icScrollSnapAnchors: no anchor with that name exists: '+ anchor_name)
			anchors[anchor_name] = undefined
			return this
		}

		this.getAnchorElement = function(anchor_name){
			return anchors[anchor_name]
		}

	}
])

.directive('icScrollSnapAnchor',[

	'icScrollSnapAnchors',

	function(icScrollSnapAnchors){
		return{
			link:function(scope, element, attrs){
				icScrollSnapAnchors.registerAnchor(attrs.icScrollSnapAnchor, element)

				scope.$on('$destroy', function(){
					icScrollSnapAnchors.deRegisterAnchor(attrs.icScrollSnapAnchor)
				})
			}
		}
	}
])

.directive('icScrollSnapTarget',[

	'icScrollSnapAnchors',

	function(icScrollSnapAnchors){
		return {
			link: function(scope, element, attrs){

				var target				= attrs.icScrollSnapTarget,
					anchor				= icScrollSnapAnchors.getAnchorElement(target),
					to					= undefined,
					expect_scroll		= false,
					stop_snapping		= false

				function onScroll(){
					window.requestAnimationFrame(function(){
						element.toggleClass('ic-scroll-snapped', anchor.scrollTop > 0)						
					})

				}

				function snap(steps){

					steps = steps || 0

					if(stop_snapping) 	return null
					if(steps > 10000){
						console.warn('icScrollSnapTarget: too many snap steps: aborting.')
						return null
					}		


					window.requestAnimationFrame(function(){

						if(stop_snapping) return null


						expect_scroll 		= true
						anchor.scrollTop 	= Math.max(anchor.scrollTop * 0.85 - 2*steps, 0)

						if(anchor.scrollTop != 0) snap(steps+1)
					})
				}

				function afterScroll(){
					stop_snapping = false
					if(anchor.scrollTop < anchor.clientHeight * 0.15) snap()
				}


				window.addEventListener('scroll', function(event){
					anchor = anchor || icScrollSnapAnchors.getAnchorElement(target)

					if(event.target != anchor) return null

					if(!expect_scroll) stop_snapping = true

					window.clearTimeout(to)
					to = window.setTimeout(afterScroll, 200)

					onScroll()	
				}, true)

				scope.$on('$destroy', function(){
					window.removeEventListener('scroll', onScroll)
				})
			}
		}
	}
])



.directive('icSpinner', [

	'$timeout',

	function($timeout){
		return {
			restrict:		'AE',
			templateUrl:	'partials/ic-spinner.html',
			scope:			{
								active:	"<"
							},

			link: function(scope, element, attrs){

				var to = undefined 

				scope.$watch('active', function(active){
					if(to) $timeout.cancel(to)

					active
					?	element.addClass('active')
					:	to = $timeout(function(){ element.removeClass('active') }, 1000, false)
				})
			}
		}
	}
])


.directive('icCategory',[

	'ic',
	
	function(){
		return {
			restrict:		'AE',
			templateUrl:	'partials/ic-category.html',

			link: function(scope, element, attrs){
				scope.ic = ic
			}
		}
	}
])

.directive('icTag', [

	function(){
		return {
			restrict:		'AE',
			templateUrl:	'partials/ic-tag.html',
			scope:			{
								name:	"<",
								count:	"<"
							},

			link: function(scope, element, attrs){

			}
		}
	}
])


.filter('fill', [
	function(){
		return function(str, rep){
			rep = 	rep || ''
			rep = 	rep
					.replace(/\s/, '_')
					.replace(/([A-Z])/g, '_$1').toUpperCase()
			return str.replace(/%s/, rep)
		}
	}
])


