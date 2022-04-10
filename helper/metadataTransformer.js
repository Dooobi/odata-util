sap.ui.define([
	"demindh/odatautils/model/Constant",
	"sap/ui/model/json/JSONModel"
], function(Constant, JSONModel) {
	"use strict";

	return {

		transformMetadataToModel: function(odataModel) {
			var metadata = odataModel.oMetadata.oMetadata.dataServices;
			
			this.dataService = {
				dataServiceVersion: metadata.dataServiceVersion
			};
			var schemas = [];
			for (var i = 0; i < metadata.schema.length; i++) {
				var data = this.parseDataForSchema(metadata.schema[i], metadata);
				var schema = {
					namespace: metadata.schema[i].namespace,
					entityTypes: data.entityTypes,
					associations: data.associations,
					complexTypes: data.complexTypes,
					entityContainers: data.entityContainers
				};
				
				schemas.push(schema);
			}
			this.dataService.schemas = schemas;
			
			this.fillParsedDataServiceWithReferences();
			this.pullDataToFirstLayer();
			
			return new JSONModel(this.dataService);
		},
		
		pullDataToFirstLayer: function() {
			var i = 0, j = 0;
				
			this.dataService.associations = [];
			this.dataService.complexTypes = [];
			this.dataService.entityTypes = [];
			this.dataService.entityContainers = [];
			this.dataService.associationSets = [];
			this.dataService.entitySets = [];
			this.dataService.functionImports = [];
			this.dataService.parameters = [];
			this.dataService.properties = [];
			
			for (i = 0; i < this.dataService.schemas.length; i++) {
				var schema = this.dataService.schemas[i];
				this.dataService.associations = this.dataService.associations.concat(schema.associations);
				this.dataService.complexTypes = this.dataService.complexTypes.concat(schema.complexTypes);
				this.dataService.entityTypes = this.dataService.entityTypes.concat(schema.entityTypes);
				this.dataService.entityContainers = this.dataService.entityContainers.concat(schema.entityContainers);
			}
			
			for (i = 0; i < this.dataService.entityContainers.length; i++) {
				var entityContainer = this.dataService.entityContainers[i];
				this.dataService.associationSets = this.dataService.associationSets.concat(entityContainer.associationSets);
				this.dataService.entitySets = this.dataService.entitySets.concat(entityContainer.entitySets);
				this.dataService.functionImports = this.dataService.functionImports.concat(entityContainer.functionImports);
			}
			
			for (i = 0; i < this.dataService.entityTypes.length; i++) {
				var entityType = this.dataService.entityTypes[i];
				for (j = 0; j < entityType.properties.length; j++) {
					var property = entityType.properties[j];
					if (!property.complexType && !property.isComplexType) {
						this.dataService.properties.push(property);
					}
				}
			}
			
			for (i = 0; i < this.dataService.functionImports.length; i++) {
				var functionImport = this.dataService.functionImports[i];
				for (j = 0; j < functionImport.parameters.length; j++) {
					var parameter = functionImport.parameters[j];
					this.dataService.parameters.push(parameter);
				}
			}
			
			for (i = 0; i < this.dataService.complexTypes.length; i++) {
				var complexType = this.dataService.complexTypes[i];
				for (j = 0; j < complexType.properties.length; j++) {
					this.dataService.properties.push(complexType.properties[i]);
				}
			}
		},
		
		fillParsedDataServiceWithReferences: function() {
			var i = 0;
			
			for (i = 0; i < this.dataService.schemas.length; i++) {
				var schema = this.dataService.schemas[i];
				this.fillParsedSchemaWithReferences(schema, this.dataService);
			}
		},
		
		fillParsedSchemaWithReferences: function(schema, dataService) {
			var i = 0;
			
			schema.dataService = dataService;
			
			for (i = 0; i < schema.complexTypes.length; i++) {
				var complexType = schema.complexTypes[i];
				complexType.schema = schema;
			}
			
			for (i = 0; i < schema.entityTypes.length; i++) {
				var entityType = schema.entityTypes[i];
				this.fillParsedEntityTypeWithReferences(entityType, schema);
			}
			
			for (i = 0; i < schema.associations.length; i++) {
				var association = schema.associations[i];
				this.fillParsedAssociationWithReferences(association, schema);
			}
			
			for (i = 0; i < schema.entityContainers.length; i++) {
				var entityContainer = schema.entityContainers[i];
				this.fillParsedEntityContainerWithReferences(entityContainer, schema);
			}
		},
		
		fillParsedEntityTypeWithReferences: function(entityType, schema) {
			var i = 0;
			
			entityType.schema = schema;
			
			for (i = 0; i < entityType.properties.length; i++) {
				var property = entityType.properties[i];
				
				if (property.type.startsWith("Edm")) {
					if (!property.complexType) {
						property.entityType = entityType;
					}
				} else {
					// Property is not a standard type but a complex type
					// We add the properties of the complex type to the entityType
					var typeParts = property.type.split(".");	// <schemaName>.<complexPropertyName>
					var complexType = this._findComplexTypeByNameAndSchemaNamespace(typeParts[1], typeParts[0], schema.dataService);
					
					property.classification = "ComplexType";
					property.complexType = complexType;
					
					for (var j = 0; j < complexType.properties.length; j++) {
						var complexProperty = complexType.properties[j];
						entityType.properties.push(complexProperty);
					}
				}
			}
			
			for (i = 0; i < entityType.navigationProperties.length; i++) {
				var navigationProperty = entityType.navigationProperties[i];
				navigationProperty.entityType = entityType;
				
				var fromRoleParts = navigationProperty.fromRole.split("."),
					fromEntityTypeName = fromRoleParts[fromRoleParts.length-1];
				navigationProperty.fromRole = this._findEntityTypeByNameAndSchema(fromEntityTypeName, schema);
				
				var toRoleParts = navigationProperty.toRole.split("."),
					toEntityTypeName = toRoleParts[toRoleParts.length-1];
				navigationProperty.toRole = this._findEntityTypeByNameAndSchema(toEntityTypeName, schema);
				
				var relationshipParts = navigationProperty.relationship.split(".");
				navigationProperty.relationship = this._findAssociationByNameAndSchemaNamespace(relationshipParts[1], relationshipParts[0], schema.dataService);
			}
		},
		
		fillParsedAssociationWithReferences: function(association, schema) {
			association.schema = schema;
			
			var end1Parts = association.end1.type.split(".");
			association.end1.type = this._findEntityTypeByNameAndSchemaNamespace(end1Parts[1], end1Parts[0]);
			
			var end2Parts = association.end2.type.split(".");
			association.end2.type = this._findEntityTypeByNameAndSchemaNamespace(end2Parts[1], end2Parts[0]);
		},
		
		fillParsedEntityContainerWithReferences: function(entityContainer, schema) {
			var i = 0;
			
			entityContainer.schema = schema;
			
			// Handle EntitySets
			for (i = 0; i < entityContainer.entitySets.length; i++) {
				var entitySet = entityContainer.entitySets[i],
					entityTypeParts = entitySet.entityType.split(".");
					
				entitySet.entityContainer = entityContainer;
				entitySet.entityType = this._findEntityTypeByNameAndSchemaNamespace(entityTypeParts[1], entityTypeParts[0]);
			}
			
			// Handle FunctionImports
			for (i = 0; i < entityContainer.functionImports.length; i++) {
				var functionImport = entityContainer.functionImports[i];
				
				functionImport.entityContainer = entityContainer;
				
				if (functionImport.entitySet) {
					var returnTypeParts = functionImport.returnType.split(".");
					functionImport.returnType = this._findEntityTypeByNameAndSchemaNamespace(returnTypeParts[1], returnTypeParts[0]);
					functionImport.entitySet = this._findEntitySetByNameAndEntityContainer(functionImport.entitySet, entityContainer);
				}
			}
			
			// Handle AssociationSets
			for (i = 0; i < entityContainer.associationSets.length; i++) {
				var associationSet = entityContainer.associationSets[i],
					associationParts = associationSet.association.split(".");
				
				associationSet.entityContainer = entityContainer;
				
				associationSet.association = this._findAssociationByNameAndSchemaNamespace(associationParts[1], associationParts[0]);
				
				associationSet.end1.entitySet = this._findEntitySetByNameAndEntityContainer(associationSet.end1.entitySet, entityContainer);
				associationSet.end2.entitySet = this._findEntitySetByNameAndEntityContainer(associationSet.end2.entitySet, entityContainer);
			}
			
		},
		
		parseDataForSchema: function(schema, metadata) {
			var i = 0,
				data = {
					entityTypes: [],
					associations: [],
					complexTypes: [],
					entityContainers: []
				};
				
			if (schema.complexType) {
				for (i = 0; i < schema.complexType.length; i++) {
					var complexType = this.parseComplexType(schema.complexType[i], schema, metadata);
					data.complexTypes.push(complexType);
				}
			}
			
			if (schema.entityType) {
				for (i = 0; i < schema.entityType.length; i++) {
					var entityType = this.parseEntityType(schema.entityType[i], schema, metadata);
					data.entityTypes.push(entityType);
				}
			}
			
			if (schema.association) {
				for (i = 0; i < schema.association.length; i++) {
					var association = this.parseAssociation(schema.association[i], schema, metadata);
					data.associations.push(association);
				}
			}
			
			if (schema.entityContainer) {
				for (i = 0; i < schema.entityContainer.length; i++) {
					var entityContainer = this.parseEntityContainer(schema.entityContainer[i], schema, metadata);
					data.entityContainers.push(entityContainer);
				}
			}
			
			return data;
		},

		parseComplexType: function(complexType, schema, metadata) {
			var parsedComplexType = {
				name: complexType.name,
				properties: []
			};
			
			for (var i = 0; i < complexType.property.length; i++) {
				var property = JSON.parse(JSON.stringify(complexType.property[i]));
				property.complexType = parsedComplexType;
				property.classification = "ComplexProperty";
				property.isPrimaryKey = false;
				parsedComplexType.properties.push(property);
			}
			
			return parsedComplexType;
		},

		parseEntityType: function(entityType, schema, metadata) {
			var parsedEntityType = {
				name: entityType.name,
				properties: [],
				navigationProperties: []
			};
			
			if (entityType.property) {
				for (var i = 0; i < entityType.property.length; i++) {
					var property = JSON.parse(JSON.stringify(entityType.property[i]));
					property.isPrimaryKey = this._isPropertyPrimaryKey(property, entityType);
					property.nullable = property.nullable === "true";
					if (property.type.startsWith("Edm")) {
						property.entityType = parsedEntityType;
						property.classification = "EntityProperty";
					}
					parsedEntityType.properties.push(property);
				}
			}
			
			if (entityType.navigationProperty) {
				for (i = 0; i < entityType.navigationProperty.length; i++) {
					var navigationProperty = JSON.parse(JSON.stringify(entityType.navigationProperty[i]));
					navigationProperty.classification = "NavigationProperty";
					parsedEntityType.navigationProperties.push(navigationProperty);
				}
			}
			
			return parsedEntityType;
		},

		parseAssociation: function(association, schema, metadata) {
			var parsedAssociation = {
				name: association.name
			};
			
			var end1 = JSON.parse(JSON.stringify(association.end[0]));
			var end2 = JSON.parse(JSON.stringify(association.end[1]));
			
			end1.association = parsedAssociation;
			end2.association = parsedAssociation;
			
			parsedAssociation.end1 = end1;
			parsedAssociation.end2 = end2;
			
			return parsedAssociation;
		},

		parseEntityContainer: function(entityContainer, schema, metadata) {
			var i = 0,
				parsedEntityContainer = {
				isDefaultEntityContainer: entityContainer.isDefaultEntityContainer,
				name: entityContainer.name,
				entitySets: [],
				associationSets: [],
				functionImports: []
			};
			
			if (entityContainer.entitySet) {
				for (i = 0; i < entityContainer.entitySet.length; i++) {
					var entitySet = this.parseEntitySet(entityContainer.entitySet[i], entityContainer, schema, metadata);
					parsedEntityContainer.entitySets.push(entitySet);
				}
			}

			if (entityContainer.association) {
				for (i = 0; i < entityContainer.associationSet.length; i++) {
					var associationSet = this.parseAssociationSet(entityContainer.associationSet[i], entityContainer, schema, metadata);
					parsedEntityContainer.associationSets.push(associationSet);
				}
			}
			
			if (entityContainer.functionImport) {
				for (i = 0; i < entityContainer.functionImport.length; i++) {
					var functionImport = this.parseFunctionImport(entityContainer.functionImport[i], entityContainer, schema, metadata);
					parsedEntityContainer.functionImports.push(functionImport);
				}
			}
			
			return parsedEntityContainer;
		},

		parseEntitySet: function(entitySet, entityContainer, schema, metadata) {
			var parsedEntitySet = {
				name: entitySet.name,
				entityType: entitySet.entityType
			};
			
			return parsedEntitySet;
		},

		parseAssociationSet: function(associationSet, entityContainer, schema, metadata) {
			var parsedAssociationSet = {
				name: associationSet.name,
				association: associationSet.association
			};
			
			var end1 = JSON.parse(JSON.stringify(associationSet.end[0]));
			var end2 = JSON.parse(JSON.stringify(associationSet.end[1]));
			
			end1.associationSet = parsedAssociationSet;
			end2.associationSet = parsedAssociationSet;
			
			parsedAssociationSet.end1 = end1;
			parsedAssociationSet.end2 = end2;
			
			return parsedAssociationSet;
		},

		parseFunctionImport: function(functionImport, entityContainer, schema, metadata) {
			var parsedFunctionImport = {
				name: functionImport.name,
				returnType: functionImport.returnType,
				httpMethod: functionImport.httpMethod,
				parameters: []
			};
			
			if (functionImport.entitySet) {
				parsedFunctionImport.entitySet = functionImport.entitySet;
				if (functionImport.returnType.startsWith("Collection(")) {
					parsedFunctionImport.returnType = functionImport.returnType.substring(11, functionImport.returnType.length - 1);
					parsedFunctionImport.returnsCollection = true;
				} else {
					parsedFunctionImport.returnsCollection = false;
				}
			}
			
			if (functionImport.parameter) {
				for (var i = 0; i < functionImport.parameter.length; i++) {
					var parameter = JSON.parse(JSON.stringify(functionImport.parameter[i]));
					parameter.functionImport = parsedFunctionImport;
					parsedFunctionImport.parameters.push(parameter);
				}
			}
			
			return parsedFunctionImport;
		},
		
		_findEntitySetByNameAndEntityContainer: function(entitySetName, entityContainer) {
			for (var i = 0; i < entityContainer.entitySets.length; i++) {
				var entitySet = entityContainer.entitySets[i];
				if (entitySet.name === entitySetName) {
					return entitySet;
				}
			}
			return null;
		},
		
		_findEntityTypeByNameAndSchema: function(entityTypeName, schema) {
			for (var i = 0; i < schema.entityTypes.length; i++) {
				if (schema.entityTypes[i].name === entityTypeName) {
					return schema.entityTypes[i];
				}
			}
			return null;
		},
		
		_findEntityTypeByNameAndSchemaNamespace: function(entityTypeName, schemaNamespace) {
			var schema,
				i = 0;
				
			for (i = 0; i < this.dataService.schemas.length; i++) {
				if (schemaNamespace === this.dataService.schemas[i].namespace) {
					schema = this.dataService.schemas[i];
					break;
				}
			}
			
			if (!schema) {
				return null;
			}
			
			for (i = 0; i < schema.entityTypes.length; i++) {
				if (schema.entityTypes[i].name === entityTypeName) {
					return schema.entityTypes[i];
				}
			}
			return null;
		},
		
		_findComplexTypeByNameAndSchemaNamespace: function(complexTypeName, schemaNamespace) {
			var schema,
				i = 0;
			
			for (i = 0; i < this.dataService.schemas.length; i++) {
				if (this.dataService.schemas[i].namespace === schemaNamespace) {
					schema = this.dataService.schemas[i];
					break;
				}
			}
			
			if (!schema) {
				return null;
			}
			
			for (i = 0; i < schema.complexTypes.length; i++) {
				if (schema.complexTypes[i].name === complexTypeName) {
					return schema.complexTypes[i];
				}
			}
			return null;
		},
		
		_findAssociationByNameAndSchemaNamespace: function(associationName, schemaNamespace) {
			var schema,
				i = 0;
			
			for (i = 0; i < this.dataService.schemas.length; i++) {
				if (this.dataService.schemas[i].namespace === schemaNamespace) {
					schema = this.dataService.schemas[i];
					break;
				}
			}
			
			if (!schema) {
				return null;
			}
			
			for (i = 0; i < schema.associations.length; i++) {
				if (schema.associations[i].name === associationName) {
					return schema.associations[i];
				}
			}
			return null;
		},
		
		_isPropertyPrimaryKey: function(property, entityType) {
			for (var i = 0; i < entityType.key.propertyRef.length; i++) {
				if (entityType.key.propertyRef[i].name === property.name) {
					return true;
				}
			}
			return false;
		}
		
	};
});