(function(exports){




	exports.categories = [
		{
			name:		'information_counseling',
			tags:		[	
							"counceling_services",
							"visiting_services",
							"care_health",
							"patient_decree",
							"testament"
						],
			colors:		['#a2c9e4', '#a2c9e4']
		},



		{
			name:		'shopping',
			tags:		[
							"drugstore",
							"shop",
							"delivery",
							"market",
							"health_food_store",
						],
			colors:		['#FF7878', '#FF7878']

		},

		{
			name:		'health',
			tags:		[


							"pharmacy",
							"occupational_therapy",
							"doctors",
							"nutrition_counceling",
							"discussion_group",
							"health_pedagogy",
							"alternative_practioners",
							"hospital",
							"rehabilitation",
							"healthcare_supply_store",
							"self_help_group"
						],
			colors:		['#AAC79A', '#AAC79A']
		},

		{
			name:		'culture',
			tags:		[

							"course_offers",
							"leisure_groups",
							"educational_offer",
							"celebration",
							"voluntary_commitment",
							"playing_crafting",
							"music_singing",
							"traveling",
							"leisure_facility",
							"museum"
						],
			colors:		['#c4accc', '#c4accc']
		},

		{
			name:		'mv',
			tags:		[
							"postbox",
							"cafe",
							"guest_apartment",
							"atm",
							"hotel",
							"church",
							"neighbourhood_support",
							"break_room",
							"post",
							"restaurant",
							"meeting_point",
							"hotspots",
							"celebrations",
						],
			colors:		['#b0bed0', '#b0bed0']
		},

		{
			name:		'mobility',
			tags:		[
							"accompanying_service",
							"break_bench",
							"oasis",
							"bus_railway",
							"taxi_stands"
						],
			colors:		['#ebbf2e', '#ebbf2e']
		},

		{
			name:		'care',
			tags:		[
							"care_service",
							"visiting_service",
							"neighbourhood_help",
							"meals_on_wheels",
							"therapists",
							"tools",
							"health_care_supply",
							"emergency_call"
						],
			colors:		['#DFA8B9', '#DFA8B9']
		},

		{
			name:		'service',
			tags:		[
							"footcare",
							"cosmetic",
							"cleaning_service",
							"computer_service",
							"funeral",
							"food_delivery",
							"craft_service",
							"optician",
							"sanitary",
							"veterinarian",
							"pet_support",
							"pet",
							"animal_care",
							"finance",
							"key_service",
							"disposal_service",
							"barber",
							"taxi_service",
							"toilet",
							"mementomori",
							"burglary_protection",
							"city_administration"
						],
			colors:		['#CAB9A9', '#CAB9A9']
		},

		{
			name:		'sport',
			tags:		[
							"indoor_pool",
							"sport_club",
							"sport_class",
							"playground",
							"rehabilitation",
							"dancing"
						],
			colors:		['#71DDD7', '#71DDD7']
		},

		{
			name:		'housing',
			tags:		[
							"craft_service",
							"moving_service",
							"burglary_protection",
							"gesobau",
							"home_help",
							"nursing_home",
							"guest_home",
							"disposal_service",
							"retirement_home"
						],
			colors:		['#F5A452', '#F5A452']
		},



	]

	exports.types = [
		{
			name:		'location',
			colors:		['#999', '#999'],
		},
		{
			name:		'event',
			colors:		['#999', '#999'],
		},
		{
			name:		'offer',
			colors:		['#999', '#999'],
		},
		{
			name:		'information',
			colors:		['#999', '#999'],
		}
	]

	exports.unsortedTags = [
		'accessible',
		'free',
		'multi_language',
		'public_toilet'
	]





}(
	('undefined' !== typeof exports) 
	? exports
	: (this['ic'] = this['ic'] || {})['taxonomy'] = (this['ic']['taxonomy'] || {})
))
