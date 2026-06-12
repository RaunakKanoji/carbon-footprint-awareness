'use client';

import * as Icons from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import PageHeader from '@/components/app/page-header';
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
  const [conversations, setConversations] = useState<ConversationItem[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialActiveId);
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);

  // Input & loading states
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
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
            msg.id === assistantMsgTempId ? { ...msg, content: msg.content + textChunk } : msg
          )
        );
      }

      // 4. Update sidebar list and active conversation threads
      if (!activeConversationId) {
        const newConv: ConversationItem = {
          id: conversationId,
          title: textToSend.length > 30 ? textToSend.substring(0, 30) + '...' : textToSend,
          updatedAt: new Date().toISOString(),
        };
        setConversations((prev) => [newConv, ...prev]);
        setActiveConversationId(conversationId);
      } else {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversationId ? { ...c, updatedAt: new Date().toISOString() } : c
          )
        );
      }
    } catch (err) {
      console.error(err);
      setErrorText(err instanceof Error ? err.message : 'Failed to send message.');
      // Remove temp messages since request failed
      setMessages((prev) => prev.filter((m) => m.id !== userMsgTemp.id && m.id !== assistantMsgTempId));
    } finally {
      setIsSending(false);
    }
  };

  // Preset chips list
  const starterChips = [
    { label: 'Suggest transport reduction tips', text: 'How can I reduce my transport carbon footprint?' },
    { label: 'Green meal adjustments', text: 'What food and diet habits save the most carbon emissions?' },
    { label: 'Analyze monthly budget targets', text: 'Review my monthly carbon budget logs and status.' },
    { label: 'Energy saving recommendations', text: 'Provide three simple steps to lower my household electricity footprint.' },
  ];

  return (
    <div className="space-y-6 w-full flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] min-h-[500px]">
      <PageHeader
        title="AI Carbon Copilot"
        description="Interact with your personal AI coach to get customized carbon reduction recommendations."
        badge="Copilot Active"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 overflow-hidden h-full">
        {/* LEFT COLUMN: Sidebar Chat History */}
        <div className="lg:col-span-1 bg-bg-surface border border-border-default/60 rounded-2xl flex flex-col overflow-hidden h-full shadow-sm">
          {/* Header */}
          <div className="p-4 border-b border-border-default shrink-0 bg-bg-base/30">
            <button
              onClick={handleStartNewChat}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 text-xs font-bold rounded-xl bg-accent-primary hover:bg-accent-primary/95 text-white shadow-sm transition-all cursor-pointer"
              id="new-chat-button"
            >
              <Icons.Plus className="w-4 h-4" />
              <span>New Conversation</span>
            </button>
          </div>

          {/* List area */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-3 py-2">
              Recent Threads
            </h4>

            {conversations.length > 0 ? (
              conversations.map((conv) => {
                const isActive = activeConversationId === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-accent-primary-dim text-accent-primary font-semibold border border-accent-primary/15'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated/70 border border-transparent'
                    }`}
                  >
                    <Icons.MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-accent-primary' : 'text-text-muted'}`} />
                    <span className="truncate flex-1">{conv.title}</span>
                    <Icons.ChevronRight className="w-3 h-3 text-text-faint opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
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
                  ? conversations.find((c) => c.id === activeConversationId)?.title || 'AI Chat Coach'
                  : 'New Conversation Thread'}
              </h3>
              <p className="text-[10px] text-text-secondary font-medium mt-0.5">
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
                <p className="text-xs font-medium">Loading history messages...</p>
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
                            const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ');
                            const isNumbered = /^\d+\.\s/.test(line.trim());
                            
                            let contentLine = line;
                            if (isBullet) contentLine = contentLine.replace(/^[\s]*(?:\*|-)\s+/, '• ');

                            // Parse bold matches (**text**)
                            const parts = contentLine.split(/(\*\*.*?\*\*)/g);
                            const parsedLine = parts.map((part, pIdx) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return (
                                  <strong key={pIdx} className="font-extrabold text-text-primary dark:text-white">
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
                      <span className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
                    Ask me about your log targets, electricity bills, public transport alternatives, or custom dietary reduction ideas.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-4">
                  {starterChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip.text)}
                      className="p-3 bg-bg-base/40 border border-border-default/60 hover:bg-bg-elevated hover:border-accent-primary/30 rounded-xl text-left transition-all text-xs font-semibold text-text-secondary cursor-pointer flex flex-col justify-between hover:shadow-sm"
                    >
                      <span className="text-text-primary font-bold text-[11px] uppercase tracking-wide text-accent-primary">
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
                placeholder="Ask your Coach a question..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isSending}
                className="flex-1 px-4 py-2.5 text-xs bg-bg-surface border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all disabled:opacity-50"
                id="copilot-message-input"
              />
              <button
                type="submit"
                disabled={isSending || !inputMessage.trim()}
                className="p-2.5 rounded-xl bg-accent-primary hover:bg-accent-primary/95 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shrink-0 shadow-sm"
                id="copilot-send-button"
              >
                <Icons.Send className="w-4.5 h-4.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
