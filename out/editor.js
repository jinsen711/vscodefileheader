'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.editorObject = void 0;
/**
 * @Author: JanKinCai
 * @Date:   2021-04-24 16:57:18
 * @Last Modified by:   JanKinCai
 * @Last Modified time: 2021-04-25 01:40:20
 */
const path = require('path');
const vscode = require('vscode');
const moment = require('moment');
const fs = require('fs');
/*
 * root
 * dir
 * base
 * ext
 * name
 */
class editorObject {
  constructor(editor, config) {
    this.editor = editor;
    this.pathobj = undefined;
    if (this.editor) {
      this.pathobj = path.parse(this.editor.document.fileName);
    }
    this.config = config || vscode.workspace.getConfiguration('fileheader');
    this.datetimeFormat = config.dateformat;
  }
  isEditor() {
    return this.editor === undefined;
  }
  isSuffix(s) {
    return this.pathobj.ext.lastIndexOf(s) !== -1;
  }
  isSuffixList(s) {
    return s.indexOf(this.pathobj.ext) !== -1;
  }
  isIgnore(s) {
    for (let ige of s) {
      let reg = new RegExp(ige.replace('.', '\\.').replace('*', '.*'));
      if (
        reg.test(this.pathobj.base) ||
        reg.test(path.join(this.pathobj.dir, this.pathobj.base))
      ) {
        return true;
      }
    }
    return false;
  }
  getDateTime() {
    return moment().format(this.datetimeFormat);
  }
  getFileBirthDateTime() {
    let fileStat = fs.statSync(this.editor.document.fileName);
    let birthTime = fileStat.birthtime;
    if (birthTime.toString().startsWith('1970')) {
      birthTime = fileStat.ctime; // When birthtime is not available
    }
    return moment(birthTime).format(this.datetimeFormat);
  }
  getSuffix() {
    return this.pathobj.ext.toLowerCase() || this.pathobj.name.toLowerCase();
  }
  getFileName() {
    return this.pathobj.name.toLowerCase();
  }
  getMaxHeaderLine() {
    return Math.min(
      this.editor.document.lineCount,
      this.config.header_max_line
    );
  }
  findStringLine(text, max_line = this.config.header_max_line) {
    let lineCount = Math.min(max_line, this.editor.document.lineCount);
    let i = 0;
    for (i = 0; i <= lineCount - 1; i++) {
      if (
        this.editor.document
          .lineAt(i)
          .text.toLowerCase()
          .indexOf(text.toLowerCase()) !== -1
      ) {
        return i;
      }
    }
    return -1;
  }
  deleteEditorComment(text, max_line) {
    let line = this.findStringLine(text, max_line);
    if (line !== -1) {
      this.editor.edit(editobj => {
        editobj.delete(new vscode.Range(line, 0, line, text.length));
      });
    }
  }
  insertEditorComment(text) {
    let line = this.editor.document.lineCount + 1;
    this.editor.edit(editobj => {
      editobj.delete(new vscode.Range(line, 0, line, text.length));
    });
  }
  isHeaderExists() {
    if (
      this.config.is_header_exists &&
      this.findStringLine(
        this.config.is_header_exists,
        this.getMaxHeaderLine()
      ) !== -1
    ) {
      return true;
    }
    if (this.findStringLine('@Author:', this.getMaxHeaderLine()) !== -1) {
      return true;
    }
    return false;
  }
}
exports.editorObject = editorObject;
//# sourceMappingURL=editor.js.map
