import React, { Component } from "react";
import { CCard, CCardHeader, CCardBody } from "@coreui/react";
import HtmlEditor, { Toolbar, MediaResizing, Item, TableContextMenu } from "devextreme-react/html-editor";
import "devextreme/dist/css/dx.light.css";

class TextEditor extends Component {
  constructor(props) {
    super(props);
    this.editorRef = React.createRef();
    this.state = { content: "" };
  }

  handleBlur = () => {
    const editor = this.editorRef.current?.instance;
    if (editor) {
      this.setState({ content: editor.option("value") });
    }
  };

  render() {
    const { content } = this.state;

    return (
      <div className="container mt-4">
        <CCard className="shadow-sm border-0">
          <CCardHeader className="bg-primary text-white">
            <h5 className="mb-0">Rich Text Editor with Table Support</h5>
          </CCardHeader>

          <CCardBody>
            <HtmlEditor
              ref={this.editorRef}
              height="500px"
              defaultValue=""
              placeholder="Start writing your content here..."
              onBlur={this.handleBlur}
            >
              <Toolbar multiline={true}>
                {/* Basic formatting */}
                <Item name="undo" />
                <Item name="redo" />
                <Item name="separator" />
                <Item name="size" acceptedValues={["8pt", "10pt", "12pt", "14pt", "18pt", "24pt", "36pt"]} />
                <Item name="font" />
                <Item name="separator" />
                <Item name="bold" />
                <Item name="italic" />
                <Item name="underline" />
                <Item name="strike" />
                <Item name="separator" />
                <Item name="alignLeft" />
                <Item name="alignCenter" />
                <Item name="alignRight" />
                <Item name="alignJustify" />
                <Item name="separator" />
                <Item name="orderedList" />
                <Item name="bulletList" />
                <Item name="separator" />
                <Item name="header" acceptedValues={[false, 1, 2, 3, 4, 5]} />
                <Item name="separator" />
                <Item name="color" />
                <Item name="background" />
                <Item name="separator" />
                <Item name="link" />
                <Item name="image" />
                <Item name="separator" />

                {/* ✨ Table controls */}
                <Item name="insertTable" />
                <Item name="insertRowAbove" />
                <Item name="insertRowBelow" />
                <Item name="insertColumnLeft" />
                <Item name="insertColumnRight" />
                <Item name="deleteColumn" />
                <Item name="deleteRow" />
                <Item name="deleteTable" />

                <Item name="separator" />
                <Item name="clear" />
                <Item name="codeBlock" />
                <Item name="blockquote" />
              </Toolbar>

              {/* Enables resizing for images */}
              <MediaResizing enabled={true} />

              {/* Enables right-click context menu for table editing */}
              <TableContextMenu enabled={true} />
            </HtmlEditor>

            {/* <div className="mt-3">
              <h6 className="text-muted">Editor Output:</h6>
              <div
                className="border p-3 rounded bg-light"
                dangerouslySetInnerHTML={{ __html: content }}
              ></div>
            </div> */}
          </CCardBody>
        </CCard>
      </div>
    );
  }
}

export default TextEditor;
