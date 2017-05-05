"use strict";

(function(){
	if(!window.dpd) 							console.error('icItemStorage: missing dpd. Please load dpd.js.')
	if(!(window.ic && window.ic.itemConfig)) 	console.error('icItemStorage: missing ic.itemConfig. Please load item_config.js.')
	if(!(window.ic && window.ic.Item)) 			console.error('icItemStorage: missing ic.Item. Please load ic-item-dpd.js.')


	function IcItemStorage(){

		//Todo: make all functione async?
		

		var icItemStorage = this

		icItemStorage.data 				= []
		icItemStorage.filters 			= {}
		icItemStorage.sortingCriteria	= {}
		icItemStorage.filteredList		= []
		icItemStorage.subMatches			= {}


		icItemStorage.storeItem = function(item_data){

			var item = icItemStorage.data.filter(function(item){ return item.id == item_data.id })[0]

			item 
			?	item.importData(item_data)
			:	icItemStorage.data.push(item = new ic.Item(item_data))

			item.internal 				= item.internal || {}
			item.internal.tags 			= item.internal.tags || []
			item.internal.sortingValues = item.internal.sortingValues || {}

			return item
		}

		icItemStorage.clearFilteredList = function(){
			while(icItemStorage.filteredList.length) icItemStorage.filteredList.pop()

			ic.itemConfig.tags
			.forEach(function(tag){ 
				icItemStorage.subMatches[tag] = 0
			})

			Object.keys(icItemStorage.filters)
			.forEach(function(filter_name){ 
				icItemStorage.subMatches[filter_name] = 0
			})

			return this
		}

		//Todo item changes
		icItemStorage.registerFilter = function(filter_name, match_fn){

			filter_name = String(filter_name)

			if(filter_name.match(/[^a-zA-Z0-9]/))			console.error('icItemStorage: filter names must contain only letters or numbers, A-Z, a-z, 0-9: '+filter_name+'.')
			if(icItemStorage.filters[filter_name]) 			console.error('icItemStorage: filter already registered: '+filter_name+'.')
			ic.itemConfig.tags.forEach(function(tag){ 
				if(tag == filter_name) 						console.error('icItemStorage: filter names must be different from tags: "'+filter_name+'"')
			})
			
			icItemStorage.filters[filter_name] = match_fn
			icItemStorage.data.forEach(function(item){
				if(match_fn(item)) item.internal.tags.push(filter_name)
			})

			return this
		}

		//Todo item changes
		icItemStorage.registerSortingCriterium = function(criterium_name, compare_fn){


			if(criterium_name.match(/[^a-zA-Z]/))		console.error('icItemStorage: sort criteria names must contain only letters, A-Z, a-z: '+criterium_name+'.')
			if(icItemStorage.sortingCriteria[criterium_name]) 	console.error('icItemStorage: sort criterium name already registered: '+criterium_name+'.')

			icItemStorage.sortingCriteria[criterium_name] =	compare_fn

		
			
			icItemStorage.data
			.sort(compare_fn)
			.forEach(function(item, index){
				item.internal.sortingValues[criterium_name]	= index
			})

			return this
		}


		icItemStorage.updateFilteredList = function(cod_tags){ //conjunction of disjunctions of tags [[tag1, tag2], [tag3]]
			
			if(!cod_tags) cod_tags = []

			//normalize cod_tags
			if(typeof cod_tags == 'string') cod_tags = [cod_tags]
			cod_tags.forEach(function(disjunction, index){
				if(typeof disjunction == 'string') cod_tags[index] = [disjunction]
			})
			

			icItemStorage.clearFilteredList()

			icItemStorage.data.forEach(function(item){

				item.internal.tags 	= item.internal.tags || []
			

				// check if item does NOT match the filter:
				if(cod_tags.some(function(disjunction){
					return disjunction.every(function(tag){
						return item.tags.indexOf(tag) == -1 && item.internal.tags.indexOf(tag) == -1
					})
				})) return null  

				//add to filtered list:
				icItemStorage.filteredList.push(item)

				//count submatches for tags:
				ic.itemConfig.tags.forEach(function(tag){
					if(item.tags.indexOf(tag) !=-1) icItemStorage.subMatches[tag] ++
				})

				//count submatches for internal tags:
				Object.keys(icItemStorage.filters).forEach(function(tag){
					if(item.internal.tags.indexOf(tag) !=-1) icItemStorage.subMatches[tag] ++
				})
			})

			return icItemStorage
		}

		icItemStorage.sortFilteredList = function(criterium){
			if(!icItemStorage.sortingCriteria[criterium]) console.error('icItemStorage: unknown sorting criterium: '+ criterium)
			icItemStorage.filteredList.sort(function(item_1, item_2){

				if(item_1.internal.sortingValue[criterium] === undefined || item_2.internal.sortingValue[criterium] === undefined) return icItemStorage.sortingCriteria[criterium](item_1, item_2)
				if(item_1.internal.sortingValue[criterium] > item_2.internal.sortingValue[criterium]) return 1
				if(item_1.internal.sortingValue[criterium] < item_2.internal.sortingValue[criterium]) return -1
				
				return 1

			})
		}

		icItemStorage.getItem = function(id){
			var item = icItemStorage.data.filter(function(item){ return item.id == id})[0] 

			if(!item){
				item = icItemStorage.storeItem({id: id})
				item.preliminary = true
			}

			return 	item.download()
					.then(
						function(){
							item.preliminary = false
							return item
						},
						function(reason){
							console.error('icItemStorage.getItem: update failed.', reason)
							return Promise.reject(reason)
						}
					)
		}

		icItemStorage.downloadAll = function(){
			return 	dpd(ic.itemConfig.collectionName).get()
					.then(
						function(data){
							data.forEach(function(item_data){
								icItemStorage.storeItem(item_data)
							}) 
						},
						function(reason){
							console.error('icItemStorage: unable to load items: '+reason)
							return Promise.reject(reason)
						}
					)
		}

		var searchTerms = []

		icItemStorage.search = function(search_term){


			search_term = search_term.replace(/\s+/,'&')

			console.log('search!!', search_term)

			var index = searchTerms.indexOf(search_term)

			if(index == -1){

				searchTerms.push(search_term)
				index = searchTerms.length-1

				var regex 					= 	new RegExp(search_term),
					searchable_properties 	= 	ic.itemConfig.properties.filter(function(property){
													return property.searchable
												})

				icItemStorage.registerFilter('search'+index, function(item){
					return	searchable_properties.some(function(property){
								switch(property.type){
									case "array": 
										return item[property.name].some(function(sub){ return sub.match(regex)})
									break 

									case "object": 
										return Object.keys(item[property.name]).some(function(key){ return item[property.name][key].match(regex) })
									break 

									default:
										return String(item[property.name]).match(regex)
									break
								}
							})
				}) 			
			}

			icItemStorage.updateFilteredList('search'+index)

			return icItemStorage
		}

	}

	ic.itemStorage = new IcItemStorage()

}())