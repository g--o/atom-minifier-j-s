'use babel';

import MinifyJSView from './minify-j-s-view';
import TextBoxView from './textbox-view';
import { CompositeDisposable } from 'atom';

export default {

  minifyJSView: null,
  modalPanel: null,
  subscriptions: null,
  prompt: null,

  activate(state) {
    this.minifyJSView = new MinifyJSView(state.minifyJSViewState, "Minifying js files, please wait...");
    this.textboxes = new TextBoxView(state.minifyJSViewState);

    this.prompt = atom.workspace.addModalPanel({
        item: this.textboxes.getElement(),
        visible: false
    });

    this.modalPanel = atom.workspace.addModalPanel({
      item: this.minifyJSView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'minify-j-s:minify': () => this.minify()
    }));

    var minpack = this;

    this.textboxes.getElement().addEventListener("keydown", function(e)
    {
        if (e.keyCode == 27) { // escape
            minpack.prompt.hide();
        } else if(e.keyCode == 13) { // enter
            minpack.prompt.hide();
            minpack.modalPanel.show();
            minpack.do_minify(minpack);
        }
    });
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.minifyJSView.destroy();
  },

  serialize() {
    return {
      minifyJSViewState: this.minifyJSView.serialize()
    };
  },

    getFiles(dir, files_, minipack){
        path = require("path");
        fs = require('fs');
        files_ = files_ || [];
        var files = fs.readdirSync(dir);
        for (var i in files){
            var name = path.join(dir, files[i]);
            if (fs.statSync(name).isDirectory())
                minipack.getFiles(name, files_, minipack);
            else if (name.substring(name.length-3, name.length) == ".js")
                files_.push(name);
        }
        return files_;
    },

    do_minify(minipack) {
        var cmd;
        var args = [];
        var fileDir = minipack.textboxes.getDirText();
        var outputFile = minipack.textboxes.getOutText();
        //const tmpFile = "tmplist.txt";
        path = require("path");
        editor = atom.workspace.getActiveTextEditor();

        if (fileDir == ".")
            alert("Please open a file that is in the desired directory.")
        else {
            if(require('os').type() == "Windows_NT")
                cmd = "uglifyjs.cmd";
            else
                cmd = "uglifyjs";
            cmd = path.join(atom.packages.getPackageDirPaths()[0], "minify-j-s", "lib", "node_modules", ".bin", cmd);
            args.push(minipack.getFiles(fileDir, [], minipack));
            args.push("-o");
            args.push(outputFile);

            var mp = minipack.modalPanel;
            //require('fs').writeFileSync(tmpFile, args.toString().replace(/,/g, ' '));
            require('child_process').exec(cmd + " " + args.toString().replace(/,/g, ' '), null, function(error) {
                mp.hide();
                if (error)
                    alert(error);
            });
        }
    },

    minify() {
        path = require("path");
        editor = atom.workspace.getActiveTextEditor();
        filePath = editor.getPath();
        fileDir = path.dirname(filePath);

        if (this.textboxes.getDirText().length == 0)
            this.textboxes.setDirText(fileDir);
        if (this.textboxes.getOutText().length == 0)
            this.textboxes.setOutText(path.join(fileDir, "build.js"));
        this.prompt.show();
        this.textboxes.getElement().children[1].focus();
    }

};
