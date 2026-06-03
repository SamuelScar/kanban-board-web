import React, { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export default function MarkdownRenderer({ content }) {
  const htmlSafe = useMemo(() => {
    if (!content) return '';
    // Converte Markdown para HTML
    const rawHtml = marked.parse(content, { breaks: true, gfm: true });
    // Sanitiza o HTML para evitar XSS
    return DOMPurify.sanitize(rawHtml);
  }, [content]);

  if (!content) return null;

  return (
    <div 
      className="markdown-body"
      dangerouslySetInnerHTML={{ __html: htmlSafe }}
    />
  );
}
