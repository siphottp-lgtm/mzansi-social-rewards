'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const goTo = (path: string) => {
    try {
      router.push(path);
    } catch {
      window.location.assign(path);
    }
  };

  return (
    <div className="space-y-12">
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>
        <div className="relative px-8 py-20 md:py-28 text-center">
          <p className="text-sm uppercase tracking-widest text-blue-100 font-semibold mb-3">
            Two Hands are Better than One
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
            Mzansi
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            Stay connected with your community — official announcements, events, groups,
            stories, and local rewards powered by Mzansi.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              type="button"
              onClick={() => goTo('/register/')}
              className="bg-white text-blue-700 px-7 py-3 rounded-xl font-semibold hover:bg-blue-50 transition shadow-lg cursor-pointer"
            >
              Get started
            </button>
            <Link
              href="/login/"
              onClick={(e) => {
                e.preventDefault();
                goTo('/login/');
              }}
              className="border-2 border-white/40 text-white px-7 py-3 rounded-xl font-semibold hover:bg-white/10 transition"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        {[
          {
            title: 'Official announcements',
            desc: 'Admins can mark posts as official and attach photos so members never miss important news.',
            emoji: '📢',
          },
          {
            title: 'Events & RSVP',
            desc: 'Create events with cover images, track attendance, and send reminders.',
            emoji: '📅',
          },
          {
            title: 'Photos & media',
            desc: 'Upload avatars, community logos, and post images. Real media makes communities feel alive.',
            emoji: '🖼️',
          },
        ].map((f) => (
          <div
            key={f.title}
            className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition"
          >
            <div className="text-3xl mb-3">{f.emoji}</div>
            <h3 className="font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
