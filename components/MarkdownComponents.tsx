import React from 'react';

export const MarkdownComponents = {
  code: ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <div className="code-block">
        <div className="code-header">
          {match[1]}
        </div>
        <pre className="code-pre">
          <code className={className} style={{
            display: 'block',
            whiteSpace: 'pre',
            textAlign: 'left',
            fontFamily: 'inherit'
          }} {...props}>
            {children}
          </code>
        </pre>
      </div>
    ) : (
      <code className="code-inline" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }: any) => <>{children}</>,
  blockquote: ({ children }: any) => (
    <blockquote className="blockquote">
      {children}
    </blockquote>
  ),
  table: ({ children }: any) => (
    <div className="table-container">
      <table className="markdown-table">
        {children}
      </table>
    </div>
  ),
  th: ({ children }: any) => (
    <th className="table-header">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="table-cell">
      {children}
    </td>
  )
};