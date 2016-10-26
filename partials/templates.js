angular.module('InfoCompass').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('partials/ic-filter-interface.html',
    "<div \n" +
    "	class = \"tags\"\n" +
    "	ng-if = \"icFilterConfig.filterBy.topics.length || icFilterConfig.filterBy.targetGroups.length\"\n" +
    ">\n" +
    "\n" +
    "	<!--TOPICS -->\n" +
    "	<a 	\n" +
    "		ng-repeat = \"topic in icFilterConfig.filterBy.topics\"\n" +
    "		ng-click  = \"icFilterConfig.toggleFilter('topics', topic)\" \n" +
    "	>\n" +
    "		<span class =\"icon icon-nav-close\"></span>\n" +
    "		{{topic | uppercase | prepend: \"TOPICS.\" |translate}}\n" +
    "	</a>\n" +
    "\n" +
    "\n" +
    "	<!--TARGET_GROUPS -->\n" +
    "	<a ng-repeat = \"targetGroup in icFilterConfig.filterBy.targetGroups\"\n" +
    "		ng-click  = \"icFilterConfig.toggleFilter('targetGroups', targetGroup)\" \n" +
    "	>\n" +
    "		<span class =\"icon icon-nav-close\"></span>\n" +
    "		{{targetGroup | uppercase | prepend: \"TARGET_GROUPS.\" |translate}}\n" +
    "	</a>\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "<div class = \"controls\">	\n" +
    "	<button\n" +
    "		class 		= \"sort\"\n" +
    "		ng-class	= \"{'icon-interface-arrow-down': open != 'sort', 'icon-interface-arrow-up': open == 'sort'}\"\n" +
    "		ic-click 	= \"toggleSortPanel()\" \n" +
    "		ic-touch-me\n" +
    "	>\n" +
    "		{{\"INTERFACE.SORT\" | translate}}\n" +
    "	</button>\n" +
    "\n" +
    "	<button\n" +
    "		class 		= \"sort\"\n" +
    "		ng-class	= \"{'icon-interface-arrow-down': open != 'filter', 'icon-interface-arrow-up': open == 'filter'}\"<\n" +
    "		ic-click 	= \"toggleFilterPanel()\" \n" +
    "		ic-touch-me\n" +
    "	>\n" +
    "		{{\"INTERFACE.FILTER\" | translate}}\n" +
    "	</button>\n" +
    "</div>\n" +
    "\n" +
    "<div \n" +
    "	class 	= \"panel sort\"\n" +
    "	ng-if 	= \"open == 'sort'\" \n" +
    ">\n" +
    "	<a \n" +
    "		ng-class 	= \"{active : icSite.params.so == 'a'}\"\n" +
    "		class		= \"disabled\"\n" +
    "	> \n" +
    "		A-Z\n" +
    "	</a>\n" +
    "\n" +
    "	<a \n" +
    "		ng-class 	= \"{active : icSite.params.so == 'n'}\"\n" +
    "		class 		= \"disabled\"\n" +
    "	> \n" +
    "		Neuste\n" +
    "	</a>\n" +
    "\n" +
    "	<a \n" +
    "		ng-class 	= \"{active : icSite.params.so == 'b'}\"		\n" +
    "		class 		= \"disabled\"\n" +
    "	> \n" +
    "		Am häufigsten gemerkt\n" +
    "	</a>\n" +
    "\n" +
    "	<a \n" +
    "		ng-class 	= \"{active : icSite.params.so == 'l'}\"\n" +
    "		class 		= \"disabled\"\n" +
    "	> \n" +
    "		Nähe zum Standort\n" +
    "	</a>\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "<div \n" +
    "	class 	= \"panel filter\"\n" +
    "	ng-if	= \"open == 'filter'\" \n" +
    ">\n" +
    "\n" +
    "	<a \n" +
    "		ng-class	= \"{'icon-interface-arrow-right': !expand.topics, 'icon-interface-arrow-down': expand.topics}\" \n" +
    "		ic-click 	= \"expand.topics = !expand.topics\"\n" +
    "		ic-touch-me\n" +
    "	>\n" +
    "		{{\"INTERFACE.TOPICS\" | translate}}\n" +
    "	</a>\n" +
    "\n" +
    "	<div ng-if = \"expand.topics\">\n" +
    "		<a \n" +
    "			ng-click 	= \"icFilterConfig.clearFilter('topics')\" \n" +
    "			ng-class 	= \"{'icon-interface-checkbox-selected' : icFilterConfig.matchFilter('topics', undefined), 'icon-interface-checkbox': !icFilterConfig.matchFilter('topics', undefined)}\"\n" +
    "			ic-touch-me\n" +
    "		>\n" +
    "			{{\"INTERFACE.TOPICS_ALL\" | translate}}\n" +
    "		</a>\n" +
    "		<a \n" +
    "			ng-repeat 	= \"topic in icConfigData.topics | orderBy : 'toString()| uppercase | prepend: \\'TOPICS.\\' |translate'\"\n" +
    "			ng-click 	= \"icFilterConfig.toggleFilter('topics', topic)\" \n" +
    "			ng-class 	= \"{'icon-interface-checkbox-selected' : icFilterConfig.matchFilter('topics', topic), 'icon-interface-checkbox': !icFilterConfig.matchFilter('topics', topic)}\"\n" +
    "			ic-touch-me			\n" +
    "		>\n" +
    "			{{topic | uppercase | prepend: \"TOPICS.\" |translate}}\n" +
    "		</a>\n" +
    "	</div>\n" +
    "\n" +
    "	<hr/>\n" +
    "\n" +
    "	<a \n" +
    "		ng-class	= \"{'icon-interface-arrow-right': !expand.targetGroups, 'icon-interface-arrow-down': expand.targetGroups}\" \n" +
    "		ic-click 	= \"expand.targetGroups = !expand.targetGroups\"\n" +
    "		ic-touch-me\n" +
    "	>\n" +
    "		{{\"INTERFACE.TARGET_GROUPS\" | translate}}\n" +
    "	</a>\n" +
    "\n" +
    "	<div ng-if = \"expand.targetGroups\">\n" +
    "		<a \n" +
    "			ng-click 	= \"icFilterConfig.clearFilter('targetGroups')\" \n" +
    "			ng-class 	= \"{'icon-interface-checkbox-selected' : icFilterConfig.matchFilter('targetGroups', undefined), 'icon-interface-checkbox': !icFilterConfig.matchFilter('targetGroups', undefined)}\"\n" +
    "			ic-touch-me			\n" +
    "		>\n" +
    "			{{\"INTERFACE.TARGET_GROUPS_ALL\" | translate}}\n" +
    "		</a>\n" +
    "		<a \n" +
    "			ng-repeat 	= \"targetGroup in icConfigData.targetGroups | orderBy : 'toString()| uppercase | prepend: \\'TARGET_GROUPS.\\' |translate'\"\n" +
    "			ng-click 	= \"icFilterConfig.toggleFilter('targetGroups', targetGroup)\" \n" +
    "			ng-class 	= \"{'icon-interface-checkbox-selected' : icFilterConfig.matchFilter('targetGroups', targetGroup), 'icon-interface-checkbox': !icFilterConfig.matchFilter('targetGroups', targetGroup)}\"\n" +
    "			ic-touch-me			\n" +
    "		>\n" +
    "			{{targetGroup | uppercase | prepend: \"TARGET_GROUPS.\" |translate}}\n" +
    "		</a>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "</div>\n"
  );


  $templateCache.put('partials/ic-full-item.html',
    "<ic-unavailable ng-if =\"!loading && !item\"></ic-unavailable>\n" +
    "\n" +
    "<ic-spinner active = \"loading\"></ic-spinner>\n" +
    "\n" +
    "<h2 ng-if = \"item.new\"> {{ 'INTERFACE.NEW_ITEM' }}</h2>\n" +
    "\n" +
    "\n" +
    "\n" +
    "<!-- start item title -->\n" +
    "\n" +
    "<h2 \n" +
    "	class 	= \"title\"\n" +
    "	ng-if	= \"!editMode\"\n" +
    ">{{ item.title }}</h2>\n" +
    "\n" +
    "<ic-item-edit\n" +
    "	ng-if 					= \"editMode\"\n" +
    "	ic-type 				= \"string\"\n" +
    "	ic-label				= \"{{'INTERFACE.ITEM_TITLE' | translate}} \"\n" +
    "	ic-key					= \"title\"\n" +
    "	ic-item					= \"item\"\n" +
    "	ic-translatable			= \"false\"\n" +
    "	ic-allow-local-edit		= \"!item.new && icUser.can('edit')\"\n" +
    "></ic-item-edit>\n" +
    "\n" +
    "<!-- end item title -->\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "<!-- start item definition -->\n" +
    "\n" +
    "<h3 \n" +
    "	class 	= \"definition\"\n" +
    "	ng-if	= \"!editMode\"\n" +
    "> {{ item.definition[language] }}</h3>\n" +
    "\n" +
    "\n" +
    "<ic-item-edit\n" +
    "	ng-if 					= \"editMode\"\n" +
    "	ic-type 				= \"string\"\n" +
    "	ic-key					= \"definition\"\n" +
    "	ic-label				= \"{{'INTERFACE.ITEM_DEFINITION' | translate}} \"\n" +
    "	ic-item					= \"item\"\n" +
    "	ic-translatable			= \"true\"\n" +
    "	ic-allow-local-edit		= \"!item.new && icUser.can('edit')\"\n" +
    "></ic-item-edit>\n" +
    "\n" +
    "<!-- end item definition -->\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "<!-- start type -->\n" +
    "\n" +
    "<ic-item-edit\n" +
    "	ng-if					= \"editMode\"\n" +
    "	ic-type					= \"string\"\n" +
    "	ic-options				= \"::icConfigData['types']\"\n" +
    "	ic-option-label			= \"option | uppercase | prepend : 'TYPES.' | translate\"\n" +
    "	ic-key					= \"type\"\n" +
    "	ic-label				= \"{{'INTERFACE.ITEM_TYPE' | translate}} \"\n" +
    "	ic-item					= \"item\"\n" +
    "	ic-allow-local-edit		= \"!item.new && icUser.can('edit')\"\n" +
    "></ic-item-edit>\n" +
    "\n" +
    "<!-- end type -->\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "<!-- start topic and targets groups -->\n" +
    "\n" +
    "<ic-item-edit\n" +
    "	ng-if					= \"editMode\"\n" +
    "	ic-type					= \"string\"\n" +
    "	ic-options				= \"::icConfigData['topics']\"\n" +
    "	ic-option-label			= \"option | uppercase | prepend : 'TOPICS.' | translate\"\n" +
    "	ic-key					= \"primaryTopic\"\n" +
    "	ic-label				= \"{{'INTERFACE.ITEM_PRIMARY_TOPIC' | translate}} \"\n" +
    "	ic-item					= \"item\"\n" +
    "	ic-allow-local-edit		= \"!item.new && icUser.can('edit')\"\n" +
    "></ic-item-edit>\n" +
    "\n" +
    "<div \n" +
    "	class 	= \"topics-and-target-groups highlight\"\n" +
    "	ng-if	= \"!editMode\"\n" +
    ">\n" +
    "	<a \n" +
    "		ng-repeat 	= \"topic in item.topics\"\n" +
    "		class		= \"highlight\"\n" +
    "		ng-href		= \"/#/tp/{{topic}}\"\n" +
    "	>{{topic | uppercase | prepend : \"TOPICS.\" | translate }}</a>\n" +
    "	<a \n" +
    "		ng-repeat 	= \"target_group in item.targetGroups\"\n" +
    "		class		= \"highlight\"\n" +
    "		ng-href		= \"/#/tg/{{target_group}}\"\n" +
    "	>{{target_group | uppercase | prepend : \"TARGET_GROUPS.\" | translate }}</a>\n" +
    "</div>\n" +
    "\n" +
    "	\n" +
    "<ic-item-edit\n" +
    "	ng-if					= \"editMode\"\n" +
    "	ic-type					= \"array\"\n" +
    "	ic-options				= \"::icConfigData['topics']\"\n" +
    "	ic-option-label			= \"option | uppercase | prepend : 'TOPICS.' | translate\"\n" +
    "	ic-key					= \"topics\"\n" +
    "	ic-label				= \"{{'INTERFACE.ITEM_TOPICS' | translate}} \"\n" +
    "	ic-item					= \"item\"\n" +
    "	ic-allow-local-edit		= \"!item.new && icUser.can('edit')\"\n" +
    "></ic-item-edit>\n" +
    "\n" +
    "<ic-item-edit\n" +
    "	ng-if					= \"editMode\"\n" +
    "	ic-type					= \"array\"\n" +
    "	ic-options				= \"::icConfigData['targetGroups']\"\n" +
    "	ic-option-label			= \"option | uppercase | prepend : 'TARGET_GROUPS.' | translate\"\n" +
    "	ic-key					= \"targetGroups\"\n" +
    "	ic-label				= \"{{'INTERFACE.ITEM_TARGET_GROUPS' | translate}} \"\n" +
    "	ic-item					= \"item\"\n" +
    "	ic-allow-local-edit		= \"!item.new && icUser.can('edit')\"\n" +
    "></ic-item-edit>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "<!-- end topic and targets groups -->\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "<!-- start image -->\n" +
    "\n" +
    "<img\n" +
    "	class	= \"hero\" \n" +
    "	ng-if 	= \"!editMode && item.imageUrl\" \n" +
    "	ng-src 	= \"{{item.imageUrl}}\"\n" +
    "/>\n" +
    "\n" +
    "<ic-item-edit\n" +
    "	ng-if 					= \"editMode\"\n" +
    "	ic-type 				= \"string\"\n" +
    "	ic-label				= \"{{'INTERFACE.ITEM_IMAGE' | translate}} \"\n" +
    "	ic-key					= \"imageUrl\"\n" +
    "	ic-item					= \"item\"\n" +
    "	ic-translatable			= \"false\"\n" +
    "	ic-allow-local-edit		= \"!item.new && icUser.can('edit')\"\n" +
    "></ic-item-edit>\n" +
    "\n" +
    "<!-- end image -->\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "<!-- start item description -->\n" +
    "\n" +
    "\n" +
    "<p \n" +
    "	ng-if 			= \"!editMode\"\n" +
    "	ng-bind-html 	= \"item.description[language]\"\n" +
    ">\n" +
    "</p>\n" +
    "\n" +
    "\n" +
    "<ic-item-edit\n" +
    "	ng-if 					= \"editMode\"\n" +
    "	ic-type 				= \"text\"\n" +
    "	ic-key					= \"description\"\n" +
    "	ic-label				= \"{{'INTERFACE.ITEM_DESCRIPTION' | translate}} \"\n" +
    "	ic-item					= \"item\"\n" +
    "	ic-translatable			= \"true\"\n" +
    "	ic-allow-local-edit		= \"!item.new && icUser.can('edit')\"\n" +
    "></ic-item-edit>\n" +
    "\n" +
    "<!-- end item description -->\n" +
    "\n" +
    "\n" +
    "\n" +
    "<hr/>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "<!-- start adress -->\n" +
    "\n" +
    "<ic-info-tag\n" +
    "	ng-if			= \"item.address && !editMode\"\n" +
    "	ic-title 		= \"'INTERFACE.ITEM_ADDRESS' | translate\"\n" +
    "	ic-content		= \"item.address\"\n" +
    "	ic-extra-lines	= \"[(item.zip||'') + ' ' + (item.location||'')]\"\n" +
    "	ic-icon			= \"'address'| icIcon : 'item' : 'black'\"\n" +
    ">\n" +
    "</ic-info-tag>\n" +
    "\n" +
    "\n" +
    "<ic-item-edit\n" +
    "	ng-if 					= \"editMode\"\n" +
    "	ic-type 				= \"string\"\n" +
    "	ic-label				= \"{{'INTERFACE.ITEM_ADDRESS' | translate}} \"\n" +
    "	ic-key					= \"address\"\n" +
    "	ic-item					= \"item\"\n" +
    "	ic-translatable			= \"false\"\n" +
    "	ic-allow-local-edit		= \"!item.new && icUser.can('edit')\"\n" +
    "></ic-item-edit>\n" +
    "\n" +
    "<ic-item-edit\n" +
    "	ng-if 					= \"editMode\"\n" +
    "	ic-type 				= \"string\"\n" +
    "	ic-label				= \"{{'INTERFACE.ITEM_ZIP' | translate}} \"\n" +
    "	ic-key					= \"zip\"\n" +
    "	ic-item					= \"item\"\n" +
    "	ic-translatable			= \"false\"\n" +
    "	ic-allow-local-edit		= \"!item.new && icUser.can('edit')\"\n" +
    "></ic-item-edit>\n" +
    "\n" +
    "<ic-item-edit\n" +
    "	ng-if 					= \"editMode\"\n" +
    "	ic-type 				= \"string\"\n" +
    "	ic-label				= \"{{'INTERFACE.ITEM_LOCATION' | translate}} \"\n" +
    "	ic-key					= \"location\"\n" +
    "	ic-item					= \"item\"\n" +
    "	ic-translatable			= \"false\"\n" +
    "	ic-allow-local-edit		= \"!item.new && icUser.can('edit')\"\n" +
    "></ic-item-edit>\n" +
    "\n" +
    "\n" +
    "\n" +
    "<!-- end address -->\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "<!-- start geo coordinates -->\n" +
    "\n" +
    "<ic-info-tag\n" +
    "	ng-if			= \"item.longitude && item.latitude && !editMode\"\n" +
    "	ic-title 		= \"'INTERFACE.ITEM_GEO_COORDINATES' | translate\"\n" +
    "	ic-content		= \"item.longitude + '/' +item.latitude\"\n" +
    "	ic-icon			= \"'geo_coordinates'| icIcon : 'item' : 'black'\"\n" +
    "	ic-link			= \"'https://www.openstreetmap.org/#map=19/'\"\n" +
    ">\n" +
    "</ic-info-tag>\n" +
    "\n" +
    "\n" +
    "<!-- end geo coordinates -->\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "<!-- start misc -->\n" +
    "\n" +
    "<ic-info-tag\n" +
    "	ng-repeat-start	= \"key in ['name', 'website', 'email', 'phone', 'facebook', 'twitter', 'linkedin', 'pinterest', 'price', 'maxParticipants']\"\n" +
    "	ng-if		= \"item[key] && !editMode\"\n" +
    "	ic-title 	= \"key | uppercase | prepend: 'INTERFACE.ITEM_' | translate\"\n" +
    "	ic-content	= \"item[key]\"\n" +
    "	ic-icon		= \"key | icIcon : 'item' : 'black'\"\n" +
    "	ic-link		= \"::key | icLinkPrefix\"\n" +
    ">\n" +
    "</ic-info-tag>\n" +
    "\n" +
    "<ic-item-edit\n" +
    "	ng-repeat-end\n" +
    "	ng-if 					= \"editMode\"\n" +
    "	ic-type 				= \"string\"\n" +
    "	ic-label				= \"{{key | uppercase | prepend: 'INTERFACE.ITEM_' | translate}} \"\n" +
    "	ic-key					= \"{{key}}\"\n" +
    "	ic-item					= \"item\"\n" +
    "	ic-translatable			= \"false\"\n" +
    "	ic-allow-local-edit		= \"!item.new && icUser.can('edit')\"\n" +
    "></ic-item-edit>\n" +
    "\n" +
    "\n" +
    "<!-- end misc -->\n" +
    "\n" +
    "\n" +
    "\n" +
    "<ic-info-tag\n" +
    "	ng-if			= \"item.hours.length > 0\"\n" +
    "	ic-title 		= \"'INTERFACE.ITEM_INFO_HOURS' | translate\"\n" +
    "	ic-extra-lines	= \"item.hours |icHours\"\n" +
    "	ic-icon			= \"'hours'| icIcon : 'item' : 'black'\"\n" +
    ">\n" +
    "</ic-info-tag>\n" +
    "\n" +
    "\n" +
    "<hr/>\n" +
    "\n" +
    "\n" +
    "<qrcode \n" +
    "	ng-if					=	\"!editMode\"\n" +
    "	version					=	\"3\" \n" +
    "	error-correction-level	=	\"M\" \n" +
    "	size					=	\"200\" \n" +
    "	data					=	\"{{item.id | icItemLink}}\"\n" +
    "	ng-if					=	\"item\"\n" +
    "	ic-toggle-overlay		=	\"qrcode\"\n" +
    ">\n" +
    "</qrcode>\n" +
    "\n" +
    "\n" +
    "<hr/>\n" +
    "\n" +
    "\n" +
    "<footer>\n" +
    "	<div ng-if = \"saving_failed\">\n" +
    "		{{ 'INTERFACE.SAVING_FAILED' | translate }}\n" +
    "	</div>\n" +
    "\n" +
    "	<div class = \"tools\">\n" +
    "		<a \n" +
    "			ng-click 	= \"print()\"\n" +
    "			ng-show		= \"!editMode\"\n" +
    "			ic-touch-me\n" +
    "		>	\n" +
    "			{{'INTERFACE.PRINT' | translate}}		\n" +
    "		</a>\n" +
    "\n" +
    "		<a \n" +
    "			disabled\n" +
    "			ng-show		= \"!editMode\"\n" +
    "			ic-touch-me\n" +
    "		>				\n" +
    "			{{'INTERFACE.SHARE'	| translate}}		\n" +
    "		</a>\n" +
    "\n" +
    "		<a \n" +
    "			ic-click	= \"cancelEdit()\"\n" +
    "			ng-show		= \"editMode\"\n" +
    "			ic-touch-me\n" +
    "		> {{'INTERFACE.CANCEL' | translate}} </a>\n" +
    "\n" +
    "		<a \n" +
    "			ic-click	= \"edit()\"\n" +
    "			ng-show		= \"!editMode\"\n" +
    "			ic-touch-me\n" +
    "		> {{'INTERFACE.EDIT' | translate}} </a>\n" +
    "\n" +
    "		<a \n" +
    "			ic-click	= \"saveAll()\"\n" +
    "			ng-show		= \"editMode\"\n" +
    "			ic-touch-me\n" +
    "		> {{'INTERFACE.SAVE_ALL' | translate}} </a>\n" +
    "\n" +
    "	</div>\n" +
    "</footer>\n"
  );


  $templateCache.put('partials/ic-header.html',
    "	<button\n" +
    "		type				= \"button\"	\n" +
    "		class 				= \"icon-nav-menu fleft\"\n" +
    "		ic-toggle-overlay 	= \"mainMenu\" \n" +
    "		ng-if				= \"icMenu\"\n" +
    "		ic-touch-me	\n" +
    "	>{{\"INTERFACE.MENU\" | translate }}</button>\n" +
    "\n" +
    "	<button\n" +
    "		type				= \"button\"\n" +
    "		class				= \"icon-interface-close fleft\"\n" +
    "		ng-if				= \"icCloseItem\"\n" +
    "		ng-click			= \"icSite.clearItem()\"\n" +
    "		ic-touch-me	\n" +
    "	></button>\n" +
    "\n" +
    "\n" +
    "\n" +
    "	<button \n" +
    "		type				= \"button\"\n" +
    "		class 				= \"icon-interface-share highlight\"\n" +
    "		ng-if				= \"icShare\"\n" +
    "		ic-toggle-overlay	= \"sharingMenu\"\n" +
    "		ic-touch-me	\n" +
    "	></button>\n" +
    "	\n" +
    "	<button \n" +
    "		type				= \"button\"\n" +
    "		class 				= \"icon-interface-print highlight\"\n" +
    "		ng-if				= \"icPrint\"\n" +
    "		ng-click			= \"print()\"\n" +
    "		ic-touch-me	\n" +
    "	></button>\n" +
    "\n" +
    "	<button \n" +
    "		type				= \"button\"\n" +
    "		class 				= \"icon-nav-language\"\n" +
    "		ng-if				= \"icLanguages\"\n" +
    "		ic-toggle-overlay 	= \"languageMenu\" \n" +
    "		ic-touch-me	\n" +
    "	></button>\n" +
    "\n" +
    "<!-- 	<button \n" +
    "		type				= \"button\"\n" +
    "		class 				= \"icon-nav-search\"\n" +
    "		ic-toggle-overlay 	= \"search\"\n" +
    "		ng-show				= \"!icSite.show('item')\"\n" +
    "	></button> -->\n"
  );


  $templateCache.put('partials/ic-info-tag.html',
    "<div class = \"icon\"><img ng-src = \"{{icIcon}}\"/></div>\n" +
    "<div class = \"title\"> {{icTitle}} </div>\n" +
    "<div class = \"content highlight\">		\n" +
    "	<a\n" +
    "		ng-if	=	\"link\"\n" +
    "		ng-href = \"{{link}}\"\n" +
    "	>\n" +
    "		{{icContent}}	\n" +
    "	</a>\n" +
    "\n" +
    "	<span\n" +
    "		ng-if 	= \"!link\"\n" +
    "	>\n" +
    "		{{icContent}}	\n" +
    "	</span>\n" +
    "\n" +
    "	<div \n" +
    "		ng-repeat 	= \"line in icExtraLines\"\n" +
    "		ng-if		= \"line | trim\"\n" +
    "	>\n" +
    "		{{line}}\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "\n"
  );


  $templateCache.put('partials/ic-item-edit-item-property.html',
    "<h4\n" +
    "	ic-click 	= \"expand = !expand\"\n" +
    "	ng-class	= \"{'icon-interface-arrow-right': !expand, 'icon-interface-arrow-down': expand}\"\n" +
    "	ic-touch-me\n" +
    "> {{icLabel}} </h4>\n" +
    "\n" +
    "\n" +
    "\n" +
    "<form \n" +
    "	ng-submit 	= \"icAllowLocalEdit && update()\"\n" +
    "	ng-if		= \"expand\"\n" +
    ">\n" +
    "\n" +
    "\n" +
    "	<!-- String -->	\n" +
    "\n" +
    "	<div ng-if	= \"::icType == 'string' && !icOptions\" >\n" +
    "		<span class =\"current-value {{diff() ? 'diff' : ''}} \">{{value.current || ('INTERFACE.EMPTY' | translate) }}</span>	\n" +
    "		<input \n" +
    "			type 		= \"text\"\n" +
    "			ng-model	= \"value.new\" \n" +
    "		></input>\n" +
    "	</div>\n" +
    "\n" +
    "	<div ng-if = \"::icType == 'string' && icOptions\">\n" +
    "		<span class =\"current-value {{diff() ? 'diff' : ''}} \">{{ value.current ? icOptionLabel({option:value.current}) : ('INTERFACE.MISSING' | translate) }}</span>	\n" +
    "		<div class = \"options\">\n" +
    "			<a \n" +
    "				ng-repeat 	= \"option in ::icOptions\"\n" +
    "				ng-class 	= \"{'icon-interface-checkbox-selected' : value.new == option , 'icon-interface-checkbox': value.new  != option}\"\n" +
    "				ng-click	= \"value.new = option\"\n" +
    "			>{{icOptionLabel({option: option}) }}</a>\n" +
    "		</div>\n" +
    "\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "	<!-- Text -->\n" +
    "\n" +
    "	<div ng-if		= \"::icType == 'text'\">\n" +
    "		<span class =\"current-value {{diff() ? 'diff' : ''}} \">{{value.current || ('INTERFACE.EMPTY' | translate) }}</span>	\n" +
    "		<textarea\n" +
    "			ng-model	= \"value.new\"\n" +
    "			ic-auto-grow\n" +
    "		>\n" +
    "		</textarea>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "	<!-- Array -->\n" +
    "\n" +
    "	<div ng-if	= \"::icType == 'array'\">\n" +
    "		<span class =\"current-value {{diff() ? 'diff' : ''}} \">\n" +
    "			<span ng-repeat = \"option in value.current\">\n" +
    "				{{icOptionLabel({option: option})}}{{$last ? '' : ','}}\n" +
    "			</span>\n" +
    "			{{value.current.length == 0 ? ('INTERFACE.EMPTY' | translate) : ''}}\n" +
    "		</span>	\n" +
    "		<div class = \"options\">\n" +
    "			<a \n" +
    "				ng-repeat 	= \"option in ::icOptions\"\n" +
    "				ng-class 	= \"{'icon-interface-checkbox-selected' : value.new.indexOf(option) != -1 , 'icon-interface-checkbox': value.new.indexOf(option) == -1}\"\n" +
    "				ng-click	= \"toggleOption(option)\"\n" +
    "			>{{icOptionLabel({option: option})}}</a>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "	<button\n" +
    "		ng-show	= \"icAllowLocalEdit\"\n" +
    "		type 	= \"submit\"\n" +
    "	>\n" +
    "		{{ \"INTERFACE.UPDATE\" | translate }}\n" +
    "	</buton>\n" +
    "\n" +
    "	<button\n" +
    "		ng-show		= \"icAllowLocalEdit\"\n" +
    "		ic-click	= \"revert()\" \n" +
    "		ng-disabled	= \"value.new == value.current\"\n" +
    "		type		= \"button\"\n" +
    "	>\n" +
    "		{{ \"INTERFACE.REVERT\" | translate }}\n" +
    "	</buton>\n" +
    "\n" +
    "</form>"
  );


  $templateCache.put('partials/ic-language-menu.html',
    "<h2>\n" +
    "	{{\"INTERFACE.CHOOSE_LANGUAGE\" | translate}}\n" +
    "</h2>\n" +
    "\n" +
    "\n" +
    "<a \n" +
    "	ng-repeat 	= \"language in ::icLanguageConfig.availableLanguages\"\n" +
    "	ng-click	= \"icLanguageConfig.currentLanguage = language\"\n" +
    "	ng-class 	= \"{'highlight active': icLanguageConfig.currentLanguage == language}\"	\n" +
    "	ic-touch-me	\n" +
    ">\n" +
    "	<span \n" +
    "		ng-if = \"icLanguageConfig.currentLanguage != language\"\n" +
    "		class = \"translation light\"\n" +
    "	>\n" +
    "			{{\"LANGUAGES.\"+language.toUpperCase()+\".NAME\" | translate}}\n" +
    "	</span>\n" +
    "	<span class = \"native\">{{\"LANGUAGES.\"+language.toUpperCase()+\".NATIVE\" | translate}}</span>\n" +
    "</a>"
  );


  $templateCache.put('partials/ic-layout.html',
    "<!--\n" +
    "\n" +
    "\n" +
    " --><section \n" +
    "		class   =   \"page\"\n" +
    "		ng-if   =   \"icSite.show('page')\"\n" +
    "	>\n" +
    "		<div ng-include = \"icSite.pageUrl\"></div>\n" +
    "	</section><!--\n" +
    "\n" +
    "\n" +
    " --><section \n" +
    "		class           =   \"filter\"    \n" +
    "		ng-if           =   \"icSite.show('filter')\"\n" +
    "	>\n" +
    "		<ic-section-filter></ic-section-filter>\n" +
    "	</section><!--\n" +
    "\n" +
    "\n" +
    " --><section \n" +
    "		class   =   \"list\"  \n" +
    "		ng-if   =   \"icSite.show('list')\"\n" +
    "		fake-scroll-bump\n" +
    "	>\n" +
    "		<ic-section-list\n" +
    "			ic-show-filter  =   \"smlLayout.mode.name == 'XS' || (smlLayout.mode.name == 'M' && icSite.show('item'))\" \n" +
    "		></ic-section-list>\n" +
    "	</section><!--\n" +
    "\n" +
    "\n" +
    "	 <ic-horizontal-swipe-list-x\n" +
    "		ic-model-as = \"icId\"\n" +
    "		ic-previous = \"icSearchResults.getPreviousId(icModel)\"\n" +
    "		ic-current  = \"icSite.params.item\"\n" +
    "		ic-next     = \"icSearchResults.getNextId(icModel)\"\n" +
    "		ic-on-turn  = \"icSite.addItemToPath(icModel)\"\n" +
    "	>\n" +
    "--><section \n" +
    "		class   = \"item\" \n" +
    "		ng-if   = \"icSite.show('item')\"\n" +
    "	>                   \n" +
    "		<ic-header\n" +
    "			ng-if 			= \"icSite.useLocalHeader('item')\"\n" +
    "			ic-close-item	= \"true\"\n" +
    "			ic-share		= \"true\"\n" +
    "			ic-print		= \"true\"\n" +
    "		>\n" +
    "		</ic-header>\n" +
    "		<ic-section-item></ic-section-item>\n" +
    "	</section><!--\n" +
    "	 </ic-horizontal-swipe-list>\n" +
    "	 -->\n" +
    "\n"
  );


  $templateCache.put('partials/ic-login.html',
    "<ng-transclude></ng-transclude>\n" +
    "\n" +
    "<form ng-submit = \"login()\">\n" +
    "	<label>\n" +
    "		{{'INTERFACE.USERNAME' | translate}}\n" +
    "		<input\n" +
    "			type 		= \"text\"\n" +
    "			ng-model 	= \"username\"			 \n" +
    "		></input>\n" +
    "	</label>\n" +
    "	<label>\n" +
    "		{{'INTERFACE.PASSWORD' | translate}}\n" +
    "		<input\n" +
    "			type 		= \"password\"\n" +
    "			ng-model 	= \"password\"			 \n" +
    "		></input>\n" +
    "	</label>\n" +
    "\n" +
    "	<div>\n" +
    "		<button \n" +
    "			type 		= \"button\"\n" +
    "			ng-click 	= \"cancel()\"\n" +
    "		>\n" +
    "			{{ 'INTERFACE.CANCEL' | translate}}\n" +
    "		</button>\n" +
    "\n" +
    "		<button type = \"submit\">\n" +
    "			{{'INTERFACE.LOGIN' | translate}}\n" +
    "		</button>\n" +
    "	</div>\n" +
    "</form>"
  );


  $templateCache.put('partials/ic-main-menu.html',
    "<h2>\n" +
    "	<a\n" +
    "		ic-home\n" +
    "		ic-toggle-overlay \n" +
    "	>\n" +
    "	<ic-text-logo></ic-text-logo>\n" +
    "	</a>\n" +
    "</h2>\n" +
    "\n" +
    "<ic-search				\n" +
    "	class 				= \"white right\"\n" +
    "	ic-on-update		= \"icSite.clearItem(); icFilterConfig.clearFilter();icOverlays.toggle('mainMenu');\"\n" +
    "></ic-search>\n" +
    "\n" +
    "\n" +
    "<a \n" +
    "	ic-home\n" +
    "	ic-toggle-overlay \n" +
    "	ic-touch-me\n" +
    ">\n" +
    "	Home\n" +
    "</a>\n" +
    "\n" +
    "<a \n" +
    "	ng-repeat 	= \"type in ::icConfigData.types\"\n" +
    "	ng-href		= \"/t/{{::type}}\"\n" +
    "	ng-click 	= \"icOverlays.toggle()\" \n" +
    "	ic-touch-me\n" +
    ">\n" +
    "	<span \n" +
    "		class 		= \"icon\"\n" +
    "		style		= \"background-image: url({{::type | icIcon : 'type' : 'color'}});\"\n" +
    "	>		\n" +
    "	</span>\n" +
    "	<div>\n" +
    "		{{type | uppercase | prepend : \"TYPES.\" | translate}}\n" +
    "	</div>\n" +
    "</a>\n" +
    "\n" +
    "\n" +
    "<a\n" +
    "	ng-click 	= \"expand.topics = !expand.topics\"\n" +
    "	ng-class	= \"{'icon-interface-arrow-down': expand.topics, 'icon-interface-arrow-right': !expand.topics}\"\n" +
    "	class	 	= \"expand \"\n" +
    "	ic-touch-me\n" +
    ">\n" +
    "	{{\"INTERFACE.TOPICS\" | translate}}\n" +
    "</a>\n" +
    "\n" +
    "<div ng-show = \"expand.topics\">\n" +
    "	<a \n" +
    "		ng-repeat 	= \"topic in ::icConfigData.topics\"\n" +
    "		ng-href		= \"/tp/{{::topic}}\"\n" +
    "		ng-click 	= \"icOverlays.toggle()\" 		\n" +
    "		ic-touch-me\n" +
    "	>\n" +
    "		<span \n" +
    "			class 		= \"icon\"\n" +
    "			style		= \"background-image: url({{::topic | icIcon : 'topic' : 'black'}});\"\n" +
    "		>		\n" +
    "		</span>\n" +
    "		{{topic | uppercase | prepend : \"TOPICS.\" | translate}}\n" +
    "	</a>\n" +
    "</div>\n" +
    "\n" +
    "<a ng-if = \"icUser.authToken\"></a>\n" +
    "<a \n" +
    "	ng-if 		= \"icUser.authToken\" \n" +
    "	class 		= \"xjust\"\n" +
    "	ng-click 	= \"logout()\" \n" +
    "><span>{{icUser.name}}</span>  <span>{{'INTERFACE.LOGOUT' | translate}}</span></a>\n" +
    "\n" +
    "<a \n" +
    "	ng-if 				= \"!icUser.authToken\"\n" +
    "	ic-toggle-overlay 	= \"login\"\n" +
    "	ic-touch-me\n" +
    ">\n" +
    "	{{'INTERFACE.LOGIN' | translate}}\n" +
    "</a>\n" +
    "\n" +
    "\n" +
    "<a \n" +
    "	ng-click 		= \"icSite.addItemToPath(icItemCreation.newItem().id)\"\n" +
    "	ic-toggle-overlay\n" +
    "	ic-touch-me\n" +
    ">\n" +
    "	{{ (icUser.role == 'editor' ? 'INTERFACE.NEW_ITEM' : 'INTERFACE.SUGGEST_ITEM') | translate}}\n" +
    "</a>\n" +
    "\n" +
    "\n" +
    "<a\n" +
    "	ng-if		= \"icItemCreation.items.length > 0\"\n" +
    "	ng-click 	= \"expand.newItems = !expand.newItems\"\n" +
    "	ng-class	= \"{'icon-interface-arrow-down': expand.newItems, 'icon-interface-arrow-right': !expand.newItems}\"\n" +
    "	class	 	= \"expand \"\n" +
    "	ic-touch-me\n" +
    ">\n" +
    "	{{'INTERFACE.NEW_ITEM_LIST' | translate}}\n" +
    "</a>\n" +
    "\n" +
    "<div ng-show = \"expand.newItems\">\n" +
    "	<a\n" +
    "		ng-repeat	= \"item in icItemCreation.items\"\n" +
    "		ng-href		= \"{{ {item : item.id} | icAddParameters }}\"\n" +
    "		ic-toggle-overlay\n" +
    "		ic-touch-me\n" +
    "	>{{item.title || item.id}}</a>\n" +
    "</div>\n"
  );


  $templateCache.put('partials/ic-overlays.html',
    "<ic-main-menu			ng-class = \"{'ic-hide': !icOverlays.show.mainMenu}\"			class = \"white left\">	</ic-main-menu>\n" +
    "<ic-language-menu 		ng-class = \"{'ic-hide': !icOverlays.show.languageMenu}\" 	class = \"white right\">	</ic-language-menu>	\n" +
    "<ic-sharing-menu 		ng-class = \"{'ic-hide': !icOverlays.show.sharingMenu}\" 		class = \"white right\">	</ic-sharing-menu>\n" +
    "\n" +
    "<ic-login \n" +
    "	ng-if 				= \"icOverlays.show.login\" \n" +
    "	class 				= \"white center\"\n" +
    "	ic-on-success		= \"icOverlays.toggle()\"\n" +
    "	ic-on-cancel		= \"icOverlays.toggle()\"\n" +
    ">\n" +
    "	<div\n" +
    "		class		= \"message\" \n" +
    "		ng-repeat 	= \"message in icOverlays.messages.login\">\n" +
    "		{{message | translate}}\n" +
    "	</div>\n" +
    "</ic-login>\n" +
    "\n" +
    "\n" +
    "\n" +
    "<div \n" +
    "	class 				=	\"qrcode black full\"\n" +
    "	ic-toggle-overlay	=	\"qrcode\"\n" +
    "	ng-if				=	\"icOverlays.show.qrcode\"\n" +
    ">\n" +
    "	<qrcode \n" +
    "		version					=	\"3\" \n" +
    "		error-correction-level	=	\"M\" \n" +
    "		size					=	\"200\" \n" +
    "		data					=	\"{{icSite.params.item | icItemLink}}\"\n" +
    "	>\n" +
    "	</qrcode>\n" +
    "	<div>{{icSite.params.item | icItemLink}}</div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "\n"
  );


  $templateCache.put('partials/ic-preview-item.html',
    "<div class = \"icon bg-{{::icType | icColor}}\"\n" +
    "	 style = \"background-image: url({{::icTopic|icIcon : 'topic' :'white'}})\"\n" +
    ">\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "<div class = \"content\">\n" +
    "\n" +
    "		<div class =\"title\">\n" +
    "			{{::icTitle}}\n" +
    "		</div>\n" +
    "\n" +
    "		<div class = \"brief\">\n" +
    "			{{icBrief}}\n" +
    "		</div>\n" +
    "</div>"
  );


  $templateCache.put('partials/ic-quick-filter.html',
    "<a \n" +
    "		ng-repeat 	= \"type in ::icConfigData.types\"\n" +
    "		ng-click 	= \"icFilterConfig.toggleFilter('type', type)\" \n" +
    "		ng-class 	= \"{'active' : icFilterConfig.matchFilter('type', type)}\"\n" +
    "		class		= \"border-{{::type | icColor}} text-{{::type | icColor}}\"\n" +
    "		style		= \"background-image: url({{::type | icIcon : 'type' :'color'}});\"\n" +
    "		ic-touch-me\n" +
    ">\n" +
    "	{{meta[type]}}\n" +
    "</a>"
  );


  $templateCache.put('partials/ic-search-result-list.html',
    "<ic-spinner active = \"icSearchResults.listLoading()\"></ic-spinner>\n" +
    "\n" +
    "<a\n" +
    "	ng-repeat	= \"item in icSearchResults.filteredList\"\n" +
    "	ng-href		= \"{{icHref({itemId:item.id})}}\"\n" +
    ">\n" +
    "\n" +
    "	<ic-preview-item\n" +
    "		ic-title 	= \"::item.title\"\n" +
    "		ic-brief	= \"item.definition[language]\"\n" +
    "		ic-topic	= \"::item.primaryTopic\"\n" +
    "		ic-type		= \"::item.type\"\n" +
    "		ng-class	= \"{active: icActive({itemId: item.id})}\"\n" +
    "	>\n" +
    "	</ic-preview-item>\n" +
    "</a>\n" +
    "\n" +
    "<ic-spinner \n" +
    "	ng-if 	= \"!icSearchResults.noMoreItems\"\n" +
    "	active 	= \"icSearchResults.listLoading()\"\n" +
    "></ic-spinner>\n" +
    "\n" +
    "<div ng-if = \"icSearchResults.noMoreItems\" class =\"no-more-items\">no more items</div>\n" +
    "\n"
  );


  $templateCache.put('partials/ic-search-term.html',
    "<div ng-if	= \"icFilterConfig.searchTerm\">\n" +
    "		» <span>{{icFilterConfig.searchTerm | uppercase}}</span> «\n" +
    "		<span>({{icSearchResults.meta['total']}})</span>\n" +
    "		<button \n" +
    "			class 		= \"icon-nav-close\"\n" +
    "			ng-click 	= \"icFilterConfig.searchTerm = ''\" \n" +
    "		></button>\n" +
    "</div>\n" +
    "\n" +
    "<hr ng-if	= \"icFilterConfig.searchTerm\"/>\n"
  );


  $templateCache.put('partials/ic-search.html',
    "<form\n" +
    "	ng-submit = \"update()\"\n" +
    ">\n" +
    "\n" +
    "	<div class = \"search-term\"> \n" +
    "		<input\n" +
    "			id					= \"search-term\" 			\n" +
    "			tabindex			= \"1\"\n" +
    "			type 				= \"text\" \n" +
    "			ng-model 			= \"searchTerm\"\n" +
    "			placeholder			= \"{{'INTERFACE.SEARCH' | translate }}\"\n" +
    "		>\n" +
    "		</input>\n" +
    "		<button \n" +
    "			class 	= \"icon-nav-search\"\n" +
    "			type	= \"submit\"	 \n" +
    "		>\n" +
    "		</button>\n" +
    "	</div>\n" +
    "</form>"
  );


  $templateCache.put('partials/ic-sharing-menu.html',
    "<h2>\n" +
    "	{{\"INTERFACE.SHARE\" | translate}}\n" +
    "</h2>\n" +
    "\n" +
    "<a \n" +
    "	ng-repeat  	= \"platform in platforms\"\n" +
    "	ng-href		= \"{{::platform.link}}\" \n" +
    ">\n" +
    "		<span \n" +
    "			class 		= \"icon\"\n" +
    "			style		= \"background-image: url({{::platform.name | icIcon : 'item' : 'black'}});\"\n" +
    "		>		\n" +
    "		</span>\n" +
    "	{{platform.name | prepend: \"INTERFACE.SHARE.\" | translate}}\n" +
    "</a>"
  );


  $templateCache.put('partials/ic-tile.html',
    "<div \n" +
    "	class = \"background {{::icIcon ? 'icon' : ''}} {{::icImage ? 'image' : ''}}\" \n" +
    "	style = \"background-image: url({{::icImage||icIcon }})\"\n" +
    ">\n" +
    "</div>\n" +
    "\n" +
    "<div class =\"content\">\n" +
    "	<div ng-if = \"icTitle\" class =\"title\">{{icTitle}}</div>\n" +
    "	<div ng-if = \"icBrief\" class =\"brief\">{{icBrief}}</div>\n" +
    "</div>"
  );


  $templateCache.put('partials/section-filter.html',
    "<ic-filter-interface expand-filter = \"true\">\n" +
    "</ic-filter-interface>\n" +
    "\n" +
    "\n"
  );


  $templateCache.put('partials/section-item.html',
    "<ic-full-item 	ng-if = \"icSite.params.item\" ic-id = \"icSite.params.item\"></ic-full-item>\n" +
    "<ic-unavailable	ng-if = \"!icSite.params.item\"></ic-unavailable>\n"
  );


  $templateCache.put('partials/section-list.html',
    "<ic-search-term></ic-search-term>\n" +
    "\n" +
    "<ic-filter-interface\n" +
    "	ng-if = \"icShowFilter\"\n" +
    ">\n" +
    "</ic-filter-interface>\n" +
    "\n" +
    "\n" +
    "<ic-quick-filter>\n" +
    "</ic-quick-filter>\n" +
    "\n" +
    "\n" +
    "<ic-search-result-list\n" +
    "	ic-href 	= \"icSite.getNewPath({'item': itemId})\"\n" +
    "	ic-active	= \"icSite.params.item == itemId\"\n" +
    ">\n" +
    "</ic-search-result-list>\n" +
    "\n"
  );


  $templateCache.put('pages/main.html',
    "<div class = \"logo\">\n" +
    "	<h1><ic-text-logo></ic-text-logo></h1>\n" +
    "	<h2>{{'INTERFACE.CLAIM' | translate}}</h2>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "<div\n" +
    "	no-text-nodes \n" +
    "	class = \"tiles\"\n" +
    ">\n" +
    "\n" +
    "	\n" +
    "\n" +
    "	\n" +
    "	\n" +
    "	<a\n" +
    "		ng-repeat	= \"type in icConfigData.types\"\n" +
    "		ng-href 	= \"{{icSite.getNewPath({t: type}, true)}}\"\n" +
    "		ic-tile\n" +
    "		ic-title	= \"'TYPES.'+type | uppercase | translate\"\n" +
    "		ic-brief	= \"\"\n" +
    "		ic-icon		= \"type | icIcon : 'type' : 'white'\"\n" +
    "		ic-type		= \"type\"\n" +
    "	></a>\n" +
    "\n" +
    "	<a\n" +
    "		ng-href 	= \"/s/infopoint\"\n" +
    "		ic-tile\n" +
    "		ic-title	= \"'Infopoints'\"\n" +
    "		ic-brief	= \"\"\n" +
    "		ic-type		= \"'places'\"\n" +
    "		ic-image	= \"'/images/infopoint.jpg'\"\n" +
    "	></a>\n" +
    "\n" +
    "\n" +
    "	<a\n" +
    "		ng-repeat	= \"target_group in icConfigData.targetGroups\"\n" +
    "		ng-href 	= \"#{{icSite.getNewPath({tg: target_group}, true)}}\"\n" +
    "		ic-tile\n" +
    "		ic-title	= \"target_group | prepend : 'TARGET_GROUPS.' | uppercase | translate\"\n" +
    "		ic-brief	= \"'INTERFACE.TARGET_GROUP' |translate\"\n" +
    "		ic-type		= \"::Mock.random(['events', 'services', 'places', 'information'], $index+1)\"\n" +
    "	></a>\n" +
    "\n" +
    "	<!-- <a \n" +
    "		href 		= \"#{{::icSite.getNewPath({item: index})}}\" \n" +
    "		ic-tile\n" +
    "		ic-title	= \"::Mock.random(['Kurs', 'Angebot', 'Projekt', 'Termine'], index+5)\"\n" +
    "		ic-brief	= \"::Mock.random(['von Beispielinitiative', 'für Beispieltext', 'mit Blindtext', 'im Beispielamt'], index+3)\"\n" +
    "		ic-image	= \"::Mock.image(index+2)\"\n" +
    "		ic-type		= \"::Mock.random(['events', 'services', 'places', 'information'], index+1)\"\n" +
    "\n" +
    "		ng-repeat 	= \"index in ::Mock.arr(16)\"\n" +
    "	></a> -->\n" +
    "\n" +
    "</div>\n" +
    "\n"
  );

}]);
