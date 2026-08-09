"use client";

import React, { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/contexts/AuthContext";
import { timeAgo } from "@/lib/utils";
import { Bot, Send, Trash2, Search, Sparkles, User, BookOpen, X } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface HistoryItem {
  id: string;
  question: string;
  answer: string | null;
  subject: string | null;
  createdAt: string;
}

const SUBJECTS = ["General", "Web Development", "AI/ML", "Database", "Mobile", "DevOps", "Security", "Algorithms"];

export default function AIChatPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi ${user?.name?.split(" ")[0] || "there"}! 👋 I'm ProjectLink AI, your intelligent assistant for project help.\n\nI can help you with:\n• **Programming & Debugging** - Any language or framework\n• **Project Ideas** - Brainstorming and planning\n• **Technology Choices** - Which stack to use\n• **College Subjects** - Academic concepts\n• **Career Advice** - Tech career guidance\n\nWhat would you like to know?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [subject, setSubject] = useState("General");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historySearch, setHistorySearch] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetch("/api/ai/chat")
      .then((r) => r.json())
      .then((d) => setHistory(d.questions || []))
      .catch(() => {});
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    const question = input;
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, subject }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const aiMessage: Message = { role: "assistant", content: data.answer, timestamp: new Date() };
      setMessages((prev) => [...prev, aiMessage]);

      // Add to history
      setHistory((prev) => [{
        id: data.questionId,
        question,
        answer: data.answer,
        subject,
        createdAt: new Date().toISOString(),
      }, ...prev]);
    } catch (err: unknown) {
      toast.error("Failed to get AI response");
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Sorry, I couldn't process your request. Please try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      role: "assistant",
      content: "Chat cleared! How can I help you today?",
      timestamp: new Date(),
    }]);
  };

  const formatMessage = (content: string) => {
    return content
      .split("\n")
      .map((line, i) => {
        if (line.startsWith("**") && line.endsWith("**")) {
          return <p key={i} className="font-bold text-current mb-1">{line.slice(2, -2)}</p>;
        }
        if (line.startsWith("• ") || line.startsWith("- ")) {
          return <li key={i} className="ml-4 list-disc">{line.slice(2)}</li>;
        }
        if (line.includes("**")) {
          const parts = line.split("**");
          return (
            <p key={i} className="mb-1">
              {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
            </p>
          );
        }
        return line ? <p key={i} className="mb-1">{line}</p> : <br key={i} />;
      });
  };

  const filteredHistory = history.filter(
    (h) =>
      h.question.toLowerCase().includes(historySearch.toLowerCase()) ||
      (h.subject && h.subject.toLowerCase().includes(historySearch.toLowerCase()))
  );

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bot size={24} className="text-indigo-600" /> AI Assistant
          </h1>
          <p className="text-slate-500 mt-1">Get instant help with your project questions, coding problems, and more</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Chat */}
          <div className="lg:col-span-3 flex flex-col" style={{ height: "calc(100vh - 280px)", minHeight: "500px" }}>
            <Card className="flex-1 flex flex-col overflow-hidden">
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Bot size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">ProjectLink AI</p>
                    <p className="text-xs text-green-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Online
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none text-slate-600"
                  >
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={clearChat} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Clear chat">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      msg.role === "assistant" ? "bg-gradient-to-br from-indigo-500 to-purple-500" : "bg-slate-700"
                    }`}>
                      {msg.role === "assistant" ? <Bot size={16} className="text-white" /> : <User size={16} className="text-white" />}
                    </div>
                    <div className={`max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white rounded-tr-sm"
                          : "bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-sm"
                      }`}>
                        <div className="space-y-0.5">{formatMessage(msg.content)}</div>
                      </div>
                      <p className="text-xs text-slate-400">{timeAgo(msg.timestamp)}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Bot size={16} className="text-white" />
                    </div>
                    <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask about programming, project ideas, debugging..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    disabled={loading}
                  />
                  <Button onClick={sendMessage} loading={loading} disabled={!input.trim()}>
                    <Send size={16} />
                  </Button>
                </div>
                <p className="text-xs text-slate-400 mt-2 text-center">
                  Press Enter to send • Powered by ProjectLink AI
                </p>
              </div>
            </Card>
          </div>

          {/* History Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <BookOpen size={15} /> Question History
                </h3>
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 pl-7 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300"
                  />
                </div>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 380px)" }}>
                {filteredHistory.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs px-4">
                    {history.length === 0 ? "No questions yet. Start chatting!" : "No matching questions"}
                  </div>
                ) : (
                  filteredHistory.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setInput(h.question)}
                      className="w-full text-left p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors"
                    >
                      <p className="text-xs font-medium text-slate-700 line-clamp-2 mb-1">{h.question}</p>
                      <div className="flex items-center gap-1">
                        {h.subject && <Badge size="sm" variant="primary">{h.subject}</Badge>}
                        <span className="text-xs text-slate-400 ml-auto">{timeAgo(h.createdAt)}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="mt-4">
          <p className="text-xs text-slate-500 mb-2">💡 Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "Give me project ideas for final year",
              "How to implement JWT auth in Node.js?",
              "Best practices for React state management",
              "Explain microservices architecture",
              "How to set up CI/CD pipeline",
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInput(prompt)}
                className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
