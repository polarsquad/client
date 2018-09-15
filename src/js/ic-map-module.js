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
				chunk_size		= 10,
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
				scope.queuedForDigest = false

				length-- 
				if(scope.$$destroyed) return console.log('destroyed') || null

				scope.$digest()
				points -= weight

				if(points <= 0){
					resetPoints()
					return 	new Promise(window.requestAnimationFrame)	
				} 

			}

			function finalize(){
				c_resolve()
				Queue.currentRun = new Promise(renewResolve)
			}

			function checkForRunEnd(){
				if(length > 0) return null

				finalize()

				return 	new Promise(window.requestAnimationFrame)
						
			}


			Queue.isRunning = function(){ return length != 0}

			Queue.add = function(scope, weight){
				if(scope.queuedForDigest) return null

				if(length == 0) queuePromise = new Promise(window.requestAnimationFrame)

				length++
				if(weight == undefined) weight = 1

				scope.queuedForDigest = true

				queuePromise = 	queuePromise
								.then(advance.bind(null, scope, weight))
								.then(checkForRunEnd)

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
		'icMainMap',
		'icMapMarkerDigestQueue',

		function($compile, icMainMap, icMapMarkerDigestQueue){


			function icClusterMarker(cluster){

				if(cluster._marker){
					icMapMarkerDigestQueue.add(cluster.scope, cluster._childCount)
					return cluster._marker
				}

				var scope 	=  	icMainMap.scope.$new(),
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
									tiles:				undefined,
								}

			this.setDefaults = function(config){

				defaults = angular.extend({}, defaults, config)

				return this
			}

			this.$get =	[

				'$rootScope',
				'$q',
				'icMapItemMarker',
				'icItemStorage',


				function($rootScope, $q ,icMapItemMarker, icItemStorage){

					var mapReady = $q.defer(),
						icMainMap = {
										ready:			mapReady.promise,
										defaults:		defaults,
										mapObject: 		undefined,
										markerCache:	{},
										scope:				$rootScope.$new()
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

					icMainMap.getMarker = function(item){

						if(!hasValidGeoCoordinates(item)){
							console.warn('icMainMap: getMarker() missing coordinates at ', item)
							return null
						}


						if(!icMainMap.markerCache[item.id]){
							//maybe check if cahed scope and new scope are different (although this should never be the case)
							icMainMap.markerCache[item.id] =  new icMapItemMarker(item, icMainMap.scope)
						}

						return 	new L.marker(
									[item.latitude, item.longitude], 
									{
										icon: icMainMap.markerCache[item.id],
										item: item,
										riseOnHover: false,
									}
								)
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
											return new icMapClusterMarker(cluster)
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


					map.on('layerremove', function(e){
						if(e.layer.scope) e.layer.scope.$destroy()
					})

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

					// L.vectorGrid.protobuf(
					// 	"https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/{z}/{x}/{y}.vector.pbf?access_token=pk.eyJ1Ijoic2dvZWxsbmVyIiwiYSI6ImNqN3Z2NzNjczRwYXQyd3Q1Znd5NHUxcXEifQ.sCDebhw6O866Yo3Yf1kkfA", 
					// 	{
					// 	//subdomains: "abcd",
					// 		attribution: '&copy; <a href ="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
					// 		vectorTileLayerStyles:{"version":8,"name":"Mapbox Streets","metadata":{"mapbox:autocomposite":true,"mapbox:type":"default","mapbox:origin":"streets-v10","mapbox:groups":{"1444934828655.3389":{"name":"Aeroways","collapsed":true},"1444933322393.2852":{"name":"POI labels  (scalerank 1)","collapsed":true},"1444855786460.0557":{"name":"Roads","collapsed":true},"1444933575858.6992":{"name":"Highway shields","collapsed":true},"1444934295202.7542":{"name":"Admin boundaries","collapsed":true},"1444856151690.9143":{"name":"State labels","collapsed":true},"1444933721429.3076":{"name":"Road labels","collapsed":true},"1444933358918.2366":{"name":"POI labels (scalerank 2)","collapsed":true},"1444933808272.805":{"name":"Water labels","collapsed":true},"1444933372896.5967":{"name":"POI labels (scalerank 3)","collapsed":true},"1444855799204.86":{"name":"Bridges","collapsed":true},"1444856087950.3635":{"name":"Marine labels","collapsed":true},"1456969573402.7817":{"name":"Hillshading","collapsed":true},"1444862510685.128":{"name":"City labels","collapsed":true},"1444855769305.6016":{"name":"Tunnels","collapsed":true},"1456970288113.8113":{"name":"Landcover","collapsed":true},"1444856144497.7825":{"name":"Country labels","collapsed":true},"1444933456003.5437":{"name":"POI labels (scalerank 4)","collapsed":true}}},"sources":{"composite":{"url":"mapbox://mapbox.mapbox-terrain-v2,mapbox.mapbox-streets-v7","type":"vector"}},"sprite":"mapbox://sprites/mapbox/streets-v10","glyphs":"mapbox://fonts/mapbox/{fontstack}/{range}.pbf","visibility":"public","layers":[{"id":"background","type":"background","layout":{},"paint":{"background-color":{"base":1,"stops":[[11,"hsl(35, 32%, 91%)"],[13,"hsl(35, 12%, 89%)"]]}}},{"id":"landcover_snow","type":"fill","metadata":{"mapbox:group":"1456970288113.8113"},"source":"composite","source-layer":"landcover","filter":["==","class","snow"],"layout":{},"paint":{"fill-color":"hsl(0, 0%, 100%)","fill-opacity":0.2,"fill-antialias":false}},{"id":"landcover_wood","type":"fill","metadata":{"mapbox:group":"1456970288113.8113"},"source":"composite","source-layer":"landcover","maxzoom":14,"filter":["==","class","wood"],"layout":{},"paint":{"fill-color":"hsl(75, 62%, 81%)","fill-opacity":{"base":1.5,"stops":[[2,0.3],[7,0]]},"fill-antialias":false}},{"id":"landcover_scrub","type":"fill","metadata":{"mapbox:group":"1456970288113.8113"},"source":"composite","source-layer":"landcover","maxzoom":14,"filter":["==","class","scrub"],"layout":{},"paint":{"fill-color":"hsl(75, 62%, 81%)","fill-opacity":{"base":1.5,"stops":[[2,0.3],[7,0]]},"fill-antialias":false}},{"id":"landcover_grass","type":"fill","metadata":{"mapbox:group":"1456970288113.8113"},"source":"composite","source-layer":"landcover","maxzoom":14,"filter":["==","class","grass"],"layout":{},"paint":{"fill-color":"hsl(75, 62%, 81%)","fill-opacity":{"base":1.5,"stops":[[2,0.3],[7,0]]},"fill-antialias":false}},{"id":"landcover_crop","type":"fill","metadata":{"mapbox:group":"1456970288113.8113"},"source":"composite","source-layer":"landcover","maxzoom":14,"filter":["==","class","crop"],"layout":{},"paint":{"fill-color":"hsl(75, 62%, 81%)","fill-opacity":{"base":1.5,"stops":[[2,0.3],[7,0]]},"fill-antialias":false}},{"id":"national_park","type":"fill","source":"composite","source-layer":"landuse_overlay","filter":["==","class","national_park"],"layout":{},"paint":{"fill-color":"hsl(100, 58%, 76%)","fill-opacity":{"base":1,"stops":[[5,0],[6,0.5]]}}},{"id":"hospital","type":"fill","source":"composite","source-layer":"landuse","filter":["==","class","hospital"],"layout":{},"paint":{"fill-color":{"base":1,"stops":[[15.5,"hsl(340, 37%, 87%)"],[16,"hsl(340, 63%, 89%)"]]}}},{"id":"school","type":"fill","source":"composite","source-layer":"landuse","filter":["==","class","school"],"layout":{},"paint":{"fill-color":{"base":1,"stops":[[15.5,"hsl(50, 47%, 81%)"],[16,"hsl(50, 63%, 84%)"]]}}},{"id":"park","type":"fill","source":"composite","source-layer":"landuse","filter":["==","class","park"],"layout":{},"paint":{"fill-color":"hsl(100, 58%, 76%)","fill-opacity":{"base":1,"stops":[[5,0],[6,1]]}}},{"id":"pitch","type":"fill","source":"composite","source-layer":"landuse","filter":["==","class","pitch"],"layout":{},"paint":{"fill-color":"hsl(100, 57%, 72%)"}},{"id":"pitch-line","type":"line","source":"composite","source-layer":"landuse","minzoom":15,"filter":["==","class","pitch"],"layout":{"line-join":"miter"},"paint":{"line-color":"hsl(75, 57%, 84%)"}},{"id":"cemetery","type":"fill","source":"composite","source-layer":"landuse","filter":["==","class","cemetery"],"layout":{},"paint":{"fill-color":"hsl(75, 37%, 81%)"}},{"id":"industrial","type":"fill","source":"composite","source-layer":"landuse","filter":["==","class","industrial"],"layout":{},"paint":{"fill-color":{"base":1,"stops":[[15.5,"hsl(230, 15%, 86%)"],[16,"hsl(230, 29%, 89%)"]]}}},{"id":"sand","type":"fill","source":"composite","source-layer":"landuse","filter":["==","class","sand"],"layout":{},"paint":{"fill-color":"hsl(60, 46%, 87%)"}},{"id":"hillshade_highlight_bright","type":"fill","metadata":{"mapbox:group":"1456969573402.7817"},"source":"composite","source-layer":"hillshade","maxzoom":16,"filter":["==","level",94],"layout":{},"paint":{"fill-color":"hsl(0, 0%, 100%)","fill-opacity":{"stops":[[14,0.12],[16,0]]},"fill-antialias":false}},{"id":"hillshade_highlight_med","type":"fill","metadata":{"mapbox:group":"1456969573402.7817"},"source":"composite","source-layer":"hillshade","maxzoom":16,"filter":["==","level",90],"layout":{},"paint":{"fill-color":"hsl(0, 0%, 100%)","fill-opacity":{"stops":[[14,0.12],[16,0]]},"fill-antialias":false}},{"id":"hillshade_shadow_faint","type":"fill","metadata":{"mapbox:group":"1456969573402.7817"},"source":"composite","source-layer":"hillshade","maxzoom":16,"filter":["==","level",89],"layout":{},"paint":{"fill-color":"hsl(56, 59%, 22%)","fill-opacity":{"stops":[[14,0.05],[16,0]]},"fill-antialias":false}},{"id":"hillshade_shadow_med","type":"fill","metadata":{"mapbox:group":"1456969573402.7817"},"source":"composite","source-layer":"hillshade","maxzoom":16,"filter":["==","level",78],"layout":{},"paint":{"fill-color":"hsl(56, 59%, 22%)","fill-opacity":{"stops":[[14,0.05],[16,0]]},"fill-antialias":false}},{"id":"hillshade_shadow_dark","type":"fill","metadata":{"mapbox:group":"1456969573402.7817"},"source":"composite","source-layer":"hillshade","maxzoom":16,"filter":["==","level",67],"layout":{},"paint":{"fill-color":"hsl(56, 59%, 22%)","fill-opacity":{"stops":[[14,0.06],[16,0]]},"fill-antialias":false}},{"id":"hillshade_shadow_extreme","type":"fill","metadata":{"mapbox:group":"1456969573402.7817"},"source":"composite","source-layer":"hillshade","maxzoom":16,"filter":["==","level",56],"layout":{},"paint":{"fill-color":"hsl(56, 59%, 22%)","fill-opacity":{"stops":[[14,0.06],[16,0]]},"fill-antialias":false}},{"id":"waterway-river-canal","type":"line","source":"composite","source-layer":"waterway","minzoom":8,"filter":["in","class","canal","river"],"layout":{"line-cap":{"base":1,"stops":[[0,"butt"],[11,"round"]]},"line-join":"round"},"paint":{"line-color":"hsl(205, 87%, 76%)","line-width":{"base":1.3,"stops":[[8.5,0.1],[20,8]]},"line-opacity":{"base":1,"stops":[[8,0],[8.5,1]]}}},{"id":"waterway-small","type":"line","source":"composite","source-layer":"waterway","minzoom":13,"filter":["!in","class","canal","river"],"layout":{"line-join":"round","line-cap":"round"},"paint":{"line-color":"hsl(205, 87%, 76%)","line-width":{"base":1.35,"stops":[[13.5,0.1],[20,3]]},"line-opacity":{"base":1,"stops":[[13,0],[13.5,1]]}}},{"id":"water-shadow","type":"fill","source":"composite","source-layer":"water","layout":{},"paint":{"fill-color":"hsl(215, 84%, 69%)","fill-translate":{"base":1.2,"stops":[[7,[0,0]],[16,[-1,-1]]]},"fill-translate-anchor":"viewport","fill-opacity":1}},{"id":"water","ref":"water-shadow","paint":{"fill-color":"hsl(196, 80%, 70%)"}},{"id":"barrier_line-land-polygon","type":"fill","source":"composite","source-layer":"barrier_line","filter":["all",["==","$type","Polygon"],["==","class","land"]],"layout":{},"paint":{"fill-color":"hsl(35, 12%, 89%)"}},{"id":"barrier_line-land-line","type":"line","source":"composite","source-layer":"barrier_line","filter":["all",["==","$type","LineString"],["==","class","land"]],"layout":{"line-cap":"round"},"paint":{"line-width":{"base":1.99,"stops":[[14,0.75],[20,40]]},"line-color":"hsl(35, 12%, 89%)"}},{"id":"aeroway-polygon","type":"fill","metadata":{"mapbox:group":"1444934828655.3389"},"source":"composite","source-layer":"aeroway","minzoom":11,"filter":["all",["==","$type","Polygon"],["!=","type","apron"]],"layout":{},"paint":{"fill-color":{"base":1,"stops":[[15,"hsl(230, 23%, 82%)"],[16,"hsl(230, 37%, 84%)"]]},"fill-opacity":{"base":1,"stops":[[11,0],[11.5,1]]}}},{"id":"aeroway-runway","type":"line","metadata":{"mapbox:group":"1444934828655.3389"},"source":"composite","source-layer":"aeroway","minzoom":9,"filter":["all",["==","$type","LineString"],["==","type","runway"]],"layout":{},"paint":{"line-color":{"base":1,"stops":[[15,"hsl(230, 23%, 82%)"],[16,"hsl(230, 37%, 84%)"]]},"line-width":{"base":1.5,"stops":[[9,1],[18,80]]}}},{"id":"aeroway-taxiway","type":"line","metadata":{"mapbox:group":"1444934828655.3389"},"source":"composite","source-layer":"aeroway","minzoom":9,"filter":["all",["==","$type","LineString"],["==","type","taxiway"]],"layout":{},"paint":{"line-color":{"base":1,"stops":[[15,"hsl(230, 23%, 82%)"],[16,"hsl(230, 37%, 84%)"]]},"line-width":{"base":1.5,"stops":[[10,0.5],[18,20]]}}},{"id":"building-line","type":"line","source":"composite","source-layer":"building","minzoom":15,"filter":["all",["!=","type","building:part"],["==","underground","false"]],"layout":{},"paint":{"line-color":"hsl(35, 6%, 79%)","line-width":{"base":1.5,"stops":[[15,0.75],[20,3]]},"line-opacity":{"base":1,"stops":[[15.5,0],[16,1]]}}},{"id":"building","type":"fill","source":"composite","source-layer":"building","minzoom":15,"filter":["all",["!=","type","building:part"],["==","underground","false"]],"layout":{},"paint":{"fill-color":{"base":1,"stops":[[15,"hsl(35, 11%, 88%)"],[16,"hsl(35, 8%, 85%)"]]},"fill-opacity":{"base":1,"stops":[[15.5,0],[16,1]]},"fill-outline-color":"hsl(35, 6%, 79%)"}},{"id":"tunnel-street-low","type":"line","metadata":{"mapbox:group":"1444855769305.6016"},"source":"composite","source-layer":"road","minzoom":11,"filter":["all",["==","$type","LineString"],["all",["==","class","street"],["==","structure","tunnel"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[12.5,0.5],[14,2],[18,18]]},"line-color":"hsl(0, 0%, 100%)","line-opacity":{"stops":[[11.5,0],[12,1],[14,1],[14.01,0]]}}},{"id":"tunnel-street_limited-low","type":"line","metadata":{"mapbox:group":"1444855769305.6016"},"source":"composite","source-layer":"road","minzoom":11,"filter":["all",["==","$type","LineString"],["all",["==","class","street_limited"],["==","structure","tunnel"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[12.5,0.5],[14,2],[18,18]]},"line-color":"hsl(0, 0%, 100%)","line-opacity":{"stops":[[11.5,0],[12,1],[14,1],[14.01,0]]}}},{"id":"tunnel-service-link-track-case","type":"line","metadata":{"mapbox:group":"1444855769305.6016"},"source":"composite","source-layer":"road","minzoom":14,"filter":["all",["==","$type","LineString"],["all",["in","class","link","service","track"],["==","structure","tunnel"],["!=","type","trunk_link"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[12,0.75],[20,2]]},"line-color":"hsl(230, 19%, 75%)","line-gap-width":{"base":1.5,"stops":[[14,0.5],[18,12]]},"line-dasharray":[3,3]}},{"id":"tunnel-street_limited-case","metadata":{"mapbox:group":"1444855769305.6016"},"ref":"tunnel-street_limited-low","paint":{"line-width":{"base":1.5,"stops":[[12,0.75],[20,2]]},"line-color":"hsl(230, 19%, 75%)","line-gap-width":{"base":1.5,"stops":[[13,0],[14,2],[18,18]]},"line-dasharray":[3,3],"line-opacity":{"base":1,"stops":[[13.99,0],[14,1]]}}},{"id":"tunnel-street-case","metadata":{"mapbox:group":"1444855769305.6016"},"ref":"tunnel-street-low","paint":{"line-width":{"base":1.5,"stops":[[12,0.75],[20,2]]},"line-color":"hsl(230, 19%, 75%)","line-gap-width":{"base":1.5,"stops":[[13,0],[14,2],[18,18]]},"line-dasharray":[3,3],"line-opacity":{"base":1,"stops":[[13.99,0],[14,1]]}}},{"id":"tunnel-secondary-tertiary-case","type":"line","metadata":{"mapbox:group":"1444855769305.6016"},"source":"composite","source-layer":"road","filter":["all",["==","$type","LineString"],["all",["in","class","secondary","tertiary"],["==","structure","tunnel"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.2,"stops":[[10,0.75],[18,2]]},"line-dasharray":[3,3],"line-gap-width":{"base":1.5,"stops":[[8.5,0.5],[10,0.75],[18,26]]},"line-color":"hsl(230, 19%, 75%)"}},{"id":"tunnel-primary-case","type":"line","metadata":{"mapbox:group":"1444855769305.6016"},"source":"composite","source-layer":"road","filter":["all",["==","$type","LineString"],["all",["==","class","primary"],["==","structure","tunnel"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[10,1],[16,2]]},"line-dasharray":[3,3],"line-gap-width":{"base":1.5,"stops":[[5,0.75],[18,32]]},"line-color":"hsl(230, 19%, 75%)"}},{"id":"tunnel-trunk_link-case","type":"line","metadata":{"mapbox:group":"1444855769305.6016"},"source":"composite","source-layer":"road","minzoom":13,"filter":["all",["==","$type","LineString"],["all",["==","structure","tunnel"],["==","type","trunk_link"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[12,0.75],[20,2]]},"line-color":"hsl(0, 0%, 100%)","line-gap-width":{"base":1.5,"stops":[[12,0.5],[14,2],[18,18]]},"line-dasharray":[3,3]}},{"id":"tunnel-motorway_link-case","type":"line","metadata":{"mapbox:group":"1444855769305.6016"},"source":"composite","source-layer":"road","minzoom":13,"filter":["all",["==","$type","LineString"],["all",["==","class","motorway_link"],["==","structure","tunnel"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[12,0.75],[20,2]]},"line-color":"hsl(0, 0%, 100%)","line-gap-width":{"base":1.5,"stops":[[12,0.5],[14,2],[18,18]]},"line-dasharray":[3,3]}},{"id":"tunnel-trunk-case","type":"line","metadata":{"mapbox:group":"1444855769305.6016"},"source":"composite","source-layer":"road","filter":["all",["==","$type","LineString"],["all",["==","structure","tunnel"],["==","type","trunk"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[10,1],[16,2]]},"line-color":"hsl(0, 0%, 100%)","line-gap-width":{"base":1.5,"stops":[[5,0.75],[18,32]]},"line-opacity":1,"line-dasharray":[3,3]}},{"id":"tunnel-motorway-case","type":"line","metadata":{"mapbox:group":"1444855769305.6016"},"source":"composite","source-layer":"road","filter":["all",["==","$type","LineString"],["all",["==","class","motorway"],["==","structure","tunnel"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[10,1],[16,2]]},"line-color":"hsl(0, 0%, 100%)","line-gap-width":{"base":1.5,"stops":[[5,0.75],[18,32]]},"line-opacity":1,"line-dasharray":[3,3]}},{"id":"tunnel-construction","type":"line","metadata":{"mapbox:group":"1444855769305.6016"},"source":"composite","source-layer":"road","minzoom":14,"filter":["all",["==","$type","LineString"],["all",["==","class","construction"],["==","structure","tunnel"]]],"layout":{"line-join":"miter"},"paint":{"line-width":{"base":1.5,"stops":[[12.5,0.5],[14,2],[18,18]]},"line-color":"hsl(230, 24%, 87%)","line-opacity":{"base":1,"stops":[[13.99,0],[14,1]]},"line-dasharray":{"base":1,"stops":[[14,[0.4,0.8]],[15,[0.3,0.6]],[16,[0.2,0.3]],[17,[0.2,0.25]],[18,[0.15,0.15]]]}}},{"id":"tunnel-path","type":"line","metadata":{"mapbox:group":"1444855769305.6016"},"source":"composite","source-layer":"road","filter":["all",["==","$type","LineString"],["all",["==","class","path"],["==","structure","tunnel"],["!=","type","steps"]]],"layout":{"line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[15,1],[18,4]]},"line-dasharray":{"base":1,"stops":[[14,[1,0]],[15,[1.75,1]],[16,[1,0.75]],[17,[1,0.5]]]},"line-color":"hsl(35, 26%, 95%)","line-opacity":{"base":1,"stops":[[14,0],[14.25,1]]}}},{"id":"tunnel-steps","type":"line","metadata":{"mapbox:group":"1444855769305.6016"},"source":"composite","source-layer":"road","filter":["all",["==","$type","LineString"],["all",["==","structure","tunnel"],["==","type","steps"]]],"layout":{"line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[15,1],[16,1.6],[18,6]]},"line-color":"hsl(35, 26%, 95%)","line-dasharray":{"base":1,"stops":[[14,[1,0]],[15,[1.75,1]],[16,[1,0.75]],[17,[0.3,0.3]]]},"line-opacity":{"base":1,"stops":[[14,0],[14.25,1]]}}},{"id":"tunnel-trunk_link","metadata":{"mapbox:group":"1444855769305.6016"},"ref":"tunnel-trunk_link-case","paint":{"line-width":{"base":1.5,"stops":[[12,0.5],[14,2],[18,18]]},"line-color":"hsl(46, 77%, 78%)","line-opacity":1,"line-dasharray":[1,0]}},{"id":"tunnel-motorway_link","metadata":{"mapbox:group":"1444855769305.6016"},"ref":"tunnel-motorway_link-case","paint":{"line-width":{"base":1.5,"stops":[[12,0.5],[14,2],[18,18]]},"line-color":"hsl(26, 100%, 78%)","line-opacity":1,"line-dasharray":[1,0]}},{"id":"tunnel-pedestrian","type":"line","metadata":{"mapbox:group":"1444855769305.6016"},"source":"composite","source-layer":"road","minzoom":13,"filter":["all",["==","$type","LineString"],["all",["==","class","pedestrian"],["==","structure","tunnel"]]],"layout":{"line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[14,0.5],[18,12]]},"line-color":"hsl(0, 0%, 100%)","line-opacity":1,"line-dasharray":{"base":1,"stops":[[14,[1,0]],[15,[1.5,0.4]],[16,[1,0.2]]]}}},{"id":"tunnel-service-link-track","metadata":{"mapbox:group":"1444855769305.6016"},"ref":"tunnel-service-link-track-case","paint":{"line-width":{"base":1.5,"stops":[[14,0.5],[18,12]]},"line-color":"hsl(0, 0%, 100%)","line-dasharray":[1,0]}},{"id":"tunnel-street_limited","metadata":{"mapbox:group":"1444855769305.6016"},"ref":"tunnel-street_limited-low","paint":{"line-width":{"base":1.5,"stops":[[12.5,0.5],[14,2],[18,18]]},"line-color":"hsl(35, 14%, 93%)","line-opacity":{"base":1,"stops":[[13.99,0],[14,1]]}}},{"id":"tunnel-street","metadata":{"mapbox:group":"1444855769305.6016"},"ref":"tunnel-street-low","paint":{"line-width":{"base":1.5,"stops":[[12.5,0.5],[14,2],[18,18]]},"line-color":"hsl(0, 0%, 100%)","line-opacity":{"base":1,"stops":[[13.99,0],[14,1]]}}},{"id":"tunnel-secondary-tertiary","metadata":{"mapbox:group":"1444855769305.6016"},"ref":"tunnel-secondary-tertiary-case","paint":{"line-width":{"base":1.5,"stops":[[8.5,0.5],[10,0.75],[18,26]]},"line-color":"hsl(0, 0%, 100%)","line-opacity":1,"line-dasharray":[1,0],"line-blur":0}},{"id":"tunnel-primary","metadata":{"mapbox:group":"1444855769305.6016"},"ref":"tunnel-primary-case","paint":{"line-width":{"base":1.5,"stops":[[5,0.75],[18,32]]},"line-color":"hsl(0, 0%, 100%)","line-opacity":1,"line-dasharray":[1,0],"line-blur":0}},{"id":"tunnel-oneway-arrows-blue-minor","type":"symbol","metadata":{"mapbox:group":"1444855769305.6016"},"source":"composite","source-layer":"road","minzoom":16,"filter":["all",["==","$type","LineString"],["all",["in","class","link","path","pedestrian","service","track"],["==","oneway","true"],["==","structure","tunnel"],["!=","type","trunk_link"]]],"layout":{"symbol-placement":"line","icon-image":{"base":1,"stops":[[17,"oneway-small"],[18,"oneway-large"]]},"symbol-spacing":200,"icon-padding":2},"paint":{}},{"id":"tunnel-oneway-arrows-blue-major","type":"symbol","metadata":{"mapbox:group":"1444855769305.6016"},"source":"composite","source-layer":"road","minzoom":15,"filter":["all",["==","$type","LineString"],["all",["in","class","primary","secondary","street","street_limited","tertiary"],["==","oneway","true"],["==","structure","tunnel"],["!=","type","trunk_link"]]],"layout":{"symbol-placement":"line","icon-image":{"base":1,"stops":[[16,"oneway-small"],[17,"oneway-large"]]},"symbol-spacing":200,"icon-padding":2},"paint":{}},{"id":"tunnel-trunk","type":"line","metadata":{"mapbox:group":"1444855769305.6016"},"source":"composite","source-layer":"road","filter":["all",["==","$type","LineString"],["all",["==","class","trunk"],["==","structure","tunnel"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[5,0.75],[18,32]]},"line-color":"hsl(46, 77%, 78%)"}},{"id":"tunnel-motorway","metadata":{"mapbox:group":"1444855769305.6016"},"ref":"tunnel-motorway-case","paint":{"line-width":{"base":1.5,"stops":[[5,0.75],[18,32]]},"line-dasharray":[1,0],"line-opacity":1,"line-color":"hsl(26, 100%, 78%)","line-blur":0}},{"id":"tunnel-oneway-arrows-white","type":"symbol","metadata":{"mapbox:group":"1444855769305.6016"},"source":"composite","source-layer":"road","minzoom":16,"filter":["all",["==","$type","LineString"],["all",["in","class","link","motorway","motorway_link","trunk"],["==","oneway","true"],["==","structure","tunnel"],["!in","type","primary_link","secondary_link","tertiary_link"]]],"layout":{"symbol-placement":"line","icon-image":{"base":1,"stops":[[16,"oneway-white-small"],[17,"oneway-white-large"]]},"symbol-spacing":200,"icon-padding":2},"paint":{}},{"id":"ferry","type":"line","source":"composite","source-layer":"road","filter":["all",["==","$type","LineString"],["==","type","ferry"]],"layout":{"line-join":"round"},"paint":{"line-color":{"base":1,"stops":[[15,"hsl(205, 73%, 63%)"],[17,"hsl(230, 73%, 63%)"]]},"line-opacity":1,"line-width":{"base":1.5,"stops":[[14,0.5],[20,1]]},"line-dasharray":{"base":1,"stops":[[12,[1,0]],[13,[12,4]]]}}},{"id":"ferry_auto","type":"line","source":"composite","source-layer":"road","filter":["all",["==","$type","LineString"],["==","type","ferry_auto"]],"layout":{"line-join":"round"},"paint":{"line-color":{"base":1,"stops":[[15,"hsl(205, 73%, 63%)"],[17,"hsl(230, 73%, 63%)"]]},"line-opacity":1,"line-width":{"base":1.5,"stops":[[14,0.5],[20,1]]}}},{"id":"road-path-bg","type":"line","metadata":{"mapbox:group":"1444855786460.0557"},"source":"composite","source-layer":"road","filter":["all",["==","$type","LineString"],["all",["==","class","path"],["!in","structure","bridge","tunnel"],["!in","type","crossing","sidewalk","steps"]]],"layout":{"line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[15,2],[18,7]]},"line-dasharray":[1,0],"line-color":"hsl(230, 17%, 82%)","line-blur":0,"line-opacity":{"base":1,"stops":[[14,0],[14.25,0.75]]}}},{"id":"road-steps-bg","type":"line","metadata":{"mapbox:group":"1444855786460.0557"},"source":"composite","source-layer":"road","filter":["all",["==","$type","LineString"],["all",["!in","structure","bridge","tunnel"],["==","type","steps"]]],"layout":{"line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[15,2],[17,4.6],[18,7]]},"line-color":"hsl(230, 17%, 82%)","line-dasharray":[1,0],"line-opacity":{"base":1,"stops":[[14,0],[14.25,0.75]]}}},{"id":"road-sidewalk-bg","type":"line","metadata":{"mapbox:group":"1444855786460.0557"},"source":"composite","source-layer":"road","minzoom":16,"filter":["all",["==","$type","LineString"],["all",["!in","structure","bridge","tunnel"],["in","type","crossing","sidewalk"]]],"layout":{"line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[15,2],[18,7]]},"line-dasharray":[1,0],"line-color":"hsl(230, 17%, 82%)","line-blur":0,"line-opacity":{"base":1,"stops":[[16,0],[16.25,0.75]]}}},{"id":"turning-features-outline","type":"symbol","metadata":{"mapbox:group":"1444855786460.0557"},"source":"composite","source-layer":"road","minzoom":15,"filter":["all",["==","$type","Point"],["in","class","turning_circle","turning_loop"]],"layout":{"icon-image":"turning-circle-outline","icon-size":{"base":1.5,"stops":[[14,0.122],[18,0.969],[20,1]]},"icon-allow-overlap":true,"icon-ignore-placement":true,"icon-padding":0,"icon-rotation-alignment":"map"},"paint":{}},{"id":"road-pedestrian-case","type":"line","metadata":{"mapbox:group":"1444855786460.0557"},"source":"composite","source-layer":"road","minzoom":12,"filter":["all",["==","$type","LineString"],["all",["==","class","pedestrian"],["==","structure","none"]]],"layout":{"line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[14,2],[18,14.5]]},"line-color":"hsl(230, 24%, 87%)","line-gap-width":0,"line-opacity":{"base":1,"stops":[[13.99,0],[14,1]]}}},{"id":"road-street-low","type":"line","metadata":{"mapbox:group":"1444855786460.0557"},"source":"composite","source-layer":"road","minzoom":11,"filter":["all",["==","$type","LineString"],["all",["==","class","street"],["==","structure","none"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[12.5,0.5],[14,2],[18,18]]},"line-color":"hsl(0, 0%, 100%)","line-opacity":{"stops":[[11,0],[11.25,1],[14,1],[14.01,0]]}}},{"id":"road-street_limited-low","type":"line","metadata":{"mapbox:group":"1444855786460.0557"},"source":"composite","source-layer":"road","minzoom":11,"filter":["all",["==","$type","LineString"],["all",["==","class","street_limited"],["==","structure","none"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[12.5,0.5],[14,2],[18,18]]},"line-color":"hsl(0, 0%, 100%)","line-opacity":{"stops":[[11,0],[11.25,1],[14,1],[14.01,0]]}}},{"id":"road-service-link-track-case","type":"line","metadata":{"mapbox:group":"1444855786460.0557"},"source":"composite","source-layer":"road","minzoom":14,"filter":["all",["==","$type","LineString"],["all",["in","class","link","service","track"],["!in","structure","bridge","tunnel"],["!=","type","trunk_link"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[12,0.75],[20,2]]},"line-color":"hsl(230, 24%, 87%)","line-gap-width":{"base":1.5,"stops":[[14,0.5],[18,12]]}}},{"id":"road-street_limited-case","metadata":{"mapbox:group":"1444855786460.0557"},"ref":"road-street_limited-low","paint":{"line-width":{"base":1.5,"stops":[[12,0.75],[20,2]]},"line-color":"hsl(230, 24%, 87%)","line-gap-width":{"base":1.5,"stops":[[13,0],[14,2],[18,18]]},"line-opacity":{"base":1,"stops":[[13.99,0],[14,1]]}}},{"id":"road-street-case","metadata":{"mapbox:group":"1444855786460.0557"},"ref":"road-street-low","paint":{"line-width":{"base":1.5,"stops":[[12,0.75],[20,2]]},"line-color":"hsl(230, 24%, 87%)","line-gap-width":{"base":1.5,"stops":[[13,0],[14,2],[18,18]]},"line-opacity":{"base":1,"stops":[[13.99,0],[14,1]]}}},{"id":"road-secondary-tertiary-case","type":"line","metadata":{"mapbox:group":"1444855786460.0557"},"source":"composite","source-layer":"road","filter":["all",["==","$type","LineString"],["all",["in","class","secondary","tertiary"],["!in","structure","bridge","tunnel"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.2,"stops":[[10,0.75],[18,2]]},"line-color":"hsl(230, 24%, 87%)","line-gap-width":{"base":1.5,"stops":[[8.5,0.5],[10,0.75],[18,26]]},"line-opacity":{"base":1,"stops":[[9.99,0],[10,1]]}}},{"id":"road-primary-case","type":"line","metadata":{"mapbox:group":"1444855786460.0557"},"source":"composite","source-layer":"road","filter":["all",["==","$type","LineString"],["all",["==","class","primary"],["!in","structure","bridge","tunnel"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[10,1],[16,2]]},"line-color":"hsl(230, 24%, 87%)","line-gap-width":{"base":1.5,"stops":[[5,0.75],[18,32]]},"line-opacity":{"base":1,"stops":[[9.99,0],[10,1]]}}},{"id":"road-motorway_link-case","type":"line","metadata":{"mapbox:group":"1444855786460.0557"},"source":"composite","source-layer":"road","minzoom":10,"filter":["all",["==","$type","LineString"],["all",["==","class","motorway_link"],["!in","structure","bridge","tunnel"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[12,0.75],[20,2]]},"line-color":"hsl(0, 0%, 100%)","line-gap-width":{"base":1.5,"stops":[[12,0.5],[14,2],[18,18]]},"line-opacity":{"base":1,"stops":[[10.99,0],[11,1]]}}},{"id":"road-trunk_link-case","type":"line","metadata":{"mapbox:group":"1444855786460.0557"},"source":"composite","source-layer":"road","minzoom":11,"filter":["all",["==","$type","LineString"],["all",["!in","structure","bridge","tunnel"],["==","type","trunk_link"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[12,0.75],[20,2]]},"line-color":"hsl(0, 0%, 100%)","line-gap-width":{"base":1.5,"stops":[[12,0.5],[14,2],[18,18]]},"line-opacity":{"base":1,"stops":[[10.99,0],[11,1]]}}},{"id":"road-trunk-case","type":"line","metadata":{"mapbox:group":"1444855786460.0557"},"source":"composite","source-layer":"road","filter":["all",["==","$type","LineString"],["all",["==","class","trunk"],["!in","structure","bridge","tunnel"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[10,1],[16,2]]},"line-color":"hsl(0, 0%, 100%)","line-gap-width":{"base":1.5,"stops":[[5,0.75],[18,32]]},"line-opacity":{"base":1,"stops":[[6,0],[6.1,1]]}}},{"id":"road-motorway-case","type":"line","metadata":{"mapbox:group":"1444855786460.0557"},"source":"composite","source-layer":"road","filter":["all",["==","$type","LineString"],["all",["==","class","motorway"],["!in","structure","bridge","tunnel"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[10,1],[16,2]]},"line-color":"hsl(0, 0%, 100%)","line-gap-width":{"base":1.5,"stops":[[5,0.75],[18,32]]}}},{"id":"road-construction","type":"line","metadata":{"mapbox:group":"1444855786460.0557"},"source":"composite","source-layer":"road","minzoom":14,"filter":["all",["==","$type","LineString"],["all",["==","class","construction"],["==","structure","none"]]],"layout":{"line-join":"miter"},"paint":{"line-width":{"base":1.5,"stops":[[12.5,0.5],[14,2],[18,18]]},"line-color":"hsl(230, 24%, 87%)","line-opacity":{"base":1,"stops":[[13.99,0],[14,1]]},"line-dasharray":{"base":1,"stops":[[14,[0.4,0.8]],[15,[0.3,0.6]],[16,[0.2,0.3]],[17,[0.2,0.25]],[18,[0.15,0.15]]]}}},{"id":"road-sidewalks","metadata":{"mapbox:group":"1444855786460.0557"},"ref":"road-sidewalk-bg","paint":{"line-width":{"base":1.5,"stops":[[15,1],[18,4]]},"line-color":"hsl(0, 0%, 100%)","line-dasharray":{"base":1,"stops":[[14,[1,0]],[15,[1.75,1]],[16,[1,0.75]],[17,[1,0.5]]]},"line-opacity":{"base":1,"stops":[[16,0],[16.25,1]]}}},{"id":"road-path","metadata":{"mapbox:group":"1444855786460.0557"},"ref":"road-path-bg","paint":{"line-width":{"base":1.5,"stops":[[15,1],[18,4]]},"line-color":"hsl(0, 0%, 100%)","line-dasharray":{"base":1,"stops":[[14,[1,0]],[15,[1.75,1]],[16,[1,0.75]],[17,[1,0.5]]]},"line-opacity":{"base":1,"stops":[[14,0],[14.25,1]]}}},{"id":"road-steps","metadata":{"mapbox:group":"1444855786460.0557"},"ref":"road-steps-bg","paint":{"line-width":{"base":1.5,"stops":[[15,1],[16,1.6],[18,6]]},"line-color":"hsl(0, 0%, 100%)","line-dasharray":{"base":1,"stops":[[14,[1,0]],[15,[1.75,1]],[16,[1,0.75]],[17,[0.3,0.3]]]},"line-opacity":{"base":1,"stops":[[14,0],[14.25,1]]}}},{"id":"road-trunk_link","metadata":{"mapbox:group":"1444855786460.0557"},"ref":"road-trunk_link-case","paint":{"line-width":{"base":1.5,"stops":[[12,0.5],[14,2],[18,18]]},"line-color":"hsl(46, 85%, 67%)","line-opacity":1}},{"id":"road-motorway_link","metadata":{"mapbox:group":"1444855786460.0557"},"ref":"road-motorway_link-case","paint":{"line-width":{"base":1.5,"stops":[[12,0.5],[14,2],[18,18]]},"line-color":"hsl(26, 100%, 68%)","line-opacity":1}},{"id":"road-pedestrian","metadata":{"mapbox:group":"1444855786460.0557"},"ref":"road-pedestrian-case","paint":{"line-width":{"base":1.5,"stops":[[14,0.5],[18,12]]},"line-color":"hsl(0, 0%, 100%)","line-opacity":1,"line-dasharray":{"base":1,"stops":[[14,[1,0]],[15,[1.5,0.4]],[16,[1,0.2]]]}}},{"id":"road-pedestrian-polygon-fill","type":"fill","metadata":{"mapbox:group":"1444855786460.0557"},"source":"composite","source-layer":"road","minzoom":12,"filter":["all",["==","$type","Polygon"],["all",["in","class","path","pedestrian"],["==","structure","none"]]],"layout":{},"paint":{"fill-color":{"base":1,"stops":[[16,"hsl(230, 16%, 94%)"],[16.25,"hsl(230, 50%, 98%)"]]},"fill-outline-color":"hsl(230, 26%, 88%)","fill-opacity":1}},{"id":"road-pedestrian-polygon-pattern","metadata":{"mapbox:group":"1444855786460.0557"},"ref":"road-pedestrian-polygon-fill","paint":{"fill-color":"hsl(0, 0%, 100%)","fill-outline-color":"hsl(35, 10%, 83%)","fill-pattern":"pedestrian-polygon","fill-opacity":{"base":1,"stops":[[16,0],[16.25,1]]}}},{"id":"road-polygon","type":"fill","metadata":{"mapbox:group":"1444855786460.0557"},"source":"composite","source-layer":"road","minzoom":12,"filter":["all",["==","$type","Polygon"],["all",["!in","class","motorway","path","pedestrian","trunk"],["!in","structure","bridge","tunnel"]]],"layout":{},"paint":{"fill-color":"hsl(0, 0%, 100%)","fill-outline-color":"#d6d9e6"}},{"id":"road-service-link-track","metadata":{"mapbox:group":"1444855786460.0557"},"ref":"road-service-link-track-case","paint":{"line-width":{"base":1.5,"stops":[[14,0.5],[18,12]]},"line-color":"hsl(0, 0%, 100%)"}},{"id":"road-street_limited","metadata":{"mapbox:group":"1444855786460.0557"},"ref":"road-street_limited-low","paint":{"line-width":{"base":1.5,"stops":[[12.5,0.5],[14,2],[18,18]]},"line-color":"hsl(35, 14%, 93%)","line-opacity":{"base":1,"stops":[[13.99,0],[14,1]]}}},{"id":"road-street","metadata":{"mapbox:group":"1444855786460.0557"},"ref":"road-street-low","paint":{"line-width":{"base":1.5,"stops":[[12.5,0.5],[14,2],[18,18]]},"line-color":"hsl(0, 0%, 100%)","line-opacity":{"base":1,"stops":[[13.99,0],[14,1]]}}},{"id":"road-secondary-tertiary","metadata":{"mapbox:group":"1444855786460.0557"},"ref":"road-secondary-tertiary-case","paint":{"line-width":{"base":1.5,"stops":[[8.5,0.5],[10,0.75],[18,26]]},"line-color":{"base":1,"stops":[[5,"hsl(35, 32%, 91%)"],[8,"hsl(0, 0%, 100%)"]]},"line-opacity":{"base":1.2,"stops":[[5,0],[5.5,1]]}}},{"id":"road-primary","metadata":{"mapbox:group":"1444855786460.0557"},"ref":"road-primary-case","paint":{"line-width":{"base":1.5,"stops":[[5,0.75],[18,32]]},"line-color":{"base":1,"stops":[[5,"hsl(35, 32%, 91%)"],[7,"hsl(0, 0%, 100%)"]]},"line-opacity":1}},{"id":"road-oneway-arrows-blue-minor","type":"symbol","metadata":{"mapbox:group":"1444855786460.0557"},"source":"composite","source-layer":"road","minzoom":16,"filter":["all",["==","$type","LineString"],["all",["in","class","link","path","pedestrian","service","track"],["==","oneway","true"],["!in","structure","bridge","tunnel"],["!=","type","trunk_link"]]],"layout":{"symbol-placement":"line","icon-image":{"base":1,"stops":[[17,"oneway-small"],[18,"oneway-large"]]},"icon-rotation-alignment":"map","icon-padding":2,"symbol-spacing":200},"paint":{}},{"id":"road-oneway-arrows-blue-major","type":"symbol","metadata":{"mapbox:group":"1444855786460.0557"},"source":"composite","source-layer":"road","minzoom":15,"filter":["all",["==","$type","LineString"],["all",["in","class","primary","secondary","street","street_limited","tertiary"],["==","oneway","true"],["!in","structure","bridge","tunnel"],["!=","type","trunk_link"]]],"layout":{"symbol-placement":"line","icon-image":{"base":1,"stops":[[16,"oneway-small"],[17,"oneway-large"]]},"icon-rotation-alignment":"map","icon-padding":2,"symbol-spacing":200},"paint":{}},{"id":"road-trunk","metadata":{"mapbox:group":"1444855786460.0557"},"ref":"road-trunk-case","paint":{"line-width":{"base":1.5,"stops":[[5,0.75],[18,32]]},"line-color":{"base":1,"stops":[[6,"hsl(0, 0%, 100%)"],[6.1,"hsl(46, 80%, 60%)"],[9,"hsl(46, 85%, 67%)"]]}}},{"id":"road-motorway","metadata":{"mapbox:group":"1444855786460.0557"},"ref":"road-motorway-case","paint":{"line-width":{"base":1.5,"stops":[[5,0.75],[18,32]]},"line-color":{"base":1,"stops":[[8,"hsl(26, 87%, 62%)"],[9,"hsl(26, 100%, 68%)"]]}}},{"id":"road-rail","type":"line","metadata":{"mapbox:group":"1444855786460.0557"},"source":"composite","source-layer":"road","minzoom":13,"filter":["all",["==","$type","LineString"],["all",["in","class","major_rail","minor_rail"],["!in","structure","bridge","tunnel"]]],"layout":{"line-join":"round"},"paint":{"line-color":{"stops":[[13,"hsl(50, 17%, 82%)"],[16,"hsl(230, 10%, 74%)"]]},"line-width":{"base":1.5,"stops":[[14,0.5],[20,1]]}}},{"id":"road-rail-tracks","metadata":{"mapbox:group":"1444855786460.0557"},"ref":"road-rail","paint":{"line-color":{"stops":[[13,"hsl(50, 17%, 82%)"],[16,"hsl(230, 10%, 74%)"]]},"line-width":{"base":1.5,"stops":[[14,4],[20,8]]},"line-dasharray":[0.1,15],"line-opacity":{"base":1,"stops":[[13.75,0],[14,1]]}}},{"id":"level-crossings","type":"symbol","metadata":{"mapbox:group":"1444855786460.0557"},"source":"composite","source-layer":"road","minzoom":16,"filter":["all",["==","$type","Point"],["==","class","level_crossing"]],"layout":{"icon-size":1,"icon-image":"level-crossing","icon-allow-overlap":true},"paint":{}},{"id":"road-oneway-arrows-white","type":"symbol","metadata":{"mapbox:group":"1444855786460.0557"},"source":"composite","source-layer":"road","minzoom":16,"filter":["all",["==","$type","LineString"],["all",["in","class","link","motorway","motorway_link","trunk"],["==","oneway","true"],["!in","structure","bridge","tunnel"],["!in","type","primary_link","secondary_link","tertiary_link"]]],"layout":{"symbol-placement":"line","icon-image":{"base":1,"stops":[[16,"oneway-white-small"],[17,"oneway-white-large"]]},"icon-padding":2,"symbol-spacing":200},"paint":{}},{"id":"turning-features","type":"symbol","metadata":{"mapbox:group":"1444855786460.0557"},"source":"composite","source-layer":"road","minzoom":15,"filter":["all",["==","$type","Point"],["in","class","turning_circle","turning_loop"]],"layout":{"icon-image":"turning-circle","icon-size":{"base":1.5,"stops":[[14,0.095],[18,1]]},"icon-allow-overlap":true,"icon-ignore-placement":true,"icon-padding":0,"icon-rotation-alignment":"map"},"paint":{}},{"id":"bridge-path-bg","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","filter":["all",["==","$type","LineString"],["all",["==","class","path"],["==","structure","bridge"],["!=","type","steps"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[15,2],[18,7]]},"line-dasharray":[1,0],"line-color":"hsl(230, 17%, 82%)","line-blur":0,"line-opacity":{"base":1,"stops":[[15,0],[15.25,1]]}}},{"id":"bridge-steps-bg","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","filter":["all",["==","$type","LineString"],["all",["==","structure","bridge"],["==","type","steps"]]],"layout":{"line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[15,2],[17,4.6],[18,7]]},"line-color":"hsl(230, 17%, 82%)","line-dasharray":[1,0],"line-opacity":{"base":1,"stops":[[14,0],[14.25,0.75]]}}},{"id":"bridge-pedestrian-case","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","minzoom":13,"filter":["all",["==","$type","LineString"],["all",["==","class","pedestrian"],["==","structure","bridge"]]],"layout":{"line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[14,2],[18,14.5]]},"line-color":"hsl(230, 24%, 87%)","line-gap-width":0,"line-opacity":{"base":1,"stops":[[13.99,0],[14,1]]}}},{"id":"bridge-street-low","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","minzoom":11,"filter":["all",["==","$type","LineString"],["all",["==","class","street"],["==","structure","bridge"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[12.5,0.5],[14,2],[18,18]]},"line-color":"hsl(0, 0%, 100%)","line-opacity":{"stops":[[11.5,0],[12,1],[14,1],[14.01,0]]}}},{"id":"bridge-street_limited-low","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","minzoom":11,"filter":["all",["==","$type","LineString"],["all",["==","class","street_limited"],["==","structure","bridge"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[12.5,0.5],[14,2],[18,18]]},"line-color":"hsl(0, 0%, 100%)","line-opacity":{"stops":[[11.5,0],[12,1],[14,1],[14.01,0]]}}},{"id":"bridge-service-link-track-case","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","minzoom":14,"filter":["all",["==","$type","LineString"],["all",["in","class","link","service","track"],["==","structure","bridge"],["!=","type","trunk_link"]]],"layout":{"line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[12,0.75],[20,2]]},"line-color":"hsl(230, 24%, 87%)","line-gap-width":{"base":1.5,"stops":[[14,0.5],[18,12]]}}},{"id":"bridge-street_limited-case","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","minzoom":11,"filter":["all",["==","$type","LineString"],["all",["==","class","street_limited"],["==","structure","bridge"]]],"layout":{"line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[12,0.75],[20,2]]},"line-color":"hsl(230, 24%, 87%)","line-gap-width":{"base":1.5,"stops":[[13,0],[14,2],[18,18]]}}},{"id":"bridge-street-case","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","minzoom":11,"filter":["all",["==","$type","LineString"],["all",["==","class","street"],["==","structure","bridge"]]],"layout":{"line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[12,0.75],[20,2]]},"line-color":"hsl(230, 24%, 87%)","line-opacity":{"base":1,"stops":[[13.99,0],[14,1]]},"line-gap-width":{"base":1.5,"stops":[[13,0],[14,2],[18,18]]}}},{"id":"bridge-secondary-tertiary-case","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","filter":["all",["==","$type","LineString"],["all",["in","class","secondary","tertiary"],["==","structure","bridge"]]],"layout":{"line-join":"round"},"paint":{"line-width":{"base":1.2,"stops":[[10,0.75],[18,2]]},"line-color":"hsl(230, 24%, 87%)","line-gap-width":{"base":1.5,"stops":[[8.5,0.5],[10,0.75],[18,26]]},"line-translate":[0,0]}},{"id":"bridge-primary-case","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","filter":["all",["==","$type","LineString"],["all",["==","class","primary"],["==","structure","bridge"]]],"layout":{"line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[10,1],[16,2]]},"line-color":"hsl(230, 24%, 87%)","line-gap-width":{"base":1.5,"stops":[[5,0.75],[18,32]]},"line-translate":[0,0]}},{"id":"bridge-trunk_link-case","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","minzoom":13,"filter":["all",["==","$type","LineString"],["all",["!in","layer",2,3,4,5],["==","structure","bridge"],["==","type","trunk_link"]]],"layout":{"line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[12,0.75],[20,2]]},"line-color":"hsl(0, 0%, 100%)","line-gap-width":{"base":1.5,"stops":[[12,0.5],[14,2],[18,18]]},"line-opacity":{"base":1,"stops":[[10.99,0],[11,1]]}}},{"id":"bridge-motorway_link-case","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","minzoom":13,"filter":["all",["==","$type","LineString"],["all",["==","class","motorway_link"],["!in","layer",2,3,4,5],["==","structure","bridge"]]],"layout":{"line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[12,0.75],[20,2]]},"line-color":"hsl(0, 0%, 100%)","line-gap-width":{"base":1.5,"stops":[[12,0.5],[14,2],[18,18]]},"line-opacity":1}},{"id":"bridge-trunk-case","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","filter":["all",["==","$type","LineString"],["all",["==","class","trunk"],["!in","layer",2,3,4,5],["==","structure","bridge"]]],"layout":{"line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[10,1],[16,2]]},"line-color":"hsl(0, 0%, 100%)","line-gap-width":{"base":1.5,"stops":[[5,0.75],[18,32]]}}},{"id":"bridge-motorway-case","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","filter":["all",["==","$type","LineString"],["all",["==","class","motorway"],["!in","layer",2,3,4,5],["==","structure","bridge"]]],"layout":{"line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[10,1],[16,2]]},"line-color":"hsl(0, 0%, 100%)","line-gap-width":{"base":1.5,"stops":[[5,0.75],[18,32]]}}},{"id":"bridge-construction","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","minzoom":14,"filter":["all",["==","$type","LineString"],["all",["==","class","construction"],["==","structure","bridge"]]],"layout":{"line-join":"miter"},"paint":{"line-width":{"base":1.5,"stops":[[12.5,0.5],[14,2],[18,18]]},"line-color":"hsl(230, 24%, 87%)","line-opacity":{"base":1,"stops":[[13.99,0],[14,1]]},"line-dasharray":{"base":1,"stops":[[14,[0.4,0.8]],[15,[0.3,0.6]],[16,[0.2,0.3]],[17,[0.2,0.25]],[18,[0.15,0.15]]]}}},{"id":"bridge-path","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","filter":["all",["==","$type","LineString"],["all",["==","class","path"],["==","structure","bridge"],["!=","type","steps"]]],"layout":{"line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[15,1],[18,4]]},"line-color":"hsl(0, 0%, 100%)","line-dasharray":{"base":1,"stops":[[14,[1,0]],[15,[1.75,1]],[16,[1,0.75]],[17,[1,0.5]]]},"line-opacity":{"base":1,"stops":[[14,0],[14.25,1]]}}},{"id":"bridge-steps","metadata":{"mapbox:group":"1444855799204.86"},"ref":"bridge-steps-bg","paint":{"line-width":{"base":1.5,"stops":[[15,1],[16,1.6],[18,6]]},"line-color":"hsl(0, 0%, 100%)","line-dasharray":{"base":1,"stops":[[14,[1,0]],[15,[1.75,1]],[16,[1,0.75]],[17,[0.3,0.3]]]},"line-opacity":{"base":1,"stops":[[14,0],[14.25,1]]}}},{"id":"bridge-trunk_link","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","minzoom":13,"filter":["all",["==","$type","LineString"],["all",["!in","layer",2,3,4,5],["==","structure","bridge"],["==","type","trunk_link"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[12,0.5],[14,2],[18,18]]},"line-color":"hsl(46, 85%, 67%)"}},{"id":"bridge-motorway_link","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","minzoom":13,"filter":["all",["==","$type","LineString"],["all",["==","class","motorway_link"],["!in","layer",2,3,4,5],["==","structure","bridge"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[12,0.5],[14,2],[18,18]]},"line-color":"hsl(26, 100%, 68%)"}},{"id":"bridge-pedestrian","metadata":{"mapbox:group":"1444855799204.86"},"ref":"bridge-pedestrian-case","paint":{"line-width":{"base":1.5,"stops":[[14,0.5],[18,12]]},"line-color":"hsl(0, 0%, 100%)","line-opacity":1,"line-dasharray":{"base":1,"stops":[[14,[1,0]],[15,[1.5,0.4]],[16,[1,0.2]]]}}},{"id":"bridge-service-link-track","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","minzoom":14,"filter":["all",["==","$type","LineString"],["all",["in","class","link","service","track"],["==","structure","bridge"],["!=","type","trunk_link"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[14,0.5],[18,12]]},"line-color":"hsl(0, 0%, 100%)"}},{"id":"bridge-street_limited","metadata":{"mapbox:group":"1444855799204.86"},"ref":"bridge-street_limited-low","paint":{"line-width":{"base":1.5,"stops":[[12.5,0.5],[14,2],[18,18]]},"line-color":"hsl(35, 14%, 93%)","line-opacity":{"base":1,"stops":[[13.99,0],[14,1]]}}},{"id":"bridge-street","metadata":{"mapbox:group":"1444855799204.86"},"ref":"bridge-street-low","paint":{"line-width":{"base":1.5,"stops":[[12.5,0.5],[14,2],[18,18]]},"line-color":"hsl(0, 0%, 100%)","line-opacity":{"base":1,"stops":[[13.99,0],[14,1]]}}},{"id":"bridge-secondary-tertiary","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","filter":["all",["==","$type","LineString"],["all",["==","structure","bridge"],["in","type","secondary","tertiary"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[8.5,0.5],[10,0.75],[18,26]]},"line-color":"hsl(0, 0%, 100%)","line-opacity":{"base":1.2,"stops":[[5,0],[5.5,1]]}}},{"id":"bridge-primary","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","filter":["all",["==","$type","LineString"],["all",["==","structure","bridge"],["==","type","primary"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[5,0.75],[18,32]]},"line-color":"hsl(0, 0%, 100%)","line-opacity":1}},{"id":"bridge-oneway-arrows-blue-minor","type":"symbol","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","minzoom":16,"filter":["all",["==","$type","LineString"],["all",["in","class","link","path","pedestrian","service","track"],["==","oneway","true"],["==","structure","bridge"]]],"layout":{"symbol-placement":"line","icon-image":{"base":1,"stops":[[17,"oneway-small"],[18,"oneway-large"]]},"symbol-spacing":200,"icon-rotation-alignment":"map","icon-padding":2},"paint":{}},{"id":"bridge-oneway-arrows-blue-major","type":"symbol","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","minzoom":15,"filter":["all",["==","$type","LineString"],["all",["in","class","primary","secondary","street","street_limited","tertiary"],["==","oneway","true"],["==","structure","bridge"]]],"layout":{"symbol-placement":"line","icon-image":{"base":1,"stops":[[16,"oneway-small"],[17,"oneway-large"]]},"symbol-spacing":200,"icon-rotation-alignment":"map","icon-padding":2},"paint":{}},{"id":"bridge-trunk","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","filter":["all",["==","$type","LineString"],["all",["==","class","trunk"],["!in","layer",2,3,4,5],["==","structure","bridge"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[5,0.75],[18,32]]},"line-color":"hsl(46, 85%, 67%)"}},{"id":"bridge-motorway","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","filter":["all",["==","$type","LineString"],["all",["==","class","motorway"],["!in","layer",2,3,4,5],["==","structure","bridge"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[5,0.75],[18,32]]},"line-color":"hsl(26, 100%, 68%)"}},{"id":"bridge-rail","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","minzoom":13,"filter":["all",["==","$type","LineString"],["all",["in","class","major_rail","minor_rail"],["==","structure","bridge"]]],"layout":{"line-join":"round"},"paint":{"line-color":{"stops":[[13,"hsl(50, 17%, 82%)"],[16,"hsl(230, 10%, 74%)"]]},"line-width":{"base":1.5,"stops":[[14,0.5],[20,1]]}}},{"id":"bridge-rail-tracks","metadata":{"mapbox:group":"1444855799204.86"},"ref":"bridge-rail","paint":{"line-color":{"stops":[[13,"hsl(50, 17%, 82%)"],[16,"hsl(230, 10%, 74%)"]]},"line-width":{"base":1.5,"stops":[[14,4],[20,8]]},"line-dasharray":[0.1,15],"line-opacity":{"base":1,"stops":[[13.75,0],[20,1]]}}},{"id":"bridge-trunk_link-2-case","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","minzoom":13,"filter":["all",["==","$type","LineString"],["all",[">=","layer",2],["==","structure","bridge"],["==","type","trunk_link"]]],"layout":{"line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[12,0.75],[20,2]]},"line-color":"hsl(0, 0%, 100%)","line-gap-width":{"base":1.5,"stops":[[12,0.5],[14,2],[18,18]]},"line-opacity":{"base":1,"stops":[[10.99,0],[11,1]]}}},{"id":"bridge-motorway_link-2-case","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","minzoom":13,"filter":["all",["==","$type","LineString"],["all",["==","class","motorway_link"],[">=","layer",2],["==","structure","bridge"]]],"layout":{"line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[12,0.75],[20,2]]},"line-color":"hsl(0, 0%, 100%)","line-gap-width":{"base":1.5,"stops":[[12,0.5],[14,2],[18,18]]},"line-opacity":1}},{"id":"bridge-trunk-2-case","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","filter":["all",["==","$type","LineString"],["all",["==","class","trunk"],[">=","layer",2],["==","structure","bridge"]]],"layout":{"line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[10,1],[16,2]]},"line-color":"hsl(0, 0%, 100%)","line-gap-width":{"base":1.5,"stops":[[5,0.75],[18,32]]}}},{"id":"bridge-motorway-2-case","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","filter":["all",["==","$type","LineString"],["all",["==","class","motorway"],[">=","layer",2],["==","structure","bridge"]]],"layout":{"line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[10,1],[16,2]]},"line-color":"hsl(0, 0%, 100%)","line-gap-width":{"base":1.5,"stops":[[5,0.75],[18,32]]}}},{"id":"bridge-trunk_link-2","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","minzoom":13,"filter":["all",["==","$type","LineString"],["all",[">=","layer",2],["==","structure","bridge"],["==","type","trunk_link"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[12,0.5],[14,2],[18,18]]},"line-color":"hsl(46, 85%, 67%)"}},{"id":"bridge-motorway_link-2","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","minzoom":13,"filter":["all",["==","$type","LineString"],["all",["==","class","motorway_link"],[">=","layer",2],["==","structure","bridge"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[12,0.5],[14,2],[18,18]]},"line-color":"hsl(26, 100%, 68%)"}},{"id":"bridge-trunk-2","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","filter":["all",["==","$type","LineString"],["all",["==","class","trunk"],[">=","layer",2],["==","structure","bridge"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[5,0.75],[18,32]]},"line-color":"hsl(46, 85%, 67%)"}},{"id":"bridge-motorway-2","type":"line","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","filter":["all",["==","$type","LineString"],["all",["==","class","motorway"],[">=","layer",2],["==","structure","bridge"]]],"layout":{"line-cap":"round","line-join":"round"},"paint":{"line-width":{"base":1.5,"stops":[[5,0.75],[18,32]]},"line-color":"hsl(26, 100%, 68%)"}},{"id":"bridge-oneway-arrows-white","type":"symbol","metadata":{"mapbox:group":"1444855799204.86"},"source":"composite","source-layer":"road","minzoom":16,"filter":["all",["==","$type","LineString"],["all",["in","class","link","motorway","motorway_link","trunk"],["==","oneway","true"],["==","structure","bridge"],["!in","type","primary_link","secondary_link","tertiary_link"]]],"layout":{"symbol-placement":"line","icon-image":{"base":1,"stops":[[16,"oneway-white-small"],[17,"oneway-white-large"]]},"symbol-spacing":200,"icon-padding":2},"paint":{}},{"id":"aerialway","type":"line","source":"composite","source-layer":"road","minzoom":13,"filter":["all",["==","$type","LineString"],["==","class","aerialway"]],"layout":{"line-join":"round"},"paint":{"line-color":"hsl(230, 10%, 74%)","line-width":{"base":1.5,"stops":[[14,0.5],[20,1]]}}},{"id":"admin-3-4-boundaries-bg","type":"line","metadata":{"mapbox:group":"1444934295202.7542"},"source":"composite","source-layer":"admin","filter":["all",[">=","admin_level",3],["==","maritime",0]],"layout":{"line-join":"bevel"},"paint":{"line-color":{"base":1,"stops":[[8,"hsl(35, 12%, 89%)"],[16,"hsl(230, 49%, 90%)"]]},"line-width":{"base":1,"stops":[[7,3.75],[12,5.5]]},"line-opacity":{"base":1,"stops":[[7,0],[8,0.75]]},"line-dasharray":[1,0],"line-translate":[0,0],"line-blur":{"base":1,"stops":[[3,0],[8,3]]}}},{"id":"admin-2-boundaries-bg","type":"line","metadata":{"mapbox:group":"1444934295202.7542"},"source":"composite","source-layer":"admin","minzoom":1,"filter":["all",["==","admin_level",2],["==","maritime",0]],"layout":{"line-join":"miter"},"paint":{"line-width":{"base":1,"stops":[[3,3.5],[10,8]]},"line-color":{"base":1,"stops":[[6,"hsl(35, 12%, 89%)"],[8,"hsl(230, 49%, 90%)"]]},"line-opacity":{"base":1,"stops":[[3,0],[4,0.5]]},"line-translate":[0,0],"line-blur":{"base":1,"stops":[[3,0],[10,2]]}}},{"id":"admin-3-4-boundaries","type":"line","metadata":{"mapbox:group":"1444934295202.7542"},"source":"composite","source-layer":"admin","filter":["all",[">=","admin_level",3],["==","maritime",0]],"layout":{"line-join":"round","line-cap":"round"},"paint":{"line-dasharray":{"base":1,"stops":[[6,[2,0]],[7,[2,2,6,2]]]},"line-width":{"base":1,"stops":[[7,0.75],[12,1.5]]},"line-opacity":{"base":1,"stops":[[2,0],[3,1]]},"line-color":{"base":1,"stops":[[3,"hsl(230, 14%, 77%)"],[7,"hsl(230, 8%, 62%)"]]}}},{"id":"admin-2-boundaries","type":"line","metadata":{"mapbox:group":"1444934295202.7542"},"source":"composite","source-layer":"admin","minzoom":1,"filter":["all",["==","admin_level",2],["==","disputed",0],["==","maritime",0]],"layout":{"line-join":"round","line-cap":"round"},"paint":{"line-color":"hsl(230, 8%, 51%)","line-width":{"base":1,"stops":[[3,0.5],[10,2]]}}},{"id":"admin-2-boundaries-dispute","type":"line","metadata":{"mapbox:group":"1444934295202.7542"},"source":"composite","source-layer":"admin","minzoom":1,"filter":["all",["==","admin_level",2],["==","disputed",1],["==","maritime",0]],"layout":{"line-join":"round"},"paint":{"line-dasharray":[1.5,1.5],"line-color":"hsl(230, 8%, 51%)","line-width":{"base":1,"stops":[[3,0.5],[10,2]]}}},{"id":"housenum-label","type":"symbol","source":"composite","source-layer":"housenum_label","minzoom":17,"layout":{"text-field":"{house_num}","text-font":["DIN Offc Pro Italic","Arial Unicode MS Regular"],"text-padding":4,"text-max-width":7,"text-size":9.5},"paint":{"text-color":"hsl(35, 2%, 69%)","text-halo-color":"hsl(35, 8%, 85%)","text-halo-width":0.5,"text-halo-blur":0}},{"id":"waterway-label","type":"symbol","source":"composite","source-layer":"waterway_label","minzoom":12,"filter":["in","class","canal","river"],"layout":{"text-field":"{name_en}","text-font":["DIN Offc Pro Italic","Arial Unicode MS Regular"],"symbol-placement":"line","text-pitch-alignment":"viewport","text-max-angle":30,"text-size":{"base":1,"stops":[[13,12],[18,16]]}},"paint":{"text-halo-width":0.5,"text-halo-color":"hsl(196, 80%, 70%)","text-color":"hsl(230, 48%, 44%)","text-halo-blur":0.5}},{"id":"poi-scalerank4-l15","type":"symbol","metadata":{"mapbox:group":"1444933456003.5437"},"source":"composite","source-layer":"poi_label","minzoom":17,"filter":["all",[">=","localrank",15],["!in","maki","campsite","cemetery","dog-park","garden","golf","park","picnic-site","playground","zoo"],["==","scalerank",4]],"layout":{"text-line-height":1.1,"text-size":{"base":1,"stops":[[16,11],[20,13]]},"icon-image":"{maki}-11","text-max-angle":38,"symbol-spacing":250,"text-font":["DIN Offc Pro Medium","Arial Unicode MS Regular"],"text-padding":2,"text-offset":[0,0.65],"text-rotation-alignment":"viewport","text-anchor":"top","text-field":"{name_en}","text-letter-spacing":0.01,"text-max-width":8},"paint":{"text-color":"hsl(26, 25%, 32%)","text-halo-color":"hsl(0, 0%, 100%)","text-halo-width":0.5,"text-halo-blur":0.5}},{"id":"poi-scalerank4-l1","type":"symbol","metadata":{"mapbox:group":"1444933456003.5437"},"source":"composite","source-layer":"poi_label","minzoom":15,"filter":["all",["<=","localrank",14],["!in","maki","campsite","cemetery","dog-park","garden","golf","park","picnic-site","playground","zoo"],["==","scalerank",4]],"layout":{"text-line-height":1.1,"text-size":{"base":1,"stops":[[16,11],[20,13]]},"icon-image":"{maki}-11","text-max-angle":38,"symbol-spacing":250,"text-font":["DIN Offc Pro Medium","Arial Unicode MS Regular"],"text-padding":1,"text-offset":[0,0.65],"text-rotation-alignment":"viewport","text-anchor":"top","text-field":"{name_en}","text-letter-spacing":0.01,"text-max-width":8},"paint":{"text-color":"hsl(26, 25%, 32%)","text-halo-color":"hsl(0, 0%, 100%)","text-halo-width":0.5,"text-halo-blur":0.5}},{"id":"poi-parks_scalerank4","type":"symbol","metadata":{"mapbox:group":"1444933456003.5437"},"source":"composite","source-layer":"poi_label","minzoom":15,"filter":["all",["in","maki","campsite","cemetery","dog-park","garden","golf","park","picnic-site","playground","zoo"],["==","scalerank",4]],"layout":{"text-line-height":1.1,"text-size":{"base":1,"stops":[[16,11],[20,13]]},"icon-image":"{maki}-11","text-max-angle":38,"symbol-spacing":250,"text-font":["DIN Offc Pro Medium","Arial Unicode MS Regular"],"text-padding":1,"text-offset":[0,0.65],"text-rotation-alignment":"viewport","text-anchor":"top","text-field":"{name_en}","text-letter-spacing":0.01,"text-max-width":8},"paint":{"text-color":"hsl(100, 100%, 20%)","text-halo-color":"hsl(0, 0%, 100%)","text-halo-width":0.5,"text-halo-blur":0.5}},{"id":"poi-scalerank3","type":"symbol","metadata":{"mapbox:group":"1444933372896.5967"},"source":"composite","source-layer":"poi_label","filter":["all",["!in","maki","campsite","cemetery","dog-park","garden","golf","park","picnic-site","playground","zoo"],["==","scalerank",3]],"layout":{"text-line-height":1.1,"text-size":{"base":1,"stops":[[16,11],[20,13]]},"icon-image":"{maki}-11","text-max-angle":38,"symbol-spacing":250,"text-font":["DIN Offc Pro Medium","Arial Unicode MS Regular"],"text-padding":1,"text-offset":[0,0.65],"text-rotation-alignment":"viewport","text-anchor":"top","text-field":"{name_en}","text-letter-spacing":0.01,"text-max-width":8},"paint":{"text-color":"hsl(26, 25%, 32%)","text-halo-color":"hsl(0, 0%, 100%)","text-halo-width":0.5,"text-halo-blur":0.5}},{"id":"poi-parks-scalerank3","type":"symbol","metadata":{"mapbox:group":"1444933372896.5967"},"source":"composite","source-layer":"poi_label","filter":["all",["in","maki","campsite","cemetery","dog-park","garden","golf","park","picnic-site","playground","zoo"],["==","scalerank",3]],"layout":{"text-line-height":1.1,"text-size":{"base":1,"stops":[[16,11],[20,13]]},"icon-image":"{maki}-11","text-max-angle":38,"symbol-spacing":250,"text-font":["DIN Offc Pro Medium","Arial Unicode MS Regular"],"text-padding":2,"text-offset":[0,0.65],"text-rotation-alignment":"viewport","text-anchor":"top","text-field":"{name_en}","text-letter-spacing":0.01,"text-max-width":8},"paint":{"text-color":"hsl(100, 100%, 20%)","text-halo-color":"hsl(0, 0%, 100%)","text-halo-width":0.5,"text-halo-blur":0.5}},{"id":"road-label-small","type":"symbol","metadata":{"mapbox:group":"1444933721429.3076"},"source":"composite","source-layer":"road_label","minzoom":15,"filter":["all",["==","$type","LineString"],["!in","class","golf","link","motorway","pedestrian","primary","secondary","street","street_limited","tertiary","trunk"]],"layout":{"text-size":{"base":1,"stops":[[15,10],[20,13]]},"text-max-angle":30,"symbol-spacing":250,"text-font":["DIN Offc Pro Regular","Arial Unicode MS Regular"],"symbol-placement":"line","text-padding":1,"text-rotation-alignment":"map","text-pitch-alignment":"viewport","text-field":"{name_en}","text-letter-spacing":0.01},"paint":{"text-color":"hsl(0, 0%, 0%)","text-halo-color":"hsl(0, 0%, 100%)","text-halo-width":1.25,"text-halo-blur":1}},{"id":"road-label-medium","type":"symbol","metadata":{"mapbox:group":"1444933721429.3076"},"source":"composite","source-layer":"road_label","minzoom":11,"filter":["all",["==","$type","LineString"],["in","class","link","pedestrian","street","street_limited"]],"layout":{"text-size":{"base":1,"stops":[[11,10],[20,14]]},"text-max-angle":30,"symbol-spacing":250,"text-font":["DIN Offc Pro Regular","Arial Unicode MS Regular"],"symbol-placement":"line","text-padding":1,"text-rotation-alignment":"map","text-pitch-alignment":"viewport","text-field":"{name_en}","text-letter-spacing":0.01},"paint":{"text-color":"hsl(0, 0%, 0%)","text-halo-color":"hsl(0, 0%, 100%)","text-halo-width":1}},{"id":"road-label-large","type":"symbol","metadata":{"mapbox:group":"1444933721429.3076"},"source":"composite","source-layer":"road_label","filter":["in","class","motorway","primary","secondary","tertiary","trunk"],"layout":{"text-size":{"base":1,"stops":[[9,10],[20,16]]},"text-max-angle":30,"symbol-spacing":250,"text-font":["DIN Offc Pro Regular","Arial Unicode MS Regular"],"symbol-placement":"line","text-padding":1,"text-rotation-alignment":"map","text-pitch-alignment":"viewport","text-field":"{name_en}","text-letter-spacing":0.01},"paint":{"text-color":"hsl(0, 0%, 0%)","text-halo-color":"hsla(0, 0%, 100%, 0.75)","text-halo-width":1,"text-halo-blur":1}},{"id":"road-shields-black","type":"symbol","metadata":{"mapbox:group":"1444933575858.6992"},"source":"composite","source-layer":"road_label","filter":["all",["<=","reflen",6],["!in","shield","at-expressway","at-motorway","at-state-b","bg-motorway","bg-national","ch-main","ch-motorway","cz-motorway","cz-road","de-motorway","e-road","fi-main","gr-motorway","gr-national","hr-motorway","hr-state","hu-main","hu-motorway","nz-state","pl-expressway","pl-motorway","pl-national","ro-county","ro-motorway","ro-national","rs-motorway","rs-state-1b","se-main","si-expressway","si-motorway","sk-highway","sk-road","us-interstate","us-interstate-business","us-interstate-duplex","us-interstate-truck","za-metropolitan","za-national","za-provincial","za-regional"]],"layout":{"text-size":9,"icon-image":"{shield}-{reflen}","icon-rotation-alignment":"viewport","text-max-angle":38,"symbol-spacing":{"base":1,"stops":[[11,150],[14,200]]},"text-font":["DIN Offc Pro Bold","Arial Unicode MS Bold"],"symbol-placement":{"base":1,"stops":[[10,"point"],[11,"line"]]},"text-padding":2,"text-rotation-alignment":"viewport","text-field":"{ref}","text-letter-spacing":0.05,"icon-padding":2},"paint":{"text-color":"hsl(0, 0%, 7%)","icon-halo-color":"rgba(0, 0, 0, 1)","icon-halo-width":1,"text-opacity":1,"icon-color":"white","text-halo-color":"hsl(0, 0%, 100%)","text-halo-width":0}},{"id":"road-shields-white","type":"symbol","metadata":{"mapbox:group":"1444933575858.6992"},"source":"composite","source-layer":"road_label","filter":["all",["<=","reflen",6],["in","shield","at-expressway","at-motorway","at-state-b","bg-motorway","bg-national","ch-main","ch-motorway","cz-motorway","cz-road","de-motorway","e-road","fi-main","gr-motorway","gr-national","hr-motorway","hr-state","hu-main","hu-motorway","nz-state","pl-expressway","pl-motorway","pl-national","ro-county","ro-motorway","ro-national","rs-motorway","rs-state-1b","se-main","si-expressway","si-motorway","sk-highway","sk-road","us-interstate","us-interstate-business","us-interstate-duplex","us-interstate-truck","za-metropolitan","za-national","za-provincial","za-regional"]],"layout":{"text-size":9,"icon-image":"{shield}-{reflen}","icon-rotation-alignment":"viewport","text-max-angle":38,"symbol-spacing":{"base":1,"stops":[[11,150],[14,200]]},"text-font":["DIN Offc Pro Bold","Arial Unicode MS Bold"],"symbol-placement":{"base":1,"stops":[[10,"point"],[11,"line"]]},"text-padding":2,"text-rotation-alignment":"viewport","text-field":"{ref}","text-letter-spacing":0.05,"icon-padding":2},"paint":{"text-color":"hsl(0, 0%, 100%)","icon-halo-color":"rgba(0, 0, 0, 1)","icon-halo-width":1,"text-opacity":1,"icon-color":"white","text-halo-color":"hsl(0, 0%, 100%)","text-halo-width":0}},{"id":"motorway-junction","type":"symbol","metadata":{"mapbox:group":"1444933575858.6992"},"source":"composite","source-layer":"motorway_junction","minzoom":14,"filter":["all",[">","reflen",0],["<=","reflen",9]],"layout":{"text-field":"{ref}","text-size":9,"icon-image":"motorway-exit-{reflen}","text-font":["DIN Offc Pro Bold","Arial Unicode MS Bold"]},"paint":{"text-color":"hsl(0, 0%, 100%)","text-translate":[0,0]}},{"id":"poi-scalerank2","type":"symbol","metadata":{"mapbox:group":"1444933358918.2366"},"source":"composite","source-layer":"poi_label","filter":["all",["!in","maki","campsite","cemetery","dog-park","garden","golf","park","picnic-site","playground","zoo"],["==","scalerank",2]],"layout":{"text-line-height":1.1,"text-size":{"base":1,"stops":[[14,11],[20,14]]},"icon-image":{"stops":[[14,"{maki}-11"],[15,"{maki}-15"]]},"text-max-angle":38,"symbol-spacing":250,"text-font":["DIN Offc Pro Medium","Arial Unicode MS Regular"],"text-padding":2,"text-offset":[0,0.65],"text-rotation-alignment":"viewport","text-anchor":"top","text-field":"{name_en}","text-letter-spacing":0.01,"text-max-width":8},"paint":{"text-color":"hsl(26, 25%, 32%)","text-halo-color":"hsl(0, 0%, 100%)","text-halo-width":0.5,"text-halo-blur":0.5}},{"id":"poi-parks-scalerank2","type":"symbol","metadata":{"mapbox:group":"1444933358918.2366"},"source":"composite","source-layer":"poi_label","filter":["all",["in","maki","campsite","cemetery","dog-park","garden","golf","park","picnic-site","playground","zoo"],["==","scalerank",2]],"layout":{"text-line-height":1.1,"text-size":{"base":1,"stops":[[14,11],[20,14]]},"icon-image":{"stops":[[14,"{maki}-11"],[15,"{maki}-15"]]},"text-max-angle":38,"symbol-spacing":250,"text-font":["DIN Offc Pro Medium","Arial Unicode MS Regular"],"text-padding":2,"text-offset":[0,0.65],"text-rotation-alignment":"viewport","text-anchor":"top","text-field":"{name_en}","text-letter-spacing":0.01,"text-max-width":8},"paint":{"text-color":"hsl(100, 100%, 20%)","text-halo-color":"hsl(0, 0%, 100%)","text-halo-width":0.5,"text-halo-blur":0.5}},{"id":"rail-label","type":"symbol","source":"composite","source-layer":"rail_station_label","minzoom":12,"filter":["!=","maki","entrance"],"layout":{"text-line-height":1.1,"text-size":{"base":1,"stops":[[16,11],[20,13]]},"icon-image":"{network}","symbol-spacing":250,"text-font":["DIN Offc Pro Medium","Arial Unicode MS Regular"],"text-offset":[0,0.85],"text-rotation-alignment":"viewport","text-anchor":"top","text-field":{"base":1,"stops":[[0,""],[13,"{name_en}"]]},"text-letter-spacing":0.01,"icon-padding":0,"text-max-width":7},"paint":{"text-color":"hsl(230, 48%, 44%)","text-halo-color":"hsl(0, 0%, 100%)","text-halo-width":0.5,"icon-halo-width":4,"icon-halo-color":"#fff","text-opacity":{"base":1,"stops":[[13.99,0],[14,1]]},"text-halo-blur":0.5}},{"id":"water-label-sm","type":"symbol","metadata":{"mapbox:group":"1444933808272.805"},"source":"composite","source-layer":"water_label","minzoom":15,"filter":["<=","area",10000],"layout":{"text-field":"{name_en}","text-font":["DIN Offc Pro Italic","Arial Unicode MS Regular"],"text-max-width":7,"text-size":{"base":1,"stops":[[16,13],[20,16]]}},"paint":{"text-color":"hsl(230, 48%, 44%)"}},{"id":"water-label","type":"symbol","metadata":{"mapbox:group":"1444933808272.805"},"source":"composite","source-layer":"water_label","minzoom":5,"filter":[">","area",10000],"layout":{"text-field":"{name_en}","text-font":["DIN Offc Pro Italic","Arial Unicode MS Regular"],"text-max-width":7,"text-size":{"base":1,"stops":[[13,13],[18,18]]}},"paint":{"text-color":"hsl(230, 48%, 44%)"}},{"id":"place-residential","type":"symbol","source":"composite","source-layer":"place_label","maxzoom":18,"filter":["all",["in","$type","LineString","Point","Polygon"],["all",["<=","localrank",10],["==","type","residential"]]],"layout":{"text-line-height":1.2,"text-size":{"base":1,"stops":[[10,11],[18,14]]},"text-max-angle":38,"symbol-spacing":250,"text-font":["DIN Offc Pro Regular","Arial Unicode MS Regular"],"text-padding":2,"text-offset":[0,0],"text-rotation-alignment":"viewport","text-field":"{name_en}","text-max-width":7},"paint":{"text-color":"hsl(26, 25%, 32%)","text-halo-color":"hsl(0, 0%, 100%)","text-halo-width":1,"text-halo-blur":0.5}},{"id":"poi-parks-scalerank1","type":"symbol","metadata":{"mapbox:group":"1444933322393.2852"},"source":"composite","source-layer":"poi_label","filter":["all",["in","maki","campsite","cemetery","dog-park","garden","golf","park","picnic-site","playground","zoo"],["<=","scalerank",1]],"layout":{"text-line-height":1.1,"text-size":{"base":1,"stops":[[10,11],[18,14]]},"icon-image":{"stops":[[13,"{maki}-11"],[14,"{maki}-15"]]},"text-max-angle":38,"symbol-spacing":250,"text-font":["DIN Offc Pro Medium","Arial Unicode MS Regular"],"text-padding":2,"text-offset":[0,0.65],"text-rotation-alignment":"viewport","text-anchor":"top","text-field":"{name_en}","text-letter-spacing":0.01,"text-max-width":8},"paint":{"text-color":"hsl(100, 100%, 20%)","text-halo-color":"hsl(0, 0%, 100%)","text-halo-width":0.5,"text-halo-blur":0.5}},{"id":"poi-scalerank1","type":"symbol","metadata":{"mapbox:group":"1444933322393.2852"},"source":"composite","source-layer":"poi_label","filter":["all",["!in","maki","campsite","cemetery","dog-park","garden","golf","park","picnic-site","playground","zoo"],["<=","scalerank",1]],"layout":{"text-line-height":1.1,"text-size":{"base":1,"stops":[[10,11],[18,14]]},"icon-image":{"stops":[[13,"{maki}-11"],[14,"{maki}-15"]]},"text-max-angle":38,"symbol-spacing":250,"text-font":["DIN Offc Pro Medium","Arial Unicode MS Regular"],"text-padding":2,"text-offset":[0,0.65],"text-rotation-alignment":"viewport","text-anchor":"top","text-field":"{name_en}","text-letter-spacing":0.01,"text-max-width":8},"paint":{"text-color":"hsl(26, 25%, 32%)","text-halo-color":"hsl(0, 0%, 100%)","text-halo-width":0.5,"text-halo-blur":0.5}},{"id":"airport-label","type":"symbol","source":"composite","source-layer":"airport_label","minzoom":9,"filter":["<=","scalerank",2],"layout":{"text-line-height":1.1,"text-size":{"base":1,"stops":[[10,12],[18,18]]},"icon-image":{"stops":[[12,"{maki}-11"],[13,"{maki}-15"]]},"symbol-spacing":250,"text-font":["DIN Offc Pro Medium","Arial Unicode MS Regular"],"text-padding":2,"text-offset":[0,0.75],"text-rotation-alignment":"viewport","text-anchor":"top","text-field":{"stops":[[11,"{ref}"],[12,"{name_en}"]]},"text-letter-spacing":0.01,"text-max-width":9},"paint":{"text-color":"hsl(230, 48%, 44%)","text-halo-color":"hsl(0, 0%, 100%)","text-halo-width":0.5,"text-halo-blur":0.5}},{"id":"place-islet-archipelago-aboriginal","type":"symbol","source":"composite","source-layer":"place_label","maxzoom":16,"filter":["in","type","aboriginal_lands","archipelago","islet"],"layout":{"text-line-height":1.2,"text-size":{"base":1,"stops":[[10,11],[18,16]]},"text-max-angle":38,"symbol-spacing":250,"text-font":["DIN Offc Pro Regular","Arial Unicode MS Regular"],"text-padding":2,"text-offset":[0,0],"text-rotation-alignment":"viewport","text-field":"{name_en}","text-letter-spacing":0.01,"text-max-width":8},"paint":{"text-color":"hsl(230, 29%, 35%)","text-halo-color":"hsl(0, 0%, 100%)","text-halo-width":1}},{"id":"place-neighbourhood","type":"symbol","source":"composite","source-layer":"place_label","minzoom":10,"maxzoom":16,"filter":["==","type","neighbourhood"],"layout":{"text-field":"{name_en}","text-transform":"uppercase","text-letter-spacing":0.1,"text-max-width":7,"text-font":["DIN Offc Pro Regular","Arial Unicode MS Regular"],"text-padding":3,"text-size":{"base":1,"stops":[[12,11],[16,16]]}},"paint":{"text-halo-color":"hsl(0, 0%, 100%)","text-halo-width":1,"text-color":"hsl(230, 29%, 35%)","text-halo-blur":0.5}},{"id":"place-suburb","type":"symbol","source":"composite","source-layer":"place_label","minzoom":10,"maxzoom":16,"filter":["==","type","suburb"],"layout":{"text-field":"{name_en}","text-transform":"uppercase","text-font":["DIN Offc Pro Regular","Arial Unicode MS Regular"],"text-letter-spacing":0.15,"text-max-width":7,"text-padding":3,"text-size":{"base":1,"stops":[[11,11],[15,18]]}},"paint":{"text-halo-color":"hsl(0, 0%, 100%)","text-halo-width":1,"text-color":"hsl(230, 29%, 35%)","text-halo-blur":0.5}},{"id":"place-hamlet","type":"symbol","source":"composite","source-layer":"place_label","minzoom":10,"maxzoom":16,"filter":["==","type","hamlet"],"layout":{"text-field":"{name_en}","text-font":["DIN Offc Pro Regular","Arial Unicode MS Regular"],"text-size":{"base":1,"stops":[[12,11.5],[15,16]]}},"paint":{"text-halo-color":"hsl(0, 0%, 100%)","text-halo-width":1.25,"text-color":"hsl(0, 0%, 0%)"}},{"id":"place-village","type":"symbol","source":"composite","source-layer":"place_label","minzoom":8,"maxzoom":15,"filter":["==","type","village"],"layout":{"text-field":"{name_en}","text-font":["DIN Offc Pro Regular","Arial Unicode MS Regular"],"text-max-width":7,"text-size":{"base":1,"stops":[[10,11.5],[16,18]]}},"paint":{"text-halo-color":"hsl(0, 0%, 100%)","text-halo-width":1.25,"text-color":"hsl(0, 0%, 0%)"}},{"id":"place-town","type":"symbol","source":"composite","source-layer":"place_label","minzoom":6,"maxzoom":15,"filter":["==","type","town"],"layout":{"icon-image":"dot-9","text-font":{"base":1,"stops":[[11,["DIN Offc Pro Regular","Arial Unicode MS Regular"]],[12,["DIN Offc Pro Medium","Arial Unicode MS Regular"]]]},"text-offset":{"base":1,"stops":[[7,[0,-0.15]],[8,[0,0]]]},"text-anchor":{"base":1,"stops":[[7,"bottom"],[8,"center"]]},"text-field":"{name_en}","text-max-width":7,"text-size":{"base":1,"stops":[[7,11.5],[15,20]]}},"paint":{"text-color":"hsl(0, 0%, 0%)","text-halo-color":"hsl(0, 0%, 100%)","text-halo-width":1.25,"icon-opacity":{"base":1,"stops":[[7.99,1],[8,0]]}}},{"id":"place-island","type":"symbol","source":"composite","source-layer":"place_label","maxzoom":16,"filter":["==","type","island"],"layout":{"text-line-height":1.2,"text-size":{"base":1,"stops":[[10,11],[18,16]]},"text-max-angle":38,"symbol-spacing":250,"text-font":["DIN Offc Pro Regular","Arial Unicode MS Regular"],"text-padding":2,"text-offset":[0,0],"text-rotation-alignment":"viewport","text-field":"{name_en}","text-letter-spacing":0.01,"text-max-width":7},"paint":{"text-color":"hsl(230, 29%, 35%)","text-halo-color":"hsl(0, 0%, 100%)","text-halo-width":1}},{"id":"place-city-sm","type":"symbol","metadata":{"mapbox:group":"1444862510685.128"},"source":"composite","source-layer":"place_label","maxzoom":14,"filter":["all",["!in","scalerank",0,1,2,3,4,5],["==","type","city"]],"layout":{"text-size":{"base":1,"stops":[[6,12],[14,22]]},"icon-image":"dot-9","text-font":{"base":1,"stops":[[7,["DIN Offc Pro Regular","Arial Unicode MS Regular"]],[8,["DIN Offc Pro Medium","Arial Unicode MS Regular"]]]},"text-offset":{"base":1,"stops":[[7.99,[0,-0.2]],[8,[0,0]]]},"text-anchor":{"base":1,"stops":[[7,"bottom"],[8,"center"]]},"text-field":"{name_en}","text-max-width":7},"paint":{"text-color":"hsl(0, 0%, 0%)","text-halo-color":"hsl(0, 0%, 100%)","text-halo-width":1.25,"icon-opacity":{"base":1,"stops":[[7.99,1],[8,0]]}}},{"id":"place-city-md-s","type":"symbol","metadata":{"mapbox:group":"1444862510685.128"},"source":"composite","source-layer":"place_label","maxzoom":14,"filter":["all",["in","ldir","E","S","SE","SW"],["in","scalerank",3,4,5],["==","type","city"]],"layout":{"text-field":"{name_en}","icon-image":"dot-10","text-anchor":{"base":1,"stops":[[7,"top"],[8,"center"]]},"text-offset":{"base":1,"stops":[[7.99,[0,0.1]],[8,[0,0]]]},"text-font":{"base":1,"stops":[[7,["DIN Offc Pro Regular","Arial Unicode MS Regular"]],[8,["DIN Offc Pro Medium","Arial Unicode MS Regular"]]]},"text-size":{"base":0.9,"stops":[[5,12],[12,22]]}},"paint":{"text-halo-width":1,"text-halo-color":"hsl(0, 0%, 100%)","text-color":"hsl(0, 0%, 0%)","text-halo-blur":1,"icon-opacity":{"base":1,"stops":[[7.99,1],[8,0]]}}},{"id":"place-city-md-n","type":"symbol","metadata":{"mapbox:group":"1444862510685.128"},"source":"composite","source-layer":"place_label","maxzoom":14,"filter":["all",["in","ldir","N","NE","NW","W"],["in","scalerank",3,4,5],["==","type","city"]],"layout":{"icon-image":"dot-10","text-font":{"base":1,"stops":[[7,["DIN Offc Pro Regular","Arial Unicode MS Regular"]],[8,["DIN Offc Pro Medium","Arial Unicode MS Regular"]]]},"text-offset":{"base":1,"stops":[[7.99,[0,-0.25]],[8,[0,0]]]},"text-anchor":{"base":1,"stops":[[7,"bottom"],[8,"center"]]},"text-field":"{name_en}","text-max-width":7,"text-size":{"base":0.9,"stops":[[5,12],[12,22]]}},"paint":{"text-color":"hsl(0, 0%, 0%)","text-halo-color":"hsl(0, 0%, 100%)","text-halo-width":1,"icon-opacity":{"base":1,"stops":[[7.99,1],[8,0]]},"text-halo-blur":1}},{"id":"place-city-lg-s","type":"symbol","metadata":{"mapbox:group":"1444862510685.128"},"source":"composite","source-layer":"place_label","minzoom":1,"maxzoom":14,"filter":["all",["in","ldir","E","S","SE","SW"],["<=","scalerank",2],["==","type","city"]],"layout":{"icon-image":"dot-11","text-font":{"base":1,"stops":[[7,["DIN Offc Pro Regular","Arial Unicode MS Regular"]],[8,["DIN Offc Pro Medium","Arial Unicode MS Regular"]]]},"text-offset":{"base":1,"stops":[[7.99,[0,0.15]],[8,[0,0]]]},"text-anchor":{"base":1,"stops":[[7,"top"],[8,"center"]]},"text-field":"{name_en}","text-max-width":7,"text-size":{"base":0.9,"stops":[[4,12],[10,22]]}},"paint":{"text-color":"hsl(0, 0%, 0%)","text-halo-color":"hsl(0, 0%, 100%)","text-halo-width":1,"icon-opacity":{"base":1,"stops":[[7.99,1],[8,0]]},"text-halo-blur":1}},{"id":"place-city-lg-n","type":"symbol","metadata":{"mapbox:group":"1444862510685.128"},"source":"composite","source-layer":"place_label","minzoom":1,"maxzoom":14,"filter":["all",["in","ldir","N","NE","NW","W"],["<=","scalerank",2],["==","type","city"]],"layout":{"icon-image":"dot-11","text-font":{"base":1,"stops":[[7,["DIN Offc Pro Regular","Arial Unicode MS Regular"]],[8,["DIN Offc Pro Medium","Arial Unicode MS Regular"]]]},"text-offset":{"base":1,"stops":[[7.99,[0,-0.25]],[8,[0,0]]]},"text-anchor":{"base":1,"stops":[[7,"bottom"],[8,"center"]]},"text-field":"{name_en}","text-max-width":7,"text-size":{"base":0.9,"stops":[[4,12],[10,22]]}},"paint":{"text-color":"hsl(0, 0%, 0%)","text-opacity":1,"text-halo-color":"hsl(0, 0%, 100%)","text-halo-width":1,"icon-opacity":{"base":1,"stops":[[7.99,1],[8,0]]},"text-halo-blur":1}},{"id":"marine-label-sm-ln","type":"symbol","metadata":{"mapbox:group":"1444856087950.3635"},"source":"composite","source-layer":"marine_label","minzoom":3,"maxzoom":10,"filter":["all",["==","$type","LineString"],[">=","labelrank",4]],"layout":{"text-line-height":1.1,"text-size":{"base":1,"stops":[[3,12],[6,16]]},"symbol-spacing":{"base":1,"stops":[[4,100],[6,400]]},"text-font":["DIN Offc Pro Italic","Arial Unicode MS Regular"],"symbol-placement":"line","text-pitch-alignment":"viewport","text-field":"{name_en}","text-letter-spacing":0.1,"text-max-width":5},"paint":{"text-color":"hsl(205, 83%, 88%)"}},{"id":"marine-label-sm-pt","type":"symbol","metadata":{"mapbox:group":"1444856087950.3635"},"source":"composite","source-layer":"marine_label","minzoom":3,"maxzoom":10,"filter":["all",["==","$type","Point"],[">=","labelrank",4]],"layout":{"text-field":"{name_en}","text-max-width":5,"text-letter-spacing":0.1,"text-line-height":1.5,"text-font":["DIN Offc Pro Italic","Arial Unicode MS Regular"],"text-size":{"base":1,"stops":[[3,12],[6,16]]}},"paint":{"text-color":"hsl(205, 83%, 88%)"}},{"id":"marine-label-md-ln","type":"symbol","metadata":{"mapbox:group":"1444856087950.3635"},"source":"composite","source-layer":"marine_label","minzoom":2,"maxzoom":8,"filter":["all",["==","$type","LineString"],["in","labelrank",2,3]],"layout":{"text-line-height":1.1,"text-size":{"base":1.1,"stops":[[2,12],[5,20]]},"symbol-spacing":250,"text-font":["DIN Offc Pro Italic","Arial Unicode MS Regular"],"symbol-placement":"line","text-pitch-alignment":"viewport","text-field":"{name_en}","text-letter-spacing":0.15,"text-max-width":5},"paint":{"text-color":"hsl(205, 83%, 88%)"}},{"id":"marine-label-md-pt","type":"symbol","metadata":{"mapbox:group":"1444856087950.3635"},"source":"composite","source-layer":"marine_label","minzoom":2,"maxzoom":8,"filter":["all",["==","$type","Point"],["in","labelrank",2,3]],"layout":{"text-field":"{name_en}","text-max-width":5,"text-letter-spacing":0.15,"text-line-height":1.5,"text-font":["DIN Offc Pro Italic","Arial Unicode MS Regular"],"text-size":{"base":1.1,"stops":[[2,14],[5,20]]}},"paint":{"text-color":"hsl(205, 83%, 88%)"}},{"id":"marine-label-lg-ln","type":"symbol","metadata":{"mapbox:group":"1444856087950.3635"},"source":"composite","source-layer":"marine_label","minzoom":1,"maxzoom":4,"filter":["all",["==","$type","LineString"],["==","labelrank",1]],"layout":{"text-field":"{name_en}","text-max-width":4,"text-letter-spacing":0.25,"text-line-height":1.1,"symbol-placement":"line","text-pitch-alignment":"viewport","text-font":["DIN Offc Pro Italic","Arial Unicode MS Regular"],"text-size":{"base":1,"stops":[[1,14],[4,30]]}},"paint":{"text-color":"hsl(205, 83%, 88%)"}},{"id":"marine-label-lg-pt","type":"symbol","metadata":{"mapbox:group":"1444856087950.3635"},"source":"composite","source-layer":"marine_label","minzoom":1,"maxzoom":4,"filter":["all",["==","$type","Point"],["==","labelrank",1]],"layout":{"text-field":"{name_en}","text-max-width":4,"text-letter-spacing":0.25,"text-line-height":1.5,"text-font":["DIN Offc Pro Italic","Arial Unicode MS Regular"],"text-size":{"base":1,"stops":[[1,14],[4,30]]}},"paint":{"text-color":"hsl(205, 83%, 88%)"}},{"id":"state-label-sm","type":"symbol","metadata":{"mapbox:group":"1444856151690.9143"},"source":"composite","source-layer":"state_label","minzoom":3,"maxzoom":9,"filter":["<","area",20000],"layout":{"text-size":{"base":1,"stops":[[6,10],[9,14]]},"text-transform":"uppercase","text-font":["DIN Offc Pro Bold","Arial Unicode MS Bold"],"text-field":{"base":1,"stops":[[0,"{abbr}"],[6,"{name_en}"]]},"text-letter-spacing":0.15,"text-max-width":5},"paint":{"text-opacity":1,"text-color":"hsl(0, 0%, 0%)","text-halo-color":"hsl(0, 0%, 100%)","text-halo-width":1}},{"id":"state-label-md","type":"symbol","metadata":{"mapbox:group":"1444856151690.9143"},"source":"composite","source-layer":"state_label","minzoom":3,"maxzoom":8,"filter":["all",["<","area",80000],[">=","area",20000]],"layout":{"text-size":{"base":1,"stops":[[5,10],[8,16]]},"text-transform":"uppercase","text-font":["DIN Offc Pro Bold","Arial Unicode MS Bold"],"text-field":{"base":1,"stops":[[0,"{abbr}"],[5,"{name_en}"]]},"text-letter-spacing":0.15,"text-max-width":6},"paint":{"text-opacity":1,"text-color":"hsl(0, 0%, 0%)","text-halo-color":"hsl(0, 0%, 100%)","text-halo-width":1}},{"id":"state-label-lg","type":"symbol","metadata":{"mapbox:group":"1444856151690.9143"},"source":"composite","source-layer":"state_label","minzoom":3,"maxzoom":7,"filter":[">=","area",80000],"layout":{"text-size":{"base":1,"stops":[[4,10],[7,18]]},"text-transform":"uppercase","text-font":["DIN Offc Pro Bold","Arial Unicode MS Bold"],"text-padding":1,"text-field":{"base":1,"stops":[[0,"{abbr}"],[4,"{name_en}"]]},"text-letter-spacing":0.15,"text-max-width":6},"paint":{"text-opacity":1,"text-color":"hsl(0, 0%, 0%)","text-halo-color":"hsl(0, 0%, 100%)","text-halo-width":1}},{"id":"country-label-sm","type":"symbol","metadata":{"mapbox:group":"1444856144497.7825"},"source":"composite","source-layer":"country_label","minzoom":1,"maxzoom":10,"filter":[">=","scalerank",5],"layout":{"text-field":"{name_en}","text-max-width":6,"text-font":["DIN Offc Pro Medium","Arial Unicode MS Regular"],"text-size":{"base":0.9,"stops":[[5,14],[9,22]]}},"paint":{"text-color":"hsl(0, 0%, 0%)","text-halo-color":{"base":1,"stops":[[2,"rgba(255,255,255,0.75)"],[3,"hsl(0, 0%, 100%)"]]},"text-halo-width":1.25}},{"id":"country-label-md","type":"symbol","metadata":{"mapbox:group":"1444856144497.7825"},"source":"composite","source-layer":"country_label","minzoom":1,"maxzoom":8,"filter":["in","scalerank",3,4],"layout":{"text-field":{"base":1,"stops":[[0,"{code}"],[2,"{name_en}"]]},"text-max-width":6,"text-font":["DIN Offc Pro Medium","Arial Unicode MS Regular"],"text-size":{"base":1,"stops":[[3,10],[8,24]]}},"paint":{"text-color":"hsl(0, 0%, 0%)","text-halo-color":{"base":1,"stops":[[2,"rgba(255,255,255,0.75)"],[3,"hsl(0, 0%, 100%)"]]},"text-halo-width":1.25}},{"id":"country-label-lg","type":"symbol","metadata":{"mapbox:group":"1444856144497.7825"},"source":"composite","source-layer":"country_label","minzoom":1,"maxzoom":7,"filter":["in","scalerank",1,2],"layout":{"text-field":"{name_en}","text-max-width":{"base":1,"stops":[[0,5],[3,6]]},"text-font":["DIN Offc Pro Medium","Arial Unicode MS Regular"],"text-size":{"base":1,"stops":[[1,10],[6,24]]}},"paint":{"text-color":"hsl(0, 0%, 0%)","text-halo-color":{"base":1,"stops":[[2,"rgba(255,255,255,0.75)"],[3,"hsl(0, 0%, 100%)"]]},"text-halo-width":1.25}}],"created":0,"modified":0,"owner":"mapbox","id":"streets-v10","draft":false},

					// 		token: "pk.eyJ1Ijoic2dvZWxsbmVyIiwiYSI6ImNqN3Z2NzNjczRwYXQyd3Q1Znd5NHUxcXEifQ.sCDebhw6O866Yo3Yf1kkfA"
					// }).addTo(map);


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



					function updateListMarkers(){

						// var items_to_be_left_on_the_map	= 	markers.getLayers()
						// 									.filter(function(marker){ 
						// 										if(list.indexOf(marker.options.item) != -1){
						// 											return true
						// 										} else {
						// 											markers.removeLayer(marker)
						// 											return false
						// 										}
						// 									})
						// 									.map(function(marker){
						// 										return marker.options.item
						// 									}),
						// 	additional_items			=	list
						// 									.filter(function(item){
						// 										return 		hasValidGeoCoordinates(item)
						// 												&&	items_to_be_left_on_the_map.indexOf(item) == -1
						// 									})

						// if(
						// 		icSite.activeItem 
						// 	&&	hasValidGeoCoordinates(icSite.activeItem)
						// 	&&	list.indexOf(icSite.activeItem) == -1
						// ){
						// 	additional_items.push(icSite.activeItem)
						// }

						markers.clearLayers()

						var	additional_items	=	icItemStorage.filteredList
													.filter(hasValidGeoCoordinates)

						markers.addLayers(additional_items.map(icMainMap.getMarker))

						// map.eachLayer(function(layer){
						// 	if(layer.getChildCount && layer.scope){
						// 		icMapMarkerDigestQueue.add(layer.scope, layer._childCount)
						// 	}
						// })


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
							markers.addLayer(icMainMap.getMarker(icSite.activeItem))
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


					updateListMarkers()


					var	stop_watching_filteredList = $rootScope.$watchCollection(
							function(){ 
								return icItemStorage.filteredList	
							},
							function(new_list, old_list){

								if(new_list.length == old_list.length){
									var check = {}
									for(var i = 0; i < new_list.length; i++){
										check[new_list[i].id] = true
										check[old_list[i].id] = true
									}
									if(Object.keys(check).length == new_list.length) return null
								}

								!scope.waiting && scope.loading++
								scope.waiting = true	
								

								icUtils.schedule('updateListMarkers', updateListMarkers, 300, true)
								.finally(function(){
									scope.loading--
									scope.waiting = false
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