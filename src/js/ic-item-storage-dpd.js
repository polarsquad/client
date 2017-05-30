"use strict";

(function(){
	if(!window.dpd) 							console.error('icItemStorage: missing dpd. Please load dpd.js.')
	if(!(window.ic && window.ic.itemConfig)) 	console.error('icItemStorage: missing ic.itemConfig. Please load ic-item-config.js.')
	if(!(window.ic && window.ic.Item)) 			console.error('icItemStorage: missing ic.Item. Please load ic-item-dpd.js.')


	function IcItemStorage(){

		//Todo: make all functione async?
		

		var icItemStorage = this

		icItemStorage.data 				= []
		icItemStorage.filters 			= {}
		icItemStorage.sortingCriteria	= {}
		icItemStorage.filteredList		= []
		icItemStorage.subMatches		= {}
		icItemStorage.altMatches		= {}

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

			Object.keys(icItemStorage.subMatches).forEach(function(key){delete icItemStorage.subMatches[key] })
			Object.keys(icItemStorage.altMatches).forEach(function(key){delete icItemStorage.altMatches[key] })
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


		icItemStorage.updateFilteredList = function(tag_groups, alt_groups){ //groups of tags of tags [[tag1, tag2], [tag3]]
			
			if(!tag_groups) 	tag_groups 	= []
			if(!alt_groups)		alt_groups 	= []

			//normalize tag_groups
			if(typeof tag_groups == 'string') tag_groups = [tag_groups]

			tag_groups.forEach(function(tag_group, index){
				if(typeof tag_group 			== 'string') 	tag_groups[index] 	= [tag_group]
				if(!tag_group)									tag_groups[index] 	= []
				if(typeof alt_groups[index] 	== 'string')	alt_groups[index] 	= [alt_groups[index]]
				if(!alt_groups[index])							alt_groups[index] 	= []
			})
			

			icItemStorage.clearFilteredList()

			icItemStorage.data.forEach(function(item){


				item.internal.tags 	= item.internal.tags || []

				var match 				= true,
					tag_group_matches 	= [],
					alt_group_matches 	= [],
					combined_tags		= item.tags.concat(item.internal.tags)

				tag_groups.forEach(function(tag_group, index){
					tag_group_matches[index] = tag_group.every(function(tag){ 
						return combined_tags.indexOf(tag) != -1
					})
				})


				var failed_groups = []

				tag_group_matches.forEach(function(tag_group_match, index){ if(!tag_group_match) failed_groups.push(index) })

				if(failed_groups.length > 1) return null
				//item failed at most one tag group:


				//count alt_matches for tags:
				combined_tags.forEach(function(tag){
					if(failed_groups.length == 0 || alt_groups[failed_groups[0]].indexOf(tag) != -1)
						icItemStorage.altMatches[tag] =  (icItemStorage.altMatches[tag]||0)+1
				})


				if(failed_groups.length > 0 ) return null
				// item failed no tag group:

				//add to filtered list:
				icItemStorage.filteredList.push(item)

				//count submatches for tags
				combined_tags.forEach(function(tag){
					icItemStorage.subMatches[tag] =  (icItemStorage.subMatches[tag]||0)+1
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

		icItemStorage.getSearchTag = function(search_term){

			if(!search_term || typeof search_term != 'string') return null

			search_term = search_term.replace(/\s+/,'&')

			var index 		= searchTerms.indexOf(search_term),
				search_tag 	= 'search%1' 

			if(index == -1){

				searchTerms.push(search_term)
				index = searchTerms.length-1


				var regex 					= 	new RegExp(search_term, 'i'),
					searchable_properties 	= 	ic.itemConfig.properties.filter(function(property){
													return property.searchable
												})

				icItemStorage.registerFilter(search_tag.replace(/%1/,index), function(item){
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


			return search_tag.replace(/%1/,index)
		}

	}

	ic.itemStorage = new IcItemStorage()

}())