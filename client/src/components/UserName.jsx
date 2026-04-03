export default function UserName({ name, setName }) {
  return (
    <div className="name">
      <span><i className="far fa-user"></i></span>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="name-input"
        maxLength="20"
      />
    </div>
  );
}