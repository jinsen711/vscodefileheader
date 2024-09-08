"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vscodeWrapper = void 0;
/**
 * @Author: JanKinCai
 * @Date:   2021-04-24 13:32:40
 * @Last Modified by:   JanKinCai
 * @Last Modified time: 2021-04-24 13:59:40
 */
const vscode = require("vscode");
class vscodeWrapper {
    constructor() {
        this.editor = vscode.window.activeTextEditor;
    }
}
exports.vscodeWrapper = vscodeWrapper;
//# sourceMappingURL=vscode-wrapper.js.map