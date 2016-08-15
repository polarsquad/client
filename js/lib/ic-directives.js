"use strict";


angular.module('icDirectives', [
	'icServices'
])





/* sections: */

.directive('icSectionFilter',[

	function(){
		return {
			restrict: 		"AE",
			templateUrl:	"partials/section-filter.html",
			scope:			{},

			link: function(){
			}
		}
	}
])


.directive('icSectionList',[

	'icSite',

	function(icSite, smlLayout){
		return {
			restrict: 		"AE",
			templateUrl:	"partials/section-list.html",
			scope:			{
								icShowFilter:	'<'
							},

			link: function(scope, element, attrs){
				scope.icSite 	= icSite
			}
		}
	}
])


.directive('icSectionItem',[
	
	'icSearchResults',

	function(icSearchResults){
		return {
			restrict: 		"AE",
			templateUrl:	"partials/section-item.html",
			scope:			{
								icId:	"<"
							},

			link: function(scope, element, attrs){
				scope.icSearchResults 	= icSearchResults
			}
		}
	}
])










/*header*/

.service('icHeaders', [

	function(){

		var icHeaders =	{
							mainHeader: 	undefined,
							localHeaders: 	[]
						}

		icHeaders.registerMain = function(el){
			if(icHeaders.mainHeader){
				console.error('icHeaders: only one main header allowed.')
				return null
			}

			icHeaders.mainHeader	=	el


			while(icHeaders.localHeaders.length){
				var el 	= icHeaders.localHeaders.shift()
				icHeaders.mainHeader.append(el)
			}
		}

		icHeaders.deregisterMain = function(){
			icHeaders.mainHeader = undefined
		}

		icHeaders.registerLocal = function(el){
			if(icHeaders.mainHeader){
				icHeaders.mainHeader.append(el)
			} else {
				icHeaders.localHeaders.push(el)
			}
		}

		return icHeaders
	}
])



.directive('icHeader',[

	'$rootScope',
	'icFilterConfig',
	'icHeaders',
	'icSite',
	'icOverlays',

	function($rootScope, icFilterConfig, icHeaders, icSite, icOverlays){
		return {
			restrict: 		"AE",
			templateUrl:	"partials/ic-header.html",
			scope:			{},

			link: function(scope, element, attr){
				
				scope.icSite			= icSite
				scope.icFilterConfig	= icFilterConfig
				scope.searchTerm		= icFilterConfig.searchTerm

				scope.update = function(){
					var input = element[0].querySelector('#search-term')
					
					input.focus()
					input.blur()

					icFilterConfig.searchTerm = scope.searchTerm
				}

				icHeaders.registerMain(element)

				scope.$on('$destroy', function(){
					icHeaders.deregisterMain(scope.$id)
				})
			}
		}
	}
])

.directive('icLocalHeader',[

	'icHeaders',

	function(icHeaders){
		return {
			restrict: 		"AE",
			scope:			{},

			link: function(scope, element, attr, ctrl, transclude){
				icHeaders.registerLocal(element)

				scope.$on('$destroy', function(){
					element.remove()
				})
			}
		}
	}

])













.directive('icSearchResultList', [

	'icSearchResults',
	'icFilterConfig',

	function(icSearchResults, icFilterConfig){
		return {
			restrict:		'AE',
			templateUrl: 	'partials/ic-search-result-list.html',
			scope:			{
								icHref:			"&",
								icActive:		"&",
								icExtraFilter:	"<"
							},

			link: function(scope, element, attrs){
				scope.icSearchResults 	= icSearchResults 
				scope.icFilterConfig	= icFilterConfig

				scope.$on('icScrollBump', function(){
					icSearchResults.download()
				})
			}
		}
	}
])






