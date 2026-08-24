function Profile({ user }) {

  return (
    <div>

      <div className="page-heading">

        <div>
          <span className="eyebrow">
            ACCOUNT
          </span>

          <h1>My Profile</h1>

          <p>
            Your account information.
          </p>
        </div>

      </div>

      <div className="profile-card">

        <div className="profile-avatar">
          {user.fullName?.charAt(0)}
        </div>

        <h2>{user.fullName}</h2>

        <span className="status-badge">
          {user.role}
        </span>

        <div className="profile-grid">

          <div>
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>

          <div>
            <span>User ID</span>
            <strong>#{user.userId}</strong>
          </div>

          <div>
            <span>Account Type</span>
            <strong>{user.role}</strong>
          </div>

          <div>
            <span>Authentication</span>
            <strong>JWT Secured ✓</strong>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;