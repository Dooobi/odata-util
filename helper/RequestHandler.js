sap.ui.define([
	"demindh/odatautils/model/Constant",
	"demindh/odatautils/helper/util"
], function(Constant, util) {
	"use strict";

	var RequestHandler = function(odataModel, sharedModel) {
		this.odataModel = odataModel;
		this.sharedModel = sharedModel;
	};
	
	RequestHandler.prototype.generateCreateRequest = function(entitySet, data, additionalUrlParameters) {
		var transformedData = [];
		for (var key in data) {
			transformedData.push(data[key]);
		}
		return {
			type: Constant.REQUEST_CREATE,
			entitySet: entitySet,
			data: transformedData,
			additionalUrlParameters: additionalUrlParameters,
			creationTime: new Date(),
			requestSentTime: null,
			response: {
				status: Constant.RESPONSE_LOCAL,
				responseReceivedTime: null
			}
		};
	};                      

	RequestHandler.prototype.generateUpdateRequest = function(entitySet, data, additionalUrlParameters) {
		var primaryKey = {},
			transformedData = [];
			
		for (var key in data) {
			if (data[key].property.isPrimaryKey) {
				primaryKey[key] = data[key];
			} else {
				transformedData.push(data[key]);
			}
		}
		return {
			type: Constant.REQUEST_UPDATE,
			entitySet: entitySet,
			primaryKey: primaryKey,
			data: transformedData,
			additionalUrlParameters: additionalUrlParameters,
			creationTime: new Date(),
			requestSentTime: null,
			response: {
				status: Constant.RESPONSE_LOCAL,
				responseReceivedTime: null
			}
		};
	};

	RequestHandler.prototype.generateRemoveRequest = function(entitySet, primaryKey, additionalUrlParameters) {
		return {
			type: Constant.REQUEST_REMOVE,
			entitySet: entitySet,
			primaryKey: primaryKey,
			additionalUrlParameters: additionalUrlParameters,
			creationTime: new Date(),
			requestSentTime: null,
			response: {
				status: Constant.RESPONSE_LOCAL,
				responseReceivedTime: null
			}
		};
	};
	
	RequestHandler.prototype.generateFunctionImportRequest = function(functionImport, data, additionalUrlParameters) {
		var transformedData = [];
		for (var key in data) {
			transformedData.push(data[key]);
		}
		return {
			type: Constant.REQUEST_FUNCTION_IMPORT,
			functionImport: functionImport,
			data: transformedData,
			additionalUrlParameters: additionalUrlParameters,
			creationTime: new Date(),
			requestSentTime: null,
			response: {
				status: Constant.RESPONSE_LOCAL,
				responseReceivedTime: null
			}
		};
	};                                                                

	RequestHandler.prototype.sendRequest = function(request) {
		var data, dataObject, params, primaryKeyObject = {}, path, key, i;
		var requestContext;
		
		params = {
			urlParameters: request.additionalUrlParameters,
			groupId: request.batch ? request.batch.groupId : null,
			success: function(responseData, response) {
				if (requestContext) {
					this.sharedModel.setProperty("response/status", Constant.RESPONSE_SUCCESS, requestContext);
					this.sharedModel.setProperty("response/responseReceivedTime", new Date(), requestContext);
					this.sharedModel.setProperty("response/data", responseData, requestContext);
				}
			}.bind(this),
			error: function(responseError) {
				if (requestContext) {
					this.sharedModel.setProperty("response/status", Constant.RESPONSE_ERROR, requestContext);
					this.sharedModel.setProperty("response/responseReceivedTime", new Date(), requestContext);
				}
			}.bind(this)
		};
		
		request.response.status = Constant.RESPONSE_PENDING;
		request.requestSentTime = new Date();
		
		if (!request.batch) {
			requestContext = this.addRequestToHistory(request, this.sharedModel);
		}
		
		switch (request.type) {
			case Constant.REQUEST_CREATE:
				data = {};
				for (i = 0; i < request.data.length; i++) {
					dataObject = request.data[i];
					data[dataObject.property.name] = util.transformData(dataObject);
				}
				this.odataModel.create("/" + request.entitySet.name, data, params);
				break;
			case Constant.REQUEST_UPDATE:
				data = {};
				for (i = 0; i < request.data.length; i++) {
					dataObject = request.data[i];
					data[dataObject.property.name] = util.transformData(dataObject);
				}
				for (key in request.primaryKey) {
					primaryKeyObject[key] = request.primaryKey[key].value;
				}
				path = this.odataModel.createKey("/" + request.entitySet.name, primaryKeyObject);
				this.odataModel.update(path, data, params);
				break;
			case Constant.REQUEST_REMOVE:
				path = this.odataModel.createKey("/" + request.entitySet.name, request.primaryKey);
				this.odataModel.remove(path, params);
				break;
			case Constant.REQUEST_FUNCTION_IMPORT:
				for (i = 0; i < request.data.length; i++) {
					params.urlParameters[request.data[i].parameter.name] = request.data[i].value;
				}
				this.odataModel.callFunction("/" + request.functionImport.name, params);
				break;
			case Constant.BATCH:
				this.odataModel.setUseBatch(true);
				this.odataModel.setDeferredGroups([request.groupId]);
				
				for (i = 0; i < request.requests.length; i++) {
					this.sendRequest(request.requests[i]);
				}
				this.odataModel.submitChanges(params);
				
				setTimeout(function() {
					this.odataModel.setUseBatch(false);
				}.bind(this), 0);
				break;
		}
	};
	
	RequestHandler.prototype.addRequestToHistory = function(request) {
		var historyEntries = this.sharedModel.getProperty("/history"),
			path = "/history/" + historyEntries.length;
		this.sharedModel.setProperty(path, request);
		
		return this.sharedModel.getContext(path);
	};

	return RequestHandler;
});