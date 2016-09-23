angular.module('InfoCompass').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('partials/ic-filter-interface.html',
    "<div \n" +
    "	class 	= \"search-term\"\n" +
    "	ng-if	= \"icFilterConfig.searchTerm\"\n" +
    ">\n" +
    "		\"{{icFilterConfig.searchTerm}}\"\n" +
    "		<button \n" +
    "			class 		= \"icon-nav-close\"\n" +
    "			ng-click 	= \"icFilterConfig.searchTerm = ''\" \n" +
    "		></button>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
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
    "		ng-click 	= \"expand.topics = !expand.topics\"\n" +
    "		ic-touch-me\n" +
    "	>\n" +
    "		{{\"INTERFACE.TOPICS\" | translate}}\n" +
    "	</a>\n" +
    "\n" +
    "	<div ng-if = \"expand.topics\">\n" +
    "		<a \n" +
    "			ng-click 	= \"icFilterConfig.clearFilter('topic')\" \n" +
    "			ng-class 	= \"{'icon-interface-checkbox-selected' : icFilterConfig.matchFilter('topic', undefined), 'icon-interface-checkbox': !icFilterConfig.matchFilter('topic', undefined)}\"\n" +
    "			ic-touch-me\n" +
    "		>\n" +
    "			{{\"INTERFACE.TOPICS_ALL\" | translate}}\n" +
    "		</a>\n" +
    "		<a \n" +
    "			ng-repeat 	= \"topic in icConfigData.topics | orderBy : 'toString()| uppercase | prepend: \\'TOPICS.\\' |translate'\"\n" +
    "			ng-click 	= \"icFilterConfig.toggleFilter('topic', topic)\" \n" +
    "			ng-class 	= \"{'icon-interface-checkbox-selected' : icFilterConfig.matchFilter('topic', topic), 'icon-interface-checkbox': !icFilterConfig.matchFilter('topic', topic)}\"\n" +
    "			ic-touch-me			\n" +
    "		>\n" +
    "			{{topic | uppercase | prepend: \"TOPICS.\" |translate}}\n" +
    "		</a>\n" +
    "	</div>\n" +
    "\n" +
    "\n" +
    "	<a \n" +
    "		ng-class	= \"{'icon-interface-arrow-right': !expand.targetGroups, 'icon-interface-arrow-down': expand.targetGroups}\" \n" +
    "		ng-click 	= \"expand.targetGroups = !expand.targetGroups\"\n" +
    "		ic-touch-me\n" +
    "	>\n" +
    "		{{\"INTERFACE.TARGET_GROUPS\" | translate}}\n" +
    "	</a>\n" +
    "\n" +
    "	<div ng-if = \"expand.targetGroups\">\n" +
    "		<a \n" +
    "			ng-click 	= \"icFilterConfig.clearFilter('targetGroup')\" \n" +
    "			ng-class 	= \"{'icon-interface-checkbox-selected' : icFilterConfig.matchFilter('targetGroup', undefined), 'icon-interface-checkbox': !icFilterConfig.matchFilter('targetGroup', undefined)}\"\n" +
    "			ic-touch-me			\n" +
    "		>\n" +
    "			{{\"INTERFACE.TARGET_GROUPS_ALL\" | translate}}\n" +
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
    "<ic-unavailable ng-if =\"!loading && !item.title\"></ic-unavailable>\n" +
    "\n" +
    "<ic-spinner active = \"loading\"></ic-spinner>\n" +
    "\n" +
    "\n" +
    "<div ng-if =\"item.title\">\n" +
    "\n" +
    "\n" +
    "\n" +
    "	<!-- start item title -->\n" +
    "\n" +
    "		<h2 \n" +
    "			class 	= \"title\"\n" +
    "			ng-if	= \"!editMode\"\n" +
    "		>{{ item.title }}</h2>\n" +
    "\n" +
    "		<ic-item-edit\n" +
    "			ng-if 					= \"editMode\"\n" +
    "			ic-type 				= \"string\"\n" +
    "			ic-label				= \"{{'INTERFACE_ITEM_TITLE' | translate}} (restrictions...)\"\n" +
    "			ic-key					= \"title\"\n" +
    "			ic-item					= \"item\"\n" +
    "			ic-translatable			= \"false\"\n" +
    "\n" +
    "		></ic-item-edit>\n" +
    "\n" +
    "	<!-- end item title -->\n" +
    "\n" +
    "\n" +
    "	<!-- start item definition -->\n" +
    "\n" +
    "		<h3 \n" +
    "			class 	= \"definition\"\n" +
    "			ng-if	= \"!editMode\"\n" +
    "		> {{ item.definition[language] }}</h3>\n" +
    "\n" +
    "		\n" +
    "		<ic-item-edit\n" +
    "			ng-if 					= \"editMode\"\n" +
    "			ic-type 				= \"string\"\n" +
    "			ic-key					= \"definition\"\n" +
    "			ic-label				= \"{{'INTERFACE_ITEM_DEFINITION' | translate}} (restrictions...)\"\n" +
    "			ic-item					= \"item\"\n" +
    "			ic-translatable			= \"true\"\n" +
    "		></ic-item-edit>\n" +
    "\n" +
    "	<!-- end item definition -->\n" +
    "\n" +
    "\n" +
    "\n" +
    "	<div class = \"topics-and-target-groups highlight\">\n" +
    "		<a \n" +
    "			ng-repeat 	= \"topic in item.topics\"\n" +
    "			class		= \"highlight\"\n" +
    "			ng-href		= \"/#/tp/{{topic}}\"\n" +
    "		>{{topic | uppercase | prepend : \"TOPICS.\" | translate }}</a>\n" +
    "		<a \n" +
    "			ng-repeat 	= \"target_group in item.targetGroups\"\n" +
    "			class		= \"highlight\"\n" +
    "			ng-href		= \"/#/tg/{{target_group}}\"\n" +
    "		>{{target_group | uppercase | prepend : \"TARGET_GROUPS.\" | translate }}</a>\n" +
    "	</div>\n" +
    "\n" +
    "	<img\n" +
    "		class	= \"hero\" \n" +
    "		ng-if 	= \"item.imageUrl\" \n" +
    "		ng-src 	= \"{{item.imageUrl}}\"\n" +
    "	/>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "	<!-- start item description -->\n" +
    "\n" +
    "\n" +
    "	<p nng-if = \"!editMode\">\n" +
    "		{{item.description[language]}}\n" +
    "	</p>\n" +
    "\n" +
    "	<ic-item-edit\n" +
    "		ng-if 					= \"editMode\"\n" +
    "		ic-type 				= \"text\"\n" +
    "		ic-key					= \"description\"\n" +
    "		ic-label				= \"{{'INTERFACE_ITEM_DESCRIPTION' | translate}} (restrictions...)\"\n" +
    "		ic-item					= \"item\"\n" +
    "		ic-translatable			= \"true\"\n" +
    "	></ic-item-edit>\n" +
    "\n" +
    "	<!-- end item description -->\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "	<ic-info-tag\n" +
    "		ng-if			= \"item.address\"\n" +
    "		ic-title 		= \"'INTERFACE.ITEM_INFO_ADDRESS' | translate\"\n" +
    "		ic-content		= \"item.address\"\n" +
    "		ic-extra-lines	= \"[item.zip + ' ' +item.location]\"\n" +
    "		ic-icon			= \"'address'| icIcon : 'item' : 'black'\"\n" +
    "	>\n" +
    "	</ic-info-tag>\n" +
    "\n" +
    "\n" +
    "	<ic-info-tag\n" +
    "		ng-repeat	= \"key in ['phone', 'email', 'website']\"\n" +
    "		ng-if		= \"item[key]\"\n" +
    "		ic-title 	= \"key | uppercase | prepend: 'INTERFACE.ITEM_INFO_' | translate\"\n" +
    "		ic-content	= \"item[key]\"\n" +
    "		ic-icon		= \"key | icIcon : 'item' : 'black'\"\n" +
    "	>\n" +
    "	</ic-info-tag>\n" +
    "\n" +
    "	<ic-info-tag\n" +
    "		ng-repeat	= \"(key, content) in item.contacts\"\n" +
    "		ic-title 	= \"key | uppercase | prepend: 'INTERFACE.ITEM_INFO_' | translate\"\n" +
    "		ic-content	= \"content\"\n" +
    "		ic-icon		= \"key | icIcon : 'item' : 'black'\"\n" +
    "	>\n" +
    "	</ic-info-tag>\n" +
    "\n" +
    "	<qrcode \n" +
    "		version					=	\"3\" \n" +
    "		error-correction-level	=	\"M\" \n" +
    "		size					=	\"200\" \n" +
    "		data					=	\"{{linkToItem}}\"\n" +
    "		ng-if					=	\"item\"\n" +
    "	>\n" +
    "	</qrcode>\n" +
    "\n" +
    "\n" +
    "	<footer>\n" +
    "		<div class = \"tools\">\n" +
    "			<a class = \"icon-interface-print highlight\">	{{'INTERFACE.PRINT' | translate}}		</a>\n" +
    "			<a class = \"icon-interface-share highlight\">	{{'INTERFACE.SHARE'	| translate}}		</a>\n" +
    "			<a \n" +
    "				class 		= \"icon-interface-edit  highlight\"\n" +
    "				ic-click	= \"edit()\"\n" +
    "			> {{'INTERFACE.EDIT' | translate}} </a>\n" +
    "		</div>\n" +
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
    "		ng-click			= \"print()\"\n" +
    "	></button>\n" +
    "\n" +
    "	<button \n" +
    "		type				= \"button\"\n" +
    "		class 				= \"icon-nav-language\"\n" +
    "		ic-toggle-overlay 	= \"languageMenu\" \n" +
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
    "<div class = \"title\">					{{icTitle}}		</div>\n" +
    "<div class = \"content highlight\">		\n" +
    "	{{icContent}}	\n" +
    "	<div \n" +
    "		ng-repeat 	= \"line in icExtraLines\"\n" +
    "		ng-if		= \"line\"\n" +
    "	>\n" +
    "		{{line}}\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "\n"
  );


  $templateCache.put('partials/ic-item-edit-string.html',
    "<label>\n" +
    "	{{icLabel}}\n" +
    "	<div>\n" +
    "		<span class =\"current-value\">{{currentValue}}</span>	\n" +
    "\n" +
    "		<input \n" +
    "			ng-if		= \"icType == 'string' \" \n" +
    "			type 		= \"text\" \n" +
    "			ng-model	= \"newValue\" \n" +
    "		></input>\n" +
    "\n" +
    "		<textarea\n" +
    "			ng-if		= \"icType == 'text'\"\n" +
    "			ng-model	= \"newValue\"\n" +
    "		>\n" +
    "		</textarea>\n" +
    "	</div>\n" +
    "</label>"
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
    "		ic-scroll-bump              \n" +
    "	>\n" +
    "		<ic-section-list\n" +
    "			ic-show-filter  =   \"smlLayout.mode.name == 'XS'\" \n" +
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
    "		<ic-section-item ic-id = \"icSite.params.item\"></ic-section-item>\n" +
    "	</section><!--\n" +
    "	 </ic-horizontal-swipe-list>\n" +
    "	 -->\n" +
    "\n"
  );


  $templateCache.put('partials/ic-main-menu.html',
    "<h2>\n" +
    "	<ic-text-logo></ic-text-logo>\n" +
    "</h2>\n" +
    "\n" +
    "<ic-search				\n" +
    "	class 				= \"white right\"\n" +
    "	ic-on-update 		= \"icOverlays.toggle('mainMenu')\" \n" +
    "></ic-search>\n" +
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
    "	ng-href		= \"/#t/{{type}}\"\n" +
    "	ng-click 	= \"icOverlays.toggle()\" \n" +
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
    ">\n" +
    "	{{\"INTERFACE.TOPICS\" | translate}}\n" +
    "</a>\n" +
    "\n" +
    "<div ng-show = \"expand.topics\">\n" +
    "	<a \n" +
    "		ng-repeat 	= \"topic in ::icConfigData.topics\"\n" +
    "		ng-href		= \"/#tp/{{topic}}\"\n" +
    "		ng-click 	= \"icOverlays.toggle()\" 		\n" +
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
    "	ng-href		= \"#{{icHref({itemId:item.id})}}\"\n" +
    ">\n" +
    "\n" +
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
    "\n"
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
    "			ng-repeat = \"topic in icFilterConfig.filterBy.topics\"\n" +
    "			ng-click  = \"icFilterConfig.toggleFilter('topic', topic)\" \n" +
    "		>\n" +
    "			{{topic | uppercase | prepend: \"TOPICS.\" |translate}}\n" +
    "			<span class =\"icon icon-nav-close\"></span>\n" +
    "		</a>\n" +
    "\n" +
    "\n" +
    "		<!--TARGET_GROUPS -->\n" +
    "		<a ng-repeat = \"targetGroup in icFilterConfig.filterBy.targetGroups\"\n" +
    "			ng-click  = \"icFilterConfig.toggleFilter('targetGroup', targetGroup)\" \n" +
    "		>\n" +
    "			{{targetGroup | uppercase | prepend: \"TARGET_GROUPS.\" |translate}}\n" +
    "			<span class =\"icon icon-nav-close\"></span>\n" +
    "		</a>\n" +
    "\n" +
    "	</div>\n" +
    "\n" +
    "	<!-- <div \n" +
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
    "	</div> -->\n" +
    "\n" +
    "</form>"
  );


  $templateCache.put('partials/ic-tile.html',
    "<div \n" +
    "	class = \"background {{::icIcon ? 'icon' : ''}} {{::icImage ? 'image' : ''}}\" \n" +
    "	style = \"background-image: url({{::icImage||icIcon }})\"\n" +
    ">\n" +
    "</div>\n" +
    "\n" +
    "<div class =\"content\">\n" +
    "	<div class =\"title\">{{icTitle}}</div>\n" +
    "	<div class =\"brief\">{{icBrief}}</div>\n" +
    "</div>"
  );


  $templateCache.put('partials/section-filter.html',
    "<ic-filter-interface expand-filter = \"true\">\n" +
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
    "		ng-href 	= \"#{{icSite.getNewPath({t: type}, true)}}\"\n" +
    "		ic-tile\n" +
    "		ic-title	= \"'TYPES.'+type | uppercase | translate\"\n" +
    "		ic-brief	= \"'INTERFACE.TYPE' | translate\"\n" +
    "		ic-icon		= \"type | icIcon : 'type' : 'white'\"\n" +
    "		ic-type		= \"type\"\n" +
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
