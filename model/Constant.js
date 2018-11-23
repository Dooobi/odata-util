sap.ui.define([], function() {
	"use strict";

	return {
		TYPE_BOOL: "Edm.Boolean",
		TYPE_STRING: "Edm.String",
		TYPE_INT32: "Edm.Int32",
		TYPE_INT64: "Edm.Int64",
		TYPE_DOUBLE: "Edm.Double",
		TYPE_DATETIME: "Edm.DateTime",
		
		REQUEST: "REQUEST",
		RESPONSE: "RESPONSE",

		RESPONSE_LOCAL: "RESPONSE_LOCAL",
		RESPONSE_PENDING: "RESPONSE_PENDING",
		RESPONSE_SUCCESS: "RESPONSE_SUCCESS",
		RESPONSE_ERROR: "RESPONSE_ERROR",
		
		REQUEST_CREATE: "Create",
		REQUEST_UPDATE: "Update",
		REQUEST_REMOVE: "Remove",
		REQUEST_FUNCTION_IMPORT: "FunctionImport",
		REQUEST_BATCH: "Batch"
	};
});