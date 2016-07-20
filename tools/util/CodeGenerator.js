/**
 * Created by malloyzhu on 2015/12/21.
 */

var fs = require('fs');
var path = require('path');
var util = require("./Util.js");

/**
 * 生成代码文件
 * @param codeTemplateFilePath：模板代码文件路径
 * @param codeFilePath：生成代码文件路径
 */
exports.generatorCodeFile = function (codeTemplateFilePath, codeFilePath, ruleList) {
    if (typeof codeTemplateFilePath !== 'string') {
        return;
    }

    if (typeof codeFilePath !== 'string') {
        return;
    }

    try {
        var codeTemplate = fs.readFileSync(codeTemplateFilePath,"utf-8");
        var code = util.replaceCodeTemplateString(ruleList, codeTemplate);
        try {
            fs.writeFileSync(codeFilePath, code);
            console.log(codeFilePath + "生成成功");
        }
        catch (e) {
            console.log(e);
        }
    }
    catch(e) {
        console.log(e);
    }
};

/**
 *
 * @param basePath
 * @param codeTemplateFileName
 * @param fileName
 * @param ruleList
 */
exports.generator = function (basePath, codeTemplateFilePath, fileName, ruleList) {
    var ret = util.isFullLetterFileName(fileName);
    if (!ret) {
        console.log("文件名错误");
        return;
    }

    ret = util.isDiskPath(basePath);
    if (!ret) {
        console.log("磁盘路径错误");
        return;
    }

    var codePath = path.join(basePath, fileName) + ".js";
    this.generatorCodeFile(codeTemplateFilePath, codePath, ruleList);
};
