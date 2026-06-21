'use client';

import * as Icons from 'lucide-react';

import React, { useEffect, useRef, useState } from 'react';

import { useToast } from '@/src/components/ui/toast-provider';

interface ConversationItem {
  id: string;
  title: string;
  updatedAt: string;
}

interface MessageItem {
  id: string;
  role: string; // USER or ASSISTANT
  content: string;
  createdAt: string;
}

function createTempMessage(content: string): MessageItem {
  return {
    id: `temp-user-${Date.now()}`,
    role: 'USER',
    content,
    createdAt: new Date().toISOString(),
  };
}

function generateTempId(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}

interface CoachClientProps {
  initialConversations: ConversationItem[];
  initialMessages: MessageItem[];
  initialActiveId: string | null;
}

export default function CoachClient({
  initialConversations,
  initialMessages,
  initialActiveId,
}: CoachClientProps) {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ConversationItem[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialActiveId);
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);

  // Input & loading states
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [deletingConversationId, setDeletingConversationId] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest message
  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  // Load message list when active conversation changes
  const handleSelectConversation = async (conversationId: string) => {
    if (activeConversationId === conversationId) return;

    setIsLoadingMessages(true);
    setErrorText(null);

    try {
      const response = await fetch(
        `/api/coach?conversationId=${encodeURIComponent(conversationId)}`,
      );
      const data = (await response.json()) as {
        success?: boolean;
        messages?: MessageItem[];
        error?: string;
      };

      if (!response.ok || !data.success || !data.messages) {
        throw new Error(data.error ?? 'Failed to load conversation history.');
      }

      setActiveConversationId(conversationId);
      setMessages(data.messages);
    } catch (err) {
      console.error(err);
      setErrorText(
        err instanceof Error ? err.message : 'Could not load messages. Please try again.',
      );
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Start new conversation locally
  const handleStartNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setInputMessage('');
    setErrorText(null);
  };

  const handleDeleteConversation = async (
    conversationId: string,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();

    if (isSending || deletingConversationId) return;

    const shouldDelete = window.confirm('Delete this AI chat? This cannot be undone.');
    if (!shouldDelete) return;

    setDeletingConversationId(conversationId);
    setErrorText(null);

    try {
      const response = await fetch(`/api/copilot/conversations/${conversationId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete conversation.');
      }

      setConversations((prev) => prev.filter((conversation) => conversation.id !== conversationId));

      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
        setMessages([]);
        setInputMessage('');
      }

      toast({
        title: 'Conversation deleted',
        description: 'The selected AI Coach thread was removed.',
        variant: 'success',
      });
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Failed to delete conversation.';
      setErrorText(message);
      toast({
        title: 'Could not delete conversation',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setDeletingConversationId(null);
    }
  };

  // Submit message handler
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isSending) return;

    setIsSending(true);
    setErrorText(null);

    // Save temporary local user message to display instantly
    const userMsgTemp = createTempMessage(textToSend);

    setMessages((prev) => [...prev, userMsgTemp]);
    setInputMessage('');

    // Pre-create temporary assistant message ID to update content progressively
    const assistantMsgTempId = generateTempId('temp-assistant');

    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          conversationId: activeConversationId || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to communicate with AI Coach.');
      }

      // 1. Check custom header for new/active conversationId
      const conversationId = response.headers.get('x-conversation-id');
      if (!conversationId) {
        throw new Error('Failed to retrieve conversation context ID.');
      }

      // 2. Initialize dynamic empty assistant bubble in log list
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgTempId,
          role: 'ASSISTANT',
          content: '',
          createdAt: new Date().toISOString(),
        },
      ]);

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response stream is not readable.');
      }

      const decoder = new TextDecoder('utf-8');

      // 3. Read stream chunks in loop
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const textChunk = decoder.decode(value, { stream: true });

        // Append text chunk progressively
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgTempId ? { ...msg, content: msg.content + textChunk } : msg,
          ),
        );
      }

      // 4. Update sidebar list and active conversation threads
      if (!activeConversationId) {
        const newConv: ConversationItem = {
          id: conversationId,
          title: textToSend.length > 30 ? `${textToSend.substring(0, 30)}…` : textToSend,
          updatedAt: new Date().toISOString(),
        };
        setConversations((prev) => [newConv, ...prev]);
        setActiveConversationId(conversationId);
      } else {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversationId ? { ...c, updatedAt: new Date().toISOString() } : c,
          ),
        );
      }
    } catch (err) {
      console.error(err);
      setErrorText(err instanceof Error ? err.message : 'Failed to send message.');
      // Remove temp messages since request failed
      setMessages((prev) =>
        prev.filter((m) => m.id !== userMsgTemp.id && m.id !== assistantMsgTempId),
      );
    } finally {
      setIsSending(false);
    }
  };

  // Preset chips list
  const starterChips = [
    {
      label: 'Lower travel emissions',
      text: 'How can I reduce my transport carbon footprint?',
      icon: Icons.Car,
      className: 'bg-blue-50 text-blue-700 ring-blue-100',
    },
    {
      label: 'Improve my meals',
      text: 'What food and diet habits save the most carbon emissions?',
      icon: Icons.Utensils,
      className: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    },
    {
      label: 'Review my budget',
      text: 'Review my monthly carbon budget logs and status.',
      icon: Icons.Target,
      className: 'bg-violet-50 text-violet-700 ring-violet-100',
    },
    {
      label: 'Reduce home energy',
      text: 'Provide three simple steps to lower my household electricity footprint.',
      icon: Icons.Zap,
      className: 'bg-amber-50 text-amber-700 ring-amber-100',
    },
  ];

  return (
    <div className="flex w-full flex-col gap-6 pb-6">
      <section className="overflow-hidden rounded-3xl border border-border-default bg-bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/15">
              <Icons.Leaf className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-text-primary">
                  Your personal reduction assistant
                </h2>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/80 px-2.5 py-1 text-xs font-black text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Ready
                </span>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                The coach uses your profile, recent logs, goals, and challenges. More complete
                activity data produces more specific advice.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleStartNewChat}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-sm font-black text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
          >
            <Icons.Plus className="h-4 w-4" aria-hidden="true" />
            New conversation
          </button>
        </div>
      </section>

      <div className="grid gap-6 xl:h-[760px] xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="flex min-h-[520px] flex-col overflow-hidden rounded-3xl border border-border-default bg-bg-surface shadow-sm xl:h-full xl:min-h-0">
          <div className="border-b border-border-subtle p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">
                  History
                </p>
                <h2 className="mt-1 text-lg font-black text-text-primary">Conversations</h2>
              </div>
              <span className="rounded-full bg-bg-elevated px-2.5 py-1 text-xs font-black tabular-nums text-text-secondary">
                {conversations.length}
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {conversations.length > 0 ? (
              conversations.map((conv) => {
                const isActive = activeConversationId === conv.id;
                const isDeleting = deletingConversationId === conv.id;
                return (
                  <div
                    key={conv.id}
                    className={`group flex items-center gap-1 rounded-2xl border p-1 transition-colors ${
                      isActive
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-transparent hover:border-border-subtle hover:bg-bg-elevated/70'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectConversation(conv.id)}
                      disabled={isDeleting}
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/25 disabled:opacity-60"
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          isActive
                            ? 'bg-emerald-600 text-white'
                            : 'bg-bg-elevated text-text-secondary'
                        }`}
                      >
                        <Icons.MessageSquare className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block truncate text-sm ${
                            isActive ? 'font-black text-emerald-900' : 'font-bold text-text-primary'
                          }`}
                        >
                          {conv.title}
                        </span>
                        <span className="mt-0.5 block text-xs font-medium text-text-muted">
                          {new Date(conv.updatedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={(event) => handleDeleteConversation(conv.id, event)}
                      disabled={isDeleting || isSending}
                      aria-label={`Delete ${conv.title}`}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-text-muted opacity-0 transition-all hover:bg-red-50 hover:text-red-600 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/25 disabled:opacity-50 group-hover:opacity-100"
                    >
                      {isDeleting ? (
                        <Icons.Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Icons.Trash2 className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center px-4 py-12 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-elevated text-text-muted">
                  <Icons.MessagesSquare className="h-5 w-5" />
                </span>
                <p className="mt-4 text-sm font-black text-text-primary">No conversations yet</p>
                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  Choose a prompt or ask your first question.
                </p>
              </div>
            )}
          </div>
        </aside>

        <section className="flex min-h-[680px] flex-col overflow-hidden rounded-3xl border border-border-default bg-bg-surface shadow-sm xl:h-full xl:min-h-0">
          <div className="flex items-center justify-between gap-4 border-b border-border-subtle p-4 sm:p-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-base font-black text-text-primary">
                  {activeConversationId
                    ? conversations.find((conversation) => conversation.id === activeConversationId)
                        ?.title || 'Carbon Coach conversation'
                    : 'Start a new conversation'}
                </h2>
                <p className="mt-0.5 text-xs font-semibold text-text-secondary">
                  Advice grounded in your Carbon Compass data
                </p>
              </div>
            </div>
            <span className="hidden rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700 sm:inline-flex">
              Personalized
            </span>
          </div>

          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6">
            {errorText && (
              <div
                role="alert"
                className="mb-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800"
              >
                <Icons.AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <span>{errorText}</span>
              </div>
            )}

            {isLoadingMessages ? (
              <div className="flex h-full min-h-96 flex-col items-center justify-center gap-3 text-text-secondary">
                <Icons.Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
                <p className="text-sm font-semibold">Loading conversation…</p>
              </div>
            ) : messages.length > 0 ? (
              <div className="mx-auto max-w-3xl space-y-5">
                {messages.map((message) => {
                  const isUser = message.role === 'USER';
                  return (
                    <div
                      key={message.id}
                      className={`flex items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                          <Icons.Leaf className="h-4 w-4" />
                        </span>
                      )}
                      <div
                        className={`max-w-[88%] rounded-3xl px-4 py-3 text-sm leading-6 sm:max-w-[78%] ${
                          isUser
                            ? 'rounded-br-md bg-slate-900 text-white'
                            : 'rounded-bl-md border border-border-subtle bg-bg-elevated/70 text-text-primary'
                        }`}
                      >
                        <div className="space-y-1.5 whitespace-pre-wrap">
                          {message.content.split('\n').map((line, index) => {
                            const isBullet =
                              line.trim().startsWith('* ') || line.trim().startsWith('- ');
                            const isNumbered = /^\d+\.\s/.test(line.trim());
                            const contentLine = isBullet
                              ? line.replace(/^[\s]*(?:\*|-)\s+/, '• ')
                              : line;
                            const parts = contentLine.split(/(\*\*.*?\*\*)/g);

                            return (
                              <p
                                key={index}
                                className={isBullet || isNumbered ? 'pl-4 -indent-4' : ''}
                              >
                                {parts.map((part, partIndex) =>
                                  part.startsWith('**') && part.endsWith('**') ? (
                                    <strong key={partIndex} className="font-black">
                                      {part.slice(2, -2)}
                                    </strong>
                                  ) : (
                                    part
                                  ),
                                )}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isSending && (
                  <div className="flex items-end gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                      <Icons.Leaf className="h-4 w-4" />
                    </span>
                    <div className="flex items-center gap-1.5 rounded-3xl rounded-bl-md border border-border-subtle bg-bg-elevated/70 px-4 py-4">
                      {[0, 150, 300].map((delay) => (
                        <span
                          key={delay}
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-secondary"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mx-auto flex h-full min-h-[520px] max-w-3xl flex-col justify-center py-8">
                <div className="text-center">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                    <Icons.Sparkles className="h-8 w-8" />
                  </span>
                  <h2 className="mt-5 text-2xl font-black tracking-tight text-text-primary">
                    What would you like to improve?
                  </h2>
                  <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-text-secondary">
                    Start with one of these questions or write your own. The coach will use the
                    information available in your account.
                  </p>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {starterChips.map((chip) => {
                    const ChipIcon = chip.icon;
                    return (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => handleSendMessage(chip.text)}
                        disabled={isSending}
                        className="group rounded-3xl border border-border-default bg-bg-base p-4 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/25 disabled:opacity-50"
                      >
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-2xl ring-1 ${chip.className}`}
                        >
                          <ChipIcon className="h-5 w-5" />
                        </span>
                        <span className="mt-4 block text-sm font-black text-text-primary">
                          {chip.label}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-text-secondary">
                          {chip.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border-subtle bg-bg-elevated/30 p-4 sm:p-5">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSendMessage(inputMessage);
              }}
              className="mx-auto max-w-3xl"
            >
              <div className="flex items-end gap-2 rounded-3xl border border-border-default bg-bg-surface p-2 shadow-sm focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/10">
                <textarea
                  name="copilot-message"
                  aria-label="Message Carbon Coach"
                  autoComplete="off"
                  rows={1}
                  placeholder="Ask about your footprint, goals, meals, travel, or energy…"
                  value={inputMessage}
                  onChange={(event) => setInputMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      handleSendMessage(inputMessage);
                    }
                  }}
                  disabled={isSending}
                  className="max-h-36 min-h-11 flex-1 resize-none border-0 bg-transparent px-3 py-2.5 text-sm leading-6 text-text-primary outline-none ring-0 placeholder:text-text-muted focus:border-0 focus:outline-none focus:ring-0 focus-visible:border-0 focus-visible:outline-none focus-visible:ring-0 disabled:opacity-50"
                  style={{ outline: 'none', boxShadow: 'none' }}
                  id="copilot-message-input"
                />
                <button
                  type="submit"
                  disabled={isSending || !inputMessage.trim()}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm transition-all hover:bg-emerald-700 disabled:pointer-events-none disabled:opacity-40"
                  id="copilot-send-button"
                  aria-label="Send message"
                >
                  {isSending ? (
                    <Icons.Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icons.ArrowUp className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-center text-xs font-medium text-text-muted">
                Enter to send · Shift + Enter for a new line
              </p>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
