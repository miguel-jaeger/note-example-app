'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { LoadingScreen, Modal } from '../../components';
import {
  getBoardById,
  getColumns,
  getTasks,
  createColumn,
  deleteColumn,
  createTask,
  updateTask,
  deleteTask,
} from '../../lib/api';
import type { Column, Task } from '../../lib/types';

export default function BoardPage() {
  const router = useRouter();
  const params = useParams();
  const boardId = params.id as string;

  const { user, isLoading } = useAuth();

  const [boardName, setBoardName] = useState('');
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New task state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskColumn, setNewTaskColumn] = useState('');
  const [addingTask, setAddingTask] = useState(false);

  // Column modal state
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [addingColumn, setAddingColumn] = useState(false);

  // Task detail modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const [editingTaskDesc, setEditingTaskDesc] = useState('');

  useEffect(() => {
    if (user && !isLoading) {
      fetchBoardData();
    }
  }, [user, isLoading]);

  const fetchBoardData = async () => {
    if (!user) return;

    try {
      const board = await getBoardById(boardId, user.id);
      if (!board) {
        router.push('/dashboard');
        return;
      }

      setBoardName(board.name);

      const columnsData = await getColumns(boardId);
      setColumns(columnsData);

      const columnIds = columnsData.map((c) => c.id);
      const tasksData = await getTasks(columnIds);
      setTasks(tasksData);
    } catch (err: any) {
      setError(err.message || 'Failed to load board');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskColumn) return;

    setAddingTask(true);
    setError('');

    try {
      const columnTasks = tasks.filter((t) => t.column_id === newTaskColumn);
      const maxPosition = columnTasks.length > 0 ? Math.max(...columnTasks.map((t) => t.position)) : -1;

      const task = await createTask(newTaskTitle.trim(), newTaskColumn, maxPosition + 1);
      setTasks([...tasks, task]);
      setNewTaskTitle('');
      setNewTaskColumn('');
    } catch (err: any) {
      setError(err.message || 'Failed to add task');
    } finally {
      setAddingTask(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;

    try {
      await deleteTask(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
    }
  };

  const handleMoveTask = async (taskId: string, newColumnId: string) => {
    const columnTasks = tasks.filter((t) => t.column_id === newColumnId);
    const maxPosition = columnTasks.length > 0 ? Math.max(...columnTasks.map((t) => t.position)) : -1;

    try {
      await updateTask(taskId, { column_id: newColumnId, position: maxPosition + 1 });
      setTasks(tasks.map((t) => (t.id === taskId ? { ...t, column_id: newColumnId } : t)));
    } catch (err: any) {
      setError(err.message || 'Failed to move task');
    }
  };

  const handleUpdateTask = async () => {
    if (!selectedTask) return;

    try {
      await updateTask(selectedTask.id, {
        title: editingTaskTitle,
        description: editingTaskDesc || null,
      });

      setTasks(
        tasks.map((t) =>
          t.id === selectedTask.id
            ? { ...t, title: editingTaskTitle, description: editingTaskDesc || null }
            : t
        )
      );
      setSelectedTask(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    }
  };

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnName.trim()) return;

    setAddingColumn(true);
    setError('');

    try {
      const maxPosition = columns.length > 0 ? Math.max(...columns.map((c) => c.position)) : -1;
      const column = await createColumn(newColumnName.trim(), boardId, maxPosition + 1);
      setColumns([...columns, column]);
      setNewColumnName('');
      setShowColumnModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to add column');
    } finally {
      setAddingColumn(false);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!confirm('Delete this column and all its tasks?')) return;

    try {
      await deleteColumn(columnId);
      setColumns(columns.filter((c) => c.id !== columnId));
      setTasks(tasks.filter((t) => t.column_id !== columnId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete column');
    }
  };

  const openTaskModal = (task: Task) => {
    setSelectedTask(task);
    setEditingTaskTitle(task.title);
    setEditingTaskDesc(task.description || '');
  };

  if (isLoading || loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{boardName}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 overflow-x-auto">
        {error && (
          <div className="mb-6 p-4 text-sm text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Add Column Button */}
        <button
          onClick={() => setShowColumnModal(true)}
          className="mb-6 px-4 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Column
        </button>

        {/* Columns */}
        <div className="flex gap-4 items-start">
          {columns.map((column) => (
            <div key={column.id} className="flex-shrink-0 w-80 bg-zinc-200 dark:bg-zinc-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{column.name}</h3>
                <button
                  onClick={() => handleDeleteColumn(column.id)}
                  className="p-1 text-zinc-400 hover:text-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tasks in column */}
              <div className="space-y-2 mb-4 min-h-[100px]">
                {tasks
                  .filter((t) => t.column_id === column.id)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="bg-white dark:bg-zinc-700 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow group"
                      onClick={() => openTaskModal(task)}
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-zinc-900 dark:text-zinc-100 flex-1">{task.title}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task.id);
                          }}
                          className="p-1 text-zinc-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Add Task Form */}
              <form onSubmit={handleAddTask} className="space-y-2">
                <input
                  type="text"
                  value={newTaskColumn === column.id ? newTaskTitle : ''}
                  onChange={(e) => {
                    setNewTaskColumn(column.id);
                    setNewTaskTitle(e.target.value);
                  }}
                  onFocus={() => setNewTaskColumn(column.id)}
                  placeholder="Add a task..."
                  className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {newTaskColumn === column.id && newTaskTitle.trim() && (
                  <button
                    type="submit"
                    disabled={addingTask}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {addingTask ? 'Adding...' : 'Add Task'}
                  </button>
                )}
              </form>
            </div>
          ))}
        </div>

        {/* Add Column Modal */}
        <Modal
          isOpen={showColumnModal}
          onClose={() => {
            setShowColumnModal(false);
            setNewColumnName('');
          }}
          title="Add Column"
        >
          <form onSubmit={handleAddColumn} className="space-y-4">
            <input
              type="text"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="Column name..."
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowColumnModal(false);
                  setNewColumnName('');
                }}
                className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addingColumn || !newColumnName.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {addingColumn ? 'Adding...' : 'Add Column'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Task Detail Modal */}
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title="Edit Task"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={editingTaskTitle}
                onChange={(e) => setEditingTaskTitle(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Description
              </label>
              <textarea
                value={editingTaskDesc}
                onChange={(e) => setEditingTaskDesc(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a description..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Move to column
              </label>
              <select
                value={selectedTask?.column_id || ''}
                onChange={(e) => selectedTask && handleMoveTask(selectedTask.id, e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTask}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}