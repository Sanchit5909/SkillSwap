"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users, FolderGit2, Search, Bot, MessageCircle, Upload,
  CheckSquare, TrendingUp, Zap, ArrowRight, Star, Target,
  Globe, Shield, ChevronDown, Mail, ExternalLink
} from "lucide-react";

export default function LandingPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const features = [
    { icon: Users, title: "Find Teammates", desc: "Discover students with the skills you need and connect instantly", color: "text-indigo-600 bg-indigo-50" },
    { icon: FolderGit2, title: "Create Projects", desc: "Publish your project idea and attract the right collaborators", color: "text-purple-600 bg-purple-50" },
    { icon: Search, title: "Project Discovery", desc: "Browse hundreds of student projects across all domains", color: "text-cyan-600 bg-cyan-50" },
    { icon: Bot, title: "AI Chatbot", desc: "Get instant help with coding, project ideas, and debugging", color: "text-pink-600 bg-pink-50" },
    { icon: MessageCircle, title: "Group Chat", desc: "Real-time communication with your entire project team", color: "text-orange-600 bg-orange-50" },
    { icon: Upload, title: "File Sharing", desc: "Upload and share project files, docs, and resources", color: "text-green-600 bg-green-50" },
    { icon: CheckSquare, title: "Task Management", desc: "Kanban-style board to assign tasks and track progress", color: "text-blue-600 bg-blue-50" },
    { icon: TrendingUp, title: "Progress Tracking", desc: "Visualize your project progress and team performance", color: "text-rose-600 bg-rose-50" },
  ];

  const steps = [
    { step: "01", title: "Create Account", desc: "Sign up with your college email and complete your student profile with skills and interests." },
    { step: "02", title: "Find or Create", desc: "Browse existing projects or post your own idea to attract skilled teammates." },
    { step: "03", title: "Team Up", desc: "Request to join a project or review applications from students who want to join yours." },
    { step: "04", title: "Collaborate", desc: "Work together through group chat, task management, and file sharing to build something amazing." },
  ];

  const faqs = [
    { q: "Is Project Link free for students?", a: "Yes! Project Link is completely free for all college students. Just sign up with your email and start collaborating." },
    { q: "Can I create multiple projects?", a: "Absolutely! You can create and join as many projects as you like. There's no limit on project creation or collaboration." },
    { q: "How does the AI Chatbot work?", a: "Our AI chatbot is powered by advanced language models. Ask it anything about programming, project ideas, debugging, or academic topics and get instant helpful responses." },
    { q: "Can project owners reject join requests?", a: "Yes, project owners have full control over their team. They can review applicant profiles, skills, and accept or reject requests." },
    { q: "Is my project data secure?", a: "We use industry-standard security practices including JWT authentication, encrypted passwords, and secure API routes to protect your data." },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">Project<span className="text-indigo-600">Link</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-slate-600 hover:text-slate-900">Features</a>
            <a href="#how-it-works" className="text-sm text-slate-600 hover:text-slate-900">How It Works</a>
            <a href="#faq" className="text-sm text-slate-600 hover:text-slate-900">FAQ</a>
            <Link href="/projects" className="text-sm text-slate-600 hover:text-slate-900">Projects</Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100">Login</Link>
            <Link href="/register" className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition-colors shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-indigo-700">Built for College Students</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 leading-tight mb-6">
            Find Your Team.<br />
            <span className="gradient-text">Build Your Project.</span>
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Project Link connects college students to collaborate on real projects.
            Find teammates with the right skills, manage tasks, chat in real-time, and build something amazing — together.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-indigo-200 text-base"
            >
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center justify-center gap-2 border-2 border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 font-semibold px-8 py-4 rounded-xl transition-all text-base"
            >
              <Search size={18} /> Explore Projects
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto">
            {[
              { num: "500+", label: "Active Students" },
              { num: "120+", label: "Projects" },
              { num: "50+", label: "Teams Formed" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-indigo-600">{stat.num}</div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 sm:px-6 bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">The Problem Every Student Faces</h2>
            <p className="text-slate-400 text-lg">Sound familiar?</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "😤", title: "Great Ideas, No Team", desc: "You have amazing project ideas but don't know who to work with. Your college network isn't enough." },
              { icon: "🔍", title: "Can't Find the Right Skills", desc: "You need a frontend developer, a UI designer, or a ML expert but have no way to find them on campus." },
              { icon: "💬", title: "Communication Chaos", desc: "Team discussions happen on WhatsApp, emails, Google Docs, GitHub — scattered across too many platforms." },
            ].map((p) => (
              <div key={p.title} className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <div className="text-4xl mb-4">{p.icon}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{p.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">Features</span>
            <h2 className="text-4xl font-bold text-slate-900 mt-2 mb-4">Everything You Need to Collaborate</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              LinkedIn + GitHub + Trello, designed specifically for college students.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all card-hover">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon size={22} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">How It Works</span>
            <h2 className="text-4xl font-bold text-slate-900 mt-2 mb-4">Start Collaborating in Minutes</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.step} className="relative">
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mx-auto mb-4">
                    {s.step}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 z-10">
                    <ArrowRight size={20} className="text-indigo-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why ProjectLink */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">Why Project Link?</span>
              <h2 className="text-4xl font-bold text-slate-900 mt-2 mb-6">Made for Students, by Students</h2>
              <div className="space-y-5">
                {[
                  { icon: Target, title: "Purpose-Built for College", desc: "Designed specifically for the college ecosystem, not a generic tool adapted for students." },
                  { icon: Globe, title: "All-in-One Platform", desc: "No more switching between apps. Chat, tasks, files, and code all in one place." },
                  { icon: Shield, title: "Safe & Secure", desc: "Your project ideas and code are protected with industry-standard security." },
                  { icon: Star, title: "AI-Powered Assistance", desc: "Get instant help from our AI chatbot for coding questions, project ideas, and debugging." },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon size={18} className="text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                      <p className="text-slate-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-8 text-white">
              <div className="space-y-4">
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <FolderGit2 size={14} />
                    </div>
                    <span className="font-medium text-sm">AI Study Assistant</span>
                    <span className="ml-auto bg-green-400/20 text-green-300 text-xs px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <div className="flex gap-1">
                    {["React", "Python", "TensorFlow"].map((t) => (
                      <span key={t} className="text-xs bg-white/15 px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <CheckSquare size={14} />
                    </div>
                    <span className="font-medium text-sm">Tasks</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { task: "Setup ML model", done: true },
                      { task: "Build React UI", done: true },
                      { task: "API Integration", done: false },
                    ].map((t) => (
                      <div key={t.task} className="flex items-center gap-2 text-sm">
                        <div className={`w-4 h-4 rounded border ${t.done ? "bg-green-400 border-green-400" : "border-white/40"} flex items-center justify-center`}>
                          {t.done && <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                        </div>
                        <span className={t.done ? "line-through opacity-60" : ""}>{t.task}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle size={14} />
                    <span className="font-medium text-sm">Team Chat</span>
                  </div>
                  <div className="text-xs text-white/70">Alex: Great progress on the model! 🎉</div>
                  <div className="text-xs text-white/70 mt-1">Priya: UI mockups are ready for review</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-slate-900">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform ${faqOpen === i ? "rotate-180" : ""}`}
                  />
                </button>
                {faqOpen === i && (
                  <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Find Your Dream Team?</h2>
          <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of students already collaborating on amazing projects. Create your profile in minutes.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 hover:bg-indigo-50 font-semibold px-8 py-4 rounded-xl transition-all shadow-lg text-base"
          >
            Start Collaborating Now <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Zap size={14} className="text-white" />
                </div>
                <span className="text-white font-bold">ProjectLink</span>
              </div>
              <p className="text-sm leading-relaxed">The ultimate collaboration platform for college students.</p>
            </div>
            {[
              { title: "Platform", links: ["Dashboard", "Discover Projects", "My Projects", "Groups"] },
              { title: "Features", links: ["AI Chatbot", "Group Chat", "File Sharing", "Task Management"] },
              { title: "Support", links: ["About", "Contact", "Privacy Policy", "Terms of Service"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-white font-medium mb-3 text-sm">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link href="/login" className="text-sm hover:text-white transition-colors">{link}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm">© 2024 ProjectLink. Built for college students everywhere.</p>
            <div className="flex gap-4">
              {[ExternalLink, ExternalLink, ExternalLink, Mail].map((Icon, i) => (
                <button key={i} className="hover:text-white transition-colors">
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
