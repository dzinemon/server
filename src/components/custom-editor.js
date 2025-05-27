// components/custom-editor.js

import { CKEditor } from '@ckeditor/ckeditor5-react'
import {
  Bold,
  ClassicEditor,
  Essentials,
  Heading,
  Italic,
  Link,
  List,
  Markdown,
  Mention,
  Paragraph,
  SourceEditing,
  Undo,
} from 'ckeditor5'
import { useState } from 'react'

import 'ckeditor5/ckeditor5.css'

import { useResources } from '@/context/resources'

function CustomEditor(props) {
  const { text, handleTextChange } = useResources()

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
    sourceEditing: {
      allowCollaborationFeatures: true,
      mode: 'textarea',
    },
  }

  return (
    <div>
      <CKEditor
        editor={ClassicEditor}
        config={editorConfiguration}
        data={props.initialData}
        onChange={(event, editor) => {
          const data = editor.getData()

          console.log(event)
          // console.log( { event, editor, data } );
          handleTextChange(data)
          console.log(data)
        }}
      />
    </div>
  )
}

export default CustomEditor