//TDOD Bump stört wenn nachgeladen wird: anders lösen, bump weglassen
.directive('icScrollBump', [

	'$timeout',
	'$window',

	function($timeout, $window){

		return {
			restrict: 	'A',
			transclude: true,
			scope:		true,
			template:	'<div class = "shuttle" ng-transclude></div>',

			link: function(scope, element, attrs, controller){

				var shuttle		= element.find('div').eq(0),
					bumper 		= angular.element('<div class = "bumper"></div>'),
					bumping		= false,
					scroll_stop = null,
					ignore_next_scroll = false

				element.append(bumper)
			

				if($window.getComputedStyle(element[0]).position == 'static') 
					element.css('position', 'relative')

				shuttle.css({
					'min-height':			'100%',
					'transform': 			'translateY(0px)',
					'transition-property':	'transform',
				})

				bumper.css({
					'padding':				'0',
					'height': 				'50%',
					'width':				'auto',
				})

				function reset(){
					bumping = false

					var client_height	= element[0].clientHeight,
						scroll_top		= element[0].scrollTop,
						bottom			= shuttle[0].offsetTop + shuttle[0].offsetHeight,
						overflow		= bottom - scroll_top - client_height,
						duration 		= 800


					function swap(){

						shuttle.css({
							'transform': 			'translateY(0px)',
							'transition-duration':	'0ms'
						})

						element[0].scrollTop += overflow
						ignore_next_scroll = true


					}

					if(overflow < 0){



						window.requestAnimationFrame(function(){
							$timeout(swap, duration, false)
							shuttle.css({
								'transition-duration':	duration+'ms',
								'transform':			'translateY('+(-overflow)+'px)'
							})
						})
					}
					
				}

				function bump(){

					var client_height	= element[0].clientHeight,
						scroll_top		= element[0].scrollTop,
						bottom			= shuttle[0].offsetTop + shuttle[0].offsetHeight,
						overflow		= bottom - scroll_top - client_height

					if(overflow > client_height) return null

					if(!bumping) scope.$broadcast('icScrollBump')
					bumping = true
				
				}


				element.on('scroll', function(event){
					if(ignore_next_scroll){
						ignore_next_scroll = false
						return null
					}

					$window.requestAnimationFrame(bump)


					if(scroll_stop) $timeout.cancel(scroll_stop)
					scroll_stop = $timeout(reset, 200, false)

				})
			},
		}
	}
])






.directive('icPreviewItem',[

	function(){
		return {

			restrict: 		'AE',
			templateUrl: 	'partials/ic-preview-item.html',
			scope:			{
								icTitle:	"<",
								icBrief: 	"<",
								icType:		"<",
								icTopic:	"<"
							},

			link: function(scope, element, attrs){
			}
		}
	}
])




.directive('icFullItem',[

	'icSearchResults',

	function(icSearchResults){

		return {
			restrict:		'AE',
			templateUrl:	'partials/ic-full-item.html',
			scope:			{
								icId:		"<"
							},

			link: function(scope, element, attrs){

				scope.icSearchResults = icSearchResults

				scope.$watch('icId', function(id){
					scope.item = icSearchResults.getItem(id)
					icSearchResults.downloadItem(id)
				})

			}
		}
	}
])



.directive('icInfoTag',[

	function(){

		return {
			restrict:		'AE',
			templateUrl:	'partials/ic-info-tag.html',
			scope:			{
								icTitle:		"<",
								icContent:		"<",
								icIcon:			"<"
							},

			link: function(scope, element, attrs){
			}
		}
	}
])






.directive('icLanguageMenu', [

	'icLanguageConfig',

	function(icLanguageConfig){
		return {
			restrict:		'AE',
			templateUrl:	'partials/ic-language-menu',
			scope:			{},

			link: function(scope, element){				
				scope.icLanguageConfig = icLanguageConfig
			}
		}
	}

])







.filter('icColor', function(){
	return 	function(str){
				switch(str){
					case 'information': return "blue"; 		break;
					case 'events':		return "purple";	break;
					case 'places':		return "orange";	break;
					case 'services':	return "yellow";	break;
					default:			return "white";		break
				}
			}
})


