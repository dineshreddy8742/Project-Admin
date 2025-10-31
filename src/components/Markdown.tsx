import React from 'react';

export const Markdown = ({ content }: { content: string }) => {
  const html = content
    .replace(/### (.*)/g, '<h3 class="text-lg font-semibold mb-2">$1</h3>')
    .replace(/#### (.*)/g, '<h4 class="text-md font-semibold mb-2">$1</h4>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\* ([^*]+)/g, '<li class="list-disc list-inside">$1</li>')
    .replace(/\n/g, '<br />');

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
