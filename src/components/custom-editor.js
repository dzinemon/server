// components/custom-editor.js

import React from 'react';
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { ClassicEditor, Heading, Link, Bold, Essentials, Italic, Mention, Paragraph, Undo } from 'ckeditor5';


import 'ckeditor5/ckeditor5.css';

import { useResources } from '@/context/resources';


function CustomEditor( props ) {

    const { text, handleTextChange } = useResources();


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
    ],
    plugins: [
        Bold, Essentials, Italic, Mention, Paragraph, Undo, Heading, Link
    ],
    initialData: 'Add your text here!',
};
  
        return (
            <CKEditor
                editor={ ClassicEditor }
                config={ editorConfiguration }
                data={ props.initialData }
                onChange={ (event, editor ) => {
                    const data = editor.getData();
                    console.log( { event, editor, data } );
                    handleTextChange( data );
                }}
            />

            // <textarea
            //     className='border border-slate-300 p-2 w-full h-full'
            //     value={props.initialData}
            //     onChange={(event) => {
            //         const data = event.target.value;
            //         handleTextChange(data);
            //     }}
            // />
        )
}

export default CustomEditor;
