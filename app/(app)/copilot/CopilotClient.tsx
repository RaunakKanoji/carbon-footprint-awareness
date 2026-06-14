'use client';

import * as Icons from 'lucide-react';

import React, { useEffect, useRef, useState } from 'react';

import PageHeader from '@/components/app/page-header';
import { useToast } from '@/components/ui/toast-provider';

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

interface CopilotClientProps {
  initialConversations: ConversationItem[];
  initialMessages: MessageItem[];
  initialActiveId: string | null;
}

export default function CopilotClient({
  initialConversations,
  initialMessages,
  initialActiveId,
}: CopilotClientProps) {
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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  // Load message list when active conversation changes
  const handleSelectConversation = async (conversationId: string) => {
    if (activeConversationId === conversationId) return;

    setActiveConversationId(conversationId);
    setIsLoadingMessages(true);
    setErrorText(null);

    try {
      const response = await fetch(`/api/copilot?conversationId=${conversationId}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setMessages(data.messages);
      } else {
        throw new Error(data.error || 'Failed to load conversation history.');
      }
    } catch (err) {
      console.error(err);
      setErrorText('Could not load messages. Please try again.');
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
        description: 'The selected AI Copilot thread was removed.',
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
      const response = await fetch('/api/copilot', {
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
      label: 'Suggest transport reduction tips',
      text: 'How can I reduce my transport carbon footprint?',
    },
    {
      label: 'Green meal adjustments',
      text: 'What food and diet habits save the most carbon emissions?',
    },
    {
      label: 'Analyze monthly budget targets',
      text: 'Review my monthly carbon budget logs and status.',
    },
    {
      label: 'Energy saving recommendations',
      text: 'Provide three simple steps to lower my household electricity footprint.',
    },
  ];

  return (
    <div className="space-y-6 w-full flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] min-h-[500px]">
      <PageHeader
        title="AI Carbon Copilot"
        description="Interact with your personal AI coach to get customized carbon reduction recommendations."
        badge="Copilot Active"
      />

      <div className="min-h-0 flex-1 overflow-visible">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full overflow-visible">
          {/* LEFT COLUMN: Sidebar Chat History */}
          <div className="lg:col-span-1 bg-bg-surface border border-border-default/60 rounded-2xl flex flex-col overflow-hidden h-full shadow-sm">
            {/* Header */}
            <div className="p-4 border-b border-border-default shrink-0 bg-bg-base/30">
              <button
                onClick={handleStartNewChat}
                className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent-primary px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-primary/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25"
                id="new-chat-button"
              >
                <Icons.Plus className="w-4 h-4" aria-hidden="true" />
                <span>New Conversation</span>
              </button>
            </div>

            {/* List area */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <h4 className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-text-muted">
                Recent Threads
              </h4>

              {conversations.length > 0 ? (
                conversations.map((conv) => {
                  const isActive = activeConversationId === conv.id;
                  const isDeleting = deletingConversationId === conv.id;
                  return (
                    <div
                      key={conv.id}
                      className={`group flex w-full items-center gap-1 rounded-xl border pr-1 text-xs transition-colors ${
                        isActive
                          ? 'border-accent-primary/15 bg-accent-primary-dim text-accent-primary'
                          : 'border-transparent text-text-secondary hover:bg-bg-elevated/70 hover:text-text-primary'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectConversation(conv.id)}
                        disabled={isDeleting}
                        className={`flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25 disabled:cursor-not-allowed disabled:opacity-60 ${
                          isActive ? 'font-semibold' : ''
                        }`}
                      >
                        <Icons.MessageSquare
                          className={`h-4 w-4 shrink-0 ${
                            isActive ? 'text-accent-primary' : 'text-text-muted'
                          }`}
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1 truncate">{conv.title}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(event) => handleDeleteConversation(conv.id, event)}
                        disabled={isDeleting || isSending}
                        aria-label={`Delete ${conv.title}`}
                        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-text-muted opacity-0 transition-[background-color,color,opacity] hover:bg-red-500/10 hover:text-red-600 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/25 disabled:cursor-not-allowed disabled:opacity-50 group-hover:opacity-100"
                      >
                        {isDeleting ? (
                          <Icons.Loader className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                        ) : (
                          <Icons.Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center p-6 text-text-muted text-xs">
                  No past conversations. Start a new one!
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Chat Area workspace */}
          <div className="lg:col-span-3 bg-bg-surface border border-border-default/60 rounded-2xl flex flex-col overflow-hidden h-full shadow-sm relative">
            {/* Active Title bar */}
            <div className="p-4 border-b border-border-default bg-bg-base/20 flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded-full bg-accent-primary-dim flex items-center justify-center text-accent-primary">
                <Icons.Sparkles className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-bold text-text-primary text-xs tracking-tight">
                  {activeConversationId
                    ? conversations.find((c) => c.id === activeConversationId)?.title ||
                      'AI Chat Coach'
                    : 'New Conversation Thread'}
                </h3>
                <p className="mt-0.5 text-xs font-medium text-text-secondary">
                  Dynamic carbon-centric suggestions
                </p>
              </div>
            </div>

            {/* Messages list thread */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {errorText && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-800 dark:text-red-300 rounded-xl flex items-start gap-2 text-xs font-medium animate-slide-in">
                  <Icons.AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <span>{errorText}</span>
                </div>
              )}

              {isLoadingMessages ? (
                <div className="flex flex-col items-center justify-center h-full text-text-secondary gap-3">
                  <Icons.Loader className="w-7 h-7 text-accent-primary animate-spin" />
                  <p className="text-xs font-medium">Loading history messages…</p>
                </div>
              ) : messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((m) => {
                    const isUser = m.role === 'USER';
                    return (
                      <div
                        key={m.id}
                        className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                            isUser
                              ? 'bg-zinc-800 text-white rounded-br-none shadow-sm'
                              : 'bg-bg-elevated/80 text-text-primary border border-border-subtle rounded-bl-none shadow-sm'
                          }`}
                        >
                          {/* Simple markdown parsing for bold & linebreaks */}
                          <div className="space-y-1.5 whitespace-pre-wrap">
                            {m.content.split('\n').map((line, idx) => {
                              // Render simple bullets
                              const isBullet =
                                line.trim().startsWith('* ') || line.trim().startsWith('- ');
                              const isNumbered = /^\d+\.\s/.test(line.trim());

                              let contentLine = line;
                              if (isBullet)
                                contentLine = contentLine.replace(/^[\s]*(?:\*|-)\s+/, '• ');

                              // Parse bold matches (**text**)
                              const parts = contentLine.split(/(\*\*.*?\*\*)/g);
                              const parsedLine = parts.map((part, pIdx) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  return (
                                    <strong
                                      key={pIdx}
                                      className="font-extrabold text-text-primary dark:text-white"
                                    >
                                      {part.slice(2, -2)}
                                    </strong>
                                  );
                                }
                                return part;
                              });

                              return (
                                <p
                                  key={idx}
                                  className={`${isBullet || isNumbered ? 'pl-4 -indent-4' : ''}`}
                                >
                                  {parsedLine}
                                </p>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Loading typing bubble */}
                  {isSending && (
                    <div className="flex justify-start animate-pulse">
                      <div className="bg-bg-elevated/80 text-text-primary border border-border-subtle rounded-2xl rounded-bl-none px-4 py-3.5 flex items-center gap-1.5">
                        <span
                          className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce"
                          style={{ animationDelay: '0ms' }}
                        />
                        <span
                          className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        />
                        <span
                          className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                /* Starter prompt guidelines screen */
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6 max-w-lg mx-auto py-8">
                  <div className="w-14 h-14 rounded-full bg-accent-primary-dim text-accent-primary flex items-center justify-center shadow-md animate-pulse">
                    <Icons.Sparkles className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-text-primary text-sm">
                      How can I assist your reduction goals today?
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Ask me about your log targets, electricity bills, public transport
                      alternatives, or custom dietary reduction ideas.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-4">
                    {starterChips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(chip.text)}
                        className="flex cursor-pointer flex-col justify-between rounded-xl border border-border-default/60 bg-bg-base/40 p-3 text-left text-xs font-semibold text-text-secondary transition-[background-color,border-color,box-shadow] hover:border-accent-primary/30 hover:bg-bg-elevated hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25"
                      >
                        <span className="text-xs font-bold uppercase tracking-wide text-accent-primary">
                          {chip.label}
                        </span>
                        <span className="mt-1 font-medium leading-relaxed">
                          &ldquo;{chip.text}&rdquo;
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form input messaging bar */}
            <div className="p-4 border-t border-border-default bg-bg-base/30 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputMessage);
                }}
                className="flex items-center gap-2.5"
              >
                <input
                  type="text"
                  name="copilot-message"
                  aria-label="Message"
                  autoComplete="off"
                  placeholder="Ask your Coach a question…"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isSending}
                  className="flex-1 rounded-xl border border-border-default bg-bg-surface px-4 py-2.5 text-sm text-text-primary transition-colors placeholder:text-text-muted focus-visible:border-accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
                  id="copilot-message-input"
                />
                <button
                  type="submit"
                  disabled={isSending || !inputMessage.trim()}
                  className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-accent-primary text-white shadow-sm transition-colors hover:bg-accent-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
                  id="copilot-send-button"
                  aria-label="Send Message"
                >
                  <Icons.Send className="w-4.5 h-4.5" aria-hidden="true" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
