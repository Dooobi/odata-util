sap.ui.define([
	"demindh/odatautils/controller/BaseController",
	"demindh/odatautils/model/formatter",
	"demindh/odatautils/helper/util",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"demindh/odatautils/helper/Validator",
	"sap/ui/core/ValueState",
	"sap/m/ColumnListItem",
	"sap/m/Label",
	"sap/m/Text"
], function(BaseController, formatter, util, JSONModel, MessageToast, MessageBox, Validator, ValueState, ColumnListItem, Label, Text) {
	"use strict";

	var DIALOG_FRAGMENT = "demindh.odatautils.view.fragment.Dialog";
		
	return BaseController.extend("demindh.odatautils.controller.FunctionImports", {

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
			this.eventBus.subscribe("beforeSettingMetaModel", this.createDataModel, this);
			
			this.setModel(this._createViewModel(), "viewModel");
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		navToEntity: function(event) {
			var context = event.getSource().getBindingContext("metaModel"),
				entityPage = this.byId("entityPage");
			
			entityPage.bindElement({
				path: context.getPath(),
				model: "metaModel"
			});
			
			this.navContainer.to(entityPage);
		},
		
		batch: function(event) {
			console.log("batch");
		},
		
		send: function(event) {
			var functionImport = event.getSource().getBindingContext("metaModel").getObject(),
				data = this.getModel("dataModel").getProperty("/" + functionImport.name),
				requestHandler = this.getOwnerComponent().getRequestHandler(),
				request;
			
			request = requestHandler.generateFunctionImportRequest(functionImport, data, {});
			
			requestHandler.sendRequest(request);
		},
		
		createDataModel: function(channel, eventId, data) {
			// data is metaModel
			var metaModelData = data.getData(),
				dataModel = {};
			
			for (var i = 0; i < metaModelData.functionImports.length; i++) {
				var functionImport = metaModelData.functionImports[i];
				dataModel[functionImport.name] = {};
				
				for (var j = 0; j < functionImport.parameters.length; j++) {
					var parameter = functionImport.parameters[j];
					dataModel[functionImport.name][parameter.name] = {
						parameter: parameter,
						value: null
					};
				}
			}
			
			this.setModel(new JSONModel(dataModel), "dataModel");
		},
		
		parameterListItemFactory: function(id, context) {
			var path = "/" + context.getProperty("functionImport/name") + "/" + context.getProperty("name") + "/value",
				inputControl = util.getInputControl(context, "dataModel", path);
			
			return new ColumnListItem({
				cells: [
					new Label({
						text: "{metaModel>name}",
						required: "{= ${metaModel>nullable} === 'false' }"
					}),
					new Text({
						text: "{metaModel>type}"
					}),
					inputControl
				]
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