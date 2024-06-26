// components/custom-editor.js

import React from 'react';
import { CKEditor } from "@ckeditor/ckeditor5-react";
import Editor from "ckeditor5-custom-build";

import { useResources } from '@/context/resources';

const editorConfiguration = {
    toolbar: [
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
        'undo',
        'redo'
    ]
};

function CustomEditor( props ) {

    const { text, handleTextChange } = useResources();
  
        return (
            <CKEditor
                editor={ Editor }
                config={ editorConfiguration }
                data={ props.initialData }
                onChange={ (event, editor ) => {
                    const data = editor.getData();
                    console.log( { event, editor, data } );
                    handleTextChange( data );
                } }
            />
        )
}

export default CustomEditor;
