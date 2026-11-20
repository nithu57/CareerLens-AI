import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Bot,
  Send,
  Sparkles,
  ExternalLink,
  Loader2,
  RefreshCw,
  Award,
  Code,
  ArrowRight,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { askLensBot, subscribeChatHistory, saveChatMessage } from '@/services/lensBotService';
import { getLatestResumeAnalysis } from '@/services/resumeService';
import { getUserRoadmap } from '@/services/roadmapService';
import { getSavedJobs } from '@/services/jobsService';
import { ChatMessage, ResumeAnalysisRecord, RoadmapMilestone, SavedJobRecord } from '@/types';

export const LensBotPage: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const modeParam = searchParams.get('mode');
  const roleParam = searchParams.get('role');
  const targetRole = roleParam || userProfile?.targetRole || 'Software Engineer';
  const isMockMode = modeParam === 'mock-interview';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [latestResume, setLatestResume] = useState<ResumeAnalysisRecord | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapMilestone[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJobRecord[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasAutoTriggeredRef = useRef(false);

  const starterPrompts = [
    `Conduct a mock interview for ${targetRole}`,
    `Give me Question 2 for ${targetRole}`,
    'What are my highest-priority missing skills?',
    `Suggest a production portfolio project to bridge my skill gaps`,
  ];

  const handleSendMessage = useCallback(
    async (textToSend?: string) => {
      const prompt = textToSend || inputPrompt;
      if (!prompt.trim() || !currentUser || isSending) return;

      setInputPrompt('');
      setIsSending(true);

      try {
        // 1. Add user message
        const userMsg: ChatMessage = {
          id: `user-${Date.now()}`,
          userId: currentUser.uid,
          role: 'user',
          content: prompt.trim(),
          createdAt: new Date().toISOString(),
        };
        await saveChatMessage(currentUser.uid, userMsg);

        // 2. Query LensBot with context and interviewMode
        await askLensBot(currentUser.uid, prompt.trim(), {
          profile: userProfile,
          latestResume,
          roadmap,
          savedJobs,
          roleOverride: targetRole,
          interviewMode: isMockMode || prompt.toLowerCase().includes('interview'),
        });
      } catch (err) {
        console.error('Chat error:', err);
      } finally {
        setIsSending(false);
      }
    },
    [currentUser, inputPrompt, isSending, userProfile, latestResume, roadmap, savedJobs, targetRole, isMockMode]
  );

  useEffect(() => {
    if (!currentUser) return;

    // Load contextual entities
    getLatestResumeAnalysis(currentUser.uid).then((r) => setLatestResume(r));
    getUserRoadmap(currentUser.uid).then((rm) => setRoadmap(rm));
    getSavedJobs(currentUser.uid).then((sj) => setSavedJobs(sj));

    // Subscribe to chat messages
    const unsub = subscribeChatHistory(currentUser.uid, (list) => {
      if (list.length === 0) {
        // Initial greeting
        const initialGreeting: ChatMessage = {
          id: 'welcome-msg',
          userId: currentUser.uid,
          role: 'assistant',
          content: `👋 Hello ${userProfile?.displayName || 'there'}! I am **LensBot**, your AI Career Mentor.\n\nI have loaded your profile for **${targetRole}**.\n\nI can conduct **mock technical interviews**, review your **skill gaps**, critique **portfolio project architectures**, and provide live feedback. What would you like to explore today?`,
          suggestedFollowUps: starterPrompts,
          createdAt: new Date().toISOString(),
        };
        setMessages([initialGreeting]);
      } else {
        setMessages(list);
      }
    });

    return () => unsub();
  }, [currentUser, userProfile, targetRole]);

  // Handle URL auto-trigger for mock interview session
  useEffect(() => {
    if (!currentUser || hasAutoTriggeredRef.current || !isMockMode) return;

    // Trigger mock interview prompt automatically if entering via mock-interview mode
    hasAutoTriggeredRef.current = true;
    handleSendMessage(`Conduct a mock technical interview for my role as ${targetRole}`);
  }, [currentUser, isMockMode, targetRole, handleSendMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
      {/* Mentor Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white flex items-center justify-center shadow-subtle">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-navy-950">LensBot AI Career Mentor</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                Online
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Context-Aware: {targetRole} · Google Gemini Powered
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isMockMode ? (
            <button
              onClick={() => {
                setSearchParams({ mode: 'mock-interview', role: targetRole });
                handleSendMessage(`Conduct a mock technical interview for my role as ${targetRole}`);
              }}
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span>Launch Mock Interview</span>
            </button>
          ) : (
            <button
              onClick={() => handleSendMessage(`Give me Question 2 for ${targetRole}`)}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Next Question</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Mock Interview Mode Banner */}
      {isMockMode && (
        <div className="px-6 py-2.5 bg-gradient-to-r from-indigo-50/90 via-purple-50/80 to-brand-50/90 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-2 transition-all">
          <div className="flex items-center space-x-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
            </span>
            <span className="text-xs font-bold text-indigo-950">
              Live Mock Interview: <span className="text-indigo-700">{targetRole}</span>
            </span>
            <span className="text-[10px] text-slate-500 hidden md:inline">
              (Evaluated against senior industry hiring rubrics)
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => handleSendMessage(`Give me Question 2 for ${targetRole}`)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200 transition-colors shadow-2xs cursor-pointer flex items-center space-x-1"
            >
              <span>Question 2</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleSendMessage(`Give me a coding algorithmic question for ${targetRole}`)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition-colors shadow-2xs cursor-pointer flex items-center space-x-1"
            >
              <Code className="w-3 h-3 text-slate-500" />
              <span>Coding Round</span>
            </button>
            <button
              onClick={() => setSearchParams({})}
              className="px-2 py-1 rounded-lg text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer flex items-center space-x-0.5"
              title="Exit Interview Mode"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit Mode</span>
            </button>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-slate-50/30">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isUser
                    ? 'bg-brand-600 text-white'
                    : 'bg-brand-100 text-brand-700 border border-brand-200'
                }`}
              >
                {isUser ? (
                  currentUser?.displayName?.charAt(0).toUpperCase() || 'U'
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              {/* Message Bubble */}
              <div className="max-w-[85%] sm:max-w-[75%] space-y-2">
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed ${
                    isUser
                      ? 'bg-brand-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none shadow-2xs'
                  }`}
                >
                  <div className="whitespace-pre-line prose prose-xs max-w-none">
                    {msg.content}
                  </div>
                </div>

                {/* Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.citations.map((cite, idx) => (
                      <a
                        key={idx}
                        href={cite.url}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white border border-slate-200 text-brand-600 hover:bg-slate-50 transition-colors shadow-2xs"
                      >
                        <span>{cite.title}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ))}
                  </div>
                )}

                {/* Suggested Follow-Ups */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {msg.suggestedFollowUps.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        className="text-left px-2.5 py-1 rounded-xl text-[11px] font-medium bg-white text-slate-700 border border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 transition-all flex items-center space-x-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-brand-500 shrink-0" />
                        <span>{prompt}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
            <span>LensBot is evaluating...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={isSending}
            placeholder={
              isMockMode
                ? `Type your technical answer for ${targetRole} or select a starter approach...`
                : 'Ask LensBot about your resume, missing skills, mock interview questions, or projects...'
            }
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={isSending || !inputPrompt.trim()}
            className="p-2.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
