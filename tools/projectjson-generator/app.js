var fs = require('fs');
var path = require('path');
var json = require('jsonfile');
var util = require("../util/Util.js");
var currentDir = __dirname;

var srcPath = process.argv[2];
var publishMode = process.argv[3];
var codeFiles = "";
var filterFileList = [];
var highPriorityFileList = [];
var filterDirectoryList = [];
var projectSrcPath = path.join(srcPath, 'src');
var highPriorityFilePath = path.join(currentDir, 'lib/highPriorityFile.js');
var filterFilePath = path.join(currentDir, 'lib/filterFile.js');
var filterDirectoryPath = path.join(currentDir, 'lib/filterDirectory.js');
var projectJsonTemplatePath = path.join(currentDir, 'lib/projectTemplate.json');
var projectJsonPath = path.join(srcPath, 'project.json');

function travel(dir, callback) {
    var files = fs.readdirSync(dir);
    for (var i in files) {
        var file = files[i];
        var pathName = path.join(dir, file);
        if (fs.statSync(pathName).isDirectory()) {
            if (!isFilterDirectory(pathName)) {
                travel(pathName, callback);
            }
        } else {
            callback(pathName);
        }
    }
};

function isFilterDirectory(pathName) {
    if (typeof pathName === 'string') {
        for (var i in filterDirectoryList) {
            var filterDirectory = srcPath + path.sep + filterDirectoryList[i];
            if (pathName == filterDirectory) {
                return true;
            }
        }
    }
    return false;
};

function isFilterFile(pathName) {
    return isFilter(pathName, filterFileList);
};

function isHighPriorityFile(pathName) {
    return isFilter(pathName, highPriorityFileList);
};

function isFilter(pathName, filterList) {
    if (typeof pathName === 'string') {
        pathName = srcPath + path.sep + pathName;
        for (var i in filterList) {
            var filterName = srcPath + path.sep + filterList[i];
            if (pathName == filterName) {
                return true;
            }
        }
    }
    return false;
};

function initFilterFileList() {
    try {
        filterFileList = json.readFileSync(filterFilePath);
    }
    catch (e) {
        console.log(e);
    }
};

function initFilterDirectoryList() {
    try {
        filterDirectoryList = json.readFileSync(filterDirectoryPath);
    }
    catch (e) {
        console.log(e);
    }
};

function initHighPriorityFileList() {
    try {
        highPriorityFileList = json.readFileSync(highPriorityFilePath);
    }
    catch (e) {
        console.log(e);
    }
};

function initCodeFiles() {
    for (var i in highPriorityFileList) {
        pushToCodeFiles(highPriorityFileList[i]);
    }
};

function pushToCodeFiles(pathName) {
    if (typeof pathName === 'string') {
        codeFiles += "\x20\x20\x20\x20";
        codeFiles += "\"";
        pathName = pathName.trim();
        pathName = pathName.split(path.sep).join('/');
        codeFiles += pathName.toString();
        codeFiles += "\",";
        codeFiles += '\n';
    } else {
        console.log("pathName : " + pathName + " error");
    }
};

function handlePathName(pathName) {
    if (typeof pathName === 'string') {
        var index = pathName.indexOf("src");
        var bJsFile = util.endsWithString(pathName, ".js");
        if (-1 !== index && bJsFile) {
            pathName = pathName.substring(index);
            var bFilterFile = isFilterFile(pathName);
            var bHighPriorityFile = isHighPriorityFile(pathName);
            if (!bFilterFile && !bHighPriorityFile) {
                pushToCodeFiles(pathName);
            }
        }
    } else {
        console.log("pathName : " + pathName + " error");
    }
};

function generatorProjectJson() {
    codeFiles = codeFiles.replace(/\n+$/g, "");
    codeFiles = codeFiles.replace(/,$/g, "");
    var projectJsonTemplate = fs.readFileSync(projectJsonTemplatePath, "utf-8");
    var reg = new RegExp("#.*?#", "g");
    projectJsonTemplate = projectJsonTemplate.replace(reg, codeFiles);
    if (publishMode === "release") {
        projectJsonTemplate = projectJsonTemplate.replace("\"debugMode\": 1", "\"debugMode\": 0");
        projectJsonTemplate = projectJsonTemplate.replace("\"showFPS\": true", "\"showFPS\": false");
        projectJsonTemplate = projectJsonTemplate.replace("\"noCache\": false", "\"noCache\": false");
    }
    try {
        fs.writeFileSync(projectJsonPath, projectJsonTemplate);
        console.log(codeFiles + "\n");
        console.log("project.json 生成成功");
    }
    catch (e) {
        console.log(e);
    }
};

if (module == require.main) {
    initFilterFileList();
    initHighPriorityFileList();
    initFilterDirectoryList();
    initCodeFiles();
    travel(projectSrcPath, function (pathName) {
        handlePathName(pathName);
    });
    generatorProjectJson();
};