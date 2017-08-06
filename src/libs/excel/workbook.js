'use strict';

const _ = require('lodash');
const JSZip = require('jszip');
const util = require('./util');
const Common = require('./common');
const Relations = require('./relations');
const createWorksheet = require('./worksheet');
const toXMLString = require('./XMLString');

const maxWorksheetNameLength = 31;

function Workbook(outerWorkbook) {
	this.outerWorkbook = outerWorkbook;
	this.common = new Common();
	this.styles = this.common.styles;
	this.images = this.common.images;

	this.relations = new Relations(this.common);
	this.relations.add(this.styles, 'stylesheet');
}

Workbook.prototype = {
	addWorksheet(config) {
		config = _.defaults(config, {
			name: this.common.getNewWorksheetDefaultName()
		});

		// 微软Excel[2007, 2013]工作表名称不允许超过31个字符
		if (config.name.length > maxWorksheetNameLength) {
			throw '微软Excel[2007, 2013]工作表名称不允许超过31个字符';
		}

		const {outerWorksheet, worksheet} = createWorksheet(this.outerWorkbook, this.common, config);
		this.common.addWorksheet(worksheet);
		this.relations.add(worksheet, 'worksheet');

		return outerWorksheet;
	},
  
	save(options) {
		const zip = new JSZip();

		this.generateFiles(zip);
		return zip.generateAsync(_.defaults(options, {
			compression: 'DEFLATE',
			mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			type: 'blob'
		}));
	},
	saveAsNodeStream(options) {
		const zip = new JSZip();

		this.generateFiles(zip);
		return zip.generateNodeStream(_.defaults(options, {
			compression: 'DEFLATE'
		}));
	},

	generateFiles(zip) {
		this.prepareWorksheets();

		this.saveWorksheets(zip);
		this.saveTables(zip);
		this.saveImages(zip);
		this.saveDrawings(zip);
		this.saveStyles(zip);
		this.saveStrings(zip);
		zip.file('[Content_Types].xml', this.createContentTypes());
		zip.file('_rels/.rels', this.createWorkbookRelationship());
		zip.file('xl/workbook.xml', this.saveWorkbook());
		zip.file('xl/_rels/workbook.xml.rels', this.relations.save());
	},
	saveWorkbook() {
		return toXMLString({
			name: 'workbook',
			ns: 'spreadsheetml',
			attributes: [
				['xmlns:r', util.schemas.relationships]
			],
			children: [
				this.bookViewsXML(),
				this.sheetsXML(),
				this.definedNamesXML()
			]
		});
	},
	bookViewsXML() {
		return toXMLString({
			name: 'bookViews',
			children: [
				toXMLString({
					name: 'workbookView',
					attributes: [
						['activeTab', this.common.getActiveWorksheetIndex()]
					]
				})
			]
		});
	},
	sheetsXML() {
		const children = this.common.worksheets.map(
			(worksheet, index) => toXMLString({
				name: 'sheet',
				attributes: [
					['name', worksheet.name],
					['sheetId', index + 1],
					['r:id', this.relations.getId(worksheet)],
					['state', worksheet.getState()]
				]
			})
		);

		return toXMLString({
			name: 'sheets',
			children
		});
	},
	definedNamesXML() {
		const isPrintTitles = this.common.worksheets.some(worksheet => worksheet.isPrintTitle());

		if (isPrintTitles) {
			const children = [];

			this.common.worksheets.forEach((worksheet, index) => {
				const value = worksheet.savePrintTitle();

				if (value) {
					children.push(toXMLString({
						name: 'definedName',
						value,
						attributes: [
							['name', '_xlnm.Print_Titles'],
							['localSheetId', index]
						]
					}));
				}
			});

			return toXMLString({
				name: 'definedNames',
				children
			});
		}
		return '';
	},
	prepareWorksheets() {
		this.common.worksheets.forEach(worksheet => {
			worksheet.prepare();
		});
	},
	saveWorksheets(zip) {
		this.common.worksheets.forEach(worksheet => {
			zip.file(worksheet.path, worksheet.save());
			zip.file(worksheet.relationsPath, worksheet.relations.save());
		});
	},
	saveTables(zip) {
		this.common.tables.forEach(table => {
			zip.file(table.path, table.save());
		});
	},
	saveImages(zip) {
		_.forEach(this.images.getImages(), image => {
			zip.file(image.path, image.data, {base64: true, binary: true});
			image.data = null;
		});
		this.images.removeImages();
	},
	saveDrawings(zip) {
		this.common.drawings.forEach(drawing => {
			zip.file(drawing.path, drawing.save());
			zip.file(drawing.relationsPath, drawing.relations.save());
		});
	},
	saveStyles(zip) {
		zip.file('xl/styles.xml', this.styles.save());
	},
	saveStrings(zip) {
		if (this.common.strings.isStrings()) {
			this.relations.add(this.common.strings, 'sharedStrings');
			zip.file('xl/sharedStrings.xml', this.common.strings.save());
		}
	},
	createContentTypes() {
		const children = [];

		children.push(toXMLString({
			name: 'Default',
			attributes: [
				['Extension', 'rels'],
				['ContentType', 'application/vnd.openxmlformats-package.relationships+xml']
			]
		}));
		children.push(toXMLString({
			name: 'Default',
			attributes: [
				['Extension', 'xml'],
				['ContentType', 'application/xml']
			]
		}));
		children.push(toXMLString({
			name: 'Override',
			attributes: [
				['PartName', '/xl/workbook.xml'],
				['ContentType', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml']
			]
		}));
		if (this.common.strings.isStrings()) {
			children.push(toXMLString({
				name: 'Override',
				attributes: [
					['PartName', '/xl/sharedStrings.xml'],
					['ContentType', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml']
				]
			}));
		}
		children.push(toXMLString({
			name: 'Override',
			attributes: [
				['PartName', '/xl/styles.xml'],
				['ContentType', 'application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml']
			]
		}));

		this.common.worksheets.forEach((worksheet, index) => {
			children.push(toXMLString({
				name: 'Override',
				attributes: [
					['PartName', '/xl/worksheets/sheet' + (index + 1) + '.xml'],
					['ContentType', 'application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml']
				]
			}));
		});
		this.common.tables.forEach((table, index) => {
			children.push(toXMLString({
				name: 'Override',
				attributes: [
					['PartName', '/xl/tables/table' + (index + 1) + '.xml'],
					['ContentType', 'application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml']
				]
			}));
		});
		_.forEach(this.common.images.getExtensions(), (contentType, extension) => {
			children.push(toXMLString({
				name: 'Default',
				attributes: [
					['Extension', extension],
					['ContentType', contentType]
				]
			}));
		});
		this.common.drawings.forEach((drawing, index) => {
			children.push(toXMLString({
				name: 'Override',
				attributes: [
					['PartName', '/xl/drawings/drawing' + (index + 1) + '.xml'],
					['ContentType', 'application/vnd.openxmlformats-officedocument.drawing+xml']
				]
			}));
		});

		return toXMLString({
			name: 'Types',
			ns: 'contentTypes',
			children
		});
	},
	createWorkbookRelationship() {
		return toXMLString({
			name: 'Relationships',
			ns: 'relationshipPackage',
			children: [
				toXMLString({
					name: 'Relationship',
					attributes: [
						['Id', 'rId1'],
						['Type', util.schemas.officeDocument],
						['Target', 'xl/workbook.xml']
					]
				})
			]
		});
	}
};

module.exports = Workbook;
