sap.ui.define([
	"demindh/odatautils/controller/BaseController",
	"demindh/odatautils/helper/util",
	"sap/ui/model/json/JSONModel",
	"sap/ui/layout/form/FormElement",
	"sap/m/Label",
	"sap/ui/core/Icon",
	"sap/m/HBox",
	"sap/m/FlexRendertype",
	"demindh/odatautils/controller/BatchAttachDialogController"
], function(BaseController, util, JSONModel, FormElement, Label, Icon, HBox, FlexRendertype, BatchAttachDialogController) {
	"use strict";

	var FRAGMENT_NAME = "demindh.odatautils.view.fragment.EntityDialog";
	
	var DIALOG_MODE_ADD = "DIALOG_MODE_ADD",
		DIALOG_MODE_UPDATE = "DIALOG_MODE_UPDATE";
		
	return BaseController.extend("demindh.odatautils.controller.EntityDialogController", {
		
		constructor: function(mainController) {
			this.mainController = mainController;
		},

		openAddDialog: function(entitySetMetaContext) {
			var dialogModel = this._createDialogModel(entitySetMetaContext, DIALOG_MODE_ADD),
				dialog = this._getDialog(dialogModel);
			
			dialog.setBindingContext(entitySetMetaContext);
			
			dialog.open();
		},
		
		openUpdateDialog: function(entitySetMetaContext, entityContext) {
			var dialogModel = this._createDialogModel(entitySetMetaContext, DIALOG_MODE_UPDATE, entityContext),
				dialog = this._getDialog(dialogModel);
			
			dialog.setBindingContext(entitySetMetaContext);
			
			dialog.open();
		},

		closeDialog: function() {
			this.dialog.close();
		},
		
		send: function() {
			var requestHandler = this.mainController.getOwnerComponent().getRequestHandler(),
			
			request = this.getRequest();
			requestHandler.sendRequest(request);
		},
		
		batch: function() {
			var requestHandler = this.mainController.getOwnerComponent().getRequestHandler(),
				batchAttachDialogController = this._getBatchAttachDialogController(),
				request;
				
			request = this.getRequest();
			
			batchAttachDialogController.attachConfirm(function() {
				this.closeDialog();
			}.bind(this));
			batchAttachDialogController.openDialog(request);
		},

		getRequest: function() {
			var entitySet = this.dialogModel.getProperty("/entitySet"),
				data = this.dialogModel.getProperty("/data"),
				dialogMode = this.dialogModel.getProperty("/dialogMode"),
				requestHandler = this.mainController.getOwnerComponent().getRequestHandler(),
				request;
			
			if (dialogMode === DIALOG_MODE_ADD) {
				request = requestHandler.generateCreateRequest(entitySet, data, {});
			} else if (dialogMode === DIALOG_MODE_UPDATE) {
				request = requestHandler.generateUpdateRequest(entitySet, data, {});
			}
			
			return request;
		},

		formElementFactory: function(id, context) {
			var propertyName = context.getProperty("name"),
				classification = context.getProperty("classification"),
				fields = [],
				path;
			
			if (classification === "EntityProperty") {
				path = "/data/" + propertyName + "/value";
			} else if (classification === "ComplexProperty") {
				path = "/data/" + context.getProperty("complexType/name") + "/value/" + propertyName + "/value";
			}
			
			var inputControl = util.getInputControl(context, "dialogModel", path).setWidth("100%");
			
			if (context.getProperty("isPrimaryKey")) {
				fields = [new HBox({
					renderType: FlexRendertype.Bare,
					width: "100%",
					alignItems: "Center",
					items: [
						new Icon({
							src: "sap-icon://primary-key",
							color: "#878787"
						}).addStyleClass("sapUiTinyMarginEnd"),
						inputControl
					]
				})];
			} else {
				fields = [inputControl];
			}
			
			var formElement = new FormElement({
				label: new Label({
					text: propertyName,
					required: !context.getProperty("nullable")
				}),
				fields: fields
			});
			return formElement;
		},

		_getDialog: function(dialogModel) {
			this.dialogModel = dialogModel;
			if (!this.dialog) {
				this.dialog = this._createDialog();
			}
			this.dialog.setModel(dialogModel, "dialogModel");
			return this.dialog;
		},

		_createDialog: function() {
			var dialog = sap.ui.xmlfragment(FRAGMENT_NAME, this);
			this.mainController.getView().addDependent(dialog);
			dialog.addStyleClass(this.mainController.getOwnerComponent().getContentDensityClass());                    
			return dialog;
		},
		
		_createDialogModel: function(entitySetMetaContext, dialogMode, entityContext) {
			var properties = entitySetMetaContext.getProperty("entityType/properties"),
				entitySetName = entitySetMetaContext.getProperty("name"),
				i18n = this.mainController.getResourceBundle(),
				dialogTitle;
			
			if (dialogMode === DIALOG_MODE_ADD) {
				dialogTitle = i18n.getText("entityDialogTitleAdd", [entitySetName]);
			} else if (dialogMode === DIALOG_MODE_UPDATE) {
				dialogTitle = i18n.getText("entityDialogTitleUpdate", [entitySetName]);	
			}
				
			var modelData = {
				dialogTitle: dialogTitle,
				dialogMode: dialogMode,
				entitySet: entitySetMetaContext.getObject(),
				data: {}
			};
			
			for (var i = 0; i < properties.length; i++) {
				var property = properties[i];
				
				if (property.classification === "EntityProperty") {
					this.addPropertyToModelData(property, modelData.data, dialogMode, entityContext);
				} else if (property.classification === "ComplexType") {
					modelData.data[property.name] = {
						property: property,
						value: {}
					};
					for (var j = 0; j < property.complexType.properties.length; j++) {
						var complexProperty = property.complexType.properties[j];
						this.addPropertyToModelData(complexProperty, modelData.data[property.name].value, dialogMode, entityContext);
					}
				}
			}
			
			return new JSONModel(modelData);
		},
		
		addPropertyToModelData: function(property, dataObject, dialogMode, entityContext) {
			var value;
			if (dialogMode === DIALOG_MODE_ADD) {
				value = null;
			} else if (dialogMode === DIALOG_MODE_UPDATE) {
				value = entityContext.getProperty(property.name);
			}
			dataObject[property.name] = {
				property: property,
				value: value
			};
		},
		
		_getBatchAttachDialogController: function() {
			if (!this.batchAttachDialogController) {
				this.batchAttachDialogController = new BatchAttachDialogController(this.mainController);
			}
			return this.batchAttachDialogController;
		}

	});
});