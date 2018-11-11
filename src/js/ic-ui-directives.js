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


.service('icScrollSources',[

	function(){

		var icScrollSources = new EventTarget()

		icScrollSources.sources = {}

		function scroll(e){
			var element 	= e.target,
				source_name	= undefined

			for(var key in icScrollSources.sources){
				if(icScrollSources.sources[key] == element) source_name = key
			}

			var event = new CustomEvent('remote-scroll', { detail: {sourceName: source_name, sourceElement: element, sourceEvent: e }})
			icScrollSources.dispatchEvent(event)
		}



		icScrollSources.registerScrollSource = function(source_name, element){
			element = element[0] || element

			if(icScrollSources.sources[source_name]) icScrollSources.deRegisterScrollSource(source_name, element)

			element.addEventListener('scroll', scroll)
			icScrollSources.sources[source_name] = element

			//fake a scroll for the first run:
			icScrollSources.dispatchEvent(new CustomEvent('remote-scroll', { detail: {sourceName: source_name, sourceElement: element}}))

			return icScrollSources
		}



		icScrollSources.deRegisterScrollSource = function(source_name, element){
			element = element[0] || element

			element.removeEventListener('scroll', scroll)

			if(icScrollSources.sources[source_name] == element) icScrollSources.sources[source_name] = undefined

			return icScrollSources
		}

		return icScrollSources
	}
])

.directive('icScrollSource',[

	'icScrollSources',

	function(icScrollSources){
		return{
			link:function(scope, element, attrs){

				var source_name = scope.$eval(attrs.icScrollSource) || attrs.icScrollSource

				icScrollSources.registerScrollSource(source_name, element)

				scope.$on('$destroy', function(){
					icScrollSources.deRegisterScrollSource(source_name, element)
				})
			}
		}
	}
])

.directive('icScrollWatch',[

	'icScrollSources',

	function(icScrollSources){
		return {
			link: function(scope, element, attrs){

				var target				= undefined,
					sources				= icScrollSources.sources,
					to					= undefined,
					expect_scroll		= false,
					stop_snapping		= false,
					threshold			= 0.15


				function checkSource(sourceElement){


					window.requestAnimationFrame(function(){
						if(!sourceElement) return null
							
						element.toggleClass(
							'ic-scroll-top', 

								sourceElement.scrollTop > 0 
							&& 	element[0].offsetHeight + sourceElement.clientHeight < sourceElement.scrollHeight
						)						
					})

				}


				function beforeScroll(event){
				
					if(event.detail.sourceName != target) return null

					checkSource(event.detail.sourceElement)
				}

				scope.scrollTop = function(){
					if(target) sources[target].scrollTop = 0
				}

				scope.scrollBottom = function(){
					if(target) sources[target].scrollTop = sources[target].scrollHeight
				}


				scope.$watch(
					function(){
						var t = scope.$eval(attrs.icScrollWatch)

						return 	t === undefined 
								? attrs.icScrollWatch
								: t
					},
					function(result){
						target	= result || undefined

						if(typeof target != 'boolean'){
							icScrollSources.addEventListener('remote-scroll', beforeScroll, true)
							if(icScrollSources.sources[target]) checkSource(icScrollSources.sources[target])
						} else {
							element.toggleClass('ic-scroll-top', target)
							icScrollSources.removeEventListener('remote-scroll', beforeScroll)
						}

					}
				)

				scope.$on('$destroy', function(){
					icScrollSources.removeEventListener('remote-scroll', beforeScroll)
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
			if(scrollbar_width > 0) style_element.sheet.insertRule('[ic-settle-scrollbar]:hover > * {margin-right: -'+scrollbar_width+'px;}', 0)

		})

		getScrollBarwidth()

		if(scrollbar_width > 0) addCssRules()
			
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


.directive('icScrollTo', [
	function(){
		return {
			restrict:	'A',

			link: function(scope, element, attrs){


				scope.$watch(attrs.scrollTop, function(){

					var target = attrs.icScrollTo.toLowerCase()


					element.on('click touch', function(){


						var scroll_parent = element[0]

						while(scroll_parent && scroll_parent.scrollHeight == scroll_parent.offsetHeight){
							scroll_parent = scroll_parent.parentElement							
						}

						if(!scroll_parent) return null

						if( target == 'top') 	scroll_parent.scrollTop = 0
						if( target == 'bottom') scroll_parent.scrollTop = scroll_parent.scrollHeight
					})

				})
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

				function click(e){
					var c = e.target

					while(c && c != element[0]){ c = c.parentElement }

					if(!c){	
						scope.$eval(attrs.icClickOutside)
						scope.$apply()
					}

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

				element.on('change keyup paste click input blur', function(){
					scope.$parent[attrs.icExposeInternalModel] = element[0].value
					scope.$parent.$apply()
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
				return 	r && r
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


.filter('section', [
	function(){
		return function(arr_1, arr_2){
			return 	arr_1
					?	arr_1.filter(function(item){ return arr_2 && arr_2.indexOf(item) != -1})
					:	[]
		}
	}
])

.filter('flatten', [
	function(){
		return function(obj){
			var result = []

			for(var key in obj) result = result.concat(obj[key])

			return result
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
		var element = angular.element(document.getElementById('on-screen-debug-window') || angular.element("<div id =\"on-screen-debug-window\"></div>")),
			log		= angular.element('<pre>'+x+'</pre>'),
			body	= angular.element(document.getElementsByTagName('body'))

		body.append(element)

		element.css({
			boxSizing:	'border-box',
			padding:	'1rem',
			position:	'fixed',
			bottom:		'0',
			height:		'40%',
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

