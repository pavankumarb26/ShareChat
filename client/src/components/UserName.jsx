export default function UserName({ name, setName }) {
  return (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm w-[420px]">
      
      {/* Icon */}
      <span className="text-gray-500 text-lg">
        👤
      </span>

      {/* Input */}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength="20"
        placeholder="Enter your name"
        className="flex-1 text-sm outline-none bg-transparent"
      />

    </div>
  );
}