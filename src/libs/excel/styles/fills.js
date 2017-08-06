'use strict';

const _ = require('lodash');
const StylePart = require('./stylePart');
const {canonColor} = require('../util');
const {saveColor} = require('./utils');
const toXMLString = require('../XMLString');

const PATTERN_TYPES = ['none', 'solid', 'darkGray', 'mediumGray', 'lightGray', 'gray125', 'gray0625',
	'darkHorizontal', 'darkVertical', 'darkDown', 'darkUp', 'darkGrid', 'darkTrellis',
	'lightHorizontal', 'lightVertical', 'lightDown', 'lightUp',	'lightGrid', 'lightTrellis'];

//https://msdn.microsoft.com/en-us/library/documentformat.openxml.spreadsheet.fills.aspx
function Fills(styles) {
	StylePart.call(this, styles, 'fills', 'fill');

	this.init();
	this.lastId = this.formats.length;
}

Fills.canon = function (format, flags) {
	const result = {
		fillType: flags.merge ? format.fillType : flags.fillType
	};

	if (result.fillType === 'pattern') {
		const fgColor = (flags.merge ? format.fgColor : format.color) || 'FFFFFFFF';
		const bgColor = (flags.merge ? format.bgColor : format.backColor) || 'FFFFFFFF';
		const patternType = flags.merge ? format.patternType : format.type;

		result.patternType = _.includes(PATTERN_TYPES, patternType) ? patternType : 'solid';
		if (flags.isTable && result.patternType === 'solid') {
			result.fgColor = bgColor;
			result.bgColor = fgColor;
		} else {
			result.fgColor = fgColor;
			result.bgColor = bgColor;
		}
	} else {
		if (_.has(format, 'left')) {
			result.left = format.left || 0;
			result.right = format.right || 0;
			result.top = format.top || 0;
			result.bottom = format.bottom || 0;
		} else {
			result.degree = format.degree || 0;
		}
		result.start = format.start || 'FFFFFFFF';
		result.end = format.end || 'FFFFFFFF';
	}
	return result;
};

Fills.saveFormat = function (format) {
	const children = format.fillType === 'pattern'
		? [savePatternFill(format)]
		: [saveGradientFill(format)];

	return toXMLString({
		name: 'fill',
		children
	});
};

Fills.prototype = _.merge({}, StylePart.prototype, {
	init() {
		this.formats.push(
			{format: this.canon({type: 'none'}, {fillType: 'pattern'})},
			{format: this.canon({type: 'gray125'}, {fillType: 'pattern'})}
		);
	},
	canon: Fills.canon,
	saveFormat: Fills.saveFormat,
	merge(formatTo, formatFrom) {
		return formatFrom || formatTo;
	}
});

function savePatternFill(format) {
	const attributes = [
		['patternType', format.patternType]
	];
	const children = [
		toXMLString({
			name: 'fgColor',
			attributes: [
				['rgb', canonColor(format.fgColor)]
			]
		}),
		toXMLString({
			name: 'bgColor',
			attributes: [
				['rgb', canonColor(format.bgColor)]
			]
		})
	];

	return toXMLString({
		name: 'patternFill',
		attributes,
		children
	});
}

function saveGradientFill(format) {
	const attributes = [];

	if (format.degree) {
		attributes.push(['degree', format.degree]);
	} else if (format.left) {
		attributes.push(['type', 'path']);
		attributes.push(['left', format.left]);
		attributes.push(['right', format.right]);
		attributes.push(['top', format.top]);
		attributes.push(['bottom', format.bottom]);
	}

	const children = [
		toXMLString({
			name: 'stop',
			attributes: [
				['position', 0]
			],
			children: [saveColor(format.start)]
		}),
		toXMLString({
			name: 'stop',
			attributes: [
				['position', 1]
			],
			children: [saveColor(format.end)]
		})
	];

	return toXMLString({
		name: 'gradientFill',
		attributes,
		children
	});
}

module.exports = Fills;
