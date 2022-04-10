sap.ui.define([
	"demindh/odatautils/model/Constant"
], function(Constant) {
	"use strict";

	return {

		formatResponseStatusIconSrc: function(responseStatus) {
			switch (responseStatus) {
				case Constant.RESPONSE_PENDING:
					return "sap-icon://lateness";
				case Constant.RESPONSE_SUCCESS:
					return "sap-icon://accept";
				case Constant.RESPONSE_ERROR:
					return "sap-icon://decline";
			}
		},
		
		formatResponseStatusIconColor: function(responseStatus) {
			switch (responseStatus) {
				case Constant.RESPONSE_PENDING:
					return "#91c8f6";
				case Constant.RESPONSE_SUCCESS:
					return "#abe2ab";
				case Constant.RESPONSE_ERROR:
					return "#ff8888";
			}
		},
		
		getFunctionImportReturnType: function(returnType, returnsCollection) {
			var result;
			if (returnType.name) {
				result = returnType.name;
			} else {
				result = returnType;
			}
			if (returnsCollection) {
				result += "[]";
			}
			return result;
		}

	};

});