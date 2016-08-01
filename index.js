var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');

var Excel = require('exceljs');

//  translate -t [path|file] excelFile
//  translate -g [path|file] targetExcelFile



var mode = 'get';
// var mode = 'set';

var phpPaths = ['./mx6/summary.php'/*, './mx6/camera.php','./mx6/spec.php'*/];
var excelFile = './mx6_translate.xlsx';


function getTextObjFromPHP(phpPath) {

	return new Promise(function(resolve, reject) {

		childProcess.exec(
	        'php -r \'include("'+ phpPath +'"); print json_encode($fis_data);\'',

	        function(err, stdout, stderr) {
	            var textObj = JSON.parse(stdout);

	            if (err) {
	            	console.log(err);
	            	return;
	            }
	            resolve(textObj);
	        }
	    );	
	});
}

function getExcelKeysFromTextObj(textObj) { 
	var excelKeys = [];
	if (typeof textObj === 'string') {
		if (!/^[\d\s]*$/.test(textObj)) {
			excelKeys.push(textObj);
		}
	} else if (Object.prototype.toString.call(textObj) === '[object Array]') {
		excelKeys = textObj.reduce(function(prev, cur) {
			return prev.concat(getExcelKeysFromTextObj(cur));
		}, []);
	} else if (textObj instanceof Object) {
		for (var key in textObj) {
			excelKeys = excelKeys.concat(getExcelKeysFromTextObj(textObj[key]));
		}
	}
	return excelKeys;
}

function getTextObjs(phpPaths) { 
	var len = phpPaths.length;
	var textObjs = {};

	return new Promise(function(resolve, reject) {

		phpPaths.forEach(function(phpPath, i) {
			getTextObjFromPHP(phpPath).then(function(textObj) {

				textObjs[path.basename(phpPath, '.php')] = textObj;

				len--; 
				if (len === 0) {
					resolve(textObjs);
				}
			}, function(err) {
				console.log(err);
			});
		});
	});
}

function createExcel(phpPaths) {
	var excelKeys = {};

	getTextObjs(phpPaths).then(function(textObjs) {
		for(var filename in textObjs) {
			try {
				excelKeys[filename] = getExcelKeysFromTextObj(textObjs[filename]);
			} catch(e) {
				console.log(e);
			}
			excelKeys[filename] = getExcelKeysFromTextObj(textObjs[filename]);
		}
		// console.log(excelKeys);
	}, function(err) {
		console.log(err);
	});
}


function init() {
	createExcel(phpPaths);
}

init();











