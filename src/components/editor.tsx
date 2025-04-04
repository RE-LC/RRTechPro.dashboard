"use client";

import {
  MDXEditor, MDXEditorMethods,
  codeBlockPlugin, diffSourcePlugin, DiffSourceToggleWrapper, SandpackConfig, toolbarPlugin, UndoRedo, BoldItalicUnderlineToggles, Separator,
  InsertTable, tablePlugin, headingsPlugin, markdownShortcutPlugin, BlockTypeSelect, linkDialogPlugin, CreateLink, InsertCodeBlock, CodeToggle,
  codeMirrorPlugin, ConditionalContents, ChangeCodeMirrorLanguage, InsertSandpack, ShowSandpackInfo,
  sandpackPlugin,
  directivesPlugin,
  AdmonitionDirectiveDescriptor,
  quotePlugin,
  linkPlugin,
  ListsToggle,
  listsPlugin,
  thematicBreakPlugin,
  InsertThematicBreak,
  InsertAdmonition,
  imagePlugin,
  InsertImage
} from "@mdxeditor/editor";
import { FC } from "react";
import "@mdxeditor/editor/style.css";
import ImageUpload from "./image-upload";

// Define Cloudinary API credentials (typically you'd store these in environment variables)
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dhf254vgn/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'wydoqxyc';

interface EditorProps {
  markdown: string;
  editorRef?: React.MutableRefObject<MDXEditorMethods | null>;
  onChange: (markdown: string) => void;
}

const defaultSnippetContent = `...`;  // Your default snippet content

const simpleSandpackConfig: SandpackConfig = {
  defaultPreset: 'react',
  presets: [
    {
      label: 'React',
      name: 'react',
      meta: 'live react',
      sandpackTemplate: 'react',
      sandpackTheme: 'light',
      snippetFileName: '/App.js',
      snippetLanguage: 'jsx',
      initialSnippetContent: defaultSnippetContent
    },
  ]
}

const Editor: FC<EditorProps> = ({ markdown, editorRef, onChange }) => {

  const handleImageUpload = async (file: File) => {
    // Create a form data object to upload the image to Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    // Make a request to Cloudinary's API to upload the image
    try {
      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.secure_url) {
        return Promise.resolve(data.secure_url);  // Return the image URL from Cloudinary
      } else {
        return Promise.reject('Image upload failed');
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return Promise.reject('Image upload failed');
    }
  };

  return (
    <MDXEditor
      markdown={markdown}
      onChange={onChange}
      ref={editorRef}
      spellCheck={true}
      contentEditableClassName="prose prose-sm sm:prose-base lg:prose-lg"
      className="border-b-2 border-black bg-white p-6 rounded-lg shadow-lg"
      plugins={[
        diffSourcePlugin({ diffMarkdown: 'An older version', viewMode: 'rich-text' }),
        directivesPlugin({ directiveDescriptors: [AdmonitionDirectiveDescriptor] }),
        tablePlugin(),
        headingsPlugin({ allowedHeadingLevels: [1,2,3,4] }),
        markdownShortcutPlugin(),
        linkDialogPlugin(),
        codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
        sandpackPlugin({ sandpackConfig: simpleSandpackConfig }),
        codeMirrorPlugin({
          codeBlockLanguages: {
            js: 'JavaScript',
            css: 'CSS',
            txt: 'Text',
            tsx: 'TypeScript',
            py: 'Python',
            rb: 'Ruby',
            java: 'Java',
            html: 'HTML',
            go: 'Go',
            php: 'PHP',
            lua: 'Lua',
            sql: 'SQL',
          }
        }),
        listsPlugin(),
        thematicBreakPlugin(),
        linkPlugin(),
        quotePlugin(),
        imagePlugin({
          imageUploadHandler: (file) => handleImageUpload(file),
          imageAutocompleteSuggestions: [
            'https://picsum.photos/200/300',
            'https://picsum.photos/200'
          ]
        }),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <UndoRedo />
              <Separator />
              <BoldItalicUnderlineToggles />
              <CodeToggle />
              <Separator />
              <ListsToggle />
              <Separator />
              <BlockTypeSelect />
              <Separator />
              <CreateLink />
              <Separator />
              <InsertTable />
              <InsertImage />
              <InsertThematicBreak />
              <Separator />
              <ConditionalContents
                options={[
                  { when: (editor) => editor?.editorType === 'codeblock', contents: () => <ChangeCodeMirrorLanguage /> },
                  { when: (editor) => editor?.editorType === 'sandpack', contents: () => <ShowSandpackInfo /> },
                  {
                    fallback: () => (<>
                      <InsertCodeBlock />
                      <InsertSandpack />
                    </>)
                  }
                ]}
              />
              <Separator />
              <InsertAdmonition />
              <Separator />
              <DiffSourceToggleWrapper>
                <></>
              </DiffSourceToggleWrapper>
            </>
          ),
        }),
      ]}
    />
  );
};

export default Editor;
