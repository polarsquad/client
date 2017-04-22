"use strict";

(function(){
	function IcItem(item_data){

		if(!window.dpd) 							console.error('icItemDpd: missing dpd. Please load dpd.js.')
		if(!(window.ic && window.ic.itemConfig)) 	console.error('icItemDpd: missing ic.itemConfig. Please load item_config.js.')

		var icItem = this

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
					for(var key in data[property.name]){
						if(data[property.name][key] !== undefined) icItem[property.name][key] = data[property.name]
					}						
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
			return	dpd(ic.itemConfig.collectionName)
					.get({id: icItem.id})
					.then(icItem.importData)
		}

		icItem.update = function(key, subkey){

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
			console.error('icItemDpd: id missing.')
			return null
		}

	}

	window.ic = window.ic || {}
	window.ic.Item = IcItem
}())


