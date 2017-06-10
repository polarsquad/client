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

				var fading_time = 400


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

				function stop(){
					element.off('touchstart mousedown', add)
					angular.element(document.body).off('touchend mouseup', remove)
				}

				scope.$watch(
					function(){
						return scope.$eval(attrs.icTouchMe)
					},
					function(attr){
						stop()
						if(typeof attr != 'boolean' || attr === true){
							fading_time = parseInt(attr)  || 400
							element.on('touchstart mousedown', add)							
						}

					}
				)

				scope.$on('$destroy', stop)

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

				var surplus = undefined

				function updateLimit(){
					var last_surplus = surplus

					surplus = element[0].getBoundingClientRect().bottom-container[0].getBoundingClientRect().bottom

					if(surplus == last_surplus) return false

					if(surplus < container[0].clientHeight)		scope[l] += step_size
					if(surplus > 2*container[0].clientHeight)	scope[l] -= step_size

					return true
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
		this.anchors = {}

		this.registerAnchor = function(anchor_name, element){
			element = element[0] || element
			if(this.anchors[anchor_name]) console.warn('icScrollSnapAnchors: anchor with that name already exists: '+ anchor_name)
			this.anchors[anchor_name] = element
			return this
		}

		this.deRegisterAnchor = function(anchor_name, element){
			element = element[0] || element
			if(!this.anchors[anchor_name]) console.warn('icScrollSnapAnchors: no anchor with that name exists: '+ anchor_name)
			if(!this.anchors[anchor_name] && this.anchors[anchor_name] != element) console.warn('icScrollSnapAnchors: element is not registered with this name:', anchor_name, element)

			if(this.anchors[anchor_name] == element) this.anchors[anchor_name] = undefined
			return this
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
					icScrollSnapAnchors.deRegisterAnchor(attrs.icScrollSnapAnchor, element)
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

				var target				= undefined,
					anchors				= icScrollSnapAnchors.anchors,
					to					= undefined,
					expect_scroll		= false,
					stop_snapping		= false,
					threshold			= 0.15

				function onScroll(){
					window.requestAnimationFrame(function(){
						element.toggleClass(
							'ic-scroll-snapped', 

								anchors[target].scrollTop > 0 
							&& 	element[0].offsetHeight + anchors[target].clientHeight < anchors[target].scrollHeight
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

						if(anchors[target].scrollTop > anchors[target].scrollHeight - anchors[target].clientHeight * (1+threshold) ) return null
						if(anchors[target].scrollTop > anchors[target].clientHeight * threshold) return null
						if(stop_snapping) return null


						expect_scroll 		= true
						anchors[target].scrollTop 	= Math.max(anchors[target].scrollTop * 0.85 - 2*steps, 0)

						if(anchors[target].scrollTop != 0) snap(steps+1)
					})
				}

				function afterScroll(){
					stop_snapping = false
					//TODO : snap()
				}

				function beforeScroll(event){
					if(event.target != anchors[target]) return null

					if(!expect_scroll) stop_snapping = true

					window.clearTimeout(to)
					to = window.setTimeout(afterScroll, 200)

					onScroll()	
				}



				scope.$watch(
					function(){
						return scope.$eval(attrs.icScrollSnapTarget)
					},
					function(result){
						target	= result || undefined

						if(target){
							window.addEventListener('scroll', beforeScroll, true)
						} else {
							element.addClass('ic-scroll-snapped')
							window.removeEventListener('scroll', beforeScroll)
						}
					}
				)

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

.directive('icButton', [

	function(){
		return  {
			restrict:	'A',
			scope:		true,

			link: function(scope, element, attrs){
				scope.$watch(attrs.icButton, function(obj){
					if(!obj) return null
					scope.active 	= !!obj.active
					scope.disabled 	= !!obj.disabled 
				})
			}
		}
	}
])


.filter('fill', [
	function(){
		return function(str, rep){
			rep = 	rep || 'UNDEFINED'
			rep = 	rep
					.replace(/\s/, '_')
					.replace(/([A-Z])/g, '_$1').toUpperCase()
			return str.replace(/%s/, rep)
		}
	}
])

.filter('trim',[
	function(){
		return function(str){
			str = str || ''
			return str.replace(/^\s+|\s+$/g,'')
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


//debug

.filter('toConsole', [
	function(){
		return function(x){
			console.log(x)
			return x
		}
	}
])


.filter('onScreen', function(){
	return function(x){
		var element = angular.element(document.getElementById('on-screen-debug-window') || document.createElement('div'))
			log		= angular.element('<pre>'+x+'</pre>'),
			body	= angular.element(document.getElementsByTagName('body'))

		ody.append(element)

		element.css({
			position:	'fixed',
			bottom:		'0',
			height:		'20%',
			width:		'100%',
			opacity:	'0.8',
			overflowY:	'scroll'
		})
		element.append(log)

		return x
	}
})

