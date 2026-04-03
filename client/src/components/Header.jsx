export default function Header({ room, users = [], onLeave }) {
  return (
    <div className="bg-white border-b shadow-sm px-4 py-3 flex items-center justify-between">

      {/* Left */}
      <button
        onClick={onLeave}
        className="text-sm text-gray-600 hover:text-black"
      >
        ← Back
      </button>

      {/* Center */}
      <div className="flex flex-col items-center">

        <h2 className="text-lg font-semibold">
          Room: <span className="text-gray-600">{room}</span>
        </h2>

        <div className="flex items-center gap-2 mt-1">
          {Array.isArray(users) &&
            users.slice(0, 5).map((u, i) => (
              <div key={i} className="relative">
                <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                  {u?.name ? u.name[0].toUpperCase() : "U"}
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
              </div>
            ))}

          {users.length > 5 && (
            <span className="text-xs text-gray-500">
              +{users.length - 5}
            </span>
          )}
        </div>

      </div>

      {/* Right */}
      <div className="text-xs text-gray-500">
        {users.length} online
      </div>

    </div>
  );
}