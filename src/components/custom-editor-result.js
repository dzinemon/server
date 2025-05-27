// components/custom-editor-result.js

import React, { useState, useEffect } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import {
  ClassicEditor,
  SourceEditing,
  Markdown,
  Heading,
  Link,
  Bold,
  Essentials,
  Italic,
  Mention,
  Paragraph,
  List,
  Undo,
} from 'ckeditor5'

import 'ckeditor5/ckeditor5.css'

function CustomEditorResult(props) {
  const initialToolbar = [
    'undo',
    'redo',
    '|',
    'heading',
    '|',
    'bold',
    'italic',
    'link',
    'bulletedList',
    'numberedList',
    '|',
    'outdent',
    'indent',
    '|',
    'imageUpload',
    'blockQuote',
    'insertTable',
    'mediaEmbed',
    '|',
    'sourceEditing',
    'markdown',
  ]

  const [toolbar, setToolbar] = useState(initialToolbar)

  const handleToolbarChange = () => {
    const newToolbar = initialToolbar.push('|', 'sourceEditing', 'markdown')
    setToolbar(newToolbar)
  }

  const editorConfiguration = {
    toolbar: toolbar,
    plugins: [
      Bold,
      Essentials,
      Italic,
      Mention,
      Paragraph,
      Undo,
      Heading,
      Link,
      List,
      SourceEditing,
      Markdown,
    ],
    initialData: '',
  }

  return (
    <CKEditor
      editor={ClassicEditor}
      config={editorConfiguration}
      data={props.initialData}
      // onChange={ (event, editor ) => {
      //     const data = editor.getData();
      //     // console.log( { event, editor, data } )
      // }}
    />
  )
}

export default CustomEditorResult
