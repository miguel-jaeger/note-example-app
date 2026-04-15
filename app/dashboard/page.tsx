'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { LoadingScreen } from '../components';
import { getBoards, createBoard, deleteBoard } from '../lib/api';
import type { Board } from '../lib/types';

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [newBoardName, setNewBoardName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchBoards();
    }
  }, [user]);

  const fetchBoards = async () => {
    if (!user) return;
    try {
      const data = await getBoards(user.id);
      setBoards(data);
    } catch (err) {
      console.error('Error fetching boards:', err);
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim() || !user) return;

    setCreating(true);
    setError('');

    try {
      const board = await createBoard(newBoardName.trim(), user.id);
      setBoards([board, ...boards]);
      setNewBoardName('');
    } catch (err: any) {
      setError(err.message || 'Failed to create board');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    if (!confirm('Are you sure you want to delete this board?')) return;

    try {
      await deleteBoard(boardId);
      setBoards(boards.filter((b) => b.id !== boardId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete board');
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Kanban Board
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {user.email}
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            My Boards
          </h2>
        </div>

        {error && (
          <div className="mb-6 p-4 text-sm text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {/* Create Board Form */}
        <form onSubmit={handleCreateBoard} className="mb-8 flex gap-3">
          <input
            type="text"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            placeholder="New board name..."
            className="flex-1 px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={creating || !newBoardName.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Board'}
          </button>
        </form>

        {/* Boards Grid */}
        {boards.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
            <p className="text-lg mb-2">No boards yet</p>
            <p className="text-sm">Create your first board to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board) => (
              <div
                key={board.id}
                className="group bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <Link
                    href={`/board/${board.id}`}
                    className="flex-1 hover:opacity-75 transition-opacity"
                  >
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                      {board.name}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Created {new Date(board.created_at).toLocaleDateString()}
                    </p>
                  </Link>
                  <button
                    onClick={() => handleDeleteBoard(board.id)}
                    className="p-2 text-zinc-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete board"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}