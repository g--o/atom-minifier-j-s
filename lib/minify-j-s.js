'use babel';

import { CompositeDisposable } from 'atom';
import { allowUnsafeNewFunction } from 'loophole';

import MinifyJSView from './minify-j-s-view';
import TextBoxView from './textbox-view';

var Minifier;

// consts
const DEFAULT_OUT_PATH = "build.js";
const DEFAULT_DIR_PATH = ".";
const FILE_EXT = ".js";
// key binds
const KB_ESCAPE = 27;
const KB_ENTER = 13;
const KB_TAB = 9;

export default {

  minifyJSView: null,
  modalPanel: null,
  subscriptions: null,
  prompt: null,

  activate(state) {

    var self = this;

    allowUnsafeNewFunction (function() {
      Minifier = require('terser');
    });

    // load views
    this.minifyJSView = new MinifyJSView(state.minifyJSViewState,
        "Minifying js files, please wait...");
    this.textboxes = new TextBoxView(state.minifyJSViewState);

    // add to panels
    this.prompt = atom.workspace.addModalPanel({
        item: this.textboxes.getElement(),
        visible: false
    });

    this.modalPanel = atom.workspace.addModalPanel({
      item: this.minifyJSView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily
    // cleaned up with aCompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'minify-j-s:minify': () => this.minify()
    }));

    // catch event of typing while focused at our panel.
    this.textboxes.getElement().addEventListener("keydown", function(e)
    {
        if (e.keyCode == KB_ESCAPE) {
            self.prompt.hide();
        } else if(e.keyCode == KB_ENTER) {
            //self.prompt.hide();
            self.modalPanel.show();
            setTimeout(self.do_minify.bind(self), 400);
        } else if (e.keyCode == KB_TAB) {
           self.textboxes.focusNext(e);
        }
    });

    this.textboxes.reload_button.onmouseup = function(e)
    {
        self.load_all_paths();
    };

    this.load_all_paths();
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

    /**
     *    get all file names in dir, append to files_
     *
     *    @method get_files
     *    @param  {String} dir      directory path
     *    @param  {List}  files_    list of initial files
     *    @return {List}            all .js files in dir tree
     */
    get_files(dir, files_){
        path = require("path");
        fs = require('fs');
        files_ = files_ || [];
        var files = fs.readdirSync(dir);
        for (var i in files){
            var name = path.join(dir, files[i]);
            if (fs.statSync(name).isDirectory())
                this.get_files(name, files_);
            else if (name.substring(name.length-3, name.length) == FILE_EXT)
                files_.push(name);
        }
        return files_;
    },

    /**
     *    actually minify
     *
     *    @method do_minify
     */
    do_minify() {
        var cmd;
        var minifiedFiles = [];
        var fileDir = this.textboxes.getDirText();
        var outputFile = this.textboxes.getOutText();
        var mp = this.modalPanel;

        path = require("path");
        editor = atom.workspace.getActiveTextEditor();

        if (fileDir == DEFAULT_DIR_PATH) {
            alert("Please select the directory in the tree view, or open a file from that directory.");
        } else {
            try {
                minifiedFiles = this.get_files(fileDir, []);
                var code = {};
                minifiedFiles.forEach((file, i) => {
                    code[file] = require('fs').readFileSync(file, 'utf8');
                });

                // Use Minifier to make the minifying, and store result.
                allowUnsafeNewFunction (function() {
                    var result = Minifier.minify(code);
                    require('fs').writeFileSync(outputFile, result.code, { flag: 'w' });
                });
            } catch(err) {
                if (err)
                    alert(err.message);
            }
        }

        // make sure hidden
        mp.hide();
    },

    /**
     *    loads all paths to textboxes
     *
     *    @method load_all_paths
     */
    load_all_paths() {
        this.load_paths(true, true);
    },

    /**
     *    loads current paths in fields
     *
     *    @method reload_paths
     *    @param  {Boolean}    isDir should update input dir?
     *    @param  {Boolean}    isOut shout update output file?
     */
    load_paths(isDir, isOut) {
        path = require("path");
        editor = atom.workspace.getActiveTextEditor();

        // get file path from editor
        if (!editor)
            filePath = DEFAULT_OUT_PATH;
        else
            filePath = editor.getPath();
        fileDir = path.dirname(filePath);

        // auto complete current dir and build path.
        if (isDir)
            this.textboxes.setDirText(fileDir);
        if (isOut)
            this.textboxes.setOutText(path.join(fileDir, DEFAULT_OUT_PATH));
    },

    // initiate minifying
    minify() {
        var dirText = this.textboxes.getDirText();
        var outText = this.textboxes.getOutText();
        // reload paths if needed
        var isDir = ((dirText.length == 0) || (dirText == DEFAULT_DIR_PATH));
        var isOut = ((outText.length == 0) || (outText == DEFAULT_OUT_PATH));
        this.load_paths(isDir, isOut);

        // Show panel prompt layout
        this.prompt.show();
        this.textboxes.input_textbox.focus();
    }

};
