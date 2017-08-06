const {saveAs} = require('file-saver');
const excel = require('./index');

const workbook = excel.createWorkbook();
workbook.addFontFormat({bold: true, underline: true, color: {theme: 3}}, 'font');
const headerBorder = workbook.addBorderFormat({color: '#FF0000', style: excel.constants.borderStyle.thin});
const greenFill = workbook.addPatternFormat({color: '#00FF00'});
const currency = workbook.addNumberFormat('$ #,##0.00;$ #,##0.00;-', 'currency');
const header = workbook.addFormat({
  font: 'font',
  border: headerBorder,
  pattern: greenFill,
  format: currency,
  horizontal: 'center'
});
const fillFormat = workbook.addFormat({
  font: {
    italic: true,
    color: '#FF0000'
  },
  border: {
    right: {color: '#8888FF', style: excel.constants.borderStyle.thin}
  },
  pattern: {type: 'darkHorizontal', color: '#88FF88', backColor: '#8888F0'},
  locked: false,
  hidden: true
});
const columns = [
  {
    width: 10,
    style: header
  },
  {
    width: 50,
    style: {
      fillOut: true,
      gradient: {left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, start: '#FFFF00', end: '#5B9BD5'}
    }
  },
  {style: {format: 'currency'}},
  {width: 25}
];
const worksheetData = [
  {
    outlineLevel: 0,
    height: 30,
    style: fillFormat,
    data: [
      2541,
      {value: 'Nullam aliquet mi et nunc tempus rutrum.', style: {pattern: {color: '#999999'}}},
      undefined,
      '__proto__',
      1342372604000,
      {date: 1342977404000}
    ]
  },
  {
    outlineLevel: 1,
    data: [
      2542,
      'Labore duis cillum dolor adipisicing cillum dolore.',
      205,
      {value: 'Dolore anim', style: {font: {bold: true}}},
      'not date',
      {date: 1342977404000}
    ]
  },
  [
    2543,
    'Irure duis sit cupidatat culpa adipisicing nisi.',
    59,
    ' String with header space',
    1342372604000,
    {time: 1342977404000}
  ],
  [
    2544,
    'Est sunt esse elit reprehenderit exercitation irure.',
    145,
    'String with trailing space ',
    1342372604000,
    {time: 1342977404000}
  ]
];

workbook.addWorksheet()
  .setData(worksheetData)
  .setData(2, worksheetData)
  .setColumns(columns)
  .setColumn(5, {
    width: 12,
    style: {format: 'date', horizontal: 'right', indent: 1},
    type: 'date'
  })
  .setRow(2, {height: 25})
  .setRows(3, [{height: 20}, {height: 15}]);

workbook.save().then(content => {
  saveAs(content, 'excel.xlsx');
});

