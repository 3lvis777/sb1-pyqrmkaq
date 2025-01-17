import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { DndContext, closestCenter, useSensor, useSensors, MouseSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, Image as ImageIcon, Link as LinkIcon, X, Plus, GripVertical } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import MediaModal from './MediaModal';

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string, url: string) => void;
  initialText?: string;
}

function LinkModal({ isOpen, onClose, onSubmit, initialText }: LinkModalProps) {
  const [text, setText] = React.useState(initialText || '');
  const [url, setUrl] = React.useState('');
  const modalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setText(initialText || '');
      setUrl('');
    }
  }, [isOpen, initialText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSubmit(text, url);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div ref={modalRef} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Insert Link</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Display Text
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600"
            >
              Insert Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

async function processClipboardItem(item: DataTransferItem, editor: any): Promise<void> {
  if (item.type.startsWith('image/')) {
    const file = item.getAsFile();
    if (file) {
      try {
        const url = await handleImageUpload(file);
        editor.chain().focus().setImage({ src: url, alt: 'Image Credit:', title: 'Click to edit image' }).run();
        return;
      } catch (error) {
        console.error('Error uploading clipboard image:', error);
        toast.error('Failed to upload clipboard image');
      }
    }
  } else if (item.type === 'text/html') {
    item.getAsString(async (html) => {
      // Extract images from HTML content
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Process links first to preserve them
      const links = doc.getElementsByTagName('a');
      for (const link of links) {
        const href = link.getAttribute('href');
        const text = link.textContent;
        if (href && text) {
          // Replace the link with markdown format
          link.outerHTML = `[${text}](${href})`;
        }
      }
      
      const images = doc.getElementsByTagName('img');
      
      // Upload and replace image sources
      for (const img of images) {
        const src = img.src;
        if (src.startsWith('data:')) {
          try {
            const response = await fetch(src);
            const blob = await response.blob();
            const file = new File([blob], 'clipboard-image.png', { type: 'image/png' });
            const url = await handleImageUpload(file);
            img.src = url;
          } catch (error) {
            console.error('Error processing inline image:', error);
          }
        }
      }
      
      // Convert HTML to markdown-like format
      const content = doc.body.innerHTML
        // Preserve bold text
        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
        // Preserve italic text
        .replace(/<em>(.*?)<\/em>/g, '*$1*')
        // Preserve headers
        .replace(/<h1>(.*?)<\/h1>/g, '# $1\n')
        .replace(/<h2>(.*?)<\/h2>/g, '## $1\n')
        .replace(/<h3>(.*?)<\/h3>/g, '### $1\n')
        // Preserve lists
        .replace(/<ul>(.*?)<\/ul>/g, (_, list) => 
          list.replace(/<li>(.*?)<\/li>/g, '* $1\n')
        )
        .replace(/<ol>(.*?)<\/ol>/g, (_, list) => 
          list.replace(/<li>(.*?)<\/li>/g, (__, item, index) => 
            `${index + 1}. ${item}\n`
          )
        );

      editor.chain().focus().insertContent(content).run();
    });
  } else if (item.type === 'text/plain') {
    item.getAsString((text) => {
      // Enhanced URL detection
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      if (urlRegex.test(text)) {
        // If it's an image URL
        if (/\.(jpg|jpeg|png|gif|webp)$/i.test(text)) {
          editor.chain().focus().setImage({ src: text }).run();
        } else {
          // Convert URLs to markdown links while preserving surrounding text
          const content = text.replace(urlRegex, (url) => `[${url}](${url})`);
          editor.chain().focus().insertContent(content).run();
        }
      } else {
        // Regular text
        editor.chain().focus().insertContent(text).run();
      }
    });
  }
}

interface EditorProps {
  content?: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const handleImageUpload = async (file: File): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const [showLinkModal, setShowLinkModal] = React.useState(false);
  const [showMediaModal, setShowMediaModal] = React.useState(false);
  
  const handleLinkSubmit = (text: string, url: string) => {    
    // If there's no selection, insert new text with link
    if (editor.state.selection.empty) {
      editor
        .chain()
        .focus()
        .insertContent(text)
        .setTextSelection(editor.state.selection.from - text.length)
        .setLink({ href: url })
        .run();
    } else {
      // If there's selected text, just add the link to it
      editor
        .chain()
        .focus()
        .setLink({ href: url })
        .run();
    }
  };

  const handleImageSelect = async (url: string, credit?: string, creditUrl?: string) => {
    if (!editor) return;
    
    const caption = credit ? `Image Credit: ${credit}` : '';

    editor.chain().focus().setImage({ 
      src: url,
      alt: caption,
      title: credit || undefined,
      'data-credit-url': creditUrl
    }).run();
    
    setShowMediaModal(false);
    toast.success('Image inserted successfully');
  };

  const handlePaste = async (event: ClipboardEvent) => {
    event.preventDefault(); // Prevent default paste behavior
    event.stopPropagation(); // Stop event bubbling
    
    const text = event.clipboardData?.getData('text/plain');
    const html = event.clipboardData?.getData('text/html');
    const items = event.clipboardData?.items;

    // Handle pasted images
    if (items) {
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            try {
              const url = await handleImageUpload(file);
              editor
                .chain()
                .focus()
                .setImage({ 
                  src: url, 
                  alt: 'Image Credit:',
                  title: credit ? `Image Credit: ${credit}` : 'Click to edit image'
                })
                .run();
              return;
            } catch (error) {
              console.error('Error uploading pasted image:', error);
              toast.error('Failed to upload pasted image');
            }
          }
        }
      }
    }

    if (html) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      // Process links in HTML
      const links = tempDiv.getElementsByTagName('a');
      Array.from(links).forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
          link.setAttribute('href', href);
        }
      });

      // Insert processed content
      editor
        .chain()
        .focus()
        .insertContent(tempDiv.innerHTML)
        .run();
    } else if (text) {
      // Handle plain text with URL detection
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      if (urlRegex.test(text)) {        
        const content = text.replace(urlRegex, (url) => {
          return `<a href="${url}">${url}</a>`;
        });
        editor
          .chain()
          .focus()
          .insertContent(content)
          .run();
      } else {
        // Insert plain text directly
        editor
          .chain()
          .focus()
          .insertContent(text)
          .run();
      }
    }
  };

  React.useEffect(() => {
    if (editor?.view?.dom) {
      const dom = editor.view.dom;
      dom.addEventListener('paste', handlePaste);
      return () => {
        dom.removeEventListener('paste', handlePaste);
      };
    }
  }, [editor, handlePaste]);

  const removeLink = () => {
    editor
      .chain()
      .focus()
      .unsetLink()
      .run();
  };

  return (
    <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('bold') ? 'bg-gray-100' : ''
        }`}
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('italic') ? 'bg-gray-100' : ''
        }`}
      >
        <Italic className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        disabled={!editor.can().chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('heading', { level: 1 }) ? 'bg-gray-100' : ''
        }`}
      >
        <Heading1 className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        disabled={!editor.can().chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('heading', { level: 2 }) ? 'bg-gray-100' : ''
        }`}
      >
        <Heading2 className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        disabled={!editor.can().chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('heading', { level: 3 }) ? 'bg-gray-100' : ''
        }`}
      >
        <Heading3 className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={!editor.can().chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('bulletList') ? 'bg-gray-100' : ''
        }`}
      >
        <List className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={!editor.can().chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('orderedList') ? 'bg-gray-100' : ''
        }`}
      >
        <ListOrdered className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setShowMediaModal(true)}
        className="p-2 rounded hover:bg-gray-100"
      >
        <ImageIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setShowLinkModal(true)}
        className="p-2 rounded hover:bg-gray-100"
      >
        <LinkIcon className="h-4 w-4" />
      </button>
      <LinkModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onSubmit={handleLinkSubmit}
        initialText={editor.state.selection.empty ? '' : editor.state.doc.textBetween(
          editor.state.selection.from,
          editor.state.selection.to
        )}
      />
      <MediaModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onSelect={handleImageSelect}
      />
    </div>
  );
};

export default function Editor({ content, onChange, placeholder }: EditorProps) {
  const [showMediaModal, setShowMediaModal] = React.useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false, // Disable built-in link to use our custom one
        heading: {
          levels: [1, 2, 3]
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: true
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: true
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-red-600 hover:text-red-700 underline'
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full mx-auto my-4 group',
          draggable: false,
          contenteditable: false,
          style: 'min-width: 100px; max-width: 100%'
        },
        allowBase64: false,
        resizable: true,
        parseHTML() {
          return [
            {
              tag: 'div.image-container',
              getAttrs: dom => ({
                src: dom.querySelector('img')?.getAttribute('src'),
                alt: dom.querySelector('img')?.getAttribute('alt'),
                title: dom.querySelector('img')?.getAttribute('title'),
                'data-credit-url': dom.querySelector('img')?.getAttribute('data-credit-url'),
                'data-caption': dom.querySelector('.image-caption')?.textContent
              })
            }
          ];
        },
        renderHTML({ HTMLAttributes }) {
          const credit = HTMLAttributes.title;
          const creditUrl = HTMLAttributes['data-credit-url'];
          const caption = HTMLAttributes['data-caption'];
          
          return [
            'div',
            { 
              class: 'image-container'
            },
            [
              'img',
              { ...HTMLAttributes, contenteditable: 'false' }
            ],
            caption ? [
              'div',
              { 
                class: 'image-caption',
                contenteditable: 'true',
                'data-placeholder': 'Add a caption...'
              },
              caption
            ] : '',
            credit ? [
              'div',
              { 
                class: 'image-credit',
              },
              creditUrl ? [
                'a',
                {
                  href: creditUrl,
                  target: '_blank',
                  rel: 'noopener noreferrer'
                },
                `Image Credit: ${credit}`
              ] : `Image Credit: ${credit}`
            ] : ''
          ];
        },
        handleDOMEvents: {
          mousedown: (view, event) => {
            const target = event.target as HTMLElement;
            if (target.classList.contains('image-resizer') || target.closest('.image-resizer')) {
              event.preventDefault();
              const wrapper = target.closest('.image-wrapper');
              const img = wrapper?.querySelector('img');
              if (!img) return false;
              
              const startX = event.pageX;
              const startY = event.pageY;
              const startWidth = img.offsetWidth;
              const startHeight = img.offsetHeight;
              const aspectRatio = startWidth / startHeight;
              
              const onMouseMove = (e: MouseEvent) => {
                const dx = e.pageX - startX;
                const dy = e.pageY - startY;
                
                // Maintain aspect ratio
                let newWidth = startWidth + dx;
                let newHeight = newWidth / aspectRatio;
                
                // Set minimum size
                if (newWidth < 100) {
                  newWidth = 100;
                  newHeight = newWidth / aspectRatio;
                }
                
                // Set maximum size
                const maxWidth = view.dom.offsetWidth * 0.9;
                if (newWidth > maxWidth) {
                  newWidth = maxWidth;
                  newHeight = newWidth / aspectRatio;
                }
                
                img.style.width = `${newWidth}px`;
                img.style.height = `${newHeight}px`;
              };
              
              const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
              };
              
              document.addEventListener('mousemove', onMouseMove);
              document.addEventListener('mouseup', onMouseUp);
              return true;
            }
            return false;
          }
        }
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing...',
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[200px] max-h-[600px] px-4 py-2 markdown-content overflow-y-auto',
      },
      handleDOMEvents: {
        keydown: (view, event) => {
          if (event.key === 'Delete' || event.key === 'Backspace') {
            const { from, to } = view.state.selection;
            const node = view.state.doc.nodeAt(from);
            if (node?.type.name === 'image') {
              event.preventDefault();
              view.dispatch(view.state.tr.delete(from, to));
              return true;
            }
          }
          return false;
        }
      }
    },
  });

  // Add resize handles to images
  React.useEffect(() => {
    if (editor) {
      const images = editor.view.dom.getElementsByTagName('img');
      Array.from(images).forEach(img => {
        if (!img.parentElement?.classList.contains('image-wrapper')) {
          const wrapper = document.createElement('div');
          wrapper.className = 'image-wrapper';
          img.parentNode?.insertBefore(wrapper, img);
          wrapper.appendChild(img);
          
          // Add resize handles
          const handles = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
          handles.forEach(position => {
            const handle = document.createElement('div');
            handle.className = `image-resizer ${position}`;
            wrapper.appendChild(handle);
          });
        }
      });
    }
  }, [editor?.getHTML()]);

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  const handleImageSelect = async (url: string, credit?: string, creditUrl?: string) => {
    if (!editor) return;
    
    const caption = credit ? `Image Credit: ${credit}` : '';

    editor.chain().focus().setImage({ 
      src: url,
      alt: caption,
      title: credit || undefined,
      'data-credit-url': creditUrl
    }).run();
    
    setShowMediaModal(false);
    toast.success('Image inserted successfully');
  };

  // Handle drag and drop
  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      // Upload and insert image
      handleImageUpload(file).then(url => {
        handleImageSelect(url);
      }).catch(error => {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image');
      });
    }
  };

  // Handle paste
  const handlePaste = async (event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        event.preventDefault();
        const file = item.getAsFile();
        if (file) {
          try {
            const url = await handleImageUpload(file);
            handleImageSelect(url);
          } catch (error) {
            console.error('Error uploading pasted image:', error);
            toast.error('Failed to upload pasted image');
          }
        }
      }
    }
  };

  // Add event listeners
  React.useEffect(() => {
    if (editor?.view?.dom) {
      const dom = editor.view.dom;
      dom.addEventListener('drop', handleDrop);
      dom.addEventListener('paste', handlePaste);

      // Handle caption editing
      dom.addEventListener('input', (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('image-caption')) {
          const container = target.closest('.image-container');
          const img = container?.querySelector('img');
          if (img) {
            img.setAttribute('data-caption', target.textContent || '');
          }
        }
      });
      
      // Handle image clicks for editing
      dom.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'IMG' || target.classList.contains('image-caption')) {
          setShowMediaModal(true);
        }
      });
      
      return () => {
        dom.removeEventListener('drop', handleDrop);
        dom.removeEventListener('paste', handlePaste);
      };
    }
  }, [editor]);

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      <MediaModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onSelect={handleImageSelect}
      />
    </div>
  );
}