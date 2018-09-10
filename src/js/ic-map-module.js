"use strict";


(function(){

	function hasValidGeoCoordinates(item){
		return 		item.latitude
				&&	item.longitude
				&&	typeof item.latitude 		== 'number'
				&&	typeof item.longitude		== 'number'
				&&  Math.abs(item.latitude) 	<= 90
				&&  Math.abs(item.longitude)	<= 180
	}


	angular.module('icMap', [
		'icServices'
	])


	.service('icMapMarkerDigestQueue',[

		function(){

			var queuePromise 	= Promise.resolve(),
				chunk_size		= 5,
				points			= chunk_size,
				length			= 0,
				c_resolve
			
			var Queue = {}

			Queue.currentRun = new Promise(renewResolve)

			function resetPoints(){
				 points = chunk_size
			} 

			function renewResolve(resolve){
				c_resolve = resolve
			}

			function advance(scope, weight){
				scope.$digest()
				length--
				points -= weight

				if(points <= 0) return 	new Promise(window.requestAnimationFrame)
										.then(resetPoints)
			}

			function finalize(){
				c_resolve()
				Queue.currentRun = new Promise(renewResolve)
			}

			function checkForChunkEnd(){
				if(length > 0) return null

				return 	new Promise(window.requestAnimationFrame)
						.then(finalize)
			}


			Queue.isRunning = function(){ return length != 0}

			Queue.add = function(scope, weight){
				if(length == 0) queuePromise = new Promise(window.requestAnimationFrame)

				length++
				if(weight == undefined) weight = 1

				queuePromise = 	queuePromise
								.then(advance.bind(null, scope, weight))
								.then(checkForChunkEnd)

				return Queue.currentRun
			}

			return Queue
		}

	])


	.service('icMapItemMarker',[

		'$compile',
		'icMapMarkerDigestQueue',

		function($compile, icMapMarkerDigestQueue){

			var icMapItemMarker = function(item, parentScope){

				var scope 	=  	parentScope.$new()

				scope.item 	= 	item
				
				var element = 	$compile('<ic-map-item-marker ic-item = "item"></ic-map-item-marker')(scope)
					//shadow	=	angular.element('<div class = "ic-map-marker-shadow"></div>')

				icMapMarkerDigestQueue.add(scope)

				this.createIcon = function(){
					return element[0]
				}

				this.createShadow = function(){
					return null // shadow[0]
				}


			}

			return icMapItemMarker
		}
	])



	.directive('icMapItemMarker',[

		'$templateCache',
		'ic',

		function($templateCache, ic){
			return {
				restrict:		'AE',
				//templateUrl:	'partials/ic-map-marker-item.html',
				//not using templateUrl, because it triggers a $digest
				template:		$templateCache.get('partials/ic-map-marker-item.html'),
				scope:			{
									icItem:		"<",
									icTitle: 	"<",
									icDetails:	"<",
									icAction:	"&?"
								},

				link: function(scope, element){
					scope.ic = ic
				}

			}
		}

	])


	.service('icMapClusterMarker',[

		'$compile',
		'icMapMarkerDigestQueue',

		function($compile, icMapMarkerDigestQueue){


			function icClusterMarker(cluster, parentScope){

				if(cluster._marker) return cluster._marker


				var scope 	=  	parentScope.$new(),
					element =	$compile('<ic-map-cluster-marker ic-cluster = "cluster"></ic-map-cluster-marker>')(scope)

				icMapMarkerDigestQueue.add(scope, cluster._childCount)

				scope.cluster 			=	cluster
				cluster.scope 			= 	scope
				cluster._marker 		= 	this
				element[0].scope		= 	scope
				
				this.createIcon = function(){
					return cluster._icon || element[0]
				}

				this.createShadow = function(){
					return null //shadow[0]
				}

			}

			return icClusterMarker
		}
	])

	.directive('icMapClusterMarker',[

		'$templateCache',
		'icSite',
		'ic',

		function($templateCache, icSite, ic){
			return {
				restrict:		'AE',
				//templateUrl:	'partials/ic-map-marker-cluster.html',
				//not using templateUrl, because it triggers a $digest
				template:		$templateCache.get('partials/ic-map-marker-cluster.html'),
				scope:			{
									icCluster:	"<"
								},

				link: function(scope){

					scope.ic = ic

					scope.$watchCollection('icCluster', function(){

						scope.items = 	scope.icCluster.getAllChildMarkers()
										.map(function(marker){
											return marker.options.item
										})

						scope.isActive = function(item){
							return 	item == icSite.activeItem
									?	0
									:	1
						}
					})
				}

			}
		}

	])


	.service('icMapSpinnerControl', [

		'$compile',

		function($compile){

			if(!window.L) console.error('icMapSpinnerControl: missing Leaflet!')

			var element = undefined

			L.icMapSpinnerControl = L.Control.extend({

				onAdd: function(map) {
					return element && element[0]
				},

				onRemove: function(map) {

				}
			})

			this.setScope = function(scope){
				this.scope = scope
				element = 	$compile('<ic-spinner active = "loading"></ic-spinner>')(scope)
			}
		}
	])


	.service('icMapExpandControl', [

		'$compile',

		function($compile){

			if(!window.L){ console.error('icMapExpandControl: missing Leaflet!'); return null}

			var element = undefined


			L.Control.IcMapExpand = L.Control.extend({
				onAdd: function(map) {
					return element && element[0]
				},

				onRemove: function(map) {
				}
			})

			this.setScope = function(scope){
				element = 	$compile('<ic-map-expand-control></ic-map-expand-control>')(scope)
			}
		}
	])

	.directive('icMapExpandControl',[

		function(){
			return {
				restrict : 		'E',
				scope:			true,
				templateUrl: 	'partials/ic-map-expand-control.html',

				link: function(scope){
				}
			}
		}
	])


	.service('icMapSwitchControl', [

		'$compile',

		function($compile){

			L.Control.icMapSwitchControl = L.Control.extend({
				onAdd: function(map) {
					this._container = this._container || $compile('<ic-map-switch-control ic-item = "'+this.options.key+'"></ic-map-switch-control>')(this.options.scope)[0]
					return this._container
				},

				onRemove: function(map) {
				}
			})
		}
	])

	.directive('icMapSwitchControl',[

		'icSite',
		'icMainMap',
		'ic',

		function(icSite, icMainMap, ic){
			return {
				restrict : 		'E',
				scope:			{
									icItem:	'<',
								},

				templateUrl: 	'partials/ic-map-switch-control.html',

				link: function(scope){

					scope.ic = ic

					scope.focusItem = function(){
						if(!hasValidGeoCoordinates(scope.icItem)){
							console.warn('icMiniMap: focusItemOnMap: missing coordinates.')
							return null
						}

						icSite.expandMap = true 

						icMainMap.ready
						.then(function(map){
							map.setView([scope.icItem.latitude, scope.icItem.longitude], icMainMap.defaults.maxZoom)	
						})

					}
				}
			}
		}
	])


	.provider('icMainMap', [

		function(){

			var defaults	= 	{
									center:				[52.600, 13.350],
									zoom:				13,
									minZoom:			11,
									maxZoom:			18,
									maxBounds:			[
															[52.80, 13.80], 
															[52.20, 13.00]
														],
									maxClusterRadius: 	40,
									tiles:				undefined
								}

			this.setDefaults = function(config){

				defaults = angular.extend({}, defaults, config)

				return this
			}

			this.$get =	[

				'$q',

				function($q){

					var mapReady = $q.defer(),
						icMainMap = {
										ready:		mapReady.promise,
										defaults:	defaults,
										mapObject: 	undefined
									}

					icMainMap.setMapObject = function(obj){
						if(icMainMap.mapObject) console.warn('icMainMap: mapObject already set!')
						icMainMap.mapObject = obj
						mapReady.resolve(icMainMap.mapObject)
					}

					icMainMap.clearMapObject = function(){
						mapReady.reject('map object cleared')
						mapReady = $q.defer()
						icMainMap.mapObject = undefined
						icMainMap.ready	= mapReady.promise
					}

					return icMainMap
				}
			]
		}
	])

	.directive('icMap',[

		'$rootScope',
		'$timeout',
		'icSite',
		'icItemStorage',
		'icUtils',
		'icMainMap',
		'icMapItemMarker',
		'icMapClusterMarker',
		'icMapExpandControl',
		'icMapSpinnerControl',
		'icMapMarkerDigestQueue',

		function($rootScope, $timeout, icSite, icItemStorage, icUtils, icMainMap, icMapItemMarker, icMapClusterMarker, icMapExpandControl, icMapSpinnerControl, icMapMarkerDigestQueue){
			return {
				restrict: 'AE',

				link: function(scope, element, attrs){

					if(!window.L) console.error('icMap: missing Leaflet!')

					scope.loading = 1

					icMainMap.ready.then(function(){ scope.loading-- })

					var markers = 	L.markerClusterGroup({
										maxClusterRadius: 			icMainMap.defaults.maxClusterRadius,
										spiderfyOnMaxZoom:			true,
										chunkedLoading:				true,
										zoomToBoundsOnClick:		false,
										animate:					false,
										iconCreateFunction: function(cluster) {										
											return 	new icMapClusterMarker(cluster, scope)
										}
									} ),
						map 	= 	L.map(element[0], {
										center: 		icMainMap.defaults.center,
										zoom: 			icMainMap.defaults.zoom,
										minZoom:		icMainMap.defaults.minZoom,
										maxZoom:		icMainMap.defaults.maxZoom,
										zoomControl: 	false,
										trackSize:		false,
										maxBounds:		icMainMap.defaults.maxBounds
									})


					//map.on('zoomend', function(){ scope.$digest()})

					icMainMap.setMapObject(map)


					new L.Control.Zoom({
						position: 	'topright' 	
					}).addTo(map)

					icMapExpandControl.setScope(scope)

					new L.Control.IcMapExpand({ 
						position: 	'topleft',
					}).addTo(map)


					icMapSpinnerControl.setScope(scope)

					new L.icMapSpinnerControl({
						position:	'bottomleft'
					}).addTo(map)



					L.tileLayer(
						icMainMap.defaults.tiles, 					
						{
							attribution: '&copy; <a href ="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
						}
					).addTo(map)

					map.addLayer(markers)

					var width 					= undefined,
						height					= undefined

					function adjustSize(delay){

						if(width !== element[0].clientWidth || height !== element[0].clientHeight){
							map.invalidateSize(false)
							width 	= element[0].clientWidth
							height 	= element[0].clientHeight
						}
					}


					angular.element(window).on('resize', function(){
						icUtils.schedule('adjustSize', adjustSize, 200, true)
					})


					var cached_markers  ={}

					function getMarker(item){

						if(!hasValidGeoCoordinates(item)){
							console.warn('icMap: getMarker() missing coordinates at ', item)
							return null
						}


						if(!cached_markers[item.id]){
							cached_markers[item.id] =  new icMapItemMarker(item, scope)
						}

						return 	new L.marker(
									[item.latitude, item.longitude], 
									{
										icon: cached_markers[item.id],
										item: item,
										riseOnHover: true,
									}
								)
					}


					function updateListMarkers(list){

						markers.clearLayers()

						
						var	new_items	=	list.filter(function(item){
												return hasValidGeoCoordinates(item)
											})

						if(
								icSite.activeItem 
							&&	hasValidGeoCoordinates(icSite.activeItem)
							&&	list.indexOf(icSite.activeItem) == -1
						){
							new_items.push(icSite.activeItem)
						}

						markers.addLayers(new_items.map(getMarker))

						return icMapMarkerDigestQueue.currentRun
						
					}


					function updateActiveItemMarker(active_id, previous_id){

						var previous_in_list = previous_id && icItemStorage.filteredList.some(function(item){ return item.id == previous_id })


						//remove previous and active item marker
						markers.getLayers()
						.forEach(function(marker){ 
							if(marker.options.item.id == active_id) 	
								markers.removeLayer(marker)

							if(marker.options.item.id == previous_id && !previous_in_list) 	
								markers.removeLayer(marker)
						})


						//add active item marker
						if(
								icSite.activeItem
							&&	hasValidGeoCoordinates(icSite.activeItem)
						){
							markers.addLayer(getMarker(icSite.activeItem))
						}

						markers.refreshClusters()
					}


					//what was this for?
					/*var sizeInvalidationSchedule = undefined

					function scheduleSizeInvalidation(){

						if(sizeInvalidationSchedule) window.cancelAnimationFrame(sizeInvalidationSchedule)

						sizeInvalidationSchedule = window.requestAnimationFrame(function(){
							map.invalidateSize()
							sizeInvalidationSchedule = undefined
						})
					}


					$rootScope.$watch(scheduleSizeInvalidation)*/



					var	stop_watching_filteredList = $rootScope.$watchCollection(
							function(){ 
								return icItemStorage.filteredList	
							},
							function(list){
								if(scope.waiting != true) scope.loading++
								scope.waiting = true	
								icUtils.schedule('updateListMarkers',function(){
									scope.waiting = false
									return 	updateListMarkers(list)								
								}, 200, true)
								.finally(function(){
									scope.loading--
									icMapSpinnerControl.scope.$digest()
								})
							}
						),

						stop_watching_activeItem = $rootScope.$watchCollection(
							function(){ 
								return 	[
												icSite.activeItem && icSite.activeItem.id, 
												icSite.activeItem && icSite.activeItem.longitude, 
												icSite.activeItem && icSite.activeItem.latitude
										]
							}, 
							function(p,c){
								if(angular.equals(p,c)) return null

								window.requestAnimationFrame(function(){
									updateActiveItemMarker(p[0],c[0])								
								})
							}
						),

						stop_watching_displayedSections = $rootScope.$watch(adjustSize)



					scope.$on('$destroy', function(){
						icMainMap.clearMapObject()
						stop_watching_filteredList()
						stop_watching_displayedSections()
						stop_watching_activeItem()
						angular.element(window).off('resize', adjustSize)

					})


				}
			}
		}
	])



	.directive('icMiniMap',[

		'icMainMap',
		'icMapItemMarker',
		'icMapSwitchControl',

		function(icMainMap, icMapItemMarker, icMapSwitchControl){
			return {
				restrict: 	'AE',
				scope:		{
								icItem: 	'<',
							},

				link: function(scope, element){

					if(!window.L) console.error('icMiniMap: missing Leaflet!')


					var	map 	= 	L.map(element[0], {
										zoom: 			16,
										minZoom:		16,
										maxZoom:		16,
										zoomControl: 	false,
										doubleClickZoom:false,
										scrollWheelZoom:false,
										boxZoom:		false,
										dragging:		false,
										touchZoom:		false
									}),
						marker	=	undefined

					
					if (map.tap) {
					  map.tap.disable();
					}



					new L.Control.icMapSwitchControl({ 
						position: 	'topright',
						scope:		scope,
						key:		'icItem'
					}).addTo(map)

					L.tileLayer(
						icMainMap.defaults.tiles,
						{
							attribution: '&copy; <a href ="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
						}
					).addTo(map)

			
					scope.$watch('icItem', function(icItem){
						if(marker) marker.remove()

						if(
								!scope.icItem
							||	!scope.icItem.latitude
							||	!scope.icItem.longitude
							||	typeof scope.icItem.latitude	!=  'number'
							||	typeof scope.icItem.longitude 	!=  'number'
							||  Math.abs(scope.icItem.latitude) 	> 90
							||  Math.abs(scope.icItem.longitude)	> 180
						){
							return null
						}


						marker = L.marker(
							[scope.icItem.latitude, scope.icItem.longitude], 
							{
								icon: new icMapItemMarker(icItem, scope),
								item: icItem,
							}
						)
						.addTo(map)

						map.setView([icItem.latitude, icItem.longitude])
					})


				}
			}
		}

	])
}())