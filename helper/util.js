sap.ui.define([
	"demindh/odatautils/model/Constant",
	"sap/ui/model/BindingMode",
	"sap/m/CheckBox",
	"sap/m/Input",
	"sap/m/DateTimePicker"
], function(Constant, BindingMode, CheckBox, Input, DateTimePicker) {
	"use strict";

	return {

		transformData: function(dataObject) {
			if (dataObject.property.classification === "ComplexType") {
				var result = {};
				for (var key in dataObject.value) {
					result[key] = dataObject.value[key].value;
				}
				return result;
			}
			return dataObject.value;
		},

		getInputControl: function(propertyContext, modelName, pathToBind) {
			var prop = propertyContext.getObject();
			
			switch (prop.type) {
				case Constant.TYPE_INT32:
				case Constant.TYPE_INT64:
				case Constant.TYPE_DOUBLE:
				case Constant.TYPE_STRING:
					return new Input({
						value: "{" + modelName + ">" + pathToBind + "}",
						placeholder: prop.type
					});
				case Constant.TYPE_BOOL:
					return new CheckBox({
						selected: "{" + modelName + ">" + pathToBind + "}"
					});
				case Constant.TYPE_DATETIME:
					return new DateTimePicker({
						dateValue: "{" + modelName + ">" + pathToBind + "}"
					});
			}
			return null;
		},
		
		getDisplayControl: function(property, modelName, pathToBind) {
			var propertyName = property.name,
				propertyType = property.type,
				classification = property.classification;
				
			if (classification === "ComplexProperty") {
				propertyName = property.complexType.name + "/" + propertyName;
			}

			switch (propertyType) {
				case "Edm.DateTime":
					return new sap.m.Text({
						text: {
							path: pathToBind,
							model: modelName,
							type: new sap.ui.model.type.DateTime()
						}
					});
				case "Edm.Boolean":
					return new sap.m.CheckBox({
						enabled: false,
						selected: {
							path: pathToBind,
							model: modelName,
						}
					});
			}

			if (propertyName === "Url") {
				return new sap.m.Image({
					src: {
						path: pathToBind,
						model: modelName,
					},
					width: "1em",
					height: "1em"
				});
			}
			
			return new sap.m.Text({
				text: {
					path: pathToBind,
					model: modelName
				}
			});
		}

	};
});