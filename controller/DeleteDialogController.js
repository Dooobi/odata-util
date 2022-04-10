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

	var FRAGMENT_NAME = "demindh.odatautils.view.fragment.DeleteDialog";
	
	return BaseController.extend("demindh.odatautils.controller.DeleteDialogController", {
		
		constructor: function(mainController) {
			this.mainController = mainController;
		},

		openDialog: function(entitySetMetaContext, entityContexts) {
			var dialogModel = this._createDialogModel(entitySetMetaContext, entityContexts),
				dialog = this._getDialog(dialogModel);
			
			dialog.setBindingContext(entitySetMetaContext);
			
			dialog.open();
		},

		closeDialog: function() {
			this.dialog.close();
		},
		
		send: function() {
			var requestHandler = this.mainController.getOwnerComponent().getRequestHandler(),
				entitySet = this.dialogModel.getProperty("/entitySet"),
				entityContexts = this.dialogModel.getProperty("/entries");
				
			for (var i = 0; i < entityContexts.length; i++) {
				var request = requestHandler.generateRemoveRequest(entitySet, entityContexts[i].getObject(), {});
				requestHandler.sendRequest(request);
			}
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
		
		_createDialogModel: function(entitySetMetaContext, entityContexts) {
			var properties = entitySetMetaContext.getProperty("entityType/properties"),
				entitySetName = entitySetMetaContext.getProperty("name"),
				i18n = this.mainController.getResourceBundle(),
				dialogTitle;

			var modelData = {
				dialogTitle: dialogTitle,
				entitySet: entitySetMetaContext.getObject(),
				entries: entityContexts
			};

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