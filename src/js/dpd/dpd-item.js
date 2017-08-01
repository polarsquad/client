"use strict";

(function(){
	if(!window.dpd) 							console.error('icItemDpd: missing dpd. Please load dpd.js.')
	if(!(window.ic && window.ic.itemConfig)) 	console.error('icItemDpd: missing ic.itemConfig. Please load item_config.js.')


	function IcItem(item_data){


		var icItem = this

		icItem.downloading 		= undefined

		icItem.importData = function(data){

			if(!data){
				console.warn('icItemDpd: .importData() called without data.')
				return icItem
			}

			ic.itemConfig.properties.forEach(function(property){

				icItem[property.name] = 	icItem[property.name] !== undefined
											?	icItem[property.name]
											:	angular.copy(property.defaultValue)

				if(data[property.name] === undefined) return null

				if(property.type == 'object'){
					Object.keys(data[property.name]).forEach(function(key){
						if(data[property.name][key] !== undefined) icItem[property.name][key] = data[property.name][key]
					})						
					return null
				}

				if(property.type == 'array'){
					// remove all duplicates:
					icItem[property.name] = []

					data[property.name].forEach(function(x){
						if(icItem[property.name].indexOf(x) == -1) icItem[property.name].push(x)
					})
					return null
				}

				icItem[property.name] = data[property.name]
			})

			return icItem
		}


		icItem.exportData = function(name, key){
			var data = {}

			ic.itemConfig.properties.forEach(function(property){ 
				if(!name || name == property.name){
					if(!key){
						data[property.name] 		=  	icItem[property.name]
					} else {
						data[property.name] 		= 	{}
						data[property.name][key]	= 	icItem[property.name][key]
					}
				}
			})

			return data
		}

		icItem.download = function(){
			if(!icItem.id) console.error('icItemDpd.download: missing item id.')

			if(icItem.ongoingDownload) return icItem.ongoingDownload

			icItem.downloading 		= 	true
			icItem.ongoingDownload 	= 	dpd(ic.itemConfig.collectionName)
										.get({id: icItem.id})
										.then(icItem.importData)
										.then(function(){
											icItem.downloading = false
										})

			return icItem.ongoingDownload
		}

		icItem.update = function(key, subkey){
			if(!icItem.id) console.error('icItemDpd.update: missing item id.')

			console.log('PUT', icItem.exportData(key, subkey))

			return 	dpd(ic.itemConfig.collectionName)
					.put({id: icItem.id}, icItem.exportData(key, subkey))
		}


		icItem.submitAsNew = function(){
			return	dpd(ic.itemConfig.collectionName)
					.post(icItem.exportData())
					.then(function(data){
						icItem.importData(data)
						return data
					})
		}


		icItem.delete = function(){
			return 	dpd(ic.itemConfig.collectionName)
					.del({id: icItem.id})
		}

		icItem.getErrors = function(property_name, key){
			var property = ic.itemConfig.properties.filter(function(property){ return property.name == property_name})[0]

			if(!property) console.warn('icItem: getErrors; unknown property:', property_name)

			return	property
					?	property.getErrors(icItem[property_name], key)
					:	null

		}



		if(item_data && item_data.id){
			icItem.id = item_data.id 
			return icItem.importData(item_data)
		} else {
			console.error('icItemDpd: missing item id.')
			return null
		}

	}


	window.ic.Item = IcItem
}())


