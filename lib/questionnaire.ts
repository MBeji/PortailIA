import fs from 'fs/promises';
import path from 'path';

const questionnairesDir = path.join(process.cwd(), 'data', 'questionnaires');

export async function getQuestionnaire(department: string) {
  try {
    const file = path.join(questionnairesDir, `${department}.json`);
    const data = await fs.readFile(file, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function saveQuestionnaire(department: string, content: any) {
  const file = path.join(questionnairesDir, `${department}.json`);
  await fs.writeFile(file, JSON.stringify(content, null, 2), 'utf-8');
  return content;
}

export async function upsertQuestion(department: string, question: any) {
  const current = await getQuestionnaire(department) || { department, questions: [] };
  const idx = current.questions.findIndex((q: any) => q.id === question.id);
  if(idx >= 0) current.questions[idx] = question; else current.questions.push(question);
  await saveQuestionnaire(department, current);
  return question;
}

export async function deleteQuestion(department: string, questionId: string) {
  const current = await getQuestionnaire(department);
  if(!current) return false;
  const next = { ...current, questions: current.questions.filter((q: any) => q.id !== questionId) };
  await saveQuestionnaire(department, next);
  return true;
}

export async function getAllQuestionnaires() {
  try {
    const files = await fs.readdir(questionnairesDir);
    const list = await Promise.all(files.filter(f => f.endsWith('.json')).map(async f => {
      const data = await fs.readFile(path.join(questionnairesDir, f), 'utf-8');
      const parsed = JSON.parse(data);
      return { department: parsed.department, questionCount: parsed.questions.length };
    }));
    return list;
  } catch {
    return [];
  }
}
