'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.updateTemplateCommand2 =
  exports.insertTemplateCommand =
  exports.updateTemplateCommand =
  exports.syncTemplateCommand =
  exports.openTemplateCommand =
  exports.createTemplateCommand =
    void 0;
/**
 * @Author: JanKinCai
 * @Date:   2021-04-24 16:24:09
 * @Last Modified by:   JanKinCai
 * @Last Modified time: 2021-04-25 01:31:07
 */
const child_process = require('child_process');
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const template = require('./template');
function createTemplateCommand(config, file_suffix_mapping) {
  let editor = vscode.window.activeTextEditor;
  let tmplobj = new template.Template(editor, config, file_suffix_mapping);
  if (config.custom_template_path) {
    vscode.window
      .showInputBox({
        ignoreFocusOut: true,
        password: false,
        prompt: 'Please type template name',
      })
      .then(tmplname => {
        if (tmplname === undefined || tmplname.trim() === '') {
          vscode.window.showInformationMessage('Please type template name');
        } else {
          tmplobj.create(tmplname);
        }
      });
  } else {
    vscode.window.showInformationMessage(
      'Please set vscodefileheader custome template path.'
    );
  }
}
exports.createTemplateCommand = createTemplateCommand;
function openTemplateCommand(config, file_suffix_mapping) {
  let editor = vscode.window.activeTextEditor;
  if (editor) {
    let tmplobj = new template.Template(editor, config, file_suffix_mapping);
    tmplobj.open();
  } else {
    vscode.window.showInformationMessage('No active window');
  }
}
exports.openTemplateCommand = openTemplateCommand;
/**
 * Sync template Command
 *
 * @return void
 */
function syncTemplateCommand(config, file_suffix_mapping) {
  if (config.custom_template_path && config.remote) {
    if (!fs.existsSync(config.custom_template_path)) {
      fs.mkdirSync(config.custom_template_path, { recursive: true });
      /* git clone */
      child_process.exec(
        `git clone ${config.remote} ${config.custom_template_path}`
      );
    } else {
      child_process.exec(`cd ${config.custom_template_path}`);
      child_process.exec(`git pull origin master`);
    }
    /* Read file_suffix_map.json or file_suffix_mapping.json */
    let file_suffix_mapping_path = path.join(
      config.custom_template_path,
      'file_suffix_map.json'
    );
    if (!fs.existsSync(file_suffix_mapping_path)) {
      file_suffix_mapping_path = path.join(
        config.custom_template_path,
        'file_suffix_mapping.json'
      );
    }
    if (fs.existsSync(file_suffix_mapping_path)) {
      Object.assign(file_suffix_mapping, require(file_suffix_mapping_path));
    }
  }
}
exports.syncTemplateCommand = syncTemplateCommand;
function updateTemplateCommand(config, file_suffix_mapping) {
  // 获取当前活动窗口
  let editor = vscode.window.activeTextEditor;
  if (editor) {
    let tmplobj = new template.Template(editor, config, file_suffix_mapping);
    tmplobj.update();
  } else {
    vscode.window.showInformationMessage('No active window');
  }
}
exports.updateTemplateCommand = updateTemplateCommand;
function updateTemplateCommand2(config, file_suffix_mapping) {
  let editor = vscode.window.activeTextEditor;
  if (editor) {
    let tmplobj = new template.Template(editor, config, file_suffix_mapping);
    tmplobj.update2();
  }
}
exports.updateTemplateCommand2 = updateTemplateCommand2;
function insertTemplateCommand(config, file_suffix_mapping) {
  let editor = vscode.window.activeTextEditor;
  let tmplobj = new template.Template(editor, config, file_suffix_mapping);
  tmplobj.insert();
  if (editor) {
    let tmplobj = new template.Template(editor, config, file_suffix_mapping);
    tmplobj.insert();
  } else {
    vscode.window.showInformationMessage('No active window');
  }
}
exports.insertTemplateCommand = insertTemplateCommand;
//# sourceMappingURL=command.js.map
