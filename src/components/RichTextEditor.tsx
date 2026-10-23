import React, { useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading3,
  List,
  ListOrdered,
  RemoveFormatting,
  Code,
  Eye,
  Highlighter,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write description here...",
  ariaLabel = "Rich text editor",
  minHeight = "120px",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isRawMode, setIsRawMode] = React.useState(false);

  // Sync internal content when value prop changes externally (e.g. modal open)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      // Only update if not currently focused or if empty
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value]);

  const exec = (command: string, arg: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, arg);
    onChange(editorRef.current.innerHTML);
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    onChange(editorRef.current.innerHTML);
  };

  return (
    <div className="rich-editor-wrapper">
      <div className="rich-editor-toolbar" role="toolbar" aria-label="Text formatting options">
        <button
          type="button"
          className="rich-tool-btn"
          title="Bold (Ctrl+B)"
          aria-label="Format bold"
          onClick={() => exec("bold")}
        >
          <Bold size={15} />
        </button>
        <button
          type="button"
          className="rich-tool-btn"
          title="Italic (Ctrl+I)"
          aria-label="Format italic"
          onClick={() => exec("italic")}
        >
          <Italic size={15} />
        </button>
        <button
          type="button"
          className="rich-tool-btn"
          title="Strikethrough"
          aria-label="Format strikethrough"
          onClick={() => exec("strikeThrough")}
        >
          <Strikethrough size={15} />
        </button>
        <span className="rich-tool-divider" />
        <button
          type="button"
          className="rich-tool-btn"
          title="Subheading"
          aria-label="Format heading 3"
          onClick={() => exec("formatBlock", "<h3>")}
        >
          <Heading3 size={15} />
        </button>
        <button
          type="button"
          className="rich-tool-btn"
          title="Bullet List"
          aria-label="Insert bulleted list"
          onClick={() => exec("insertUnorderedList")}
        >
          <List size={15} />
        </button>
        <button
          type="button"
          className="rich-tool-btn"
          title="Numbered List"
          aria-label="Insert numbered list"
          onClick={() => exec("insertOrderedList")}
        >
          <ListOrdered size={15} />
        </button>
        <button
          type="button"
          className="rich-tool-btn"
          title="Highlight"
          aria-label="Highlight text"
          onClick={() => exec("hiliteColor", "#fef3c7")}
        >
          <Highlighter size={15} />
        </button>
        <span className="rich-tool-divider" />
        <button
          type="button"
          className="rich-tool-btn"
          title="Clear formatting"
          aria-label="Clear formatting"
          onClick={() => exec("removeFormat")}
        >
          <RemoveFormatting size={15} />
        </button>
        <button
          type="button"
          className={`rich-tool-btn ${isRawMode ? "active" : ""}`}
          title={isRawMode ? "Visual preview" : "HTML code editor"}
          aria-label={isRawMode ? "Switch to visual view" : "Switch to HTML code view"}
          onClick={() => setIsRawMode(!isRawMode)}
          style={{ marginLeft: "auto" }}
        >
          {isRawMode ? <Eye size={15} /> : <Code size={15} />}
        </button>
      </div>

      {isRawMode ? (
        <textarea
          className="rich-editor-raw"
          style={{ minHeight }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Edit raw HTML or text..."
          aria-label={`${ariaLabel} HTML code`}
        />
      ) : (
        <div
          ref={editorRef}
          className="rich-editor-content"
          style={{ minHeight }}
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-label={ariaLabel}
          onInput={handleInput}
          onBlur={handleInput}
          data-placeholder={placeholder}
          dangerouslySetInnerHTML={{ __html: value || "" }}
        />
      )}
    </div>
  );
};
