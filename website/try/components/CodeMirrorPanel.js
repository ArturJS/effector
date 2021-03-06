import React from 'react';
import CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
// import 'codemirror/mode/jsx/jsx';

import 'codemirror/addon/comment/comment';
import 'codemirror/addon/wrap/hardwrap';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/comment-fold';
import 'codemirror/keymap/sublime';
// import 'codemirror/addon/fold/xml-fold';
import 'codemirror/addon/fold/foldgutter.css';

export default class CodeMirrorPanel extends React.Component {
  static defaultProps = {
    lineNumbers: true,
    tabSize: 2,
    showCursorWhenSelecting: true,
    autoCloseBrackets: true,
    matchBrackets: true,
    className: '',
    //keyMap: 'sublime',
    lineWrapping: false,
    passive: false,
  };
  _textareaRef = React.createRef();
  _codeMirror = null;
  _cached = '';

  componentDidMount() {
    const {passive, value, onChange, codeSample, ...props} = this.props;
    const options = {
      foldGutter: true,
      tabSize: 2,
      dragDrop: false,
      keyMap: 'sublime',
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
      ...props,
    };

    this._codeMirror = CodeMirror.fromTextArea(
      this._textareaRef.current,
      options,
    );
    this._codeMirror.on('change', this.handleChange);
    this._codeMirror.on('focus', this.handleFocus);

    this._codeMirror.setValue((this._cached = this.props.value || ''));
  }

  componentWillUnmount() {
    this._codeMirror && this._codeMirror.toTextArea();
  }

  componentDidUpdate(prevProps) {
    if (this.props.value !== this._cached && this.props.value != null) {
      this.updateValue(this.props.value);
    }
    if (this.props.mode !== prevProps.mode && this.props.mode != null) {
      this._codeMirror.setOption('mode', this.props.mode);
    }
  }

  updateValue(value) {
    this._cached = value;
    if (this.props.passive) {
      this._codeMirror.setValue(value);
    }
  }

  handleFocus = (/* codeMirror, event */) => {
    if (this._codeMirror.getValue() === this.props.codeSample) {
      this._codeMirror.execCommand('selectAll');
    }
  };

  handleChange = (doc, change) => {
    //console.log('change.origin', change.origin);
    if (change.origin !== 'setValue') {
      this._cached = doc.getValue();
      this.props.onChange(this._cached);
    }
  };

  render() {
    return (
      <div className={'editor ' + this.props.className}>
        <textarea ref={this._textareaRef} />
      </div>
    );
  }
}
