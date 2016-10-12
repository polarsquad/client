"use strict";


angular.module('icDirectives', [
	'icServices'
])





.directive('icLoadingScreen',[

	'$q',
	'$timeout',
	'$rootScope',

	function($q, $timeout){
		return {
			restrict:	'AE',
			transclude:	true,

			link: function(scope, element, attrs, ctrl, transclude){


				var childScope 	= undefined,
					unwatch		= undefined,
					timer		= $timeout(parseInt(attrs.icMinDuration), false) 



				function clear(){
					childScope.$destroy()
					element.remove()
					unwatch()
				}

				transclude(function(clone, scope){
					childScope = scope
					element.append(clone)
				})

				unwatch = scope.$watch(attrs.icAppReady , function(appReady){ 

					if(!appReady) 			return null
					if(appReady === true) 	appReady = $q.resolve()

					

					appReady
					.then(function(){
						return timer
					})
					.then(function(){
						var deferred 			= $q.defer(),
							has_transition 		= undefined,
							no_transition_timer = $timeout(2000, false) 

						element.addClass('ic-hide')						    
						
						no_transition_timer
						.then(function(){
							deferred.resolve()
						})

						element.one('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function(){
							deferred.resolve()
						})

						return deferred.promise
					})
					.then(clear, function(reason){
						scope.error = reason					
					})

				})
			}
		}
	}
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
	'icSearchResults',

	function(icSite, smlLayout, icSearchResults){
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

	'icSite',

	function(icSite){
		return {
			restrict: 		"AE",
			templateUrl:	"partials/section-item.html",

			link: function(scope, element, attrs){
				scope.icSite = icSite
			}
		}
	}
])










/*header*/

// .service('icHeaders', [

// 	function(){

// 		var icHeaders =	{
// 							mainHeader: 	undefined,
// 							localHeaders: 	[]
// 						}

// 		icHeaders.registerMain = function(el){
// 			if(icHeaders.mainHeader){
// 				console.error('icHeaders: only one main header allowed.')
// 				return null
// 			}

// 			icHeaders.mainHeader	=	el


// 			while(icHeaders.localHeaders.length){
// 				var el 	= icHeaders.localHeaders.shift()
// 				icHeaders.mainHeader.append(el)
// 			}
// 		}

// 		icHeaders.deregisterMain = function(){
// 			icHeaders.mainHeader = undefined
// 		}

// 		icHeaders.registerLocal = function(el){
// 			if(icHeaders.mainHeader){
// 				icHeaders.mainHeader.append(el)
// 			} else {
// 				icHeaders.localHeaders.push(el)
// 			}
// 		}

// 		return icHeaders
// 	}
// ])



.directive('icHeader',[

	'icFilterConfig',
	'icSite',

	function(icFilterConfig, icSite){
		return {
			restrict: 		"AE",
			templateUrl:	"partials/ic-header.html",
			scope:			{
								icMenu:			"<",
								icCloseItem:	"<",
								icShare:		"<",
								icPrint:		"<",
								icLanguages:	"<"
							},

			link: function(scope, element, attr){
				
				scope.icSite			= icSite
				scope.icFilterConfig	= icFilterConfig
			
				scope.print				= function(){ window.print() 		}
				scope.closeItem			= function(){ icsite.clearItem()	}
			}
		}
	}
])

// .directive('icLocalHeader',[

// 	'icHeaders',

// 	function(icHeaders){
// 		return {
// 			restrict: 		"AE",
// 			scope:			{},

// 			link: function(scope, element, attr, ctrl, transclude){
// 				icHeaders.registerLocal(element)

// 				scope.$on('$destroy', function(){
// 					element.remove()
// 				})
// 			}
// 		}
// 	}

// ])













