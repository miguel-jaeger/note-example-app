import insforge from './insforge';
import { Board, Column, Task } from './types';

// ============== BOARDS ==============

export async function getBoards(userId: string): Promise<Board[]> {
  const { data, error } = await insforge.database
    .from('boards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getBoardById(boardId: string, userId: string): Promise<Board | null> {
  const { data, error } = await insforge.database
    .from('boards')
    .select('*')
    .eq('id', boardId)
    .eq('user_id', userId)
    .single();

  if (error) return null;
  return data;
}

export async function createBoard(name: string, userId: string): Promise<Board> {
  const { data, error } = await insforge.database
    .from('boards')
    .insert({ name, user_id: userId })
    .select()
    .single();

  if (error) throw error;

  // Create default columns
  const defaultColumns = [
    { name: 'To Do', position: 0, board_id: data.id },
    { name: 'In Progress', position: 1, board_id: data.id },
    { name: 'Done', position: 2, board_id: data.id },
  ];

  await insforge.database.from('columns').insert(defaultColumns);

  return data;
}

export async function deleteBoard(boardId: string): Promise<void> {
  const { error } = await insforge.database
    .from('boards')
    .delete()
    .eq('id', boardId);

  if (error) throw error;
}

// ============== COLUMNS ==============

export async function getColumns(boardId: string): Promise<Column[]> {
  const { data, error } = await insforge.database
    .from('columns')
    .select('*')
    .eq('board_id', boardId)
    .order('position', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createColumn(name: string, boardId: string, position: number): Promise<Column> {
  const { data, error } = await insforge.database
    .from('columns')
    .insert({ name, board_id: boardId, position })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteColumn(columnId: string): Promise<void> {
  const { error } = await insforge.database
    .from('columns')
    .delete()
    .eq('id', columnId);

  if (error) throw error;
}

// ============== TASKS ==============

export async function getTasks(columnIds: string[]): Promise<Task[]> {
  if (columnIds.length === 0) return [];

  const { data, error } = await insforge.database
    .from('tasks')
    .select('*')
    .in('column_id', columnIds)
    .order('position', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createTask(title: string, columnId: string, position: number): Promise<Task> {
  const { data, error } = await insforge.database
    .from('tasks')
    .insert({ title, column_id: columnId, position })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTask(
  taskId: string,
  updates: { title?: string; description?: string | null; column_id?: string; position?: number }
): Promise<Task> {
  const { data, error } = await insforge.database
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await insforge.database
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) throw error;
}