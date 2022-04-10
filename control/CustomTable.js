sap.ui.define([
	"sap/ui/table/Table"
], function (Table) {
	"use strict";

	return Table.extend("demindh.odatautils.control.CustomTable", {

		metadata: {
			events: {
				dblClick: {}
			}
		},

		renderer: {},

		onAfterRendering: function () {
			if (sap.ui.table.Table.prototype.onAfterRendering) {
				sap.ui.table.Table.prototype.onAfterRendering.apply(this, arguments);
			}
			var table = this;

			this.getRows().forEach(function (r, i) {
				r.$().dblclick(function () {
					var rowIndex = i + table.getFirstVisibleRow(),
						context = table.getContextByIndex(rowIndex);
					if (context) {
						table.fireDblClick({
							rowIndex: rowIndex,
							rowContext: context
						});
					}
				});
			});

			this.$().find('.sapUiTableRowHdr').each(function (i) {
				$(this).dblclick(function () {
					var rowIndex = i + table.getFirstVisibleRow(),
						context = table.getContextByIndex(rowIndex);
					if (context) {
						table.fireDblClick({
							rowIndex: rowIndex,
							rowContext: context
						});
					}
				});
			});
		}

	});
});