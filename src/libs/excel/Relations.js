'use strict';

const _ = require('lodash');
const util = require('./util');
const toXMLString = require('./XMLString');

function RelationshipManager(common) {
	this.common = common;

	this.relations = Object.create(null);
	this.lastId = 1;
}

RelationshipManager.prototype = {
	add(object, type) {
		const relation = this.relations[object.objectId];

		if (relation) {
			return relation.relationId;
		}

		const relationId = 'rId' + this.lastId++;
		this.relations[object.objectId] = {
			relationId,
			schema: util.schemas[type],
			object
		};
		return relationId;
	},
	getId(object) {
		const relation = this.relations[object.objectId];

		return relation ? relation.relationId : null;
	},
	save() {
		const children = _.map(this.relations, relation => {
			const attributes = [
				['Id', relation.relationId],
				['Type', relation.schema],
				['Target', relation.object.target || this.common.getPath(relation.object)]
			];

			if (relation.object.targetMode) {
				attributes.push(['TargetMode', relation.object.targetMode]);
			}

			return toXMLString({
				name: 'Relationship',
				attributes
			});
		});

		return toXMLString({
			name: 'Relationships',
			ns: 'relationshipPackage',
			children
		});
	}
};

module.exports = RelationshipManager;
