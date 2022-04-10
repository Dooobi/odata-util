sap.ui.define([
	"demindh/odatautils/controller/BaseController",
	"demindh/odatautils/model/formatter",
	"demindh/odatautils/helper/util",
	"sap/ui/model/json/JSONModel",
	"demindh/odatautils/controller/EntityDialogController",
	"demindh/odatautils/controller/DeleteDialogController",
	"sap/ui/table/Column",
	"sap/ui/core/Icon",
	"sap/m/Label",
	"sap/m/Button",
	"sap/ui/table/RowAction",
	"sap/ui/table/RowActionItem"
], function(BaseController, formatter, util, JSONModel, EntityDialogController, DeleteDialogController, Column, Icon, Label, Button, RowAction, RowActionItem) {
	"use strict";

	var DIALOG_FRAGMENT = "demindh.odatautils.view.fragment.Dialog";
		
	return BaseController.extend("demindh.odatautils.controller.Entity", {

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
			
			this.setModel(this._createViewModel(), "viewModel");
			
			this.table = this.byId("entityTable");
			
			this.getView().addEventDelegate({
				onBeforeShow: this.onBeforeShow.bind(this),
				onAfterShow: this.onAfterShow.bind(this)
			});
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		onBeforeShow: function(event, data) {
			var path = event.data.bindingPath,
				entitySet = this.getModel("metaModel").getProperty(path);
			
			this.getView().bindElement({
				path: path,
				model: "metaModel"
			});
			
			this.table.bindRows({
				path: "/" + entitySet.name
			});
		},
		
		onAfterShow: function() {
			var columns = this.table.getColumns();
			
			for (var i = 0; i < columns.length; i++) {
				this.table.autoResizeColumn(i);
			}
		},
		
		createActionColumn: function() {
			return new Column({
				label: new Label({ text: "" }),
				autoResizable: false,
				template: new Button({
					icon: "sap-icon://edit",
					press: this.openUpdateDialog
				})
			});
		},
		
		createRowActionTemplate: function() {
			return new RowAction({
				items: [
					new RowActionItem({icon: "sap-icon://edit", text: "Edit", press: this.openUpdateDialog})
				]
			});
		},
		
		openAddEntityDialog: function() {
			var entitySetMetaContext = this.getView().getBindingContext("metaModel");
			this._getEntityDialogController().openAddDialog(entitySetMetaContext);
		},
		
		openUpdateEntityDialog: function(event) {
			var entitySetMetaContext = this.getView().getBindingContext("metaModel"),
				entityContext = event.getParameter("rowContext");
			this._getEntityDialogController().openUpdateDialog(entitySetMetaContext, entityContext);
		},
		
		openDeleteDialog: function(event) {
			var entitySetMetaContext = this.getView().getBindingContext("metaModel"),
				entityContexts = [],
				indices = this.table.getSelectedIndices();
			
			for (var i = 0; i < indices.length; i++) {
				entityContexts.push(this.table.getContextByIndex(indices[i]));
			}
			
			this._getDeleteDialogController().openDialog(entitySetMetaContext, entityContexts);
		},

		entityTableColumnFactory: function(id, context) {
			var propertyName = context.getProperty("name"),
				columnName = propertyName;
			
			return new Column({
				label: new sap.m.HBox({
					items: [
						new Icon({
							src: "sap-icon://primary-key",
							visible: context.getProperty("isPrimaryKey"),
							color: "#878787",
							size: "0.8em"
						}).addStyleClass("sapUiTinyMarginEnd"),
						new Label({
							text: propertyName,
							required: !context.getProperty("nullable")
						})
					]
				}),
				autoResizable: true,
				template: util.getDisplayControl(context, undefined, propertyName)
			});
		},
		
		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */
	
		_createViewModel: function() {
			return new JSONModel({
				dialogMode: ""
			});
		},
		
		_getEntityDialogController: function() {
			if (!this.entityDialogController) {
				this.entityDialogController = new EntityDialogController(this);
			}
			return this.entityDialogController;
		},
		
		_getDeleteDialogController: function() {
			if (!this.deleteDialogController) {
				this.deleteDialogController = new DeleteDialogController(this);
			}
			return this.deleteDialogController;
		}
		
	});
});