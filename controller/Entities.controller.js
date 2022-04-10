sap.ui.define([
	"demindh/odatautils/controller/BaseController",
	"demindh/odatautils/model/formatter",
	"demindh/odatautils/helper/util",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"demindh/odatautils/helper/Validator",
	"sap/ui/core/ValueState"
], function(BaseController, formatter, util, JSONModel, MessageToast, MessageBox, Validator, ValueState) {
	"use strict";

	var DIALOG_FRAGMENT = "demindh.odatautils.view.fragment.Dialog";
		
	return BaseController.extend("demindh.odatautils.controller.Entities", {

		formatter: formatter,
		util: util,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the controller is instantiated.
		 * @public
		 */
		onInit: function() {
			var odata = this.getModel();
			
			this.eventBus = this.getOwnerComponent().getEventBus();
			
			this.setModel(this._createViewModel(), "viewModel");
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		transformMetadataToModel: function() {
			var schemas = this.getModel().oMetadata.oMetadata.dataServices;
			
			this.setModel(new JSONModel(schemas), "metaModel");
		},

		navToEntity: function(event) {
			var context = event.getSource().getBindingContext("metaModel"),
				entityPage = sap.ui.getCore().byId("entityView");
				
			this.eventBus.publish("navigateEvent", {
				key: "entityView",
				bindingPath: context.getPath() 
			});
		},
		
		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */
		
		_createViewModel: function() {
			return new JSONModel({
				dialogMode: ""
			});
		}
		
	});
});