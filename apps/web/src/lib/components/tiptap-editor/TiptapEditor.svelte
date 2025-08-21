<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Editor } from '@tiptap/core';
  import StarterKit from '@tiptap/starter-kit';
  import Image from '@tiptap/extension-image';
  import Link from '@tiptap/extension-link';
  import { TextAlign } from '@tiptap/extension-text-align';
  import { TextStyle } from '@tiptap/extension-text-style';
  import { Color } from '@tiptap/extension-color';
  import Underline from '@tiptap/extension-underline';
  
  // Icons
  import MdiFormatBold from 'virtual:icons/mdi/format-bold';
  import MdiFormatItalic from 'virtual:icons/mdi/format-italic';
  import MdiFormatUnderline from 'virtual:icons/mdi/format-underline';
  import MdiFormatStrikethrough from 'virtual:icons/mdi/format-strikethrough';
  import MdiFormatQuoteClose from 'virtual:icons/mdi/format-quote-close';
  import MdiFormatListBulleted from 'virtual:icons/mdi/format-list-bulleted';
  import MdiFormatListNumbered from 'virtual:icons/mdi/format-list-numbered';
  import MdiUndo from 'virtual:icons/mdi/undo';
  import MdiRedo from 'virtual:icons/mdi/redo';
  import MdiImage from 'virtual:icons/mdi/image';
  import MdiLink from 'virtual:icons/mdi/link';
  import MdiFormatAlignLeft from 'virtual:icons/mdi/format-align-left';
  import MdiFormatAlignCenter from 'virtual:icons/mdi/format-align-center';
  import MdiFormatAlignRight from 'virtual:icons/mdi/format-align-right';
  import MdiFormatHeader1 from 'virtual:icons/mdi/format-header-1';
  import MdiFormatHeader2 from 'virtual:icons/mdi/format-header-2';
  import MdiFormatHeader3 from 'virtual:icons/mdi/format-header-3';
  import MdiFormatParagraph from 'virtual:icons/mdi/format-paragraph';

  // Props
  export let content = '';
  export let placeholder = '开始创作你的诗歌...';
  export let onUpdate: ((content: string) => void) | undefined = undefined;
  export let readonly = false;
  export let minHeight = '400px';

  // State
  let element: HTMLDivElement;
  let editor: Editor | null = null;

  onMount(() => {
    editor = new Editor({
      element: element,
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
          },
          paragraph: {
            HTMLAttributes: {
              'data-placeholder': placeholder,
            },
          },
        }),
        Image.configure({
          inline: true,
          allowBase64: true,
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-primary hover:text-primary-focus underline',
          },
        }),
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        TextStyle,
        Color.configure({
          types: [TextStyle.name],
        }),
        Underline,
      ],
      content: content,
      editable: !readonly,
      onTransaction: () => {
        // Force re-render so `editor.isActive` works as expected
        editor = editor;
      },
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        if (onUpdate) {
          onUpdate(html);
        }
      },
    });
  });

  onDestroy(() => {
    if (editor) {
      editor.destroy();
    }
  });

  // Toolbar actions
  function addImage() {
    const url = window.prompt('请输入图片URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }

  function addLink() {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('请输入链接URL:', previousUrl);
    
    if (url === null) {
      return;
    }
    
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  // Export content getter for parent component
  export function getContent(): string {
    return editor?.getHTML() || '';
  }

  export function setContent(newContent: string) {
    if (editor) {
      editor.commands.setContent(newContent);
    }
  }

  export function focus() {
    if (editor) {
      editor.commands.focus();
    }
  }
</script>

<div class="tiptap-editor">
  {#if editor && !readonly}
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="flex flex-wrap items-center gap-1">
        <!-- Undo/Redo -->
        <button 
          class="btn btn-ghost btn-sm toolbar-btn"
          onclick={() => editor?.chain().focus().undo().run()}
          disabled={!editor?.can().chain().focus().undo().run()}
          title="撤销"
        >
          <MdiUndo class="w-4 h-4" />
        </button>
        <button 
          class="btn btn-ghost btn-sm toolbar-btn"
          onclick={() => editor?.chain().focus().redo().run()}
          disabled={!editor?.can().chain().focus().redo().run()}
          title="重做"
        >
          <MdiRedo class="w-4 h-4" />
        </button>
        
        <div class="divider divider-horizontal mx-1"></div>
        
        <!-- Headings -->
        <button 
          class="btn btn-ghost btn-sm toolbar-btn"
          class:btn-active={editor?.isActive('heading', { level: 1 })}
          onclick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          title="标题 1"
        >
          <MdiFormatHeader1 class="w-4 h-4" />
        </button>
        <button 
          class="btn btn-ghost btn-sm toolbar-btn"
          class:btn-active={editor?.isActive('heading', { level: 2 })}
          onclick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          title="标题 2"
        >
          <MdiFormatHeader2 class="w-4 h-4" />
        </button>
        <button 
          class="btn btn-ghost btn-sm toolbar-btn"
          class:btn-active={editor?.isActive('heading', { level: 3 })}
          onclick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          title="标题 3"
        >
          <MdiFormatHeader3 class="w-4 h-4" />
        </button>
        <button 
          class="btn btn-ghost btn-sm toolbar-btn"
          class:btn-active={editor?.isActive('paragraph')}
          onclick={() => editor?.chain().focus().setParagraph().run()}
          title="段落"
        >
          <MdiFormatParagraph class="w-4 h-4" />
        </button>
        
        <div class="divider divider-horizontal mx-1"></div>
        
        <!-- Text formatting -->
        <button 
          class="btn btn-ghost btn-sm toolbar-btn"
          class:btn-active={editor?.isActive('bold')}
          onclick={() => editor?.chain().focus().toggleBold().run()}
          disabled={!editor?.can().chain().focus().toggleBold().run()}
          title="加粗"
        >
          <MdiFormatBold class="w-4 h-4" />
        </button>
        <button 
          class="btn btn-ghost btn-sm toolbar-btn"
          class:btn-active={editor?.isActive('italic')}
          onclick={() => editor?.chain().focus().toggleItalic().run()}
          disabled={!editor?.can().chain().focus().toggleItalic().run()}
          title="斜体"
        >
          <MdiFormatItalic class="w-4 h-4" />
        </button>
        <button 
          class="btn btn-ghost btn-sm toolbar-btn"
          class:btn-active={editor?.isActive('underline')}
          onclick={() => editor?.chain().focus().toggleUnderline().run()}
          disabled={!editor?.can().chain().focus().toggleUnderline().run()}
          title="下划线"
        >
          <MdiFormatUnderline class="w-4 h-4" />
        </button>
        <button 
          class="btn btn-ghost btn-sm toolbar-btn"
          class:btn-active={editor?.isActive('strike')}
          onclick={() => editor?.chain().focus().toggleStrike().run()}
          disabled={!editor?.can().chain().focus().toggleStrike().run()}
          title="删除线"
        >
          <MdiFormatStrikethrough class="w-4 h-4" />
        </button>
        
        <div class="divider divider-horizontal mx-1"></div>
        
        <!-- Lists and quotes -->
        <button 
          class="btn btn-ghost btn-sm toolbar-btn"
          class:btn-active={editor?.isActive('bulletList')}
          onclick={() => editor?.chain().focus().toggleBulletList().run()}
          title="无序列表"
        >
          <MdiFormatListBulleted class="w-4 h-4" />
        </button>
        <button 
          class="btn btn-ghost btn-sm toolbar-btn"
          class:btn-active={editor?.isActive('orderedList')}
          onclick={() => editor?.chain().focus().toggleOrderedList().run()}
          title="有序列表"
        >
          <MdiFormatListNumbered class="w-4 h-4" />
        </button>
        <button 
          class="btn btn-ghost btn-sm toolbar-btn"
          class:btn-active={editor?.isActive('blockquote')}
          onclick={() => editor?.chain().focus().toggleBlockquote().run()}
          title="引用"
        >
          <MdiFormatQuoteClose class="w-4 h-4" />
        </button>
        
        <div class="divider divider-horizontal mx-1"></div>
        
        <!-- Text alignment -->
        <button 
          class="btn btn-ghost btn-sm toolbar-btn"
          class:btn-active={editor?.isActive({ textAlign: 'left' })}
          onclick={() => editor?.chain().focus().setTextAlign('left').run()}
          title="左对齐"
        >
          <MdiFormatAlignLeft class="w-4 h-4" />
        </button>
        <button 
          class="btn btn-ghost btn-sm toolbar-btn"
          class:btn-active={editor?.isActive({ textAlign: 'center' })}
          onclick={() => editor?.chain().focus().setTextAlign('center').run()}
          title="居中对齐"
        >
          <MdiFormatAlignCenter class="w-4 h-4" />
        </button>
        <button 
          class="btn btn-ghost btn-sm toolbar-btn"
          class:btn-active={editor?.isActive({ textAlign: 'right' })}
          onclick={() => editor?.chain().focus().setTextAlign('right').run()}
          title="右对齐"
        >
          <MdiFormatAlignRight class="w-4 h-4" />
        </button>
        
        <div class="divider divider-horizontal mx-1"></div>
        
        <!-- Media -->
        <button 
          class="btn btn-ghost btn-sm toolbar-btn"
          onclick={addImage}
          title="插入图片"
        >
          <MdiImage class="w-4 h-4" />
        </button>
        <button 
          class="btn btn-ghost btn-sm toolbar-btn"
          class:btn-active={editor?.isActive('link')}
          onclick={addLink}
          title="插入链接"
        >
          <MdiLink class="w-4 h-4" />
        </button>
      </div>
    </div>
  {/if}
  
  <!-- Editor content -->
  <div 
    bind:this={element}
    class="editor-content tiptap-content border border-base-300 p-4 bg-base-100 focus-within:border-primary transition-colors"
    class:rounded-lg={readonly}
    class:rounded-b-lg={!readonly}
    class:border-t-0={!readonly}
    style="min-height: {minHeight};"
  ></div>
</div>

<style>
  .tiptap-editor {
    border: 1px solid hsl(var(--bc) / 0.2);
    border-radius: 0.5rem;
    background: hsl(var(--b1));
    transition: border-color 0.2s;
  }
  
  .tiptap-editor:focus-within {
    border-color: hsl(var(--p));
  }
  
  .toolbar {
    border-bottom: 1px solid hsl(var(--bc) / 0.1);
    background: hsl(var(--b2));
    padding: 0.5rem;
    border-radius: 0.5rem 0.5rem 0 0;
  }
  
  .editor-content {
    padding: 1rem;
    min-height: 300px;
    outline: none;
  }
  
  .editor-content :global(p[data-placeholder]:empty:before) {
    content: attr(data-placeholder);
    color: hsl(var(--bc) / 0.4);
    pointer-events: none;
    font-style: italic;
  }
  
  :global(.toolbar-btn) {
    min-height: 2rem;
    height: 2rem;
    padding: 0 0.5rem;
  }
  
  :global(.toolbar-btn.active) {
    background: hsl(var(--p));
    color: hsl(var(--pc));
  }
  
  :global(.toolbar-divider) {
    width: 1px;
    height: 1.5rem;
    background: hsl(var(--bc) / 0.2);
    margin: 0 0.25rem;
  }
  
  :global(.tiptap-content .ProseMirror) {
    outline: none;
    line-height: 1.8;
  }
  
  :global(.tiptap-content .ProseMirror p.is-editor-empty:first-child::before) {
    content: attr(data-placeholder);
    float: left;
    color: oklch(var(--bc) / 0.4);
    pointer-events: none;
    height: 0;
  }
  
  :global(.tiptap-content .ProseMirror h1) {
    font-size: 2rem;
    font-weight: bold;
    margin: 1rem 0 0.5rem 0;
  }
  
  :global(.tiptap-content .ProseMirror h2) {
    font-size: 1.5rem;
    font-weight: bold;
    margin: 1rem 0 0.5rem 0;
  }
  
  :global(.tiptap-content .ProseMirror h3) {
    font-size: 1.25rem;
    font-weight: bold;
    margin: 1rem 0 0.5rem 0;
  }
  
  :global(.tiptap-content .ProseMirror p) {
    margin: 0.5rem 0;
  }
  
  :global(.tiptap-content .ProseMirror ul, .tiptap-content .ProseMirror ol) {
    padding-left: 1.5rem;
    margin: 0.5rem 0;
  }
  
  :global(.tiptap-content .ProseMirror li) {
    margin: 0.25rem 0;
  }
  
  :global(.tiptap-content .ProseMirror blockquote) {
    border-left: 4px solid oklch(var(--p));
    padding-left: 1rem;
    margin: 1rem 0;
    font-style: italic;
    color: oklch(var(--bc) / 0.8);
  }
  
  :global(.tiptap-content .ProseMirror img) {
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
    margin: 0.5rem 0;
  }
  
  :global(.tiptap-content .ProseMirror a) {
    color: oklch(var(--p));
    text-decoration: underline;
  }
  
  :global(.tiptap-content .ProseMirror a:hover) {
    color: oklch(var(--pf));
  }
</style>