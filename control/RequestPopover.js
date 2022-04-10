sap.ui.define([
	"sap/m/ResponsivePopover",
	"demindh/odatautils/control/view/RequestPopover"
], function (ResponsivePopover, RequestPopover) {
	"use strict";

	var FRAGMENT_ID = "requestPopover";

	return ResponsivePopover.extend("demindh.odatautils.control.RequestPopover", {

		metadata: {
		},

		// ------------------------------------------------------------------------------------------------
		// L I F E C Y C L E
		// ------------------------------------------------------------------------------------------------
		
		constructor: function () {
			ResponsivePopover.prototype.constructor.apply(this, arguments);

			var fragment = sap.ui.xmlfragment(FRAGMENT_ID, RequestPopover, this);

			this.setContent(fragment);
		},
		
		renderer: {},

		onAfterRendering: function () {
		}

	});
});