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

	var FRAGMENT_NAME = "demindh.odatautils.view.fragment.BatchAttachDialog";
	
	var DIALOG_MODE_CHOOSE_EXISTING = "DIALOG_MODE_CHOOSE_EXISTING",
		DIALOG_MODE_CHOOSE_NEW = "DIALOG_MODE_CHOOSE_NEW";
	
	return BaseController.extend("demindh.odatautils.controller.BatchAttachDialogController", {
		
		constructor: function(mainController) {
			this.mainController = mainController;
			this.onConfirmCallback = null;
		},

		openDialog: function(request) {
			var dialogModel = this._createDialogModel(request),
				dialog = this._getDialog(dialogModel);
			
			dialog.open();
		},
		
		confirm: function() {
			var sharedModel = this.mainController.getModel("shared"),
				batchRequests = sharedModel.getProperty("/batchRequests");
			
			switch (this.dialogModel.getProperty("/mode")) {
				case DIALOG_MODE_CHOOSE_EXISTING:
					var selectControl = sap.ui.getCore().byId("selectBatchRequest"),
						selectedContext = selectControl.getSelectedItem().getBindingContext("shared"),
						requests = sharedModel.getProperty("requests", selectedContext);
					
					requests.push(this.dialogModel.getProperty("/request"));
					
					this.dialogModel.setProperty("/request/batch", selectedContext.getObject());
					sharedModel.setProperty("requests", requests, selectedContext);
					sharedModel.refresh(true);
					break;
				case DIALOG_MODE_CHOOSE_NEW:
					var batchRequest = {
						groupId: this.dialogModel.getProperty("/data/groupId"),
						changeset: this.dialogModel.getProperty("/data/changeset"),
						requests: [
							this.dialogModel.getProperty("/request")
						],
						response: {}
					};
					this.dialogModel.setProperty("/request/batch", batchRequest);
					sharedModel.setProperty("/batchRequests/" + batchRequests.length, batchRequest);
					break;
			}
			
			if (this.onConfirmCallback) {
				this.onConfirmCallback();
			}
			this.closeDialog();
		},

		closeDialog: function() {
			this.onConfirmCallback = null;
			this.dialog.close();
		},
		
		attachConfirm: function(callback) {
			this.onConfirmCallback = callback;
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
		
		_createDialogModel: function(request) {
			var i18n = this.mainController.getResourceBundle(),
				dialogTitle,
				data;
			
			var modelData = {
				mode: DIALOG_MODE_CHOOSE_EXISTING,
				request: request,
				data: {
					groupId: null,
					changeset: null
				}
			};
			
			return new JSONModel(modelData);
		}

	});
});