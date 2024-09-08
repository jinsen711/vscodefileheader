'use strict';
/**
 * @Author: JanKinCai
 * @Date:   2020-01-03 22:02:02
 * @Last Modified by:   JanKinCai
 * @Last Modified time: 2024-03-10 10:57:19
 */
Object.defineProperty(exports, '__esModule', { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require('vscode');
const command = require('./command');
var template = require('art-template');

// 文件后缀名与语言映射
var file_suffix_mapping = {
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

// 自定义模板函数, 用于模板中调用
template.defaults.imports.upper = function (value) {
  return value.toUpperCase();
};
template.defaults.imports.lower = function (value) {
  return value.toLowerCase();
};
template.defaults.imports.replace = function (
  value,
  searchValue,
  replaceValue
) {
  return value.replace(searchValue, replaceValue);
};

// 得到在 package.json 中定义的配置
function getConfig() {
  return vscode.workspace.getConfiguration('fileheader');
}

// 休眠, 例如 sleep(1000) 表示休眠 1 秒
function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

// vscode 指令和函数的绑定, 用于触发对应的函数
function activate(context) {
  console.log('vscode 插件激活成功');

  // 同步模板, 这个函数没看出来有什么用
  command.syncTemplateCommand(getConfig(), file_suffix_mapping);

  // 绑定指令
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
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map
