"use client";

import { useEffect, useState } from "react";

interface GitHubUser {
  public_repos: number;
  followers: number;
  following: number;
  name: string;
  bio: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  html_url: string;
}

interface GitHubStatsProps {
  username?: string;
}

function Skeleton({ width, height }: { width: string; height: string }) {
  return (
    <div
      style={{
        width,
        height,
        background: 'rgba(94, 194, 183, 0.08)',
        borderRadius: '4px',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    />
  );
}

export function GitHubStats({ username = "seqi" }: GitHubStatsProps) {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [userRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${username}`),
          fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=6`),
        ]);

        if (!userRes.ok) throw new Error("Failed to fetch GitHub data");

        const userData = await userRes.json();
        const reposData = await reposRes.json();

        setUser(userData);
        setRepos(Array.isArray(reposData) ? reposData : []);
      } catch {
        setError("无法加载 GitHub 数据");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [username]);

  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);

  if (loading) {
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(94, 194, 183, 0.22)', borderRadius: '4px', padding: '24px' }}>
              <Skeleton width="40px" height="32px" />
              <div style={{ marginTop: '8px' }}><Skeleton width="80px" height="16px" /></div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(94, 194, 183, 0.22)', borderRadius: '4px', padding: '20px' }}>
              <Skeleton width="60%" height="20px" />
              <div style={{ marginTop: '8px' }}><Skeleton width="90%" height="14px" /></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', border: '1px solid rgba(94, 194, 183, 0.22)', borderRadius: '4px', color: 'var(--cyan)', fontFamily: 'monospace' }}>
        {error}
      </div>
    );
  }

  const stats = [
    { label: "公开仓库", value: user?.public_repos ?? 0 },
    { label: "获得 Stars", value: totalStars },
    { label: "关注者", value: user?.followers ?? 0 },
  ];

  return (
    <div>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid rgba(94, 194, 183, 0.22)',
              borderRadius: '4px',
              padding: '24px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--cyan)', fontFamily: 'var(--font-mono, monospace)', marginBottom: '4px' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Repos */}
      {repos.length > 0 && (
        <div>
          <h3 style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            热门项目
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {repos.map((repo) => (
              <a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid rgba(94, 194, 183, 0.22)',
                    borderRadius: '4px',
                    padding: '20px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = 'rgba(94, 194, 183, 0.48)';
                    el.style.boxShadow = '0 0 15px rgba(94, 194, 183, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = 'rgba(94, 194, 183, 0.22)';
                    el.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '15px', color: 'var(--cyan)', marginBottom: '6px' }}>
                    {repo.name}
                  </div>
                  {repo.description && (
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
                      {repo.description}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {repo.language && <span>{repo.language}</span>}
                    <span>★ {repo.stargazers_count}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
