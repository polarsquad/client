"use strict";


angular.module('icMap', [
	'icServices'
])


.service('icMapItemMarker',[

	'$compile',

	function($compile){

		var icItemMarker = function(item, parentScope){

			var scope 	=  	parentScope.$new()

			scope.item 	= 	item
			
			var element = 	$compile('<ic-map-item-marker ic-item = "item"></ic-map-item-marker')(scope)
				//shadow	=	angular.element('<div class = "ic-map-marker-shadow"></div>')

			this.createIcon = function(){
				return element[0]
			}

			this.createShadow = function(){
				return //null shadow[0]
			}

		}

		return icItemMarker
	}
])


.service('icMapClusterMarker',[

	'$compile',

	function($compile){


		var icClusterMarker = function(cluster, parentScope){


			if(!cluster.scope) {
				var scope 	=  	parentScope.$new()

				scope.cluster =	cluster
				cluster.scope = scope

				cluster.on('remove', function(){
					scope.$destroy()
				})

				var element = 	$compile('<ic-map-cluster-marker ic-cluster = "cluster"></ic-map-cluster-marker>')(scope)
					//shadow	=	angular.element('<div class = "ic-map-marker-shadow"></div>')	
			} 



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


.directive('icMapItemMarker',[

	'icLanguages',
	'icSite',

	function(icLanguages, icSite){
		return {
			restrict:		'AE',
			templateUrl:	'partials/ic-map-item-marker.html',
			scope:			{
								icItem:	"<"
							},

			link: function(scope){
				scope.icLanguages 	= icLanguages
				scope.icSite		= icSite
			}

		}
	}

])


.directive('icMapClusterMarker',[


	function(){
		return {
			restrict:		'AE',
			templateUrl:	'partials/ic-map-cluster-marker.html',
			scope:			{
								icCluster:	"<"
							},

			link: function(scope){
				scope.$watch('icCluster', function(){
					scope.items = 	scope.icCluster.getAllChildMarkers()
									.map(function(marker){
										return marker.options.item
									})
				})
			}

		}
	}

])


.service('icMapSpinnerControl', [

	'$compile',

	function($compile){

		var element = undefined

		L.Control.IcMapSpinner = L.Control.extend({
			onAdd: function(map) {
				return element && element[0]
			},

			onRemove: function(map) {
			}
		})

		this.setScope = function(scope){
			element = 	$compile('<ic-spinner active = "icSearchResults.listLoading()"></ic-spinner>')(scope)
		}
	}
])


.service('icMapExpandControl', [

	'$compile',

	function($compile){

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

	'icSite',

	function(icSite){
		return {
			restrict : 		'E',
			scope:			true,
			templateUrl: 	'partials/ic-map-expand-control.html',

			link: function(scope){
				scope.icSite = icSite
			}
		}
	}
])


.service('icMapSwitchControl', [

	'$compile',

	function($compile){

		var element = undefined

		L.Control.icMapSwitchControl = L.Control.extend({
			onAdd: function(map) {
				return element && element[0]
			},

			onRemove: function(map) {
			}
		})

		this.setScope = function(scope){
			element = 	$compile('<ic-map-switch-control ic-item = "icItem"></ic-map-switch-control>')(scope)
		}
	}
])

.directive('icMapSwitchControl',[

	'icSite',

	function(icSite){
		return {
			restrict : 		'E',
			scope:			true,
			templateUrl: 	'partials/ic-map-switch-control.html',
			scope:			{
								icItem: '<'
							},

			link: function(scope){
				scope.icSite = icSite
			}
		}
	}
])



.directive('icMap',[

	'$rootScope',
	'$timeout',
	'icSearchResults',
	'icMapItemMarker',
	'icMapClusterMarker',
	'icMapExpandControl',
	'icMapSpinnerControl',
	'icSite',

	function($rootScope, $timeout, icSearchResults, icMapItemMarker, icMapClusterMarker, icMapExpandControl, icMapSpinnerControl, icSite){
		return {

			restrict: 'AE',

			link: function(scope, element, attrs){


				var markers = 	L.markerClusterGroup({
									maxClusterRadius: 50,
									iconCreateFunction: function(cluster) {										
										return 	new icMapClusterMarker(cluster, scope)
									}
								} ),
					map 	= 	L.map(element[0], {
									center: 		[52.500, 13.400],
									zoom: 			11,
									minZoom:		11,
									zoomControl: 	false,
									trackSize:		false,
									maxBounds:		[
														[52.80, 13.80], 
														[52.20, 13.00]
													]
								})


				//Todo: solve this more generically, hooks?
				icSite.focusItemOnMap = function(item){
					if(!item ||  !item.latitude || !item.longitude){
						console.warn('icMap: icSite.focusItemOnMap: missing coordinates.')
						return null
					}
					icSite.expandMap = true

					map.setView([item.latitude, item.longitude], 18)
				}



				scope.icSearchResults = icSearchResults

				new L.Control.Zoom({
					position: 'topright' 	
				}).addTo(map)

				icMapExpandControl.setScope(scope)

				new L.Control.IcMapExpand({ 
					position: 	'topleft',
				}).addTo(map)


				icMapSpinnerControl.setScope(scope)

				new L.Control.IcMapSpinner({ 
					position: 	'bottomleft',
				}).addTo(map)


				L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
					attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
				}).addTo(map);

				map.addLayer(markers)

				var width 					= undefined,
					height					= undefined,
					scheduled_adjustment	= undefined

				function adjustSize(delay){

					delay = parseInt(delay) || 50
					
					if(delay > 400) return null
					if(scheduled_adjustment) $timeout.cancel(scheduled_adjustment)

					scheduled_adjustment = $timeout(function(){
						if(width !== element[0].clientWidth || height !== element[0].clientHeight){
							map.invalidateSize(false)
							width 	= element[0].clientWidth
							height 	= element[0].clientHeight

							adjustSize()					
						} else{
							adjustSize(delay *2)
						}

					}, delay , false)
				}


				angular.element(window).on('resize', adjustSize)

				var stop_watching_filteredList 			= 	$rootScope.$watch(
																function(){ 																	
																	return [icSearchResults.filteredList, icSearchResults.getItem(icSite.params.item)]
																},
																function(obj){

																	var list = 	obj[1] && obj[0].indexOf(obj[1]) == -1
																				?	obj[0].concat([obj[1]])
																				:	obj[0]



																	markers.clearLayers()
																	markers.addLayers(
																		list
																		.filter(function(item){
																			return item.latitude && item.latitude
																		})
																		.map(function(item){

																			var marker = new L.marker(
																							[item.latitude, item.longitude], 
																							{
																								icon: new icMapItemMarker(item, scope),
																								item: item,
																								riseOnHover: true
																							})

																			return marker
																		})
																	)

																	markers.refreshClusters()
																

																},
																true
															),

					stop_watching_displayedCompontents	=	$rootScope.$watch(
																function(){ return icSite.displayedComponents},
																adjustSize,
																true
															)

				scope.$on('$destroy', function(){
					stop_watching_filteredList()
					stop_watching_displayedCompontents()
					angular.element(window).off('resize', adjustSize)
				})


			}
		}
	}
])



.directive('icMiniMap',[

	'icMapItemMarker',
	'icMapSwitchControl',


	function(icMapItemMarker, icMapSwitchControl){
		return {
			restrict: 	'AE',
			scope:		{
							icItem: 	'<',
						},

			link: function(scope, element){

				var	map 	= 	L.map(element[0], {
									zoom: 			16,
									minZoom:		16,
									maxZoom:		16,
									zoomControl: 	false,
									boxZoom:		false,
									doubleClickZoom:false,
									dragging:		false,
								}),
					marker	=	undefined

				

				icMapSwitchControl.setScope(scope)

				new L.Control.icMapSwitchControl({ 
					position: 	'topright',
				}).addTo(map)


				L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
					attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
				}).addTo(map);

				scope.$watch('icItem', function(icItem){
					if(marker) marker.remove()

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