.directive('icSearchResultList', [

	'icSearchResults',
	'icFilterConfig',
	'icLanguageConfig',

	function(icSearchResults, icFilterConfig, icLanguageConfig){
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


				scope.$watch(
					function(){
						return icLanguageConfig.currentLanguage
					},
					function(){
						scope.language = icLanguageConfig.currentLanguage
					}
				)
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
	'icLanguageConfig',
	'icItemEdits',
	'icConfigData',
	'icUser',

	function(icSearchResults, icLanguageConfig, icItemEdits, icConfigData, icUser){

		return {
			restrict:		'AE',
			templateUrl:	'partials/ic-full-item.html',
			scope:			{
								icId:			"<",
							},

			link: function(scope, element, attrs){

				scope.icSearchResults 	= icSearchResults
				scope.icConfigData		= icConfigData
				scope.icUser			= icUser

				scope.editMode			= false

				scope.edit = function() {
					scope.editMode = true
				}

				scope.cancelEdit = function(){
					scope.editMode = false
				}

				scope.save = function() {
					scope.editMode = false
					icItemEdits.upload(icId)
				}

				scope.print = function(){
					window.print()
				}



				scope.$watch('icId', function(id){
					scope.item 		= icSearchResults.getItem(id)
					scope.itemEdit 	= icItemEdits.open(id)

					icSearchResults.downloadItem(id)

					
				})

				scope.$watch(
					function(){
						return scope.icId && icSearchResults.itemLoading(scope.icId)
					},

					function(loading){
						scope.loading = loading
					}
				)

				scope.$watch(
					function(){
						return icLanguageConfig.currentLanguage
					},
					function(){
						scope.language = icLanguageConfig.currentLanguage
					}
				)

			}
		}
	}
])



.directive('icInfoTag', [

	function(){

		return {
			restrict:		'AE',
			templateUrl:	'partials/ic-info-tag.html',
			scope:			{
								icTitle:		"<",
								icContent:		"<",
								icExtraLines:	"<",
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
			templateUrl:	'partials/ic-language-menu.html',
			scope:			{},

			link: function(scope, element){				
				scope.icLanguageConfig = icLanguageConfig
			}
		}
	}

])


.directive('icMainMenu', [

	'icConfigData',
	'icSite',
	'icFilterConfig',
	'icOverlays',
	'icUser',
	'icApi', //Todo not nice

	function(icConfigData, icSite, icFilterConfig, icOverlays, icUser, icApi){
		return {
			restrict:		'AE',
			templateUrl:	'partials/ic-main-menu.html',
			scope:			{},

			link: function(scope, element){				
				scope.icConfigData 		= icConfigData
				scope.icSite 			= icSite
				scope.icFilterConfig 	= icFilterConfig
				scope.icOverlays		= icOverlays
				scope.icUser			= icUser

				scope.expand = {}

				scope.logout = icApi.logout
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
	return 	function(str, pre, color){
			var p = pre		||	'type',
				c = color 	|| 'black'


			switch(str){
				case 'information': return "/images/icon_"+p+"_information_"+c+".svg"; 	break;
				case 'events':		return "/images/icon_"+p+"_events_"+c+".svg";		break;
				case 'places':		return "/images/icon_"+p+"_places_"+c+".svg";		break;
				case 'services':	return "/images/icon_"+p+"_services_"+c+".svg";		break;

				case 'city':		return "/images/icon_"+p+"_city_"+c+".svg";			break;
				case 'education':	return "/images/icon_"+p+"_education_"+c+".svg";	break;
				case 'social':		return "/images/icon_"+p+"_social_"+c+".svg";		break;
				case 'health':		return "/images/icon_"+p+"_health_"+c+".svg";		break;
				case 'leisure':		return "/images/icon_"+p+"_leisure_"+c+".svg";		break;
				case 'work':		return "/images/icon_"+p+"_work_"+c+".svg";			break;
				case 'support':		return "/images/icon_"+p+"_support_"+c+".svg";		break;
				case 'law':			return "/images/icon_"+p+"_law_"+c+".svg";			break;
				case 'culture':		return "/images/icon_"+p+"_culture_"+c+".svg";		break;

				case 'email':		return "/images/icon_"+p+"_email_"+c+".svg";		break;
				case 'address':		return "/images/icon_"+p+"_place_"+c+".svg";		break;
				case 'phone':		return "/images/icon_"+p+"_phone_"+c+".svg";		break;
				case 'time':		return "/images/icon_"+p+"_time_"+c+".svg";			break;				
				case 'website':		return "/images/icon_"+p+"_link_"+c+".svg";			break;				
				// default:			return "/images/icon_nav_close.svg";				break;
				default:			return "/images/icon_topic_information_white.svg";	console.warn('icIcon: missing icon displayed as info!'); break;
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
			templateUrl:	'partials/ic-tile.html',

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



.directive('icFilterInterface', [

	'icFilterConfig',
	'icConfigData',

	function(icFilterConfig, icConfigData){
		return {
			restrict: 		'AE',
			templateUrl:	'partials/ic-filter-interface.html',
			scope:			{
								expandFilter:	'<'
							},

			link: function(scope, element,attrs){
				scope.open 				= false
				scope.icFilterConfig 	= icFilterConfig
				scope.icConfigData 		= icConfigData
				scope.expand			= {}


				if(scope.expandFilter){
					scope.open 					= 'filter'
					scope.expand.topics 		= true
					scope.expand.targetGroups 	= true
				}

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
	'icSearchResults',

	function(icFilterConfig, icConfigData, icSearchResults){
		return {
			restrict: 		'AE',
			templateUrl:	'partials/ic-quick-filter.html',
			scope:			{},

			link: function(scope, element,attrs){
				scope.icFilterConfig 	= icFilterConfig
				scope.icConfigData 		= icConfigData

				scope.$watch(
					function(){
						return icSearchResults.meta
					},

					function(meta){
						scope.meta = meta
					}
				)
			}
		}
	}
])




.filter('prepend',[
	function(){
		return function(str, pre){
			return pre+str
		}
	}
])

.filter('append',[
	function(){
		return function(str, suf){
			return str+suf
		}
	}
])





// .directive('icTriplet', [

// 	'$timeout',
// 	'$compile',
// 	'icSite',
// 	'icSearchResults',

// 	function($timeout, $compile, icSite, icSearchResults){
// 		return {
// 			restrict:	"AE",
// 			scope:		{
// 							icId:	"<"
// 						},
// 			template:	'<div class ="shuttle">'+
// 						'</div>',	

// 			link: function(scope, element, attrs, ctrl){

// 				var previous_item, current_item, next_item,
// 					width,
// 					shuttle = element.find('div').eq(0)



// 				previous_item		= $compile('<ic-full-item ic-id = "previousId">	</ic-full-item>')(scope)
// 				current_item 		= $compile('<ic-full-item ic-id = "currentId">	</ic-full-item>')(scope)
// 				next_item 			= $compile('<ic-full-item ic-id = "nextId">		</ic-full-item>')(scope)

// 				scope.$watch('icId', function(id){
// 					scope.previousId	= icSearchResults.getPreviousId(id)
// 					scope.currentId 	= id
// 					scope.nextId		= icSearchResults.getNextId(id)
// 				})

// 				scope.$watch(
// 					function(){ return icSearchResults.filteredList.length},
// 					function(){
// 						scope.previousId	= icSearchResults.getPreviousId(scope.currentId)
// 						scope.nextId		= icSearchResults.getNextId(scope.currentId)
// 					}
// 				)


// 				element.css({
// 					display:			'block'
// 				})

// 				width = element[0].clientWidth

// 				element.css({
// 					width:				width+'px',
// 					overflowX:			'scroll'
// 				})

// 				shuttle.css({
// 					display:			'inline-block',
// 					whiteSpace:			'nowrap',
// 					transition:			'transform 0 ease-in',
// 					'will-change':		'scroll-position transform', 
// 				})

// 				element.append(shuttle)

// 				shuttle
// 				.append(previous_item)
// 				.append(current_item)
// 				.append(next_item)

// 				shuttle.children()
// 				.css({
// 					display:			'inline-block',
// 					width:				width+'px',
// 					verticalAlign:		'top',
// 					whiteSpace:			'normal'
// 				})	
				

// 				var scroll_stop 		= undefined,
// 					ignore_next_scroll 	= true,
// 					slide_off			= false

// 				element[0].scrollLeft 	= width



// 				function swap(){

// 					ignore_next_scroll = true

// 					shuttle.css({
// 						'transform':			'translateX(0px)',
// 						'transition-duration':	'0ms'
// 					})	


// 					if(scope.snapTo == 'next'){
// 						scope.previousId		= scope.currentId
// 						scope.currentId			= scope.nextId
// 						scope.nextId			= icSearchResults.getNextId(scope.nextId)
// 					}

// 					if(scope.snapTo == 'previous'){
// 						scope.nextId			= scope.currentId
// 						scope.currentId			= scope.previousId
// 						scope.previousId		= icSearchResults.getPreviousId(scope.previousId)
// 					}
					
// 					ignore_next_scroll		= true
// 					element[0].scrollLeft 	= width

// 					if(scope.snapTo != 'current'){
// 						scope.$digest()
// 						$timeout(function(){ 
// 							icSite.addItemToPath(scope.currentId) 
// 							slide_off = false
// 						} , 30, false)
// 					}

// 				}

// 				function snap() {	


// 					var scroll_left 	= element[0].scrollLeft,
// 						scroll_width	= shuttle[0].scrollWidth
						
// 					scope.snapTo = 'current'



// 					if(scroll_left < 0.4*scroll_width/3) scope.snapTo = scope.previousId 	? 'previous' 	: 'current'
// 					if(scroll_left > 1.6*scroll_width/3) scope.snapTo = scope.nextId		? 'next'		: 'current'

// 					var scroll_to 	= 	{
// 											previous:	0,
// 											current:	width,
// 											next:		2*width
// 										}[scope.snapTo],		

// 						distance 	= 	scroll_left - scroll_to,
// 						duration	=	Math.abs(distance/width) * 400


// 					shuttle.css({
// 						'transform':			'translateX('+distance+'px)',
// 						'transition-duration':	duration+'ms'
// 					})


// 					$timeout(swap, duration, false)
// 				}



// 				element.on('scroll', function(e){
// 					e.stopPropagation()
					
// 					console.log('scroll')

// 					if(ignore_next_scroll){ ignore_next_scroll = false; return null }

// 					if(scroll_stop) $timeout.cancel(scroll_stop)

// 					if(slide_off) return null

// 					scroll_stop = 	$timeout(snap, 100, false)
// 				})

// 			}
// 		}
// 	}
// ])






.directive('icTextLogo', [

	function(){
		return {
			restrict: 'E',
			template: "<span>Info</span><span>Compass</span>"
		}
	}
])










.directive('icSearch',[

	'icConfigData',
	'icFilterConfig',

	function(icConfigData, icFilterConfig){
		return {
			restrict: 		'E',
			templateUrl:	'partials/ic-search.html',
			scope:			{
								icOnSubmit: 	'&',
								icOnUpdate: 	'&'
							},

			link: function(scope, element, attrs){

				
				//scope.icTitles 			= icConfigData.titles
				scope.icFilterConfig	= icFilterConfig
				scope.searchTerm		= ''

				scope.update = function(){
					var input = element[0].querySelector('#search-term')
					
					input.focus()
					input.blur()

					if(scope.icOnSubmit) scope.icOnSubmit()

					if(scope.searchTerm){
						icFilterConfig.searchTerm = scope.searchTerm
						if(scope.icOnUpdate){
							scope.icOnUpdate()
						}
					}

					scope.searchTerm = undefined
				}

				scope.setSearchTerm = function(str){
					var input = element[0].querySelector('#search-term')

					scope.searchTerm = str
					window.requestAnimationFrame(function(){
						input.focus()
					})
				}
			}
		}
	}
])























.directive('icHorizontalSwipeListX', [

	'$timeout',
	'$compile',
	'icSite',
	'icSearchResults',

	function($timeout, $compile, icSite, icSearchResults){
		return {
			restrict:	"AE",
			scope:		{
							icModelAs:	"@",
							icPrevious:	"&",
							icCurrent:	"<",
							icNext:		"&",
							icOnTurn:	"&"
						},
			priority:	0,
			transclude:	true,
			template:	'<button ng-if = "previousModel" ng-click = "previous()" class ="left"></button>'+
						'<div class ="wrapper">'+
						'	<div class ="shuttle"></div>'+
						'</div>'+
						'<button ng-if = "nextModel" ng-click = "next()" class ="right"></button>',	

			link: function(scope, element, attrs, ctrl, transclude){

				var width,
					wrapper = element.find('div').eq(0),
					shuttle = wrapper.find('div').eq(0)



				var previous_scope	= scope.$parent.$new(),
					current_scope 	= scope.$parent.$new(),
					next_scope		= scope.$parent.$new()
					
				scope.previousModel	= undefined
				scope.currentModel	= undefined
				scope.nextModel		= undefined



				function updateScopes(newCurrentModel, digest){
					current_scope[scope.icModelAs]	= scope.currentModel		= newCurrentModel
					previous_scope[scope.icModelAs]	= scope.previousModel		= scope.icPrevious({'icModel': newCurrentModel})
					next_scope[scope.icModelAs]		= scope.nextModel			= scope.icNext({'icModel': newCurrentModel})




					if(digest){
						current_scope.$digest()
						previous_scope.$digest()
						next_scope.$digest()

						var items = shuttle.children()

						items[0].scrollTop = items[1].scrollTop = items[2].scrollTop = 0
						items[1].focus()

					}

				}

				scope.$watch('icCurrent', function(id){ updateScopes(id) })

				scope.$watch(
					function(){ return icSearchResults.filteredList.length} ,
					function(){ updateScopes(scope.icCurrent) }
				)


				element.css({
					display:			'inline-block',
					height:				'100%'
				})

				wrapper.css({
					display:			'inline-block',
					height:				'100%'

				})

				// width 	= element[0].clientWidth

				wrapper.css({
					overflowX:			'scroll',
					overflowY:			'hidden'
				})

				shuttle.css({
					display:			'inline-block',
					height:				'100%',					
					whiteSpace:			'nowrap',
					transition:			'transform 0 ease-in',
					'will-change':		'scroll-position transform', 
					overflow:			'hidden',
				})

				

				transclude(previous_scope, function(clone, scope){
					shuttle.append(clone)
				})

				transclude(current_scope, function(clone, scope){
					shuttle.append(clone)
				})

				transclude(next_scope, function(clone, scope){
					shuttle.append(clone)
				})


				shuttle.children()
				.css({
					display:			'inline-block',
					verticalAlign:		'top',
					whiteSpace:			'normal',
					transitionProperty: 'transform'
				})	

				//remove text nodes:
				
				var nodes 		= shuttle[0].childNodes,
					text_nodes 	= []

				for (var i = 0; i < nodes.length; i++) {
						if(nodes[i].nodeType == 3) text_nodes.push(nodes[i])
				} 

				text_nodes.forEach(function(node){
					shuttle[0].removeChild(node)
				})


				//handle Resize:
				function handleResize(){
					window.requestAnimationFrame(function(){
						width = shuttle.children()[0].offsetWidth
						wrapper.css({width: width+'px'})				
						wrapper[0].scrollLeft = width	
					})
				}
				
				handleResize()

				angular.element(window).on('resize', handleResize)
				
				scope.$on('$destroy', function(){
					angular.element(window).off('resize', handleResize)
				})





				var scroll_stop 		= undefined,
					ignore_next_scroll 	= true,
					slide_off			= false




				function swap(){


					ignore_next_scroll = true

					shuttle.css({
						'transform':			'translateX(0px)',
						'transition-duration':	'0ms'
					})	


					if(scope.snapTo == 'next'){
						updateScopes(scope.nextModel, true)
					}

					if(scope.snapTo == 'previous'){
						updateScopes(scope.previousModel, true)
					}
					

					ignore_next_scroll		= true
					wrapper[0].scrollLeft 	= width

					if(scope.snapTo != 'current'){
						$timeout(function(){ 
							scope.icOnTurn({icModel: scope.currentModel})
							slide_off = false
						} , 30, false)
					}

				}

				function snap() {	

					// console.log(snap)


					var scroll_left 	= wrapper[0].scrollLeft,
						scroll_width	= shuttle[0].scrollWidth
						
					scope.snapTo = 'current'



					if(scroll_left < 0.4*scroll_width/3) scope.snapTo = scope.previousModel 	? 'previous' 	: 'current'
					if(scroll_left > 1.6*scroll_width/3) scope.snapTo = scope.nextModel			? 'next'		: 'current'

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

					shuttle.children().css({
						transform:				'translateX(0px)',
						'transition-duration':	duration+'ms'
					})


					$timeout(swap, duration, false)
				}


				scope.previous = function(){
					scope.snapTo = 'previous'
					$timeout(swap, 0, false)
				}

				scope.next = function(){
					scope.snapTo = 'next'
					$timeout(swap, 0, false)
				}

				wrapper.on('scroll', function(e){
					e.stopPropagation()

					//console.log('scroll')
					
					if(ignore_next_scroll){ ignore_next_scroll = false; return null }

					window.requestAnimationFrame(function(){
						var left = wrapper[0].scrollLeft


						shuttle.children().eq(0)
						.css({
							transform:				'translateX('+(left < width ? left/2 : 0)+'px)',
							'transition-duration':	'0ms'
						})

						shuttle.children().eq(1)
						.css({
							transform:				'translateX('+(left > width ? (left-width)/2 : 0)+'px)',
							'transition-duration':	'0ms'
						})

					})

					if(scroll_stop) $timeout.cancel(scroll_stop)

					if(slide_off) return null

					scroll_stop = 	$timeout(snap, 100, false)
				})

			}
		}
	}
])








.directive('icHorizontalSwipeList', [

	'$timeout',
	'$compile',
	'icSite',
	'icSearchResults',

	function($timeout, $compile, icSite, icSearchResults){
		return {
			restrict:	"AE",
			scope:		{
							icModelAs:	"@",
							icPrevious:	"&",
							icCurrent:	"<",
							icNext:		"&",
							icOnTurn:	"&"
						},
			priority:	0,
			transclude:	true,
			template:	'<button ng-if = "previousModel" ng-click = "previous()" class ="left"></button>'+
						'<div class ="wrapper">'+
						'	<div class ="shuttle"></div>'+
						'</div>'+
						'<button ng-if = "nextModel" ng-click = "next()" class ="right"></button>',	

			link: function(scope, element, attrs, ctrl, transclude){

				var width,
					wrapper = element.find('div').eq(0),
					shuttle = wrapper.find('div').eq(0)



				var previous_scope	= scope.$parent.$new(),
					current_scope 	= scope.$parent.$new(),
					next_scope		= scope.$parent.$new()
					
				scope.previousModel	= undefined
				scope.currentModel	= undefined
				scope.nextModel		= undefined



				function updateScopes(newCurrentModel, digest){
					current_scope[scope.icModelAs]	= scope.currentModel		= newCurrentModel
					previous_scope[scope.icModelAs]	= scope.previousModel		= scope.icPrevious({'icModel': newCurrentModel})
					next_scope[scope.icModelAs]		= scope.nextModel			= scope.icNext({'icModel': newCurrentModel})




					if(digest){
						current_scope.$digest()
						previous_scope.$digest()
						next_scope.$digest()

						var items = shuttle.children()

						items[0].scrollTop = items[1].scrollTop = items[2].scrollTop = 0
						items[1].focus()

					}

				}

				scope.$watch('icCurrent', function(id){ updateScopes(id) })

				scope.$watch(
					function(){ return icSearchResults.filteredList.length} ,
					function(){ updateScopes(scope.icCurrent) }
				)


				element.css({
					display:			'inline-block',
					height:				'100%'
				})

				wrapper.css({
					display:			'inline-block',
					height:				'100%',
					//willChange:			'scroll-position',
					overflowX:			'scroll',
					overflowY:			'hidden'
				})

				shuttle.css({
					display:			'inline-block',
					height:				'100%',					
					whiteSpace:			'nowrap',
					transition:			'transform 0 ease-in',
					overflow:			'hidden',
				})

				

				transclude(previous_scope, function(clone, scope){
					shuttle.append(clone)
				})

				transclude(current_scope, function(clone, scope){
					shuttle.append(clone)
				})

				transclude(next_scope, function(clone, scope){
					shuttle.append(clone)
				})


				shuttle.children()
				.css({
					display:			'inline-block',
					verticalAlign:		'top',
					whiteSpace:			'normal'
				})	

				//remove text nodes:
				
				var nodes 		= shuttle[0].childNodes,
					text_nodes 	= []

				for (var i = 0; i < nodes.length; i++) {
						if(nodes[i].nodeType == 3) text_nodes.push(nodes[i])
				} 

				text_nodes.forEach(function(node){
					shuttle[0].removeChild(node)
				})


				//handle Resize:
				function handleResize(){
					window.requestAnimationFrame(function(){
						width = shuttle.children()[0].offsetWidth
						wrapper.css({width: width+'px'})				
						wrapper[0].scrollLeft = width	
					})
				}
				
				handleResize()

				angular.element(window).on('resize', handleResize)
				
				scope.$on('$destroy', function(){
					angular.element(window).off('resize', handleResize)
				})





				var scroll_stop 		= undefined,
					ignore_next_scroll 	= true,
					slide_off			= false



				function swap(){


					shuttle.css({
						'transform':			'translateX(0px)',
						'transition-duration':	'0ms'
					})	


					if(scope.snapTo == 'next'){
						updateScopes(scope.nextModel, true)
					}

					if(scope.snapTo == 'previous'){
						updateScopes(scope.previousModel, true)
					}
					

					ignore_next_scroll		= true
					wrapper[0].scrollLeft 	= width

					if(scope.snapTo != 'current'){
						$timeout(function(){ 
							scope.icOnTurn({icModel: scope.currentModel})
							slide_off = false
						} , 30, false)
					}

				}

				function snap() {	

					// console.log(snap)


					var scroll_left 	= wrapper[0].scrollLeft
						
					scope.snapTo = 'current'



					if(scroll_left < previous_boundry) scope.snapTo = scope.previousModel 	? 'previous' 	: 'current'
					if(scroll_left > 1.6*scroll_width/3) scope.snapTo = scope.nextModel			? 'next'		: 'current'

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

					shuttle.children().css({
						transform:				'translateX(0px)',
						'transition-duration':	duration+'ms'
					})


					$timeout(swap, duration, false)
				}


				scope.previous = function(){
					scope.snapTo = 'previous'
					$timeout(swap, 0, false)
				}

				scope.next = function(){
					scope.snapTo = 'next'
					$timeout(swap, 0, false)
				}



				var last_scroll_left 	= undefined,
					scroll_left			= undefined,
					scroll_width		= undefined,
					count				= 0,
					watch				= false



				function watchScroll(){
					if(!watch) count = 0

					scroll_left 	= wrapper[0].scrollLeft
					scroll_width	= shuttle[0].scrollWidth

					if(scroll_left != last_scroll_left){
						shuttle.children().eq(0)
						.css({
							transform:				'translateX('+(scroll_left < width ? Math.floor(scroll_left/2) : 0)+'px)',
						})

						shuttle.children().eq(1)
						.css({
							transform:				'translateX('+(scroll_left > width ? Math.floor((scroll_left-width)/2) : 0) +'px)',
						})
					}

					count = 	scroll_left == last_scroll_left 
								?	count + 1 
								:	0
					
					if(count > 5){
						//console.log(scroll_left, width)
						if(scroll_left < 0.4*width) 	wrapper[0].scrollLeft -= width/50
						if(scroll_left > 1.6*width) 	wrapper[0].scrollLeft += width/50

						if(scroll_left >= 0.4*width && scroll_left <= 1.6*width && scroll_left != width){
							wrapper[0].scrollLeft	= 	scroll_left > width
													?	Math.min(width, wrapper[0].scrollLeft-width/50)
													:	Math.max(width, wrapper[0].scrollLeft+width/50)
						}
					}

					if(count < 10 ){						
						watch = true
						window.requestAnimationFrame(watchScroll)
					} else {
						watch = false
					}

					last_scroll_left = scroll_left
				}

				wrapper.on('scroll', function(e){
					e.stopPropagation()

					if(slide_off) 	return null
					if(watch) 		return null
					if(ignore_next_scroll){ ignore_next_scroll = false; return null }
					
					watchScroll()

					// console.log('scroll')
					

					

					// if(scroll_stop) $timeout.cancel(scroll_stop)

					// if(slide_off) return null

					// scroll_stop = 	$timeout(snap, 100, false)
				})

			}
		}
	}
])




.directive('icSearchTerm', [

	'icFilterConfig',
	'icSearchResults',

	function(icFilterConfig, icSearchResults){
		return {
			restrict:		'AE',
			templateUrl:	'partials/ic-search-term.html',

			link: function(scope){
				scope.icFilterConfig 	= icFilterConfig
				scope.icSearchResults 	= icSearchResults
			}
		}
	}
])















.directive('icOverlays', [

	'icOverlays',

	function(icOverlays){

		return {

			restrict:	"AE",
			templateUrl:"partials/ic-overlays.html",
			scope:		true,

			link: function(scope, element, attrs, ctrl, transclude){
				icOverlays.registerScope(scope)
				scope.icOverlays = icOverlays


				element.on('click', function(e){
					e.stopPropagation()
					if(element[0] == e.target){
						icOverlays.toggle(null)
						scope.$digest()
					}
				})

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

				function toggle(e){
					// e.preventDefault()
					e.stopPropagation()
					icOverlays.toggle(attrs.icToggleOverlay)
					icOverlays.$digest()					
				}

				element.on('click', toggle)
				scope.$on('$destroy', function(){ element.off('click', toggle) })
			}
		}
	}
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



.directive('icItemEdit', [

	'icItemEdits',
	'icLanguageConfig',

	function(icItemEdits, icLanguageConfig){
		return {
			restrict:		'AE',
			scope:			{
								icLabel:				"@",
								icKey:					"@",
								icTitle: 				"<",
								icItem:					"=",
								icType:					"@",
								icOptions:				"<",
								icOptionLabel:			"&",
								icAllowLocalEdit:		"<",
							},

			templateUrl: 	"partials/ic-item-edit-item-property.html",

			link: function(scope, element, attrs){

				var itemEdit = icItemEdits.open(scope.icItem.id)

				scope.icTranslatable 	= 	'icTranslatable' in attrs && scope.$eval(attrs.icTranslatable) !== false
				scope.icLanguageConfig	= 	icLanguageConfig
				scope.value				=	{}
				scope.expand			=	undefined


				scope.update = function(){

					itemEdit
					.update(scope.icKey, scope.icTranslatable ? icLanguageConfig.currentLanguage : undefined)
					.then(function(item_data){
						console.log(scope.icKey, scope.icTranslatable, icLanguageConfig.currentLanguage)
						console.log(item_data)
						scope.icItem.importData(item_data)
						refreshValues()
					})
				}

				scope.revert = function(){
					scope.value.new = angular.copy(scope.value.current)
				}

				scope.diff = function(){
					if(!scope.value.new) 		return !!scope.value.current
					if(!scope.value.current) 	return !!scope.value.new

					switch(scope.icType){
						case "string": 	return scope.value.new != scope.value.current; break;
						case "text": 	return scope.value.new != scope.value.current; break;
						case "array": 	return scope.value.new.length != scope.value.current.length || scope.value.new.some(function(option){ return scope.value.current.indexOf(option) == -1 })
					}
				}

				scope.toggleOption = function(option){
					var pos = scope.value.new.indexOf(option)

					return	pos != -1
							?	scope.value.new.splice(pos,1)
							:	scope.value.new.push(option)

				}






				function refreshValues(){
					itemEdit = icItemEdits.open(scope.icItem.id)

					scope.value.new			= 	angular.copy(
													scope.icTranslatable
													?	itemEdit[scope.icKey][icLanguageConfig.currentLanguage] 
													:	itemEdit[scope.icKey]
												)


					scope.value.current		= 	angular.copy(
													scope.icTranslatable
													?	scope.icItem[scope.icKey][icLanguageConfig.currentLanguage] 
													:	scope.icItem[scope.icKey]
												)

					if(!scope.value.new || scope.value.new.length == 0) scope.value.new = angular.copy(scope.value.current)

					scope.expand = (scope.expand === undefined ? scope.value.new || undefined : scope.expand)
				}

				scope.$watch(function(){ return icLanguageConfig.currentLanguage }, refreshValues)

				scope.$watch('icItem[icKey]', refreshValues, true)

				scope.$watch('value.new', function(){
					if(scope.icTranslatable){
						itemEdit[scope.icKey][icLanguageConfig.currentLanguage] = scope.value.new
					} else {
						itemEdit[scope.icKey] = scope.value.new
					}
				})
			}
		}
	}
])


.filter('icItemLink',[
	function(){
		return function(id){
			return location.origin+'/#/item/'+id
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


.filter('icHours', function(){

	var cache = {}

	return function(hours){
		cache[hours.toString()] = cache[hours.toString()] || []
		while(cache[hours.toString()].length) cache[hours.toString()].pop()

		hours.forEach(function(obj){
			cache[hours.toString()].push( obj.days + (obj.hours ? ': ' + obj.hours : '') )
		})

		return cache[hours.toString()]
	}
})

.filter('trim',[

	function(){
		return function(str){
			return str.replace(/^\s+|\s+$/g,'')
		}
	}
])



//TODO: remove this
.directive('fakeScrollBump', [

	'icSearchResults',

	function(icSearchResults){
		return {
			restrict:	'A',

			link: function(scope, element, attrs){

				function trigger(){
					requestAnimationFrame(function(){

						if(icSearchResults.listLoading()) 	return null
						if(icSearchResults.noMoreItems) 	return null

						if(element[0].scrollTop + 2*element[0].clientHeight <= element[0].scrollHeight) return null
						icSearchResults
						.download()
						.then(function(){
							trigger()
						})

					})
				}

				element.on('scroll', trigger)
			}
		}
	}
])




.directive('icAutoGrow', [

	function(){
		return {
			restrict:	"A",
			require:	"ngModel",

			link: function(scope, element, attrs){

				function resize(){
					window.requestAnimationFrame(function(){
						element.css('height', 'auto')
						element.css('height', element[0].scrollHeight + 'px')
					})
				}

				element.on('blur keyup keydown change',resize)
				scope.$watch(attrs.ngModel, resize)
			}
		}
	}

])


.directive('icLogin',[

	'icApi',

	function(icApi){
		return {
			restrict:		'E',
			templateUrl:	'partials/ic-login.html',
			transclude:		true,
			scope:			{
								icOnSuccess:	'&',
								icOnFailure:	'&',
							},

			link: function(scope, element){
				scope.username = ''
				scope.password = ''

				scope.login = function(){
					icApi.login(scope.username, scope.password)
					.then(
						function(){
							console.log('done')
							scope.username = ''
							scope.password = ''
							scope.icOnSuccess()
						},
						function(){
							console.log('failed')
							scope.icOnFailure()
						}
					)
				}
			}
		}
	}
])