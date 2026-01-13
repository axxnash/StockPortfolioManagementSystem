const { Parser } = require("json2csv");

exports.toCsv = (data) => new Parser().parse(data);
