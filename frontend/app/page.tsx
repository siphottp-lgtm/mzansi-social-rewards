'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [statusText, setStatusText] = useState('');

  const goTo = (path: string, label: string) => {
    setStatusText(`Opening ${label} (${path})...`);
    try {
      router.push(path);
    } catch {
      window.location.assign(path);
    }
  };

  const features = [
    {
      title: 'Official announcements',
      desc: 'Admins can mark posts as official and attach photos so members never miss important news.',
      emoji: '📢',
      path: '/login/',
    },
    {
      title: 'Events & RSVP',
      desc: 'Create events with cover images, track attendance, and send reminders.',
      emoji: '📅',
      path: '/login/',
    },
    {
      title: 'Photos & media',
      desc: 'Upload avatars, community logos, and post images. Real media makes communities feel alive.',
      emoji: '🖼️',
      path: '/login/',
    },
  ];

  return (
    <div className="space-y-12">
      <section className="relative rounded-3xl overflow-hidden text-white shadow-xl border border-black/10">
        {/* South African Flag Background */}
        <svg
          viewBox="0 0 900 600"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <rect width="900" height="200" fill="#E03C31" />
          <rect y="400" width="900" height="200" fill="#001489" />
          <path d="M0,0 L450,300 L0,600 Z" fill="#000000" />
          <path
            d="M0,0 L450,300 L900,300 L900,200 L480,200 L180,0 Z M0,600 L450,300 L900,300 L900,400 L480,400 L180,600 Z"
            fill="#FFFFFF"
          />
          <path
            d="M0,0 L450,300 L900,300 L900,240 L465,240 L105,0 Z M0,600 L450,300 L900,300 L900,360 L465,360 L105,600 Z"
            fill="#007749"
          />
          <path d="M0,72 L342,300 L0,528 L0,480 L270,300 L0,120 Z" fill="#FFB81C" />
        </svg>
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />

        <div className="relative z-10 px-8 py-20 md:py-28 text-center">
          <p className="text-sm uppercase tracking-widest text-[#FFB81C] font-bold mb-3 drop-shadow">
            Two Hands are Better than One
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5 drop-shadow">
            Mzansi
          </h1>
          <p className="text-lg md:text-xl text-white/95 max-w-2xl mx-auto mb-10 drop-shadow">
            Stay connected with your community — official announcements, events, groups,
            stories, and local rewards powered by Mzansi.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              type="button"
              onClick={() => goTo('/register/', 'Get started')}
              className="inline-block bg-[#007749] text-white border-2 border-white px-7 py-3 rounded-xl font-semibold hover:bg-[#005f3a] active:scale-95 transition shadow-lg cursor-pointer touch-manipulation"
            >
              Get started
            </button>
            <button
              type="button"
              onClick={() => goTo('/login/', 'Sign in')}
              className="inline-block bg-black/60 border-2 border-[#FFB81C] text-white px-7 py-3 rounded-xl font-semibold hover:bg-black/80 active:scale-95 transition shadow-lg cursor-pointer touch-manipulation"
            >
              Sign in
            </button>
          </div>
          {statusText && (
            <p className="mt-4 text-xs font-mono text-[#FFB81C] bg-black/75 px-3 py-2 rounded-lg break-all">
              {statusText}
            </p>
          )}
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        {features.map((f) => (
          <button
            key={f.title}
            type="button"
            onClick={() => goTo(f.path, f.title)}
            className="text-left bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-[#007749] transition cursor-pointer touch-manipulation"
          >
            <div className="text-3xl mb-3">{f.emoji}</div>
            <h3 className="font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
          </button>
        ))}
      </section>
    </div>
  );
}