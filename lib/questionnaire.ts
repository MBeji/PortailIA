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

export async function createQuestionnaire(department: string) {
  const file = path.join(questionnairesDir, `${department}.json`);
  const exists = await fs.stat(file).then(()=>true).catch(()=>false);
  if (exists) throw new Error('Questionnaire already exists');
  const content = { department, questions: [] as any[] };
  await fs.writeFile(file, JSON.stringify(content, null, 2), 'utf-8');
  return content;
}

export async function deleteQuestionnaire(department: string) {
  const file = path.join(questionnairesDir, `${department}.json`);
  await fs.unlink(file);
  return true;
}

export async function renameQuestionnaire(oldDep: string, newDep: string) {
  const oldFile = path.join(questionnairesDir, `${oldDep}.json`);
  const newFile = path.join(questionnairesDir, `${newDep}.json`);
  const data = await fs.readFile(oldFile, 'utf-8').catch(()=>null);
  if(!data) throw new Error('Not found');
  const parsed = JSON.parse(data);
  parsed.department = newDep;
  await fs.writeFile(newFile, JSON.stringify(parsed, null, 2), 'utf-8');
  if (oldFile !== newFile) await fs.unlink(oldFile).catch(()=>{});
  return parsed;
}

export async function importQuestionnaire(payload: any, { override = false }: { override?: boolean } = {}) {
  if (!payload || typeof payload !== 'object' || !payload.department || !Array.isArray(payload.questions)) {
    throw new Error('Invalid questionnaire payload');
  }
  const dep = payload.department;
  const file = path.join(questionnairesDir, `${dep}.json`);
  const exists = await fs.stat(file).then(()=>true).catch(()=>false);
  if (exists && !override) throw new Error('Questionnaire exists; set override to true');
  await fs.writeFile(file, JSON.stringify({ department: dep, questions: payload.questions }, null, 2), 'utf-8');
  return { department: dep, questionCount: payload.questions.length };
}
