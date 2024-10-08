/**
 * @Author: JanKinCai
 * @Date:   2020-01-03 22:02:02
 * @Last Modified by:   JanKinCai
 * @Last Modified time: 2024-03-10 10:57:19
 */

import * as vscode from 'vscode';
import * as command from './command';

var template = require('art-template');

// 扩展文件名与语言的映射
var file_suffix_mapping: any = {
  '.as': 'ActionScript',
  '.scpt': 'AppleScript',
  '.asp': 'ASP',
  '.aspx': 'ASP',
  '.bat': 'Batch File',
  '.cmd': 'Batch File',
  '.c': 'C',
  '.cs': 'C#',
  '.cpp': 'C++',
  '.clj': 'Clojure',
  '.css': 'CSS',
  '.D': 'D',
  '.dart': 'Dart',
  '.erl': 'Erlang',
  '.go': 'Go',
  '.groovy': 'Groovy',
  '.hs': 'Haskell',
  '.htm': 'HTML',
  '.html': 'HTML',
  '.java': 'Java',
  '.js': 'JavaScript',
  '.tex': 'LaTeX',
  '.lsp': 'Lisp',
  '.lua': 'Lua',
  '.md': 'Markdown',
  '.mat': 'Matlab',
  '.m': 'Objective-C',
  '.ml': 'OCaml',
  '.p': 'Pascal',
  '.pl': 'Perl',
  '.php': 'PHP',
  '.py': 'Python',
  '.r': 'R',
  '.rs': 'Rust',
  '.rst': 'RestructuredText',
  '.rb': 'Ruby',
  '.scala': 'Scala',
  '.scss': 'SCSS',
  '.sh': 'ShellScript',
  '.sql': 'SQL',
  '.tcl': 'TCL',
  '.txt': 'Text',
  '.ts': 'TypeScript',
  '.vue': 'Vue',
  '.xml': 'XML',
  '.yml': 'YAML',
  '.yaml': 'YAML',

  '.h': 'H',
};

template.defaults.imports.upper = function (value: string) {
  return value.toUpperCase();
};

template.defaults.imports.lower = function (value: string) {
  return value.toLowerCase();
};

template.defaults.imports.replace = function (
  value: string,
  searchValue: string,
  replaceValue: string
) {
  return value.replace(searchValue, replaceValue);
};

/**
 * @description 获取 package.json 中 properties 中以 fileheader. 开头的配置
 * @author jin
 * @date 12/09/2024
 * @return {*}  {*}
 */
function getConfig(): any {
  return vscode.workspace.getConfiguration('fileheader');
}

// 休眠函数
function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export function activate(context: vscode.ExtensionContext) {
  console.log(getConfig());

  //   command.syncTemplateCommand(getConfig(), file_suffix_mapping);

  let disposable = vscode.commands.registerCommand(
    'extension.fileheader',
    () => {
      command.updateTemplateCommand(getConfig(), file_suffix_mapping);
    }
  );
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('extension.synctemplate', () => {
    command.syncTemplateCommand(getConfig(), file_suffix_mapping);
  });
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand(
    'extension.createtemplate',
    () => {
      command.createTemplateCommand(getConfig(), file_suffix_mapping);
    }
  );
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('extension.opentemplate', () => {
    command.openTemplateCommand(getConfig(), file_suffix_mapping);
  });
  context.subscriptions.push(disposable);

  // Save
  vscode.workspace.onWillSaveTextDocument(() => {
    command.updateTemplateCommand(getConfig(), file_suffix_mapping);
  });

  // Open
  vscode.workspace.onDidOpenTextDocument(() => {
    setTimeout(function () {
      command.updateTemplateCommand2(getConfig(), file_suffix_mapping);
    }, 100);
  });
}

// this method is called when your extension is deactivated
export function deactivate() {}
