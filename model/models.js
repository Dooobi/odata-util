sap.ui.define([
		"sap/ui/model/json/JSONModel",
		"sap/ui/Device"
	], function (JSONModel, Device) {
		"use strict";

		return {

			createDeviceModel: function () {
				var oModel = new JSONModel(Device);
				oModel.setDefaultBindingMode("OneWay");
				return oModel;
			},
			
			createSharedModel: function() {
				return new JSONModel({
					history: [
					// {
					// 	type: "FunctionImport",
					// 	functionImport: {}, // reference to FunctionImport
					// 	data: [{
					// 		parameter: {}, // reference to Property
					// 		value: "1232-223-4219"
					// 	}],
					// 	additionalUrlParameters: [{
					// 		name: "ignoreFilter",
					// 		value: "true"
					// 	}],
					// 	response: {
					// 		status: "Pending", // or Success or Error
							
					// 	}
					// },
					// {
					// 	type: "Create",
					// 	entitySet: {}, // reference to EntitySet
					// 	parameters: [{
					// 		property: {},	// reference to Property
					// 		value: "Mein Wert"
					// 	}],
					// 	additionalUrlParameters: [],
					// 	response: {}
					// },
					// {
					// 	type: "Batch",
					// 	groupId: "group1",
					// 	changeSet: "changeSet1",
					// 	requests: [
					// 	{
					// 		type: "Create",
					// 		entitySet: {}, // reference to EntitySet
					// 		parameters: [{
					// 			property: {},	// reference to Property
					// 			value: "Mein Wert"
					// 		}],
					// 		additionalUrlParameters: [],
					// 		response: {}
					// 	}, {
					// 		type: "Update",
					// 		entitySet: {}, // reference to EntitySet
					// 		entityKey: [{
					// 			property: {}, // reference to id property
					// 			value: "eBay"
					// 		}, {
					// 			property: {}, // reference to id property
					// 			value: "77"
					// 		}],
					// 		parameters: [{
					// 			property: {},	// reference to Property
					// 			value: "Mein Wert"
					// 		}],
					// 		additionalUrlParameters: [],
					// 		response: {}
					// 	}, {
					// 		type: "Delete",
					// 		entitySet: {}, // reference to EntitySet
					// 		entityKey: [{
					// 			property: {}, // reference to id property
					// 			value: "eBay"
					// 		}, {
					// 			property: {}, // reference to id property
					// 			value: "77"
					// 		}],
					// 		additionalUrlParameters: [],
					// 		response: {}
					// 	}],
					// 	response: {
					// 		status: "Pending", // or Success or Error
							
					// 	}
					// }
					],
					batchRequests: [{
						groupId: "group1",
						changeSet: "changeSet1",
						requests: [],
						response: {}
					}]
				});
			}

		};

	}
);