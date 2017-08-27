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

					if(surplus == last_surplus && !scope.noMoreItems) return false

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
						scope.noMoreItems 	= max <= scope[l]
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

		var scrollbar_width = undefined,
			style_element 	= undefined

		function getScrollBarwidth(){
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
		}

		function addCssRules(){
			style_element = document.createElement('style')

		  	document.head.appendChild(style_element)

			style_element.sheet.insertRule('[ic-settle-scrollbar] 			{overflow-y: hidden;}', 0)
			style_element.sheet.insertRule('[ic-settle-scrollbar]:hover		{overflow-y: scroll; -webkit-overflow-scrolling: touch;}', 0)
			style_element.sheet.insertRule('[ic-settle-scrollbar]:hover > * {margin-right: -'+scrollbar_width+'px;}', 0)
		}

		angular.element(window).on('resize', function(){
			getScrollBarwidth()

			style_element.sheet.deleteRule(0)
			style_element.sheet.insertRule('[ic-settle-scrollbar]:hover > * {margin-right: -'+scrollbar_width+'px;}', 0)

		})

		getScrollBarwidth()
		addCssRules()
			
		return {
			restrict:	'A',

			link: function(scope, element){
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



.directive('focusMe', [
	function(){
		return {
			restrict: 'A',

			link: function(scope, element, attrs){
				if(attrs.focusMe === undefined || attrs.focusMe === "" || scope.$eval(attrs.focusMe) ) element[0].focus()
			}
		}
	}
])


.directive('icScrollTop', [
	function(){
		return {
			restrict:	'A',

			link: function(scope, element, attrs){

				scope.$watch(attrs.scrollTop, function(){

					var el = element

					while(el && el [0]){
						el[0].scrollTop = 0
						el = el.parent()
					}
				})
			}
		}
	}
])

.directive('icClickOutside', [
	function(){
		return {
			restrict:	'A',

			link: function(scope, element, attrs){

				var body	= angular.element(document.getElementsByTagName('body'))

				function click(){
					scope.$eval(attrs.icClickOutside)
					scope.$apply()

				}

				body.on('click touchstart', click)

				// what was this for?  break href =/
				// element.on('click touchstart', function(event){
				// 	event.stopPropagation();
				// })

				scope.$on('$destroy', function(){
					body.off('click', click)
				})

			}
		}
	}
])




.directive('icAutoGrow', [

	function(){
		return {
			restrict:	"A",
			require:	"ngModel",

			link: function(scope, element, attrs, ctrl){

				function resize(){
					window.requestAnimationFrame(function(){
						element.css('height', 'auto')
						element.css('height', element[0].scrollHeight + 'px')
					})
				}

				element.on('blur keyup keydown change focus blur',resize)
				ctrl.$viewChangeListeners.push(resize)

				scope.$watch(attrs.ngModel, resize)
			}
		}
	}

])




.directive('icExposeInternalModel', [

	function(){
		return {
			restrict:	"A",
			require:	"ngModel",

			link: function(scope, element, attrs, ctrl){

				scope.$parent[attrs.icExposeInternalModel] = ctrl.$viewValue
				element.on('change keydown blur', function(){
					scope.$parent.$digest()
				})
			}
		}
	}
])





.filter('fill', [
	function(){
		return function(str, rep){
			rep = rep || 'undefined'
			
			if(!rep.forEach) rep = [rep] 

			rep = rep.map(function(r){
				return 	r
						.replace(/\s/g, '_')
						.replace(/([a-z])([A-Z])/g, '$1_$2')
						.toUpperCase()
			})

			return 	rep.reduce(function(s, r){
						return s.replace(/%s/, r)
					}, str)
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
			return a && a.indexOf(x) != -1
		}
	}
])


.filter('preventLoop', [
	function(){
		var cache = []

		return function(array){	

			var json		= JSON.stringify(array),
				cache_item 	= cache.filter(function(cache_item){ return cache_item.j == json })[0]

			if(!cache_item){
				cache_item = {j: json, a: array}
				cache.push(cache_item )
			}

			return cache_item.a
		}
	}
])

.filter('mapToKey',[
	function(){
		return function(array, key){	
			return 	array
					?	array.map(function(value){ return value[key] })
					:	null
		}
	}
])



//debug

.filter('consoleLog', [
	function(){
		return function(x){
			console.log(x)
			return x
		}
	}
])


.filter('consoleDir', [
	function(){
		return function(x){
			console.dir(x)
			return x
		}
	}
])

.filter('onScreen', function(){
	return function(x){
		var element = angular.element(document.getElementById('on-screen-debug-window') || document.createElement('div')),
			log		= angular.element('<pre>'+x+'</pre>'),
			body	= angular.element(document.getElementsByTagName('body'))

		body.append(element)

		element.css({
			boxSizing:	'border-box',
			padding:	'1rem',
			position:	'fixed',
			bottom:		'0',
			height:		'20%',
			width:		'100%',
			opacity:	'0.8',
			overflowY:	'scroll',
			zIndex:		'100',
			background:	'#fff',
			minHeight: 	'2rem',
			minWidth:	'10rem',
			border:		'0.5rem solid #000'

		})
		element.append(log)

		return x
	}
})