.filter('icIcon', function(){
	return 	function(str, color){
			var c = color ?  'color' : 'white'

			switch(str){
				case 'information': return "/images/icon_type_information_"+c+".svg"; 		break;
				case 'events':		return "/images/icon_type_events_"+c+".svg";				break;
				case 'places':		return "/images/icon_type_places_"+c+".svg";				break;
				case 'services':	return "/images/icon_type_services_"+c+".svg";			break;

				case 'city':		return "/images/icon_topic_city_"+c+".svg";			break;
				case 'education':	return "/images/icon_topic_education_"+c+".svg";	break;
				case 'encounters':	return "/images/icon_topic_encounters_"+c+".svg";	break;
				case 'health':		return "/images/icon_topic_health_"+c+".svg";		break;
				case 'leisure':		return "/images/icon_topic_leisure_"+c+".svg";		break;
				case 'work':		return "/images/icon_topic_work_"+c+".svg";			break;

				default:			return "/images/icon_nav_close.svg";				break;
			}
		}
})



.filter('icAddParameters',[

	'icSite',

	function(icSite){
		return function(params){
			if(typeof params == 'string') params = icsite.path2params(param)
			return icSite.getNewPath(params, 'add')
		}
	}
])


.filter('icToggleParameters',[

	'icSite',

	function(icSite){
		return function(params){
			if(typeof params == 'string') params = icsite.path2params(param)
			return icSite.getNewPath(params, 'toggle')
		}
	}
])



.directive('icTile', [

	'icColorFilter',

	function(icColorFilter){


		return {
			restrict:		'AE',
			transclude:		true,
			templateUrl:	'/partials/ic-tile.html',

			scope:			{
								icType:		"<",
								icImage:	"<",
								icIcon:		"<",
								icTitle:	"<",
								icBrief:	"<"
							},

			link: function(scope, element, attrs){
				element.addClass('bg-'+icColorFilter(scope.icType))

				scope.$watch('icType', function(new_value, old_value){
					element.removeClass	('bg-'+icColorFilter(old_value))
					element.addClass	('bg-'+icColorFilter(new_value))
				})
			}
		
		}

	}
])








.directive('noTextNodes', [
	function(){
		return {
			restrict:	'AE',
			priority:	1000,

			link: function(scope, element, attrs){

				var nodes 		= element[0].childNodes,
					text_nodes 	= []

				for (var i = 0; i < nodes.length; i++) {
						if(nodes[i].nodeType == 3) text_nodes.push(nodes[i])
				} 

				text_nodes.forEach(function(node){
					element[0].removeChild(node)
				})

			}
		}
	}
])



