
import { useState } from "react";
import "./index.css";

export default function App() {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function searchUser(e) {
    e.preventDefault();

    if (!username.trim()) return;

    setLoading(true);
    setError("");
    setUser(null);
    setRepos([]);

    try {
      const response = await fetch(
        `https://api.github.com/users/${encodeURIComponent(username.trim())}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("GitHub user nahi mila.");
        }
        if (response.status === 403) {
          throw new Error("API rate limit reached. Thodi der baad try karo.");
        }
        throw new Error("User fetch nahi ho paya.");
      }

      const data = await response.json();

      const repoResponse = await fetch(
        `https://api.github.com/users/${encodeURIComponent(username.trim())}/repos?sort=updated&per_page=6`
      );

      if (!repoResponse.ok) {
        throw new Error("Repositories load nahi ho payi. Dobara try karo.");
      }

      const repoData = await repoResponse.json();

      setUser(data);
      setRepos(repoData);
    } catch (err) {
      setError(err.message || "Network error. Internet check karo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white sm:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 text-center">
          <div className="mb-4 text-5xl">⌘</div>
          <h1 className="text-3xl font-bold sm:text-4xl">
            GitHub <span className="text-violet-400">Finder</span>
          </h1>
          <p className="mt-3 text-slate-400">
            Explore GitHub developers and their projects.
          </p>
        </header>

        <form
          onSubmit={searchUser}
          className="mb-8 flex gap-2 rounded-2xl border border-slate-700 bg-slate-900 p-2"
        >
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter GitHub username..."
            className="min-w-0 flex-1 bg-transparent px-3 py-3 outline-none placeholder:text-slate-500"
          />
          <button
            disabled={loading}
            className="rounded-xl bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-500 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {error && (
          <p className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </p>
        )}

        {loading && (
          <p className="py-10 text-center text-slate-400">
            Fetching GitHub data...
          </p>
        )}

        {user && !loading && (
          <>
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
              <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                <img
                  src={user.avatar_url}
                  alt={`${user.login}'s avatar`}
                  className="h-24 w-24 rounded-full border-2 border-violet-500"
                />

                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold">
                    {user.name || user.login}
                  </h2>
                  <p className="mt-1 text-violet-400">@{user.login}</p>
                  <p className="mt-3 text-sm text-slate-400">
                    {user.bio || "No bio available."}
                  </p>

                  <a
                    href={user.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-block rounded-lg bg-violet-600 px-4 py-2 font-medium hover:bg-violet-500"
                  >
                    View GitHub Profile ↗
                  </a>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { label: "Repositories", value: user.public_repos },
                  { label: "Followers", value: user.followers },
                  { label: "Following", value: user.following },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center"
                  >
                    <p className="text-xl font-bold">{item.value}</p>
                    <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2 text-sm text-slate-400">
                {user.location && <p>📍 {user.location}</p>}
                {user.company && <p>🏢 {user.company}</p>}
                {user.blog && (
                  <p className="break-all">
                    🔗{" "}
                    <a
                      href={
                        user.blog.startsWith("http")
                          ? user.blog
                          : `https://${user.blog}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-violet-400 hover:underline"
                    >
                      {user.blog}
                    </a>
                  </p>
                )}
              </div>
            </section>

            <section className="mt-8">
              <h2 className="mb-4 text-xl font-bold">
                Recent Public Repositories
              </h2>

              {repos.length === 0 ? (
                <p className="text-slate-400">No public repositories found.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {repos.map((repo) => (
                    <a
                      key={repo.id}
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:-translate-y-1 hover:border-violet-500"
                    >
                      <h3 className="break-words font-semibold text-violet-400">
                        {repo.name}
                      </h3>
                      <p className="mt-2 line-clamp-2 min-h-10 text-sm text-slate-400">
                        {repo.description || "No description provided."}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
                        <span>⭐ {repo.stargazers_count}</span>
                        <span>⑂ {repo.forks_count}</span>
                        {repo.language && <span>{repo.language}</span>}
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {!user && !loading && !error && (
          <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center">
            <p className="text-4xl">🔎</p>
            <h2 className="mt-4 font-semibold">Find a developer</h2>
            <p className="mt-2 text-sm text-slate-400">
              Try searching for octocat.
            </p>
          </div>
        )}

        <footer className="mt-12 text-center text-sm text-slate-500">
          Built with React, Tailwind CSS & GitHub REST API
        </footer>
      </div>
    </main>
  );
}