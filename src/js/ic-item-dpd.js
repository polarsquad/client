"use strict";

(function(){
	if(!window.dpd) 							console.error('icItemDpd: missing dpd. Please load dpd.js.')
	if(!(window.ic && window.ic.itemConfig)) 	console.error('icItemDpd: missing ic.itemConfig. Please load item_config.js.')


	function IcItem(item_data){


		var icItem = this

		icItem.downloading 		= undefined
		icItem.preliminary 		= undefined

		icItem.importData = function(data){

			if(!data){
				console.warn('icItemDpd: .importData() called without data.')
				return icItem
			}

			ic.itemConfig.properties.forEach(function(property){

				icItem[property.name] = 	icItem[property.name] !== undefined
											?	icItem[property.name]
											:	property.defaultValue

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
					return 	key 
							?	icItem[property.name][key]
							:	icItem[property.name]
				}
			})

			return data
		}

		icItem.download = function(){
			if(!icItem.id) console.error('icItemDpd.download: missing item id.')

			icItem.downloading = true

			return	dpd(ic.itemConfig.collectionName)
					.get({id: icItem.id})
					.then(icItem.importData)
					.then(function(){
						icItem.downloading = false
					})
		}

		icItem.update = function(key, subkey){
			if(!icItem.id) console.error('icItemDpd.update: missing item id.')

			return 	dpd(ic.itemConfig.collectionName)
					.put({id: icItem.id}, icItem.exportData(key, subkey))
		}


		icItem.submitAsNew = function(){
			return	dpd(ic.itemConfig.collectionName)
					.post(icItem.exportData())
		}


		icItem.delete = function(){
			return 	dpd(ic.itemConfig.collectionName)
					.delete({id: icItem.id})
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


