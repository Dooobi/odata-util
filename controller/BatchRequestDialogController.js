sap.ui.define([
	"demindh/odatautils/controller/BaseController",
	"demindh/odatautils/helper/util",
	"sap/ui/model/json/JSONModel",
	"sap/ui/layout/form/FormElement",
	"sap/m/Label",
	"sap/ui/core/Icon",
	"sap/m/HBox",
	"sap/m/FlexRendertype"
], function(BaseController, util, JSONModel, FormElement, Label, Icon, HBox, FlexRendertype) {
	"use strict";

	var FRAGMENT_NAME = "demindh.odatautils.view.fragment.BatchRequestDialog";
	
	var DIALOG_MODE_ADD = "DIALOG_MODE_ADD",
		DIALOG_MODE_UPDATE = "DIALOG_MODE_UPDATE";
		
	return BaseController.extend("demindh.odatautils.controller.BatchRequestDialogController", {
		
		constructor: function(mainController) {
			this.mainController = mainController;
		},

		openAddDialog: function() {
			var dialogModel = this._createDialogModel(DIALOG_MODE_ADD),
				dialog = this._getDialog(dialogModel);
			
			dialog.open();
		},
		
		openUpdateDialog: function(batchRequestContext) {
			var dialogModel = this._createDialogModel(DIALOG_MODE_UPDATE, batchRequestContext),
				dialog = this._getDialog(dialogModel);
			
			dialog.open();
		},
		
		save: function() {
			var sharedModel = this.mainController.getModel("shared"),
				batchRequests = sharedModel.getProperty("/batchRequests"),
				batchRequest = {
					groupId: this.dialogModel.getProperty("/data/groupId"),
					changeset: this.dialogModel.getProperty("/data/changeset"),
					requests: [],
					response: {}
				};
			
			sharedModel.setProperty("/batchRequests/" + batchRequests.length, batchRequest);
			
			this.closeDialog();
		},

		closeDialog: function() {
			this.dialog.close();
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
		
		_createDialogModel: function(dialogMode, batchRequestContext) {
			var i18n = this.mainController.getResourceBundle(),
				dialogTitle,
				data;
			
			if (dialogMode === DIALOG_MODE_ADD) {
				dialogTitle = i18n.getText("batchRequestDialogTitleAdd");
				
				data = {
					groupId: null,
					changeset: null
				};
			} else if (dialogMode === DIALOG_MODE_UPDATE) {
				dialogTitle = i18n.getText("batchRequestDialogTitleUpdate");
				
				data = {
					groupId: batchRequestContext.getProperty("groupId"),
					changeset: batchRequestContext.getProperty("changeset")
				};
			}
			
			var modelData = {
				dialogTitle: dialogTitle,
				dialogMode: dialogMode,
				data: data
			};
			
			return new JSONModel(modelData);
		}

	});
});