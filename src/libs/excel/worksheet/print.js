'use strict';

const _ = require('lodash');
const util = require('../util');
const toXMLString = require('../XMLString');

const methods = {
	setHeader(headers) {
		if (!_.isArray(headers)) {
			throw '无效的参数类型';
		}
		this.headers = headers;
	},
	setFooter(footers) {
		if (!_.isArray(footers)) {
			throw '无效的参数类型';
		}
		this.footers = footers;
	},
	setPageMargin(margin) {
		this.margin = _.defaults(margin, {
			left: 0.7,
			right: 0.7,
			top: 0.75,
			bottom: 0.75,
			header: 0.3,
			footer: 0.3
		});
	},
	/**
	 * http://www.datypic.com/sc/ooxml/t-ssml_ST_Orientation.html
	 *
	 * @param {String} orientation
	 */
	setPageOrientation(orientation) {
		if (orientation === 'portrait' || orientation === 'landscape') {
			this.orientation = orientation;
		}
	},
	setPrintTitleTop(params) {
		this.printTitles = this.printTitles || {};

		if (_.isObject(params)) {
			this.printTitles.topFrom = params[0];
			this.printTitles.topTo = params[1];
		} else {
			this.printTitles.topFrom = 0;
			this.printTitles.topTo = params - 1;
		}
	},
	setPrintTitleLeft(params) {
		this.printTitles = this.printTitles || {};

		if (_.isObject(params)) {
			this.printTitles.leftFrom = params[0];
			this.printTitles.leftTo = params[1];
		} else {
			this.printTitles.leftFrom = 0;
			this.printTitles.leftTo = params - 1;
		}
	},

	isPrintTitle() {
		return this.printTitles && (this.printTitles.topTo >= 0 || this.printTitles.leftTo >= 0);
	},
	savePrintTitle() {
		if (this.isPrintTitle()) {
			const printTitles = this.printTitles;
			let value = '';

			if (printTitles.topTo >= 0) {
				value = this.sheetName() +
					'!$' + (printTitles.topFrom + 1) +
					':$' + (printTitles.topTo + 1);

				if (printTitles.leftTo >= 0) {
					value += ',';
				}
			}
			if (printTitles.leftTo >= 0) {
				value += this.sheetName() +
					'!$' + util.positionToLetter(printTitles.leftFrom + 1) +
					':$' + util.positionToLetter(printTitles.leftTo + 1);
			}
			return value;
		}
		return '';
	},

	savePrint() {
		return this.savePageMargins() +
			this.savePageSetup() +
			this.saveHeaderFooter();
	},
	savePageMargins() {
		const margin = this.margin;

		if (margin) {
			return toXMLString({
				name: 'pageMargins',
				attributes: [
					['top', margin.top],
					['bottom', margin.bottom],
					['left', margin.left],
					['right', margin.right],
					['header', margin.header],
					['footer', margin.footer]
				]
			});
		}
		return '';
	},
	savePageSetup() {
		if (this.orientation) {
			return toXMLString({
				name: 'pageSetup',
				attributes: [
					['orientation', this.orientation]
				]
			});
		}
		return '';
	},
	saveHeaderFooter() {
		if (this.headers.length || this.footers.length) {
			const children = [];

			if (this.headers.length) {
				children.push(this.saveHeader());
			}
			if (this.footers.length) {
				children.push(this.saveFooter());
			}

			return toXMLString({
				name: 'headerFooter',
				children
			});
		}
		return '';
	},
	saveHeader() {
		return toXMLString({
			name: 'oddHeader',
			value: compilePageDetailPackage(this.headers)
		});
	},
	saveFooter() {
		return toXMLString({
			name: 'oddFooter',
			value: compilePageDetailPackage(this.footers)
		});
	}
};

function compilePageDetailPackage(data) {
	return [
		'&L', compilePageDetailPiece(data[0] || ''),
		'&C', compilePageDetailPiece(data[1] || ''),
		'&R', compilePageDetailPiece(data[2] || '')
	].join('');
}

function compilePageDetailPiece(data) {
	if (_.isString(data)) {
		return '&"-,Regular"' + data;
	} else if (_.isObject(data) && !_.isArray(data)) {
		let string = '&"' + (data.font || '-') + ',';

		if (data.bold && data.italic) {
			string += 'Bold Italic';
		} else if (data.bold) {
			string += 'Bold';
		} else if (data.italic) {
			string += 'Italic';
		} else {
			string += 'Regular';
		}
		string += '"';
		if (data.underline) {
			string += '&U';
		}
		if (data.fontSize) {
			string += '&' + data.fontSize;
		}
		string += data.text;

		return string;
	} else if (_.isArray(data)) {
		return _.reduce(data, (result, value) => result + compilePageDetailPiece(value), '');
	}
}

module.exports = {methods};
