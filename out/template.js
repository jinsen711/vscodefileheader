'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.Template = void 0;
/**
 * @Author: JanKinCai
 * @Date:   2021-04-22 23:41:46
 * @Last Modified by:   JanKinCai
 * @Last Modified time: 2024-03-09 22:39:14
 */
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const art_template = require('art-template');
const editor = require('./editor');
class Template extends editor.editorObject {
  constructor(editor, config, file_suffix_mapping) {
    // 初始化 editor.editorObject 对象
    super(editor, config);
    // 获取模版路径 template 文件夹
    this.default_tmpl_path = this.getDefaultTemplatePath();
    // 保存文件后缀与模版路径映射
    this.file_suffix_mapping = file_suffix_mapping;
  }
  /**
   * getSuffix
   *
   * @return string
   */
  getSuffix() {
    let pathobj = path.parse(this.editor.document.fileName);
    return pathobj.ext.toLowerCase() || pathobj.name.toLowerCase();
  }
  /**
   * getFileName
   *
   * @return string
   */
  getFileName() {
    return path.parse(this.editor.document.fileName).name.toLowerCase();
  }
  /**
   * getDefaultTemplatePath
   *
   * @return string
   */
  getDefaultTemplatePath() {
    return path.join(path.dirname(__dirname), 'template');
  }
  getDefaultArtTemplate(type = 'header') {
    return path.join(this.default_tmpl_path, 'art', type + '.art');
  }
  /**
   * getTemplatePath
   *
   * @param type (string): header/body
   *
   * @return string | undefined
   */
  getTemplatePath(type = 'header') {
    let suffix = this.getSuffix();
    let name = this.getFileName();
    let tmpl = '';
    for (let v in this.config.file_suffix_mapping) {
      let reg = new RegExp(
        '^' + v.replace('.', '\\.').replace('*', '.*') + '$'
      );
      if (reg.test(name + suffix) || reg.test(suffix)) {
        tmpl = this.config.file_suffix_mapping[v] + '.tmpl';
        break;
      }
    }
    if (!tmpl) {
      tmpl =
        (this.file_suffix_mapping[name + suffix] ||
          this.file_suffix_mapping[suffix]) + '.tmpl';
    }
    if (tmpl) {
      let tmplpath = path.join(
        this.config.custom_template_path || '',
        type,
        tmpl
      );
      if (fs.existsSync(tmplpath)) {
        return tmplpath;
      }
      tmplpath = path.join(this.default_tmpl_path, type, tmpl);
      if (fs.existsSync(tmplpath)) {
        return tmplpath;
      }
    }
    return undefined;
  }
  _create(name, type = 'header') {
    let srcpath = vscode.Uri.file(this.getDefaultArtTemplate(type));
    let dstpath = vscode.Uri.file(
      path.join(this.config.custom_template_path, type, name + '.tmpl')
    );
    vscode.workspace.fs.copy(srcpath, dstpath);
  }
  _open(name, type = 'header') {
    let tmplpath = path.join(
      this.config.custom_template_path,
      type,
      name + '.tmpl'
    );
    let textDocument = vscode.workspace.openTextDocument(
      vscode.Uri.file(tmplpath)
    );
    let viewcolumn = vscode.ViewColumn.One;
    if (type === 'body') {
      viewcolumn = vscode.ViewColumn.Two;
    }
    vscode.window.showTextDocument(textDocument, viewcolumn);
  }
  _open2(tmplpath, type = 'header') {
    if (tmplpath === undefined || !fs.existsSync(tmplpath)) {
      vscode.window.showInformationMessage('Template path does not exist');
    } else {
      let textDocument = vscode.workspace.openTextDocument(
        vscode.Uri.file(tmplpath)
      );
      let viewcolumn = vscode.ViewColumn.One;
      if (type === 'body') {
        viewcolumn = vscode.ViewColumn.Two;
      }
      vscode.window.showTextDocument(textDocument, viewcolumn);
    }
  }
  create(name) {
    this._create(name, 'header');
    this._create(name, 'body');
    this._open(name, 'header');
    this._open(name, 'body');
  }
  open() {
    let tmplpath = this.getTemplatePath('header');
    this._open2(tmplpath, 'header');
    tmplpath = this.getTemplatePath('body');
    this._open2(tmplpath, 'body');
  }
  deleteEditorComments() {
    if (this.isSuffix('.php')) {
      this.deleteEditorComment('<?php', 2);
    } else if (this.isSuffixList(['.py', '.pxd', '.pyx'])) {
      this.deleteEditorComment('# -*- coding: utf-8 -*-', 1);
    }
  }
  insertEndComments() {
    let lineCount = this.editor.document.lineCount;
    if (this.config.body && lineCount <= 1) {
      if (this.isSuffix('.php')) {
        this.insertEditorComment('?>');
      }
    }
  }
  /**
   * Support Predefined variables: https://code.visualstudio.com/docs/editor/variables-reference
   */
  predefinedVariables() {
    const rfd = this.pathobj.dir.split(path.sep);
    return {
      workspaceFolder: vscode.workspace.rootPath,
      workspaceFolderBasename: vscode.workspace.name,
      file: this.editor.document.fileName,
      relativeFile: path.join(rfd[rfd.length - 1], this.pathobj.base),
      relativeFileDirname: rfd[rfd.length - 1],
      fileBasename: this.pathobj.base,
      fileBasenameNoExtension: this.pathobj.name,
      fileDirname: this.pathobj.dir,
      fileExtname: this.pathobj.ext,
      cwd: vscode.workspace.rootPath,
    };
  }
  _insert() {
    return __awaiter(this, void 0, void 0, function* () {
      // 获取当前文件的行数
      let lineCount = this.editor.document.lineCount;
      //   获取要插入的模版文件路径
      let tmplpath = this.getTemplatePath('header');
      let tmplpath_body = this.getTemplatePath('body');
      let ret = '';
      if (tmplpath) {
        const text = yield vscode.workspace.fs.readFile(
          vscode.Uri.file(tmplpath)
        );
        if (text.toString().trim() !== '') {
          ret = art_template.render(
            text.toString(),
            Object.assign(
              {
                author: this.config.author,
                create_time: this.getFileBirthDateTime(),
                last_modified_by: this.config.author,
                last_modified_time: this.getDateTime(),
                template: this.getDefaultTemplatePath(),
              },
              this.config.other_config,
              this.predefinedVariables()
            ),
            { escape: false }
          );
        }
        if (lineCount <= 1 && tmplpath_body) {
          const bodytext = yield vscode.workspace.fs.readFile(
            vscode.Uri.file(tmplpath_body)
          );
          if (bodytext.toString().trim() !== '') {
            ret += art_template.render(
              bodytext.toString(),
              Object.assign(
                {
                  template: this.getDefaultTemplatePath(),
                },
                this.config.other_config,
                this.predefinedVariables()
              ),
              { escape: false }
            );
          }
        }
        if (ret.trim() !== '') {
          this.editor.edit(editobj => {
            editobj.insert(new vscode.Position(0, 0), ret);
          });
          this.editor.document.save();
        }
      } else {
        console.debug(
          'Not found fileheader template: ' + this.editor.document.fileName
        );
      }
    });
  }
  insert() {
    if (!this.isHeaderExists()) {
      this.deleteEditorComments();
      this._insert();
      this.insertEndComments();
    }
  }
  _update() {
    let start = 0;
    let line = 0;
    this.editor.edit(editobj => {
      line = this.findStringLine(this.config.update_last_modified_time_flags);
      if (line !== -1) {
        start = this.editor.document.lineAt(line).text.indexOf(':') + 1;
        editobj.replace(
          new vscode.Range(line, start, line, 100),
          ' ' + this.getDateTime()
        );
      }
      line = this.findStringLine(this.config.update_last_modified_author_flags);
      if (line !== -1) {
        start = this.editor.document.lineAt(line).text.indexOf(':') + 1;
        editobj.replace(
          new vscode.Range(line, start, line, 100),
          '   ' + this.config.author
        );
      }
      if (vscode.version < '1.43.0') {
        this.editor.document.save();
      }
    });
  }
  update() {
    // 判断是否是忽略文件, 不进行插入
    if (!this.isIgnore(this.config.ignore)) {
      // 判断是否已经存在
      if (this.isHeaderExists()) {
        // 判断是否是文件夹
        if (this.editor.document.isDirty) {
          this._update();
        }
      } else if (this.config.save) {
        this.insert();
      }
    }
  }
  update2() {
    if (!this.isIgnore(this.config.ignore)) {
      if (this.isHeaderExists()) {
        if (this.editor.document.isDirty) {
          this._update();
        }
      } else if (this.config.open) {
        this.insert();
      }
    }
  }
}
exports.Template = Template;
//# sourceMappingURL=template.js.map