/*
const logo = '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';
const battery1 = 'iVBORw0KGgoAAAANSUhEUgAAAEAAAAAgCAYAAACinX6EAAAACXBIWXMAAA7EAAAOxAGVKw4bAAABq0lEQVRoge2YsS4EYRDHf3PuktNcwu2KwlVEofMCJCQKnSfwAPS8Alp6b0BDVCIqKoXoSMiJhPtOVJycu1HcilC4zO5e1rK/5tsvmf/M5J9vsslARkbGf0bsEs0x+DiL6Hg4fYyIvtLXOuF++Dx0Clu45vFre6jMhS3YAxSVVereehixzYCyW0R0O7jdAG9hisZICfCBNlDB+XfWBHlj/GRwHuP8aWux2Bmp9tMoPgM5VCYAswE5W3S7Y5jKi7VQT7itfPbx0ZuRUKIveLXLrjFv+VmeBm4i1+oB0Q2A0a4RhWYhhjo/o7JK2RWpe7sWmW0EfjfTiO5QdjMWUfoNEN1CdAuoBvd5izyOEUiW2tAyAGU3hmgF0aJFnv4XEJHMgKQbSJrMgKQbSJr0/wX8h00AVCc6pzQs8vQboLL07b5vkf+lEThCZYG6d2gRxfECrrpGNAvNGOr8jOgazj+wyqIb4PyxyDkSxDYC7VxnAyTa34tmzIxUP/v46M2I9QWcBecUXu2apFdiDUrBVxvRizAp/sZSFFZw/kYYcdrX4g36WqdR1uIZGRn/m3fCBW+4FEtAXQAAAABJRU5ErkJggg==';
const battery2 = 'iVBORw0KGgoAAAANSUhEUgAAAEAAAAAgCAYAAACinX6EAAAACXBIWXMAAA7EAAAOxAGVKw4bAAABmUlEQVRoge2YsUoDQRCGv0ksYpPC3ImFqQwW6XwBBQULO5/AB9BeX0FtTe8baKNYiVhpZSF2CkpE0GwsNYJmLHIhaDe3F84z9zWbhf1nfn52OTKQk5MzyohdogUmXpcQnY2nTxDRD4pfFzxPXccuYTuuY4StI1SW4zYcAorKFu1gJ47YFkDFrSG6H+0egM84TROkDIRAF6jiwidrgTHj+bloPceFC9ZmiTPdHKdTegMKqNQBcwAF2+luLzCVd2ujofBYHfjoezMSS/SDoHXrpXdhzduDB/4BwEwCNfxR2aLiSrSDQ4vM9gT+NguIHlBxixZR9gMQbSDaAJrRfsUiT+IJpEtrcgOAiqshWkW0ZJFn/wZ4kgeQtoG0yQNI20DaZP8rEL7sAaBa763SscizH4DK+q/9sUX+n57AGSqrtINTiyiJG3CXQA1/RLdx4YlV5h9Ayv/mfLE9gW6hNwESHR+GGTPTzYGPvjcj1htwFa3zBK170h6JdShHv7qI3sQp8T+GorCJC3fjiLM+Fu9Q/Lr0GYvn5OSMNt8TO2q4lNWMWQAAAABJRU5ErkJggg==';
const battery3 = 'iVBORw0KGgoAAAANSUhEUgAAAEAAAAAgCAYAAACinX6EAAAACXBIWXMAAA7EAAAOxAGVKw4bAAABoUlEQVRoge2YsS4EURSGv7MUq1HYuaKwFVHovAAJiULnCTwAvX0FtPTegIaoRFRUCtGRsCsS9q6SlbBHsbOEbHNmZjNmzdfcucn5zzn5c24mOZCTk/OfEbtEC4w8LyA6FU2fIKJvDHyc8Th2GTmFLVwHcfUDVBajFuwBikqFRrAZRWwzoORXEN0Nb3fAe5SiCTIMOKAFlPHuwZpg0Bg/E56neDdnLZY447UhmsUXoIDKNGA2oGCLbrUNU3m1FuoJ9+XvPjq9GYkk+kFQv46doztVvJvvUe4v4hsAEwnkiI9KhZIv0gj2LTLbE/jbzCG6R8mbpib7BojuILoD1ML7kkWexBNIl/roGgAlP4loGdGiRZ79CYhJbkDaDaRNbkDaDaRN9v8C7mkbANXp9ilNizz7Bqis/rofWuT99AROUFmmERxbRElMwE0CObpRNUWLbuDdkbVIfAO8m4ydI0VsT6BVaG+ARId60YyZ8dp3H53ejFgn4CI8Zwnqt6S9EmsyHH61EL2KkqI/lqKwjndbUcRZX4s3Gfg4j7MWz8nJ+d98AsKVbJq58zg+AAAAAElFTkSuQmCC';
const battery4 = 'iVBORw0KGgoAAAANSUhEUgAAAEAAAAAgCAYAAACinX6EAAAACXBIWXMAAA7EAAAOxAGVKw4bAAABpElEQVRoge2YMS9DURTHf6c11NJB3xNDOxFDN1+AhMRg8wnEzK5fAavuvgELMYmwMBnERkIqhN4aqYQeQ18jmM57r3mevt9ye1/u/39O/rk3TQ5kZGQMMmKXaI6R5zlEJ8PpY0T0jfzHKY9jF6EtbMd1CL+5h8p82IJ9QFGp0fI2wohtAZTcEqLbwe4WeA9TNEaKgA90gArOv7caDBnPTwXrMc6fsRaLnXJjmHbhBcihUgXMAeRspzvdwFRerYX6wl3lq49eb0ZCib7hNa8ie1hROaHlLcdhFT0AGI/Bw8rv0FVqlFyBlrdrMbI9gb/NDKI7lNysRZT+AETriNaBRrBfsMjjeALJ0hxdBaDkJhCtIFqwyNN/AyKSBZB0A0mTBZB0A0mT/n8B/2kLANVqd5W2RZ7+AFRWfuz3LfL/9ASOUFmk5R1aRHHcgOsYPKw8/Poiuo7zD6xG0QNw/kRkjwSxPYFOrjsBEh3uRzNmyo2vPnq9GbHegPNgncZr3pD0SKxNMfjVQfQyjMX/GIrCGs7fDCNO+1i8Tf7jLMpYPCMjY7D5BFwebntoXHHoAAAAAElFTkSuQmCC';

const {saveAs} = require('file-saver');
const excel = require('../libs/excel');

const workbook = excel.createWorkbook();

const logoName = workbook.addImage(logo, 'png');

workbook.addImage(battery1, 'png', 'battery1');
workbook.addImage(battery1, 'png', 'battery01');
workbook.addWorksheet({name: '中文的e'})
  .setImage(logoName, {cell: 'B3', cols: 2, rows: 4, left: 5, top: -10, right: 5, bottom: -10})
  .insertHyperlink(2, 4, {location: 'https://www.amazon.com', tooltip: '打开链接'})
  .setImage('battery1', 'E3')
  .setImage({data: battery2, type: 'png'}, {c: 5, r: 4})
  .setImageOneCell({data: battery3, type: 'png'}, {cell: 'E5', left: 10, top: 3, width: 50, height: 15})
  .setImageOneCell({data: battery3, type: 'png'}, {cell: {c: 5, r: 6}, left: 10, top: 3, width: 50, height: 15})
  .setImageAbsolute({data: battery4, type: 'png'}, {left: 400, top: 50, width: 80, height: 30});

workbook.save().then(content => {
  saveAs(content, 'excel.xlsx');
});
 */