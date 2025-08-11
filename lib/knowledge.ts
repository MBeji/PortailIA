import fs from 'fs/promises';
import path from 'path';
import { marked } from 'marked';

const knowledgeDir = path.join(process.cwd(), 'data', 'knowledge', 'base');

export interface KnowledgeItem { slug: string; title: string; tags: string[]; content: string }
export interface KnowledgeItemExtended extends KnowledgeItem { html: string; headings: { depth: number; text: string; id: string }[]; excerpt: string; wordCount: number; readingMinutes: number }

export async function listKnowledge(query: string): Promise<KnowledgeItem[]> {
  try {
    const files = await fs.readdir(knowledgeDir);
    const items: KnowledgeItem[] = [];
    for(const f of files.filter(f => f.endsWith('.md'))){
      const raw = await fs.readFile(path.join(knowledgeDir, f), 'utf-8');
      const [firstLine, ...rest] = raw.split('\n');
      const metaMatch = firstLine.match(/^#\s+(.+?)(?:\s+\[(.*)\])?$/);
      const title = metaMatch ? metaMatch[1] : f.replace(/\.md$/,'');
  const tags = metaMatch && metaMatch[2] ? metaMatch[2].split(',').map(t => t.trim()) : [];
  items.push({ slug: f.replace(/\.md$/,'') , title, tags, content: rest.join('\n') });
    }
    if(!query) return items;
    const q = query.toLowerCase();
    return items.filter(i => i.title.toLowerCase().includes(q) || i.content.toLowerCase().includes(q) || i.tags.some(t => t.toLowerCase().includes(q)));
  } catch {
    return [];
  }
}

function extractHeadings(markdown: string) {
  const lines = markdown.split('\n');
  const headings: { depth: number; text: string; id: string }[] = [];
  for(const line of lines) {
    const m = line.match(/^(#{1,4})\s+(.+)/);
    if(m) {
      const depth = m[1].length;
      const raw = m[2].trim();
      const text = raw.replace(/\[(.*)\]$/, '$1').trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      headings.push({ depth, text, id });
    }
  }
  return headings;
}

export async function getKnowledge(slug: string): Promise<KnowledgeItemExtended | null> {
  try {
    const file = path.join(knowledgeDir, `${slug}.md`);
    const raw = await fs.readFile(file, 'utf-8');
    const [firstLine, ...rest] = raw.split('\n');
    const metaMatch = firstLine.match(/^#\s+(.+?)(?:\s+\[(.*)\])?$/);
    const title = metaMatch ? metaMatch[1] : slug;
    const tags = metaMatch && metaMatch[2] ? metaMatch[2].split(',').map(t=>t.trim()) : [];
    const content = rest.join('\n');
    const headings = extractHeadings(content);
    const html = marked.parse(content, { async: false }) as string;
    const plain = content.replace(/```[\s\S]*?```/g,'').replace(/[#>*_`\-]/g,' ');
    const words = plain.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const readingMinutes = Math.max(1, Math.round(wordCount / 200));
    const excerpt = words.slice(0,50).join(' ') + (wordCount>50 ? '…' : '');
    return { slug, title, tags, content, html, headings, excerpt, wordCount, readingMinutes };
  } catch {
    return null;
  }
}
