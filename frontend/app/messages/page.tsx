'use client';

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col">
      <header className="bg-white/95 backdrop-blur-sm shadow-sm px-6 py-3 flex items-center justify-between border-b-2 border-[#007749]">
        <h1 className="text-2xl font-extrabold text-[#007749]">🇿🇦 Mzansi Messenger</h1>
        <a href="/dashboard" className="font-semibold text-[#007749] hover:underline">Back to Feed</a>
      </header>

      <div className="max-w-4xl w-full mx-auto flex-1 grid grid-cols-3 bg-white shadow-sm my-4 rounded-xl overflow-hidden">
        <div className="border-r p-4 space-y-3">
          <h3 className="font-bold text-sm text-gray-500 uppercase">Chats</h3>
          <div className="p-2 bg-green-50 rounded-lg cursor-pointer">
            <h4 className="font-semibold text-sm">Amo Mphela</h4>
            <p className="text-xs text-gray-500 truncate">Sharp! Let's catch up on Mzansi later.</p>
          </div>
        </div>
        <div className="col-span-2 flex flex-col justify-between p-4">
          <div className="border-b pb-3 font-semibold">Amo Mphela</div>
          <div className="flex-1 py-4 space-y-3 overflow-y-auto">
            <div className="bg-gray-100 p-3 rounded-lg max-w-xs text-sm">Sharp! Let's catch up on Mzansi later.</div>
          </div>
          <div className="flex gap-2 pt-2 border-t">
            <input type="text" placeholder="Type a message..." className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#007749]" />
            <button className="bg-[#007749] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#005f3a]">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}