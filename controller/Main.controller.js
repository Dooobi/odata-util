sap.ui.define([
	"demindh/odatautils/controller/BaseController",
	"demindh/odatautils/model/Constant",
	"demindh/odatautils/model/formatter",
	"demindh/odatautils/helper/util",
	"demindh/odatautils/helper/metadataTransformer",
	"sap/ui/model/json/JSONModel",
	"sap/ui/layout/SplitterLayoutData",
	"demindh/odatautils/controller/BatchRequestDialogController",
], function(BaseController, Constant, formatter, util, metadataTransformer, JSONModel, SplitterLayoutData, BatchRequestDialogController) {
	"use strict";

	var DIALOG_FRAGMENT = "demindh.odatautils.view.fragment.Dialog";
	
	var delegateOnAfterRendering = function(event) {
		console.log("afterRendering");
		var table = event.srcControl;
		table.removeEventDelegate(delegate);
		var columns = table.getColumns();
		for (var c = 0; c < columns.length; c++) {
			table.autoResizeColumn(c);
		}
	};
	var delegate = {
		onAfterRendering: delegateOnAfterRendering
	};
	
	return BaseController.extend("demindh.odatautils.controller.Main", {

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
			
			this.dataService = {};
			
			this.setModel(this._createViewModel(), "viewModel");
			
			this.eventBus = this.getOwnerComponent().getEventBus();
			this.eventBus.subscribe("navigateEvent", this.navigateEvent, this);
			
			this.navContainer = this.byId("navContainer");
			
			odata.metadataLoaded().then(
				this.transformMetadata.bind(this)
			);
			
			setTimeout(this.onTimer.bind(this), 500);
			
			var pane = this.byId("pane");
			pane.setLayoutData(new SplitterLayoutData({
				size: "30%"
			}));
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		onHomePress: function() {
		},

		transformMetadata: function() {
			var odata = this.getModel(),
				metaModel = metadataTransformer.transformMetadataToModel(odata);
				
			this.eventBus.publish("beforeSettingMetaModel", metaModel);
				
			this.setModel(metaModel, "metaModel");
		},

		onTimer: function() {
			var data = this.dataService;
			setTimeout(this.onTimer.bind(this), 500);
		},

		onTabSelected: function(event) {
			this.navigate({
				key: event.getParameter("key")
			});
		},

		navigate: function(data) {
			var view = this.byId(data.key);
			
			this.navContainer.to(view, data);
		},
		
		navigateEvent: function(channel, eventId, data) {
			this.navigate(data);
		},

		sendBatchRequest: function(event) {
			var batchRequest = event.getSource().getBindingContext("shared").getObject();
			
			this.getOwnerComponent().getRequestHandler().sendRequest(batchRequest);
		},

		requestListItemFactory: function(id, context) {
			switch (context.getProperty("type")) {
				case Constant.REQUEST_CREATE:
				case Constant.REQUEST_UPDATE:
				case Constant.REQUEST_REMOVE:
					var fragment = sap.ui.xmlfragment("demindh.odatautils.view.fragment.CrudRequestListItem", this),
						table = fragment.getContent()[0].getContent()[0],
						dataValues = context.getProperty("data"),
						dataRow = {};
						
					// for (var i = 0; i < dataValues.length; i++) {
					// 	var dataValue = dataValues[i];
					// 	dataRow[dataValue.property.name] = util.transformData(dataValue);
					// }
					
					// var dataModel = new JSONModel({
					// 	dataRow: [
					// 		dataRow
					// 	]
					// });
					
					// table.addEventDelegate(delegate);
					// table.setModel(dataModel, "dataModel");
					
					return fragment;
				case Constant.REQUEST_FUNCTION_IMPORT:
					return sap.ui.xmlfragment("demindh.odatautils.view.fragment.FunctionImportRequestListItem", this);
			}
		},
		
		formElementFactory: function(id, context) {
			var property = context.getProperty("property"),
				propertyName = property.name,
				classification = property.classification,
				fields = [];
			
			var inputControl = util.getDisplayControl(property, "shared", "value").setWidth("100%");
			
			if (property.isPrimaryKey) {
				fields = [new sap.m.HBox({
					renderType: sap.m.FlexRendertype.Bare,
					width: "100%",
					alignItems: "Center",
					items: [
						new sap.ui.core.Icon({
							src: "sap-icon://primary-key",
							color: "#878787"
						}).addStyleClass("sapUiTinyMarginEnd"),
						inputControl
					]
				})];
			} else {
				fields = [inputControl];
			}
			
			var formElement = new sap.ui.layout.form.FormElement({
				label: new sap.m.Label({
					text: propertyName,
					required: !property.nullable
				}),
				fields: fields
			});
			return formElement;
		},
		
		entityTableColumnFactory: function(id, context) {
			var propertyName = context.getProperty("name"),
				nullable = context.getProperty("nullable") === "true",
				columnName = propertyName;
			
			return new sap.ui.table.Column({
				label: new sap.m.HBox({
					items: [
						new sap.ui.core.Icon({
							src: "sap-icon://primary-key",
							visible: context.getProperty("isPrimaryKey"),
							color: "#878787",
							size: "0.8em"
						}).addStyleClass("sapUiTinyMarginEnd"),
						new sap.m.Label({
							text: propertyName,
							required: !nullable
						})
					]
				}),
				autoResizable: true,
				template: util.getDisplayControl(context, "dataModel")
			});
		},

		deleteBatchRequest: function(event) {
			var pathElements = event.getSource().getBindingContext("shared").getPath(),
				index = parseInt(pathElements[pathElements.length - 1], 10),
				sharedModel = this.getModel("shared"),
				batchRequests = this.getModel("shared").getProperty("/batchRequests");
				
			batchRequests.splice(index, 1);
			
			sharedModel.setProperty("/batchRequests", batchRequests);
		},
		
		openAddBatchRequestDialog: function() {
			this._getBatchRequestDialogController().openAddDialog();
		},
		
		pressHistory: function(event) {
			var source = event.getParameter("listItem"),
				bindingContext = source.getBindingContext();
				
			var popover = sap.ui.xmlfragment("popover", "demindh.odatautils.view.fragment.Popover", this);
			this.getView().addDependent(popover);
			popover.setBindingContext(bindingContext);
			popover.openBy(source);
		},
		
		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */
		
		_createViewModel: function() {
			return new JSONModel({
			});
		},
		
		_getBatchRequestDialogController: function() {
			if (!this.batchRequestDialogController) {
				this.batchRequestDialogController = new BatchRequestDialogController(this);
			}
			return this.batchRequestDialogController;
		}
		
	});
});