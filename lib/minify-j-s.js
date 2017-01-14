'use babel';

import { CompositeDisposable } from 'atom';
import { allowUnsafeNewFunction } from 'loophole';

import MinifyJSView from './minify-j-s-view';
import TextBoxView from './textbox-view';

var UglifyJS;

export default {

  minifyJSView: null,
  modalPanel: null,
  subscriptions: null,
  prompt: null,

  activate(state) {

    allowUnsafeNewFunction (function() {
      UglifyJS = require('uglify-js');
    });

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

    var minpack = this;
    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'minify-j-s:minify': () => this.minify()
    }));

    // catch event of typing while focused at our panel.
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

    // get all file names in dir, append to files_, access 'this' from 'minipack'
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

    // the actual minifying is done here.
    do_minify(minipack) {
        var cmd;
        var minifiedFiles = [];
        var fileDir = minipack.textboxes.getDirText();
        var outputFile = minipack.textboxes.getOutText();

        path = require("path");
        editor = atom.workspace.getActiveTextEditor();

        if (fileDir == ".") {
            minipack.modalPanel.hide();
            alert("Please select the directory in the tree view, or open a file from that directory.")
        } else {
            minifiedFiles = minipack.getFiles(fileDir, [], minipack);
            var mp = minipack.modalPanel;
            try {
                // Use UglifyJS to make the minifying, and store result.
                allowUnsafeNewFunction (function() {
                    var result = UglifyJS.minify(minifiedFiles);
                    require('fs').writeFileSync(outputFile, result.code, { flag: 'w' });
                    mp.hide();
                });
            } catch(err) {
                mp.hide();
                if (err)
                    alert(err.message);
            }
        }
    },

    // initiate minifying
    minify() {
        path = require("path");
        editor = atom.workspace.getActiveTextEditor();

        const outPath = "build.js";
        const defaultDir = ".";

        // get file path from editor
        if (!editor)
            filePath = defaultDir;
        else
            filePath = editor.getPath();
        fileDir = path.dirname(filePath);

        if (this.textboxes.getDirText() == defaultDir || this.textboxes.getOutText() == outPath) {
            this.textboxes.setDirText("");
            this.textboxes.setOutText("");
        }

        // auto complete blank into current dir and build path.
        if (this.textboxes.getDirText().length == 0)
            this.textboxes.setDirText(fileDir);
        if (this.textboxes.getOutText().length == 0)
            this.textboxes.setOutText(path.join(fileDir, outPath));

        // Show panel prompt layout
        this.prompt.show();
        this.textboxes.getElement().children[1].focus();
    }

};
