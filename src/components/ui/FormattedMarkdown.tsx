/**
 * FormattedMarkdown — Lightweight, secure markdown renderer for Chatbot & Assistant responses.
 * 
 * Supports:
 * - Double asterisks bold: **bold text** -> <strong className="font-bold text-white">
 * - Single asterisk italic: *italic* -> <em className="italic text-zinc-200">
 * - Inline code: `code` -> <code className="font-mono text-emerald-400">
 * - Bullet lists: Lines starting with •, -, * -> <ul> with styled emerald bullet pills
 * - Numbered lists: Lines starting with 1., 2., etc. -> <ol> with tabular numbers
 * - Multi-paragraph text separation
 */

import React from 'react';
import { cn } from '@/lib/utils';

export function renderFormattedText(text: string): React.ReactNode[] {
  // Regex splitting by bold-italic (***...***), bold (**...**), italic (*...*), and code (`...`)
  const parts = text.split(/(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*[^*\n]+?\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('***') && part.endsWith('***') && part.length >= 6) {
      return (
        <strong key={i} className="font-bold italic text-white tracking-tight">
          {part.slice(3, -3)}
        </strong>
      );
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={i} className="font-bold text-white tracking-tight">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2 && !part.startsWith('**')) {
      return (
        <em key={i} className="italic text-zinc-200">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code key={i} className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#1e1e1e] border border-[#2e2e2e] text-emerald-400">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export interface FormattedMarkdownProps {
  content: string;
  className?: string;
}

export const FormattedMarkdown: React.FC<FormattedMarkdownProps> = ({
  content,
  className,
}) => {
  if (!content) return null;

  const rawLines = content.split('\n');
  const blocks: Array<
    | { type: 'p'; text: string }
    | { type: 'ul'; items: string[] }
    | { type: 'ol'; items: string[] }
  > = [];

  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({ type: 'p', text: currentParagraph.join('\n') });
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }
  };

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    // Check for bullet list (-, *, •, –, —)
    const bulletMatch = trimmed.match(/^[-*•–—]\s+(.*)$/);
    if (bulletMatch) {
      flushParagraph();
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(bulletMatch[1]);
      continue;
    }

    // Check for numbered list (1., 2., etc.)
    const numberMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numberMatch) {
      flushParagraph();
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(numberMatch[2]);
      continue;
    }

    // Regular line inside a paragraph
    flushList();
    currentParagraph.push(line);
  }

  flushParagraph();
  flushList();

  return (
    <div className={cn('space-y-2 leading-relaxed font-normal', className)}>
      {blocks.map((block, idx) => {
        if (block.type === 'ul') {
          return (
            <ul key={idx} className="space-y-1.5 pl-1 my-1.5">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 mt-1.5 shrink-0" />
                  <span className="flex-1">{renderFormattedText(item)}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === 'ol') {
          return (
            <ol key={idx} className="space-y-1.5 pl-1 my-1.5">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-2">
                  <span className="font-mono text-[10px] text-zinc-400 mt-0.5 shrink-0 tabular-nums font-semibold">
                    {itemIdx + 1}.
                  </span>
                  <span className="flex-1">{renderFormattedText(item)}</span>
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={idx} className="whitespace-pre-line">
            {renderFormattedText(block.text)}
          </p>
        );
      })}
    </div>
  );
};
