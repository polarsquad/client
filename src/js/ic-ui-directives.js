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


.directive('icTouchMe', [
	function(){
		return {
			restrict:		'A',
			link: function(scope, element, attrs){

				var fading_time = attrs.icTouchMe || 400

				function add(){
					angular.element(document.body).one('touchend mouseup', remove)									
					element.addClass('ic-touched')	
				}
				function remove(){
					element.addClass('ic-touch-fade')
					window.requestAnimationFrame(function(){
						element.removeClass('ic-touched')					
						window.setTimeout(function(){
							element.removeClass('ic-touch-fade')
						}, fading_time)
					})
				}

				element.on('touchstart mousedown', add)

				scope.$on('$destroy', function(){
					element.off('touchstart mousedown', add)
					angular.element(document.body).off('touchend mouseup', remove)
				})

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

				if(!container){
					console.warn('icScrollRepeatLimit: missing container.', element[0])
					return null
				}
				container = angular.element(container)


				scope[l] = step_size


				scope.icScrollRepeatLimitIncrease = function(){
					scope[l] += step_size
				}

				function updateLimit(){
					var surplus 	= element[0].getBoundingClientRect().bottom-container[0].getBoundingClientRect().bottom,
						last_limit 	= scope[l]

					if(surplus < container[0].clientHeight)		scope[l] += step_size
					if(surplus > 2*container[0].clientHeight)	scope[l] -= step_size
					
					return last_limit != scope[l]
				}


				function onScroll(){
					container.off('scroll', onScroll)
					window.requestAnimationFrame(function(){
						if(updateLimit()){
							window.setTimeout(function(){
								onScroll()
							}, 250)	
							scope.$apply()
						} else {
							container.on('scroll', onScroll)							
						}
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
						updateLimit()
					}, true
				)

				container.on('scroll', onScroll)
			
			}
		}
	}

])


.service('icScrollSnapAnchors',[

	function(){
		var anchors = {}

		this.registerAnchor = function(anchor_name, element){
			element = element[0] || element
			if(anchors[anchor_name]) console.warn('icScrollSnapAnchors: anchor with that name already exists: '+ anchor_name)
			anchors[anchor_name] = element
			return this
		}

		this.deRegisterAnchor = function(anchor_name){
			if(!anchors[anchor_name]) console.warn('icScrollSnapAnchors: no anchor with that name exists: '+ anchor_name)
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
				console.log('register:', attrs.icScrollSnapAnchor)

				scope.$on('$destroy', function(){
					console.log('destroy:', attrs.icScrollSnapAnchor)
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
					stop_snapping		= false,
					threshold			= 0.15

				function onScroll(){
					window.requestAnimationFrame(function(){
						element.toggleClass(
							'ic-scroll-snapped', 

								anchor.scrollTop > 0 
							&& 	element[0].offsetHeight + anchor.clientHeight < anchor.scrollHeight
						)						
					})

				}

				function snap(steps){


					steps = steps || 0

					if(steps > 10000){
						console.warn('icScrollSnapTarget: too many snap steps: aborting.')
						return null
					}		


					window.requestAnimationFrame(function(){

						if(anchor.scrollTop > anchor.scrollHeight - anchor.clientHeight * (1+threshold) ) return null
						if(anchor.scrollTop > anchor.clientHeight * threshold) return null
						if(stop_snapping) return null


						expect_scroll 		= true
						anchor.scrollTop 	= Math.max(anchor.scrollTop * 0.85 - 2*steps, 0)

						if(anchor.scrollTop != 0) snap(steps+1)
					})
				}

				function afterScroll(){
					stop_snapping = false
					snap()
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



.directive('icSettleScrollbar',[
	
	function(){

		var scrollbar_width = undefined
			
		return {
			restrict:	'A',

			link: function(scope, element){

				if(scrollbar_width !== undefined) return null

				var style_element = document.createElement('style')
  
		  		document.head.appendChild(style_element)


				var div	= 	angular.element('<div></div>')
								.css({
								'width': 		'100px',
								'height':		'100px',
								'position':		'absolute',
								'overflow-y':	'scroll'
							})

				angular.element(document.getElementsByTagName('body')[0]).append(div)

				scrollbar_width	=	(100-div[0].clientWidth)

				div.remove()

		  		style_element.sheet.insertRule('[ic-settle-scrollbar] > * {margin-right: -'+scrollbar_width+'px}', 0)
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

.filter('toConsole', [
	function(){
		return function(x){
			console.log(x)
			return x
		}
	}
])

.filter('in',[
	function(){
		return function(x, a){
			return a.indexOf(x) != -1
		}
	}
])
