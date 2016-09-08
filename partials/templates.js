angular.module('InfoCompass').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('partials/ic-filter-interface.html',
    "<div class = \"controls\">	\n" +
    "	<button\n" +
    "		class 		= \"sort\"\n" +
    "		ng-class	= \"{'icon-interface-arrow-down': open != 'sort', 'icon-interface-arrow-up': open == 'sort'}\"\n" +
    "		ng-click 	= \"toggleSortPanel()\" \n" +
    "	>\n" +
    "		{{\"INTERFACE.SORT\" | translate}}\n" +
    "	</button>\n" +
    "\n" +
    "	<button\n" +
    "		class 		= \"sort\"\n" +
    "		ng-class	= \"{'icon-interface-arrow-down': open != 'filter', 'icon-interface-arrow-up': open == 'filter'}\"<\n" +
    "		ng-click 	= \"toggleFilterPanel()\" \n" +
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
    "		ng-click 	= \"expand.topics = !expand.topics\"\n" +
    "	>\n" +
    "		{{\"INTERFACE.TOPICS\" | translate}}\n" +
    "	</a>\n" +
    "\n" +
    "	<div ng-if = \"expand.topics\">\n" +
    "		<a \n" +
    "			ng-click 	= \"icFilterConfig.clearFilter('topic')\" \n" +
    "			ng-class 	= \"{'icon-interface-checkbox-selected' : icFilterConfig.matchFilter('topic', undefined), 'icon-interface-checkbox': !icFilterConfig.matchFilter('topic', undefined)}\"\n" +
    "		>\n" +
    "			{{\"INTERFACE.TOPICS_ALL\" | translate}}\n" +
    "		</a>\n" +
    "		<a \n" +
    "			ng-repeat 	= \"topic in icConfigData.topics | orderBy : 'toString()| uppercase | prepend: \\'TOPICS.\\' |translate'\"\n" +
    "			ng-click 	= \"icFilterConfig.toggleFilter('topic', topic)\" \n" +
    "			ng-class 	= \"{'icon-interface-checkbox-selected' : icFilterConfig.matchFilter('topic', topic), 'icon-interface-checkbox': !icFilterConfig.matchFilter('topic', topic)}\"\n" +
    "		>\n" +
    "			{{topic | uppercase | prepend: \"TOPICS.\" |translate}}\n" +
    "		</a>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "	<a \n" +
    "		ng-class	= \"{'icon-interface-arrow-right': !expand.targetGroups, 'icon-interface-arrow-down': expand.targetGroups}\" \n" +
    "		ng-click 	= \"expand.targetGroups = !expand.targetGroups\"\n" +
    "	>\n" +
    "		{{\"INTERFACE.TARGET_GROUPS\" | translate}}\n" +
    "	</a>\n" +
    "\n" +
    "	<div ng-if = \"expand.targetGroups\">\n" +
    "		<a \n" +
    "			ng-click 	= \"icFilterConfig.clearFilter('targetGroup')\" \n" +
    "			ng-class 	= \"{'icon-interface-checkbox-selected' : icFilterConfig.matchFilter('targetGroup', undefined), 'icon-interface-checkbox': !icFilterConfig.matchFilter('targetGroup', undefined)}\"\n" +
    "		>\n" +
    "			{{\"INTERFACE.TARGET_GROUP.ALL\" | translate}}\n" +
    "		</a>\n" +
    "		<a \n" +
    "			ng-repeat 	= \"targetGroup in icConfigData.targetGroups | orderBy : 'toString()| uppercase | prepend: \\'TARGET_GROUPS.\\' |translate'\"\n" +
    "			ng-click 	= \"icFilterConfig.toggleFilter('targetGroup', targetGroup)\" \n" +
    "			ng-class 	= \"{'icon-interface-checkbox-selected' : icFilterConfig.matchFilter('targetGroup', targetGroup), 'icon-interface-checkbox': !icFilterConfig.matchFilter('targetGroup', targetGroup)}\"\n" +
    "		>\n" +
    "			{{targetGroup | uppercase | prepend: \"TARGET_GROUPS.\" |translate}}\n" +
    "		</a>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "</div>\n"
  );


  $templateCache.put('partials/ic-full-item.html',
    "\n" +
    "<ic-unavailable ng-if =\"!loading && !item.title\"></ic-unavailable>\n" +
    "\n" +
    "<ic-spinner active = \"loading\"></ic-spinner>\n" +
    "\n" +
    "<div ng-if =\"item.title\">\n" +
    "	<h2 class 	= \"title\">{{ item.title }}</h2>\n" +
    "	<h3 class 	= \"definition\"> {{ item.definition[language] }}</h3>\n" +
    "	<div class = \"topics\">\n" +
    "		<a \n" +
    "			ng-repeat 	= \"topic in item.topic\"\n" +
    "			class		= \"highlight\"\n" +
    "		>\n" +
    "			{{topic | uppercase | prepend : \"TOPICS.\" | translate | append : $last ? '' : ','}}\n" +
    "		</a>\n" +
    "	</div>\n" +
    "\n" +
    "	<img ng-if = \"item.imageUrl\" ng-src = \"{{item.imageUrl}}\"/>\n" +
    "	<p>\n" +
    "		{{item.description[language]}}\n" +
    "	</p>\n" +
    "\n" +
    "\n" +
    "	<ic-info-tag\n" +
    "		ng-repeat	= \"key in ['address', 'phone', 'email', 'website']\"\n" +
    "		ng-if		= \"item[key]\"\n" +
    "		ic-title 	= \"'ITEM_INFO_'+key\"\n" +
    "		ic-content	= \"item[key]\"\n" +
    "		ic-icon		= \"'images/icon_'+key+'.svg'\"\n" +
    "	>\n" +
    "	</ic-info-tag>\n" +
    "\n" +
    "	<ic-info-tag\n" +
    "		ng-repeat	= \"key in ['name', 'phone', 'email']\"\n" +
    "		ng-if		= \"item.contacts && item.contacts[key]\"\n" +
    "		ic-title 	= \"'ITEM_INFO_'+key\"\n" +
    "		ic-content	= \"item.contacts[key]\"\n" +
    "		ic-icon		= \"'images/icon_'+key+'.svg'\"\n" +
    "	>\n" +
    "	</ic-info-tag>\n" +
    "\n" +
    "	<footer>\n" +
    "		<a class = \"icon-interface-print highlight\">	Drucken		</a>\n" +
    "		<a class = \"icon-interface-share highlight\">	Teilen		</a>\n" +
    "		<a class = \"icon-interface-edit  highlight\">	Bearbeiten	</a>\n" +
    "	</footer>\n" +
    "</div>"
  );


  $templateCache.put('partials/ic-header.html',
    "	\n" +
    "	<button\n" +
    "		type				= \"button\"\n" +
    "		class				= \"icon-interface-close fleft\"\n" +
    "		ng-show				= \"icSite.show('item')\"\n" +
    "		ng-click			= \"icSite.clearItem()\"\n" +
    "	></button>\n" +
    "\n" +
    "\n" +
    "	<button\n" +
    "		type				= \"button\"	\n" +
    "		class 				= \"icon-nav-menu fleft\"\n" +
    "		ic-toggle-overlay 	= \"mainMenu\" \n" +
    "		ng-show				= \"!icSite.show('item')\"\n" +
    "	></button>\n" +
    "\n" +
    "\n" +
    "	<button \n" +
    "		type				= \"button\"\n" +
    "		class 				= \"icon-interface-share\"\n" +
    "		ng-show				= \"icSite.show('item')\"\n" +
    "	></button>\n" +
    "	\n" +
    "	<button \n" +
    "		type				= \"button\"\n" +
    "		class 				= \"icon-interface-print\"\n" +
    "		ng-show				= \"icSite.show('item')\"\n" +
    "	></button>\n" +
    "\n" +
    "	<button \n" +
    "		type				= \"button\"\n" +
    "		class 				= \"icon-nav-language\"\n" +
    "		ic-toggle-overlay 	= \"languageMenu\" \n" +
    "	></button>\n" +
    "\n" +
    "	<button \n" +
    "		type				= \"button\"\n" +
    "		class 				= \"icon-nav-search\"\n" +
    "		ic-toggle-overlay 	= \"search\"\n" +
    "		ng-show				= \"!icSite.show('item')\"\n" +
    "	></button>\n"
  );


  $templateCache.put('partials/ic-info-tag.html',
    "<div class = \"icon\" style = \"background-image: url({{icIcon}})\"></div>\n" +
    "<div class = \"title\">					{{icTitle}}		</div>\n" +
    "<div class = \"content text-primary\">	{{icContent}}	</div>\n" +
    "\n"
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
    ">\n" +
    "	<div \n" +
    "		ng-class 	= \"{'highlight': icLanguageConfig.currentLanguage == language}\"		\n" +
    "	>\n" +
    "		<span class = \"native\">{{\"LANGUAGES.\"+language.toUpperCase()+\".NATIVE\" | translate}}</span>\n" +
    "		<span \n" +
    "			ng-if = \"icLanguageConfig.currentLanguage != language\"\n" +
    "			class = \"translation small light\"\n" +
    "		>\n" +
    "				{{\"LANGUAGES.\"+language.toUpperCase()+\".NAME\" | translate}}\n" +
    "		</span>\n" +
    "	</div>\n" +
    "</a>"
  );


  $templateCache.put('partials/ic-main-menu.html',
    "<h2>\n" +
    "	<ic-text-logo></ic-text-logo>\n" +
    "</h2>\n" +
    "\n" +
    "\n" +
    "<a \n" +
    "	ng-href		= \"/\"\n" +
    "	ng-click 	= \"icOverlays.toggle()\" \n" +
    ">\n" +
    "	Home\n" +
    "</a>\n" +
    "\n" +
    "<a \n" +
    "	ng-repeat 	= \"type in ::icConfigData.types\"\n" +
    "	ng-click 	= \"icSite.clearItem(); icFilterConfig.clearFilter().toggleFilter('type', type); icOverlays.toggle()\" \n" +
    ">\n" +
    "	<span \n" +
    "		class 		= \"icon\"\n" +
    "		style		= \"background-image: url({{::type | icIcon : 'color'}});\"\n" +
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
    ">\n" +
    "	{{\"INTERFACE.TOPICS\" | translate}}\n" +
    "</a>\n" +
    "\n" +
    "<div ng-show = \"expand.topics\">\n" +
    "	<a \n" +
    "		ng-repeat 	= \"topic in ::icConfigData.topics\"\n" +
    "		ng-click 	= \"icSite.clearItem(); icFilterConfig.clearFilter().toggleFilter('topic', topic); icOverlays.toggle()\"\n" +
    "	>\n" +
    "		<span \n" +
    "			class 		= \"icon\"\n" +
    "			style		= \"background-image: url({{::topic | icIcon : 'black'}});\"\n" +
    "		>		\n" +
    "		</span>\n" +
    "		{{topic | uppercase | prepend : \"TOPICS.\" | translate}}\n" +
    "	</a>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<a \n" +
    ">\n" +
    "	MERKLISTE\n" +
    "</a>\n" +
    "\n" +
    "\n" +
    "\n" +
    "<a \n" +
    ">\n" +
    "	BEITRAG ERSTELLEN\n" +
    "</a>\n" +
    "\n" +
    "\n" +
    "\n" +
    "<a \n" +
    ">\n" +
    "	ABOUT\n" +
    "</a>\n" +
    "\n" +
    "\n" +
    "\n" +
    "<a \n" +
    ">\n" +
    "	LOGIN\n" +
    "</a>"
  );


  $templateCache.put('partials/ic-overlays.html',
    "\n" +
    "<ic-language-menu 		ng-class = \"{'ic-hide': !icOverlays.show.languageMenu}\" 	class = \"white right\">	</ic-language-menu>	\n" +
    "<ic-main-menu			ng-class = \"{'ic-hide': !icOverlays.show.mainMenu}\"			class = \"white left\">	</ic-main-menu>\n" +
    "\n" +
    "<ic-search				\n" +
    "	ng-class 			= \"{'ic-hide':!icOverlays.show.search}\"\n" +
    "	class 				= \"white right\"\n" +
    "	ic-on-update 		= \"icOverlays.toggle('search')\" \n" +
    "></ic-search>\n"
  );


  $templateCache.put('partials/ic-preview-item.html',
    "<div class = \"icon bg-{{::icType | icColor}}\"\n" +
    "	 style = \"background-image: url({{::icTopic|icIcon : 'white'}})\"\n" +
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
    "		style		= \"background-image: url({{::type | icIcon : 'color'}});\"\n" +
    ">\n" +
    "	{{meta[type]}}\n" +
    "</a>"
  );


  $templateCache.put('partials/ic-search-result-list.html',
    "<a\n" +
    "	ng-repeat	= \"item in icSearchResults.filteredList\"\n" +
    "	ng-href		= \"#{{::icHref({itemId:item.id})}}\"\n" +
    ">\n" +
    "	<ic-preview-item\n" +
    "		ic-title 	= \"::item.title\"\n" +
    "		ic-brief	= \"item.definition[language]\"\n" +
    "		ic-topic	= \"::item.primary_topic\"\n" +
    "		ic-type		= \"::item.type\"\n" +
    "		ng-class	= \"{active: icActive({itemId: item.id})}\"\n" +
    "	>\n" +
    "	</ic-preview-item>\n" +
    "</a>\n" +
    "\n" +
    "<div ng-if = \"icSearchResults.noMoreItems\" class =\"no-more-items\">no more items</div>\n" +
    "<ic-spinner active = \"icSearchResults.listLoading()\"></ic-spinner>\n" +
    "\n"
  );


  $templateCache.put('partials/ic-search.html',
    "<form\n" +
    "	ng-submit = \"update()\"\n" +
    ">\n" +
    "\n" +
    "	<input \n" +
    "		id					= \"search-term\"\n" +
    "		tabindex			= \"1\"\n" +
    "		type 				= \"text\" \n" +
    "		ng-model 			= \"searchTerm\"\n" +
    "	>\n" +
    "	</input>\n" +
    "\n" +
    "	<div class = \"tags\">\n" +
    "\n" +
    "		<!--TYPES -->\n" +
    "		<a 	\n" +
    "			ng-if		= \"icFilterConfig.filterBy.type\"\n" +
    "			ng-click  	= \"icFilterConfig.toggleFilter('type', icFilterConfig.filterBy.type)\" \n" +
    "		>\n" +
    "			{{icFilterConfig.filterBy.type | uppercase | prepend: \"TYPES.\" |translate}}\n" +
    "			<span class =\"icon icon-nav-close\"></span>\n" +
    "		</a>\n" +
    "\n" +
    "		<!--TOPICS -->\n" +
    "		<a 	\n" +
    "			ng-repeat = \"topic in icFilterConfig.filterBy.topic\"\n" +
    "			ng-click  = \"icFilterConfig.toggleFilter('topic', topic)\" \n" +
    "		>\n" +
    "			{{topic | uppercase | prepend: \"TOPICS.\" |translate}}\n" +
    "			<span class =\"icon icon-nav-close\"></span>\n" +
    "		</a>\n" +
    "\n" +
    "\n" +
    "		<!--TARGET_GROUPS -->\n" +
    "		<a ng-repeat = \"targetGroup in icFilterConfig.filterBy.targetGroup\"\n" +
    "			ng-click  = \"icFilterConfig.toggleFilter('targetGroup', targetGroup)\" \n" +
    "		>\n" +
    "			{{targetGroup | uppercase | prepend: \"TARGET_GROUPS.\" |translate}}\n" +
    "			<span class =\"icon icon-nav-close\"></span>\n" +
    "		</a>\n" +
    "\n" +
    "	</div>\n" +
    "\n" +
    "	<div \n" +
    "		class 	= \"auto-suggest\"\n" +
    "		ng-if	= \"searchTerm.length > 2\"\n" +
    "	>\n" +
    "		<a\n" +
    "			ng-repeat 		= \"title in icTitles | filter : searchTerm | limitTo: 5 track by $index\"		\n" +
    "			ng-mousedown  	= \"setSearchTerm(title)\"\n" +
    "			ng-if 			= \"title != searchTerm\" \n" +
    "		>\n" +
    "			{{title}}\n" +
    "		</a>\n" +
    "	</div>\n" +
    "\n" +
    "</form>"
  );


  $templateCache.put('partials/ic-tile.html',
    "<div \n" +
    "	class = \"background {{::icIcon ? 'icon' : ''}} {{::icImage ? 'image' : ''}}\" \n" +
    "	style = \"background-image: url({{::icImage||icIcon}})\"\n" +
    ">\n" +
    "</div>\n" +
    "\n" +
    "<div class =\"content\">\n" +
    "	<div class =\"title\">{{icTitle}}</div>\n" +
    "	<div class =\"brief\">{{icBrief}}</div>\n" +
    "</div>"
  );


  $templateCache.put('partials/section-filter.html',
    "<ic-filter-interface>\n" +
    "</ic-filter-interface>\n" +
    "\n" +
    "\n"
  );


  $templateCache.put('partials/section-item.html',
    "<ic-full-item 	ng-if = \"icId\" ic-id = \"icId\"></ic-full-item>\n" +
    "<ic-unavailable	ng-if = \"!icId\"></ic-unavailable>\n"
  );


  $templateCache.put('partials/section-list.html',
    "\n" +
    "<ic-filter-interface\n" +
    "	ng-if = \"icShowFilter\"\n" +
    ">\n" +
    "</ic-filter-interface>\n" +
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
    "	<h2>Informationen und Angebote für Geflüchtete und Unterstützer*innen (mehr)</h2>\n" +
    "</div>\n" +
    "\n" +
    "<d iv\n" +
    "	no-text-nodes \n" +
    "	class = \"tiles\"\n" +
    ">\n" +
    "\n" +
    "	\n" +
    "\n" +
    "	\n" +
    "	\n" +
    "	<a \n" +
    "		ng-repeat	= \"type in icConfigData.types\"\n" +
    "		ng-href 	= \"#{{icSite.getNewPath({t: type}, true)}}\"\n" +
    "		ng-class 	= \"{active : icSite.params.t == type}\"\n" +
    "		ic-tile\n" +
    "		ic-title	= \"'TYPES.'+type.toUpperCase() | translate\"\n" +
    "		ic-brief	= \"'Kurzer Text'\"\n" +
    "		ic-icon		= \"type | icIcon\"\n" +
    "		ic-type		= \"type\"\n" +
    "	></a>\n" +
    "\n" +
    "\n" +
    "	<a \n" +
    "		href 		= \"#{{::icSite.getNewPath({item: index})}}\" \n" +
    "		ic-tile\n" +
    "		ic-title	= \"::Mock.random(['Kurs', 'Angebot', 'Projekt', 'Termine'], index+5)\"\n" +
    "		ic-brief	= \"::Mock.random(['von Beispielinitiative', 'für Beispieltext', 'mit Blindtext', 'im Beispielamt'], index+3)\"\n" +
    "		ic-image	= \"::Mock.image(index+2)\"\n" +
    "		ic-type		= \"::Mock.random(['events', 'services', 'places', 'information'], index+1)\"\n" +
    "\n" +
    "		ng-repeat 	= \"index in ::Mock.arr(16)\"\n" +
    "	></a>\n" +
    "\n" +
    "</div>\n" +
    "\n"
  );

}]);