.directive('icSpinner', [

	'$timeout',

	function($timeout){
		return {
			restrict:	'AE',
			template:	'<div class = "foreground"></div><div class = "background">',
			scope:		{
							active:	"="
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



.directive('icFilterInterface', [

	'icFilterConfig',
	'icConfigData',

	function(icFilterConfig, icConfigData){
		return {
			restrict: 		'AE',
			templateUrl:	'partials/ic-filter-interface.html',
			scope:			{},

			link: function(scope, element,attrs){
				scope.open 				= false
				scope.icFilterConfig 	= icFilterConfig
				scope.icConfigData 		= icConfigData
				scope.expand			= {}


				scope.toggleSortPanel = function(){
					scope.open = 	scope.open != 'sort'
									?	'sort'
									:	false
				}

				scope.toggleFilterPanel = function(){
					scope.open = 	scope.open != 'filter'
									?	'filter'
									:	false
				}
			}
		}
	}
])


.directive('icQuickFilter', [

	'icFilterConfig',
	'icConfigData',

	function(icFilterConfig, icConfigData){
		return {
			restrict: 		'AE',
			templateUrl:	'partials/ic-quick-filter.html',
			scope:			{},

			link: function(scope, element,attrs){
				scope.icFilterConfig 	= icFilterConfig
				scope.icConfigData 		= icConfigData
			}
		}
	}
])



.directive('icTriplet', [

	'$timeout',
	'$compile',
	'icSite',
	'icSearchResults',

	function($timeout, $compile, icSite, icSearchResults){
		return {
			restrict:	"AE",
			scope:		{
							icId:	"<"
						},
			template:	'<div class ="shuttle">'+
						'</div>',	

			link: function(scope, element, attrs, ctrl){

				var previous_item, current_item, next_item,
					width,
					shuttle = element.find('div').eq(0)



				previous_item		= $compile('<ic-full-item ic-id = "previousId">	</ic-full-item>')(scope)
				current_item 		= $compile('<ic-full-item ic-id = "currentId">	</ic-full-item>')(scope)
				next_item 			= $compile('<ic-full-item ic-id = "nextId">		</ic-full-item>')(scope)

				scope.$watch('icId', function(id){
					scope.previousId	= icSearchResults.getPreviousId(id)
					scope.currentId 	= id
					scope.nextId		= icSearchResults.getNextId(id)
				})

				scope.$watch(
					function(){ return icSearchResults.filteredList.length},
					function(){
						scope.previousId	= icSearchResults.getPreviousId(scope.currentId)
						scope.nextId		= icSearchResults.getNextId(scope.currentId)
					}
				)


				element.css({
					display:			'block'
				})

				width = element[0].clientWidth

				element.css({
					width:				width+'px',
					overflowX:			'scroll'
				})

				shuttle.css({
					display:			'inline-block',
					whiteSpace:			'nowrap',
					transition:			'transform 0 ease-in',
					'will-change':		'scroll-position transform', 
				})

				element.append(shuttle)

				shuttle
				.append(previous_item)
				.append(current_item)
				.append(next_item)

				shuttle.children()
				.css({
					display:			'inline-block',
					width:				width+'px',
					verticalAlign:		'top',
					whiteSpace:			'normal'
				})	
				

				var scroll_stop 		= undefined,
					ignore_next_scroll 	= true,
					slide_off			= false

				element[0].scrollLeft 	= width

				function swap(){

					ignore_next_scroll = true

					shuttle.css({
						'transform':			'translateX(0px)',
						'transition-duration':	'0ms'
					})	


					if(scope.snapTo == 'next'){
						scope.previousId		= scope.currentId
						scope.currentId			= scope.nextId
						scope.nextId			= icSearchResults.getNextId(scope.nextId)
					}

					if(scope.snapTo == 'previous'){
						scope.nextId			= scope.currentId
						scope.currentId			= scope.previousId
						scope.previousId		= icSearchResults.getPreviousId(scope.previousId)
					}
					
					ignore_next_scroll		= true
					element[0].scrollLeft 	= width

					if(scope.snapTo != 'current'){
						scope.$digest()
						$timeout(function(){ 
							icSite.updatePath({item: scope.currentId}) 
							slide_off = false
						} , 30, false)
					}

				}

				function snap() {	


					var scroll_left 	= element[0].scrollLeft,
						scroll_width	= shuttle[0].scrollWidth
						
					scope.snapTo = 'current'



					if(scroll_left < 0.4*scroll_width/3) scope.snapTo = scope.previousId 	? 'previous' 	: 'current'
					if(scroll_left > 1.6*scroll_width/3) scope.snapTo = scope.nextId		? 'next'		: 'current'

					var scroll_to 	= 	{
											previous:	0,
											current:	width,
											next:		2*width
										}[scope.snapTo],		

						distance 	= 	scroll_left - scroll_to,
						duration	=	Math.abs(distance/width) * 400


					shuttle.css({
						'transform':			'translateX('+distance+'px)',
						'transition-duration':	duration+'ms'
					})


					$timeout(swap, duration, false)
				}



				element.on('scroll', function(e){
					e.stopPropagation()
					
					if(ignore_next_scroll){ ignore_next_scroll = false; return null }

					if(scroll_stop) $timeout.cancel(scroll_stop)

					if(slide_off) return null

					scroll_stop = 	$timeout(snap, 100, false)
				})

			}
		}
	}
])



.directive('icOverlays', [

	'icOverlays',

	function(icOverlays){
		return {
			restrict:	"AE",
			templateUrl:"/partials/ic-overlays.html",
			scope:		true,

			link: function(scope, element, attrs, ctrl, transclude){
				icOverlays.registerScope(scope)
				scope.icOverlays = icOverlays
			}
				
		}
	}
])


.directive('icToggleOverlay',[

	'icOverlays',

	function(icOverlays){
		return {
			restrict:	"A",

			link: function(scope, element, attrs){
				element.on('click', function(e){
					e.preventDefault()
					e.stopImmediatePropagation()
					icOverlays.toggle(attrs.icToggleOverlay)
					icOverlays.$digest()
				})

			}
		}
	}
])



