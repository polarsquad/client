(function(exports){


	exports.categories = [
		{
			name:		'counseling',
			tags:		[	
							"helpdesk",
							"visiting",
							"counseling",
							"care",
							"provision",
							"will",
						],
			colors:		['#a2c9e4', '#a2c9e4']
		},

		{
			name:		'shopping',
			tags:		[
							"chemist",
							"store",
							"delivery",
							"market",
							"health_food",
						],
			colors:		['#FF7878', '#FF7878']

		},

		{
			name:		'health',
			tags:		[
							"pharmacy",
							"physician",
							"doctors_office",
							"nutrition_counseling",
							"discussion_group",
							"alternative_practitioner",
							"hospital",
							"health_food",
							"rehabilitation",
							"medical_service",
							"self_help"
						],
			colors:		['#AAC79A', '#AAC79A']
		},

		{
			name:		'culture',
			tags:		[
							"handicraft",
							"library",
							"learning_opportunity",
							"festival",
							"commitment",
							"needlework",
							"mobile_cinema",
							"music",
							"travel",
							"senior_leisure_center",
							"games",
							"language_course",
							"city_culture",
							"dancing",
						],
			colors:		['#c4accc', '#c4accc']
		},

		{
			name:		'mv',
			tags:		[
							"mailbox",
							"coffee shop",
							"guest_apartment",
							"atm",
							"hotel",
							"church",
							"neighborhood_floor",
							"break_point",
							"post_office",
							"restaurant",
							"meeting_places",
							"wifi_hotspot",
						],
			colors:		['#b0bed0', '#b0bed0']
		},

		{
			name:		'mobility',
			tags:		[
							"accompanying_service",
							"benches",
							"resting_place",
							"public_transport",
							"taxi_stand",
						],
			colors:		['#F9D766', '#F9D766']
		},

		{
			name:		'care',
			tags:		[
							"health_care",
							"visiting_service",
							"neighborhood_assistance",
							"meals_on_wheels",
							"therapists",
							"utilities",
							"medical_supplies",
							"emergency_call"
						],
			colors:		['#DFA8B9', '#DFA8B9']
		},

		{
			name:		'service',
			tags:		[
							"chiropody",
							"cosmetics",
							"pigeons",
							"cleaning",
							"computer",
							"funeral",
							"food_delivery",
							"craftsperson",
							"optician",
							"sanitary",
							"vet",
							"dog_care",
							"pets",
							"animal_care",
							"finances",
							"locksmith",
							"disposal",
							"hairdresser",
							"cabs",
							"lavatory",
							"memento_mori",
							"burglary_protection",
						],
			colors:		['#CAB9A9', '#CAB9A9']
		},

		{
			name:		'sport',
			tags:		[
							"indoor_swimming",
							"sports_club",
							"sports_course",
							"public_toilets",
							"nordic_walking", 
							"chair_gymnastics",
							"seniors_playground",
							"rehabilitation",
							"community_college",
							"dancing",
						],
			colors:		['#71DDD7', '#71DDD7']
		},

		{
			name:		'housing',
			tags:		[
							"craftsmen",
							"relocation_assistance",
							"burglary protection",
							"gesobau",
							"household_help",
							"nursing home",
							"guest_apartment",
							"disposal",
							"senior_accomodation",
						],
			colors:		['#F5A452', '#F5A452']
		},



	]

	exports.types = [
		{
			name:		'location',
			colors:		['#777', '#777'],
		},
		{
			name:		'event',
			colors:		['#777', '#777'],
		},
		{
			name:		'offer',
			colors:		['#777', '#777'],
		},
		{
			name:		'information',
			colors:		['#777', '#777'],
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
