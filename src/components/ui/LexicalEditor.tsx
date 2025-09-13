"use client";

import { 
  $getRoot, 
  $getSelection, 
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND
} from 'lexical';
import { useEffect, useState } from 'react';

import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { 
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode
} from '@lexical/list';
import { Bold, Italic, Underline, List, ListOrdered, Quote, Heading1, Heading2, Heading3 } from 'lucide-react';

// Define theme for the editor
const theme = {
  ltr: 'ltr',
  rtl: 'rtl',
  placeholder: 'editor-placeholder',
  paragraph: 'editor-paragraph',
  quote: 'editor-quote',
  heading: {
    h1: 'editor-heading-h1',
    h2: 'editor-heading-h2',
    h3: 'editor-heading-h3',
    h4: 'editor-heading-h4',
    h5: 'editor-heading-h5',
  },
  list: {
    nested: {
      listitem: 'editor-nested-listitem',
    },
    ol: 'editor-list-ol',
    ul: 'editor-list-ul',
    listitem: 'editor-listitem',
  },
  image: 'editor-image',
  link: 'editor-link',
  text: {
    bold: 'editor-text-bold',
    italic: 'editor-text-italic',
    overflowed: 'editor-text-overflowed',
    hashtag: 'editor-text-hashtag',
    underline: 'editor-text-underline',
    strikethrough: 'editor-text-strikethrough',
    underlineStrikethrough: 'editor-text-underlineStrikethrough',
    code: 'editor-text-code',
  },
  code: 'editor-code',
  codeHighlight: {
    atrule: 'editor-tokenAttr',
    attr: 'editor-tokenAttr',
    boolean: 'editor-tokenProperty',
    builtin: 'editor-tokenSelector',
    cdata: 'editor-tokenComment',
    char: 'editor-tokenSelector',
    class: 'editor-tokenFunction',
    'class-name': 'editor-tokenFunction',
    comment: 'editor-tokenComment',
    constant: 'editor-tokenProperty',
    deleted: 'editor-tokenProperty',
    doctype: 'editor-tokenComment',
    entity: 'editor-tokenOperator',
    function: 'editor-tokenFunction',
    important: 'editor-tokenVariable',
    inserted: 'editor-tokenSelector',
    keyword: 'editor-tokenAttr',
    namespace: 'editor-tokenVariable',
    number: 'editor-tokenProperty',
    operator: 'editor-tokenOperator',
    prolog: 'editor-tokenComment',
    property: 'editor-tokenProperty',
    punctuation: 'editor-tokenPunctuation',
    regex: 'editor-tokenVariable',
    selector: 'editor-tokenSelector',
    string: 'editor-tokenSelector',
    symbol: 'editor-tokenProperty',
    tag: 'editor-tokenProperty',
    url: 'editor-tokenOperator',
    variable: 'editor-tokenVariable',
  },
};

// Toolbar Plugin
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const formatText = (format: 'bold' | 'italic' | 'underline') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const formatHeading = (headingSize: 'h1' | 'h2' | 'h3') => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(headingSize));
      }
    });
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
  };

  const formatList = (listType: 'bullet' | 'number') => {
    if (listType === 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }
  };

  return (
    <div className="lexical-toolbar">
      <button
        type="button"
        onClick={() => formatText('bold')}
        className="toolbar-btn"
        title="Bold"
      >
        <Bold size={16} />
      </button>
      
      <button
        type="button"
        onClick={() => formatText('italic')}
        className="toolbar-btn"
        title="Italic"
      >
        <Italic size={16} />
      </button>
      
      <button
        type="button"
        onClick={() => formatText('underline')}
        className="toolbar-btn"
        title="Underline"
      >
        <Underline size={16} />
      </button>

      <div className="toolbar-divider" />

      <button
        type="button"
        onClick={() => formatHeading('h1')}
        className="toolbar-btn"
        title="Heading 1"
      >
        <Heading1 size={16} />
      </button>

      <button
        type="button"
        onClick={() => formatHeading('h2')}
        className="toolbar-btn"
        title="Heading 2"
      >
        <Heading2 size={16} />
      </button>

      <button
        type="button"
        onClick={() => formatHeading('h3')}
        className="toolbar-btn"
        title="Heading 3"
      >
        <Heading3 size={16} />
      </button>

      <div className="toolbar-divider" />

      <button
        type="button"
        onClick={() => formatQuote()}
        className="toolbar-btn"
        title="Quote"
      >
        <Quote size={16} />
      </button>

      <button
        type="button"
        onClick={() => formatList('bullet')}
        className="toolbar-btn"
        title="Bullet List"
      >
        <List size={16} />
      </button>

      <button
        type="button"
        onClick={() => formatList('number')}
        className="toolbar-btn"
        title="Numbered List"
      >
        <ListOrdered size={16} />
      </button>
    </div>
  );
}

// Plugin to handle onChange events
function OnChangePlugin({ onChange }: { onChange: (editorState: string) => void }) {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      // Convert the editor state to JSON string
      const editorStateJSON = editorState.toJSON();
      onChange(JSON.stringify(editorStateJSON));
    });
  }, [editor, onChange]);
  
  return null;
}

// Catch any errors that occur during Lexical updates
function onError(error: Error) {
  console.error(error);
}

interface LexicalEditorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  height?: number;
}

export function LexicalEditor({
  value = "",
  onChange,
  placeholder = "Enter some text...",
  className = "",
  height = 200,
}: LexicalEditorProps) {
  const [editorState, setEditorState] = useState(value);

  const initialConfig = {
    namespace: 'LexicalEditor',
    theme,
    onError,
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeNode,
      CodeHighlightNode,
      AutoLinkNode,
      LinkNode,
    ],
    editorState: value ? value : undefined,
  };

  const handleChange = (newEditorState: string) => {
    setEditorState(newEditorState);
    onChange(newEditorState);
  };

  return (
    <div className={`lexical-editor-container ${className}`}>
      <LexicalComposer initialConfig={initialConfig}>
        <div className="lexical-editor-inner">
          <ToolbarPlugin />
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="lexical-content-editable"
                style={{ 
                  minHeight: height,
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderTopLeftRadius: '0px',
                  borderTopRightRadius: '0px',
                  borderBottomLeftRadius: '6px',
                  borderBottomRightRadius: '6px',
                  borderTop: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  lineHeight: '1.5',
                }}
                aria-placeholder={placeholder}
                placeholder={
                  <div 
                    className="lexical-placeholder"
                    style={{
                      color: '#9ca3af',
                      fontSize: '14px',
                    }}
                  >
                    {placeholder}
                  </div>
                }
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <ListPlugin />
          <CheckListPlugin />
          <TabIndentationPlugin />
          <OnChangePlugin onChange={handleChange} />
        </div>
      </LexicalComposer>
    </div>
  );
}

export default LexicalEditor;
