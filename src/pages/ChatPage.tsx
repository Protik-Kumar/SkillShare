import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  MessageSquare,
  ShieldCheck,
  Search,
  ExternalLink,
  CheckCircle2,
  Phone,
  ArrowLeft,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatters';

export const ChatPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialConvId = searchParams.get('conv');

  const { conversations, messages, sendMessage, orders, profiles } = useData();
  const { currentUser } = useAuth();

  const userConversations = conversations.filter(
    (c) => currentUser && c.participants.includes(currentUser.uid)
  );

  const [activeConvId, setActiveConvId] = useState<string>(
    initialConvId || userConversations[0]?.id || ''
  );
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [showAttachInput, setShowAttachInput] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialConvId) {
      setActiveConvId(initialConvId);
    } else if (!activeConvId && userConversations.length > 0) {
      setActiveConvId(userConversations[0].id);
    }
  }, [initialConvId, userConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConvId]);

  const activeConv = conversations.find((c) => c.id === activeConvId);

  // Determine other participant
  const otherUserId = activeConv?.participants.find((p) => p !== currentUser?.uid) || '';
  const otherUserDetails = activeConv?.participantDetails?.[otherUserId] || {
    name: 'Collaborator',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
  };

  // Associated order if any
  const associatedOrder = activeConv?.orderId
    ? orders.find((o) => o.id === activeConv.orderId)
    : orders.find((o) => o.clientId === otherUserId || o.freelancerId === otherUserId);

  const activeMessages = messages.filter((m) => m.conversationId === activeConvId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachmentUrl.trim()) return;

    sendMessage(
      activeConvId,
      inputText.trim() || 'Attached deliverable',
      attachmentUrl.trim() || undefined,
      attachmentUrl.trim() ? 'project_files.zip' : undefined
    );

    setInputText('');
    setAttachmentUrl('');
    setShowAttachInput(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 py-3 sm:py-6 transition-colors flex items-center justify-center">
      <div className="max-w-6xl w-full mx-auto px-2 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden flex h-[680px] sm:h-[750px]">
          {/* Left Column: Conversations List */}
          <aside className={`${activeConvId ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-slate-200 dark:border-slate-800 flex-col shrink-0`}>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <span>Messages & Contracts</span>
              </h2>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {userConversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No conversations yet. Message a freelancer from their profile or a job proposal!
                </div>
              ) : (
                userConversations.map((conv) => {
                  const otherUid = conv.participants.find((p) => p !== currentUser?.uid) || '';
                  const otherInfo = conv.participantDetails?.[otherUid] || { name: 'User' };
                  const isSelected = conv.id === activeConvId;

                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => setActiveConvId(conv.id)}
                      className={`w-full text-left p-4 flex items-start gap-3 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-l-4 border-indigo-600'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <img
                        src={otherInfo.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                        alt={otherInfo.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {otherInfo.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {conv.lastMessageAt ? formatDate(conv.lastMessageAt) : ''}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {conv.lastMessage}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Right Column: Chat Thread */}
          <main className={`${!activeConvId ? 'hidden md:flex' : 'flex'} flex-1 flex-col min-w-0 bg-slate-50/50 dark:bg-slate-950/40`}>
            {activeConv ? (
              <>
                {/* Chat Header */}
                <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => setActiveConvId('')}
                      className="md:hidden p-1.5 -ml-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer shrink-0"
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <img
                      src={otherUserDetails.avatar}
                      alt={otherUserDetails.name}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {otherUserDetails.name}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Online in Bangladesh"></span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-slate-500 truncate block">
                        {otherUserDetails.headline || 'SkillShare Member'}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/profile/${otherUserId}`}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 ml-2"
                  >
                    View Profile
                  </Link>
                </div>

                {/* Related Order Banner if connected to a contract */}
                {associatedOrder && (
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 border-b border-indigo-100 dark:border-indigo-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-slate-700 dark:text-slate-200 font-medium">
                        Order #{associatedOrder.orderNumber}: <strong className="text-indigo-600 dark:text-indigo-400">{associatedOrder.title}</strong> ({associatedOrder.status})
                      </span>
                    </div>
                    <Link
                      to="/dashboard"
                      className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Manage Escrow &rarr;
                    </Link>
                  </div>
                )}

                {/* Message Stream */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {activeMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-xs text-slate-400 space-y-2">
                      <MessageSquare className="w-8 h-8 text-slate-300" />
                      <span>Start collaborating! Send your project details or files below.</span>
                    </div>
                  ) : (
                    activeMessages.map((msg) => {
                      const isMe = msg.senderId === currentUser?.uid;

                      return (
                        <div
                          key={msg.id}
                          className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isMe && (
                            <img
                              src={msg.senderAvatar || otherUserDetails.avatar}
                              alt={msg.senderName}
                              className="w-7 h-7 rounded-full object-cover shrink-0"
                            />
                          )}

                          <div
                            className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1.5 shadow-sm ${
                              isMe
                                ? 'bg-indigo-600 text-white rounded-br-none'
                                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 rounded-bl-none'
                            }`}
                          >
                            <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>

                            {/* Attachment link if present */}
                            {msg.fileUrl && (
                              <div className="pt-1">
                                <a
                                  href={msg.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] border ${
                                    isMe
                                      ? 'bg-indigo-700/80 text-white border-indigo-500'
                                      : 'bg-slate-100 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 border-slate-200 dark:border-slate-600'
                                  }`}
                                >
                                  <Paperclip className="w-3 h-3" />
                                  <span>{msg.fileName || 'Attached Deliverable File'}</span>
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                              </div>
                            )}

                            <div
                              className={`text-[9px] text-right ${
                                isMe ? 'text-indigo-200' : 'text-slate-400'
                              }`}
                            >
                              {formatDate(msg.createdAt)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Attachment input drawer */}
                {showAttachInput && (
                  <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-slate-400" />
                    <input
                      type="url"
                      value={attachmentUrl}
                      onChange={(e) => setAttachmentUrl(e.target.value)}
                      placeholder="Paste deliverable file link (Google Drive, GitHub, Figma)..."
                      className="flex-1 text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                )}

                {/* Input Bar */}
                <form
                  onSubmit={handleSend}
                  className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={() => setShowAttachInput(!showAttachInput)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Attach file link"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message or milestone update..."
                    className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />

                  <button
                    type="submit"
                    className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Select a conversation on the left to start chatting.
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
