import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderFormattedText, FormattedMarkdown } from '@/components/ui/FormattedMarkdown';

type TestElement = React.ReactElement<{ children?: React.ReactNode; className?: string }>;

describe('FormattedMarkdown Component & Inline Token Parser', () => {
  it('parses double asterisks into bold strong elements', () => {
    const raw = 'In this context, a **touchpoint** is a **verified, individual observation**.';
    const nodes = renderFormattedText(raw);
    
    // Check that we have elements
    expect(nodes.length).toBeGreaterThan(1);
    
    const strongNodes = nodes.filter(
      (n): n is TestElement => React.isValidElement(n) && n.type === 'strong'
    );
    
    expect(strongNodes.length).toBe(2);
    expect(strongNodes[0].props.children).toBe('touchpoint');
    expect(strongNodes[1].props.children).toBe('verified, individual observation');
  });

  it('parses bold text adjacent to punctuation, parentheses, and dashes', () => {
    const raw = "HP's **Shopee listings** (e.g., HP Smart Tank 670, 210, 580) count as **one touchpoint**, while YouTube has **264 touchpoints**—mix of **196 e-commerce listings**.";
    const nodes = renderFormattedText(raw);

    const strongNodes = nodes.filter(
      (n): n is TestElement => React.isValidElement(n) && n.type === 'strong'
    );

    expect(strongNodes.length).toBe(4);
    expect(strongNodes[0].props.children).toBe('Shopee listings');
    expect(strongNodes[1].props.children).toBe('one touchpoint');
    expect(strongNodes[2].props.children).toBe('264 touchpoints');
    expect(strongNodes[3].props.children).toBe('196 e-commerce listings');
  });

  it('parses single asterisks into italic em elements', () => {
    const raw = 'This is an *important note* for market analysis.';
    const nodes = renderFormattedText(raw);

    const emNodes = nodes.filter(
      (n): n is TestElement => React.isValidElement(n) && n.type === 'em'
    );

    expect(emNodes.length).toBe(1);
    expect(emNodes[0].props.children).toBe('important note');
  });

  it('parses inline code backticks', () => {
    const raw = 'Use `ministral-14b-latest` for strict schema output.';
    const nodes = renderFormattedText(raw);

    const codeNodes = nodes.filter(
      (n): n is TestElement => React.isValidElement(n) && n.type === 'code'
    );

    expect(codeNodes.length).toBe(1);
    expect(codeNodes[0].props.children).toBe('ministral-14b-latest');
  });

  it('parses triple asterisks into bold italic strong elements', () => {
    const raw = 'Critical priority: ***Top Strategic Action*** for Thailand.';
    const nodes = renderFormattedText(raw);

    const strongNodes = nodes.filter(
      (n): n is TestElement => React.isValidElement(n) && n.type === 'strong'
    );

    expect(strongNodes.length).toBe(1);
    expect(strongNodes[0].props.children).toBe('Top Strategic Action');
    expect(strongNodes[0].props.className).toContain('italic');
  });

  it('renders bullet lists properly for -, *, •, and —', () => {
    const content = `Key Takeaways:
- **Pricing advantage**: HP holds competitive edge on Smart Tank 580.
* **Service advantage**: 2-year onsite warranty praised by users.
• **Channel visibility**: Strong presence on Shopee and Lazada.
— **Retail presence**: JIB and Advice physical footprint.`;

    const element = FormattedMarkdown({ content });
    expect(element).not.toBeNull();
    expect(React.isValidElement(element)).toBe(true);
  });

  it('renders numbered lists properly', () => {
    const content = `Step-by-step recommendation:
1. Reinforce 2-year onsite warranty messaging.
2. Optimize bundle pricing against Epson L3250.
3. Monitor Pantip forum sentiment daily.`;

    const element = FormattedMarkdown({ content });
    expect(element).not.toBeNull();
  });

  it('returns null gracefully when content is empty', () => {
    const element = FormattedMarkdown({ content: '' });
    expect(element).toBeNull();
  });
});
