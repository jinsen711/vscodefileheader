/**
 * @Author: JanKinCai
 * @Date:   2021-04-22 23:41:46
 * @Last Modified by:   JanKinCai
 * @Last Modified time: 2024-03-09 22:39:14
 */
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as art_template from 'art-template';
import * as editor from './editor';

class Template extends editor.editorObject {
  default_tmpl_path: string;
  file_suffix_mapping: any;

  constructor(editor: any, config: any, file_suffix_mapping: any) {
    super(editor, config);
    this.default_tmpl_path = this.getDefaultTemplatePath();
    this.file_suffix_mapping = file_suffix_mapping;
  }

  /**
   * getSuffix
   *
   * @return string
   */
  getSuffix(): string {
    let pathobj: any = path.parse(this.editor.document.fileName);

    return pathobj.ext.toLowerCase() || pathobj.name.toLowerCase();
  }

  /**
   * getFileName
   *
   * @return string
   */
  getFileName(): string {
    return path.parse(this.editor.document.fileName).name.toLowerCase();
  }

  /**
   * getDefaultTemplatePath
   *
   * @return string
   */
  getDefaultTemplatePath(): string {
    return path.join(path.dirname(__dirname), 'template');
  }

  getDefaultArtTemplate(type: string = 'header'): string {
    return path.join(this.default_tmpl_path, 'art', type + '.art');
  }

  /**
   * getTemplatePath
   *
   * @param type (string): header/body
   *
   * @return string | undefined
   */
  getTemplatePath(type: string = 'header'): string | undefined {
    let suffix: string = this.getSuffix();
    let name: string = this.getFileName();
    let tmpl: string = '';

    for (let v in this.config.file_suffix_mapping) {
      let reg: any = new RegExp(
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

  private _create(name: string, type: string = 'header'): void {
    let srcpath = vscode.Uri.file(this.getDefaultArtTemplate(type));
    let dstpath = vscode.Uri.file(
      path.join(this.config.custom_template_path, type, name + '.tmpl')
    );
    vscode.workspace.fs.copy(srcpath, dstpath);
  }

  private _open(name: string, type: string = 'header'): void {
    let tmplpath = path.join(
      this.config.custom_template_path,
      type,
      name + '.tmpl'
    );

    let textDocument: any = vscode.workspace.openTextDocument(
      vscode.Uri.file(tmplpath)
    );

    let viewcolumn: number = vscode.ViewColumn.One;

    if (type === 'body') {
      viewcolumn = vscode.ViewColumn.Two;
    }

    vscode.window.showTextDocument(textDocument, viewcolumn);
  }

  private _open2(tmplpath: string | undefined, type: string = 'header'): void {
    if (tmplpath === undefined || !fs.existsSync(tmplpath)) {
      vscode.window.showInformationMessage('Template path does not exist');
    } else {
      let textDocument: any = vscode.workspace.openTextDocument(
        vscode.Uri.file(tmplpath)
      );

      let viewcolumn: number = vscode.ViewColumn.One;

      if (type === 'body') {
        viewcolumn = vscode.ViewColumn.Two;
      }

      vscode.window.showTextDocument(textDocument, viewcolumn);
    }
  }

  create(name: string): void {
    this._create(name, 'header');
    this._create(name, 'body');
    this._open(name, 'header');
    this._open(name, 'body');
  }

  open(): void {
    let tmplpath = this.getTemplatePath('header');

    this._open2(tmplpath, 'header');

    tmplpath = this.getTemplatePath('body');

    this._open2(tmplpath, 'body');
  }

  private deleteEditorComments(): void {
    if (this.isSuffix('.php')) {
      this.deleteEditorComment('<?php', 2);
    } else if (this.isSuffixList(['.py', '.pxd', '.pyx'])) {
      this.deleteEditorComment('# -*- coding: utf-8 -*-', 1);
    }
  }

  private insertEndComments(): void {
    let lineCount: number = this.editor.document.lineCount;

    if (this.config.body && lineCount <= 1) {
      if (this.isSuffix('.php')) {
        this.insertEditorComment('?>');
      }
    }
  }

  /**
   * Support Predefined variables: https://code.visualstudio.com/docs/editor/variables-reference
   */
  private predefinedVariables(): any {
    const rfd: any = this.pathobj.dir.split(path.sep);

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

  private async _insert() {
    // 获取当前编辑器总行数
    let lineCount: number = this.editor.document.lineCount;
    // 获取目标文件 header 模板路径
    let tmplpath: string | undefined = this.getTemplatePath('header');
    // 获取目标文件 body 模板路径
    let tmplpath_body: string | undefined = this.getTemplatePath('body');
    let ret: string = '';

    // 如果 header 模板存在，则读取模板内容
    if (tmplpath) {
      const text = await vscode.workspace.fs.readFile(
        vscode.Uri.file(tmplpath)
      );

      // 渲染模板内容
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

      // 如果当前编辑器总行数 <= 1，并且 body 模板存在，则读取 body 模板内容
      if (lineCount <= 1 && tmplpath_body) {
        const bodytext = await vscode.workspace.fs.readFile(
          vscode.Uri.file(tmplpath_body)
        );

        // 渲染 body 模板内容, 并合并到 header 模板内容中, ret 变量
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

      // 写入模板内容到编辑器中
      if (ret.trim() !== '') {
        this.editor.edit(editobj => {
          editobj.insert(new vscode.Position(0, 0), ret);
        });

        // 保存
        this.editor.document.save();
      }
    } else {
      console.debug(
        'Not found fileheader template: ' + this.editor.document.fileName
      );
    }
  }

  insert(): void {
    if (!this.isHeaderExists()) {
      this.deleteEditorComments();
      this._insert();
      this.insertEndComments();
    }
  }

  private _update(): void {
    let start: number = 0;
    let line: number = 0;

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

  update(): void {
    // 判断是否是需要忽略的文件
    if (!this.isIgnore(this.config.ignore)) {
      // 判断是否存在文件头部注释, 如果存在, 进行更新, 不存在的话进行插入
      if (this.isHeaderExists()) {
        // 判断文件是否被修改过, 如果被修改过, 进行更新, 更新时间, 更新作者等
        if (this.editor.document.isDirty) {
          this._update();
        }
      } else if (this.config.save) {
        this.insert();
      }
    }
  }

  update2(): void {
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

export { Template };
