import fs from 'fs/promises';
import path from 'path';

const knowledgeDir = path.join(process.cwd(), 'data', 'knowledge', 'base');

export interface KnowledgeItem { slug: string; title: string; tags: string[]; content: string }

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

export async function getKnowledge(slug: string): Promise<KnowledgeItem | null> {
  try {
    const file = path.join(knowledgeDir, `${slug}.md`);
    const raw = await fs.readFile(file, 'utf-8');
    const [firstLine, ...rest] = raw.split('\n');
    const metaMatch = firstLine.match(/^#\s+(.+?)(?:\s+\[(.*)\])?$/);
    const title = metaMatch ? metaMatch[1] : slug;
    const tags = metaMatch && metaMatch[2] ? metaMatch[2].split(',').map(t=>t.trim()) : [];
    return { slug, title, tags, content: rest.join('\n') };
  } catch {
    return null;
  }
}
