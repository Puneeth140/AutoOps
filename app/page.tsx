'use client'

import { useEffect, useState, type ReactNode } from 'react'
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  Clock3,
  FileText,
  Gauge,
  LayoutDashboard,
  MapPin,
  Menu,
  Play,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  Upload,
  UserRound,
  X,
  Zap,
} from 'lucide-react'
import { api, type CandidateProfile, type Job } from './api'

const navItems = [
  ['Dashboard', LayoutDashboard],
  ['Job Discovery', Search],
  ['Job Matches', Target],
  ['My Profile', UserRound],
  ['Resume', FileText],
] as const

type IconType = typeof BriefcaseBusiness

type ProfileWithName = CandidateProfile & {
  name?: string
  full_name?: string
}

const JOBS_PAGE_SIZE = 100
const MATCHES_PAGE_SIZE = 100
const RECOMMENDATION_LIMIT = 5
const SUGGESTED_PROFILE_LIMIT = 6
const STRONG_MATCH_THRESHOLD = 80
const EXCELLENT_MATCH_THRESHOLD = 90
const MAX_RESUME_SIZE_LABEL = 'Maximum 5 MB'
const RESUME_ACCEPT =
  '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

function getProfileName(profile: CandidateProfile | null) {
  const candidate = profile as ProfileWithName | null
  return candidate?.name?.trim() || candidate?.full_name?.trim() || 'Candidate'
}

function getInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'CA'
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(value?: string) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  const minutes = Math.max(
    0,
    Math.round((Date.now() - date.getTime()) / 60000),
  )

  if (minutes < 60) return `${minutes}m ago`
  if (minutes < 1440) return `${Math.round(minutes / 60)}h ago`
  return `${Math.round(minutes / 1440)}d ago`
}

function scoreClass(value = 0) {
  return value >= EXCELLENT_MATCH_THRESHOLD
    ? 'score-strong'
    : value >= STRONG_MATCH_THRESHOLD
      ? 'score-good'
      : 'score-neutral'
}

function Score({ value, large = false }: { value?: number; large?: boolean }) {
  const score = Math.round(value || 0)
  return (
    <span
      className={`score ${scoreClass(score)} ${large ? 'score-large' : ''}`}
    >
      {score}%
    </span>
  )
}

function getProfileCompleteness(profile: CandidateProfile | null) {
  if (!profile) return 0

  const checks = [
    Boolean(profile.filename),
    profile.skills.length > 0,
    profile.projects.length > 0,
    profile.education.length > 0,
    profile.suggested_profiles.length > 0,
  ]

  return Math.round(
    (checks.filter(Boolean).length / checks.length) * 100,
  )
}

function Sidebar({
  active,
  setActive,
  open,
  setOpen,
  online,
  profile,
}: {
  active: string
  setActive: (value: string) => void
  open: boolean
  setOpen: (value: boolean) => void
  online: boolean | null
  profile: CandidateProfile | null
}) {
  const name = getProfileName(profile)
  const initials = getInitials(name)

  const statusText =
    online === null
      ? 'Checking connection…'
      : online
        ? 'All systems operational'
        : 'Backend unavailable'

  return (
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand-row">
        <div className="brand-mark">
          <Zap size={16} fill="currentColor" />
        </div>
        <div>
          <div className="brand-name">AutoOps</div>
          <div className="brand-sub">JobHunter</div>
        </div>
        <button
          className="mobile-close"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        >
          <X size={18} />
        </button>
      </div>

      <div className="workspace">
        <div className="workspace-avatar">{initials}</div>
        <div>
          <div className="workspace-name">
            {profile ? `${name}'s workspace` : 'Your workspace'}
          </div>
          <div className="workspace-plan">Job search workspace</div>
        </div>
      </div>

      <nav className="nav-list">
        {navItems.map(([label, Icon]) => (
          <button
            key={label}
            className={`nav-item ${active === label ? 'nav-active' : ''}`}
            onClick={() => {
              setActive(label)
              setOpen(false)
            }}
          >
            <Icon size={17} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="api-status">
          <span
            className={`status-dot ${online === false ? 'status-offline' : ''}`}
          />
          <div>
            <div className="api-label">API status</div>
            <div className="api-online">{statusText}</div>
          </div>
        </div>

        <div className="user-row">
          <div className="user-avatar">{initials}</div>
          <div className="user-meta">
            <div className="user-name">{name}</div>
            <div className="user-email">AutoOps user</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

function Header({
  title,
  subtitle,
  setOpen,
  profile,
}: {
  title: string
  subtitle: string
  setOpen: (value: boolean) => void
  profile: CandidateProfile | null
}) {
  const initials = getInitials(getProfileName(profile))

  return (
    <header className="topbar">
      <button
        className="mobile-menu"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="top-actions">
        <div className="top-avatar">{initials}</div>
      </div>
    </header>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = '',
}: {
  icon: IconType
  label: string
  value: string
  detail: string
  tone?: string
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon size={17} />
      </div>
      <div className="stat-info">
        <span className="eyebrow">{label}</span>
        <div className="stat-value-row">
          <strong>{value}</strong>
        </div>
        <span className="stat-detail">{detail}</span>
      </div>
    </div>
  )
}

function JobCard({ job }: { job: Job }) {
  const visibleSkills = (job.matched_skills || job.skills || []).slice(0, 4)
  const visibleMissing = (job.missing_skills || []).slice(0, 1)

  return (
    <article className="job-card">
      <div className="job-main">
        <div className="company-logo blue">{(job.company || '?')[0]}</div>

        <div className="job-copy">
          <div className="job-title-row">
            <h3>{job.title || 'Untitled job'}</h3>
            <Score value={job.match_score} />
          </div>

          <p className="company-line">
            {job.company || 'Unknown company'}
            <span>·</span>
            <MapPin size={13} />
            {job.location || 'Remote'}
          </p>

          <div className="skill-row">
            {visibleSkills.map(skill => (
              <span className="skill-chip" key={skill}>
                {skill}
              </span>
            ))}
            {visibleMissing.map(skill => (
              <span className="missing-chip" key={skill}>
                + {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="job-footer">
        <span className="posted">
          <Clock3 size={13} />
          {formatDate(job.posted_date || job.collected_at)}
        </span>

        {job.url ? (
          <a
            className="text-button"
            href={job.url}
            target="_blank"
            rel="noreferrer"
          >
            View job <ArrowUpRight size={14} />
          </a>
        ) : null}
      </div>
    </article>
  )
}

function Dashboard({
  jobs,
  profile,
  refresh,
  loading,
  onNavigate,
}: {
  jobs: Job[]
  profile: CandidateProfile | null
  refresh: () => void
  loading: boolean
  onNavigate: (page: string) => void
}) {
  const name = getProfileName(profile)
  const strongMatches = jobs.filter(
    job => (job.match_score || 0) >= STRONG_MATCH_THRESHOLD,
  ).length

  const averageMatch = jobs.length
    ? Math.round(
        jobs.reduce(
          (sum, job) => sum + (job.match_score || 0),
          0,
        ) / jobs.length,
      )
    : 0

  const completeness = getProfileCompleteness(profile)

  return (
    <>
      <div className="page-heading-actions">
        <div />
        <div className="heading-actions">
          <button
            className="button secondary"
            onClick={() => onNavigate('Job Discovery')}
          >
            <Search size={15} />
            Search jobs
          </button>
          <button
            className="button primary"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <section className="stats-grid">
        <StatCard
          icon={BriefcaseBusiness}
          label="Jobs stored"
          value={String(jobs.length)}
          detail="from your latest scan"
          tone="blue-tone"
        />
        <StatCard
          icon={Sparkles}
          label="Profile skills"
          value={String(profile?.skills.length || 0)}
          detail="detected from resume"
          tone="orange-tone"
        />
        <StatCard
          icon={Target}
          label="Strong matches"
          value={String(strongMatches)}
          detail={`${STRONG_MATCH_THRESHOLD}% match or higher`}
          tone="green-tone"
        />
        <StatCard
          icon={Gauge}
          label="Average match"
          value={`${averageMatch}%`}
          detail="across loaded jobs"
          tone="purple-tone"
        />
      </section>

      <div className="content-grid">
        <section>
          <div className="section-heading">
            <div>
              <h2>{profile ? `Recommended for ${name}` : 'Recommended jobs'}</h2>
              <p>Opportunities ranked by your latest profile data</p>
            </div>
            <button
              className="subtle-link"
              onClick={() => onNavigate('Job Matches')}
            >
              View all <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="jobs-stack">
            {jobs
              .slice(0, RECOMMENDATION_LIMIT)
              .map((job, index) => (
                <JobCard
                  job={job}
                  key={`${job.url || job.title || 'job'}-${index}`}
                />
              ))}

            {!jobs.length && (
              <EmptyState
                title="No jobs yet"
                text="Run a search from Job Discovery to collect opportunities."
              />
            )}
          </div>
        </section>

        <aside className="profile-card">
          <div className="section-heading">
            <div>
              <h2>Your profile</h2>
              <p>Based on your latest resume analysis</p>
            </div>
          </div>

          <div className="profile-person">
            <div className="profile-avatar">{getInitials(name)}</div>
            <div>
              <strong>{name}</strong>
              <span>{profile ? 'Profile analyzed' : 'No resume yet'}</span>
            </div>
            <button
              className="edit-link"
              onClick={() => onNavigate('My Profile')}
            >
              View
            </button>
          </div>

          <div className="progress-wrap">
            <div className="progress-label">
              <span>Profile completeness</span>
              <strong>{completeness}%</strong>
            </div>
            <div className="progress-track">
              <div
                className="progress-bar"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>

          <div className="profile-list">
            <div>
              <FileText size={16} />
              <span>Resume analyzed</span>
              <strong>{profile ? 'Ready' : 'Missing'}</strong>
            </div>
            <div>
              <Sparkles size={16} />
              <span>Skills detected</span>
              <strong>{profile?.skills.length || 0}</strong>
            </div>
            <div>
              <RefreshCw size={16} />
              <span>Last updated</span>
              <strong>{formatDate(profile?.created_at)}</strong>
            </div>
          </div>

          <button
            className="button full secondary"
            onClick={() => onNavigate(profile ? 'My Profile' : 'Resume')}
          >
            <UserRound size={15} />
            {profile ? 'View profile' : 'Upload resume'}
          </button>
        </aside>
      </div>
    </>
  )
}

function Discovery({
  jobs,
  runSearch,
  searching,
  initialKeyword,
  initialLocation,
}: {
  jobs: Job[]
  runSearch: (keyword: string, location: string) => void
  searching: boolean
  initialKeyword: string
  initialLocation: string
}) {
  const [keyword, setKeyword] = useState(initialKeyword)
  const [location, setLocation] = useState(initialLocation)

  return (
    <>
      <div className="filter-bar">
        <div className="search-field">
          <Search size={16} />
          <input
            value={keyword}
            onChange={event => setKeyword(event.target.value)}
            placeholder="Search roles, skills, or companies"
          />
        </div>

        <div className="search-field location-field">
          <MapPin size={16} />
          <input
            value={location}
            onChange={event => setLocation(event.target.value)}
            placeholder="Location (optional)"
          />
        </div>

        <button
          className="button primary"
          onClick={() => runSearch(keyword.trim(), location.trim())}
          disabled={searching}
        >
          <Play size={14} fill="currentColor" />
          {searching ? 'Searching…' : 'Run job search'}
        </button>
      </div>

      <div className="results-head">
        <div>
          <h2>{jobs.length} stored opportunities</h2>
          <p>Live data from your JobHunter database</p>
        </div>
      </div>

      <div className="discovery-table">
        <div className="table-header">
          <span>Job</span>
          <span>Location</span>
          <span>Match</span>
          <span>Posted</span>
          <span>Actions</span>
        </div>

        {jobs.map((job, index) => (
          <div
            className="table-row"
            key={`${job.url || job.title || 'job'}-${index}`}
          >
            <div className="table-job">
              <div className="company-logo small blue">
                {(job.company || '?')[0]}
              </div>
              <div>
                <strong>{job.title || 'Untitled job'}</strong>
                <span>{job.company || 'Unknown company'}</span>
              </div>
            </div>

            <span className="table-location">
              {job.location || 'Remote'}
            </span>
            <Score value={job.match_score} />
            <span className="table-posted">
              {formatDate(job.posted_date || job.collected_at)}
            </span>

            {job.url ? (
              <a
                className="row-action"
                href={job.url}
                target="_blank"
                rel="noreferrer"
              >
                View <ArrowUpRight size={14} />
              </a>
            ) : (
              <span />
            )}
          </div>
        ))}

        {!jobs.length && (
          <div className="empty-row">
            No jobs stored yet. Run a search to populate this list.
          </div>
        )}
      </div>
    </>
  )
}

function Matches({
  matches,
  loading,
  reload,
}: {
  matches: Job[]
  loading: boolean
  reload: () => void
}) {
  return (
    <>
      <div className="results-head">
        <div>
          <h2>{matches.length} ranked matches</h2>
          <p>Explainable scores based on your latest resume</p>
        </div>
        <button
          className="button secondary"
          onClick={reload}
          disabled={loading}
        >
          <RefreshCw size={14} />
          Refresh matches
        </button>
      </div>

      <div className="jobs-stack">
        {matches.map((job, index) => (
          <JobCard
            job={job}
            key={`${job.url || job.title || 'match'}-${index}`}
          />
        ))}

        {!matches.length && (
          <EmptyState
            title="No matches available"
            text="Upload a resume and run a job search first."
          />
        )}
      </div>
    </>
  )
}

function Profile({ profile }: { profile: CandidateProfile | null }) {
  const name = getProfileName(profile)
  const skills = profile?.skills || []
  const completeness = getProfileCompleteness(profile)

  return (
    <>
      <div className="profile-hero">
        <div className="large-avatar">{getInitials(name)}</div>
        <div>
          <h2>{name}</h2>
          <p>
            {profile
              ? 'Profile generated from the latest uploaded resume'
              : 'Upload a resume to build your profile'}
          </p>
          <span>{profile ? `${completeness}% profile completeness` : 'No profile data yet'}</span>
        </div>
      </div>

      <section className="profile-detail-grid">
        <div className="detail-card">
          <div className="section-heading">
            <div>
              <h2>Extracted skills</h2>
              <p>
                {profile
                  ? `Detected from ${profile.filename || 'your resume'}`
                  : 'Upload a resume to populate your profile'}
              </p>
            </div>
            <span className="skill-count">{skills.length} skills</span>
          </div>

          {skills.length > 0 ? (
            <div className="skill-group">
              <span>Skills</span>
              <div>
                {skills.map(skill => (
                  <span className="skill-chip filled" key={skill}>
                    {skill.replaceAll('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              title="No profile yet"
              text="Upload your resume to extract skills and project evidence."
            />
          )}
        </div>

        <div className="detail-card">
          <div className="section-heading">
            <div>
              <h2>Suggested profiles</h2>
              <p>Based on detected skills and project evidence</p>
            </div>
          </div>

          {(profile?.suggested_profiles || [])
            .slice(0, SUGGESTED_PROFILE_LIMIT)
            .map(item => (
              <div className="health-line" key={item.profile}>
                <span>{item.profile}</span>
                <strong>{Math.round(item.match_score)}%</strong>
              </div>
            ))}

          {!profile?.suggested_profiles?.length && (
            <p className="muted-copy">No profile suggestions yet.</p>
          )}
        </div>
      </section>
    </>
  )
}

function ResumePage({
  profile,
  onUploaded,
}: {
  profile: CandidateProfile | null
  onUploaded: (profile: CandidateProfile) => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function upload(file?: File) {
    if (!file) return

    setError('')
    setBusy(true)

    try {
      const result = await api.uploadResume(file)
      onUploaded(result)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <label className="resume-card upload-label">
        <div className="upload-icon">
          <Upload size={21} />
        </div>
        <h2>{busy ? 'Analyzing your resume…' : 'Upload your resume'}</h2>
        <p>Choose your latest resume to extract skills and project evidence.</p>
        <span>PDF or DOCX · {MAX_RESUME_SIZE_LABEL}</span>
        <span className="button primary">
          <Upload size={15} />
          Choose resume
        </span>
        <input
          type="file"
          accept={RESUME_ACCEPT}
          hidden
          onChange={event => upload(event.target.files?.[0])}
        />
      </label>

      {error && <div className="error-banner">{error}</div>}

      {profile && (
        <>
          <section className="resume-status">
            <div className="success-icon">
              <Check size={17} />
            </div>
            <div>
              <strong>Resume analyzed successfully</strong>
              <p>
                {profile.skills.length} skills and {profile.projects.length}{' '}
                projects detected.
              </p>
            </div>
          </section>

          <div className="resume-file">
            <FileText size={20} />
            <div>
              <strong>{profile.filename || 'Latest resume'}</strong>
              <span>Latest analyzed profile</span>
            </div>
          </div>
        </>
      )}
    </>
  )
}

function EmptyState({
  title,
  text,
}: {
  title: string
  text: string
}) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  )
}

export default function App() {
  const [active, setActive] = useState('Dashboard')
  const [open, setOpen] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [matches, setMatches] = useState<Job[]>([])
  const [profile, setProfile] = useState<CandidateProfile | null>(null)
  const [online, setOnline] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState({
    keyword: '',
    location: '',
  })

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  const loadJobs = async () => {
    const data = await api.jobs(JOBS_PAGE_SIZE)
    setJobs(data)
    return data
  }

  const loadMatches = async () => {
    const data = await api.matches(MATCHES_PAGE_SIZE)
    setMatches(data.matches)
    return data.matches
  }

  const mergeJobMatches = (jobList: Job[], matchList: Job[]) =>
    jobList.map(job => {
      const match = matchList.find(item => item.url === job.url)
      return match
        ? {
            ...job,
            match_score: match.match_score,
            matched_skills: match.matched_skills,
            missing_skills: match.missing_skills,
            keyword_matches: match.keyword_matches,
          }
        : job
    })

  const refresh = async () => {
    setLoading(true)

    try {
      await api.health()
      setOnline(true)
    } catch (error) {
      console.error('Backend health check failed:', error)
      setOnline(false)
    }

    try {
      const [jobsData, profileData] = await Promise.all([
        api.jobs(JOBS_PAGE_SIZE),
        api.profile(),
      ])

      setProfile(profileData)

      if (profileData) {
        try {
          const matchData = await api.matches(MATCHES_PAGE_SIZE)
          setMatches(matchData.matches)
          setJobs(mergeJobMatches(jobsData, matchData.matches))
        } catch (error) {
          console.error('Failed to load matches:', error)
          setMatches([])
          setJobs(jobsData)
        }
      } else {
        setMatches([])
        setJobs(jobsData)
      }

      notify('Live data refreshed')
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Refresh failed')
    } finally {
      setLoading(false)
    }
  }

  const runSearch = async (keyword: string, location: string) => {
    if (!keyword) return notify('Enter a keyword first')

    setLoading(true)
    setSearch({ keyword, location })

    try {
      const result = await api.searchJobs(keyword, location)
      const freshJobs = await api.jobs(JOBS_PAGE_SIZE)

      try {
        const matchData = await api.matches(MATCHES_PAGE_SIZE)
        setMatches(matchData.matches)
        setJobs(mergeJobMatches(freshJobs, matchData.matches))
      } catch (error) {
        console.error('Failed to refresh matches after search:', error)
        setMatches([])
        setJobs(freshJobs)
      }

      notify(`${result.found} jobs found · ${result.new_jobs} new`)
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Job search failed')
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    const initialize = async () => {
      setLoading(true)

      try {
        await api.health()
        setOnline(true)
      } catch (error) {
        console.error('Backend health check failed:', error)
        setOnline(false)
      }

      try {
        const [jobsData, profileData] = await Promise.all([
          api.jobs(JOBS_PAGE_SIZE),
          api.profile(),
        ])

        setProfile(profileData)

        if (profileData) {
          try {
            const matchData = await api.matches(MATCHES_PAGE_SIZE)
            setMatches(matchData.matches)
            setJobs(mergeJobMatches(jobsData, matchData.matches))
          } catch (error) {
            console.error('Failed to load initial matches:', error)
            setMatches([])
            setJobs(jobsData)
          }
        } else {
          setJobs(jobsData)
        }
      } catch (error) {
        console.error('Failed to load initial application data:', error)
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [])

  const pageInfo: Record<string, [string, string]> = {
    Dashboard: [
      `${getGreeting()}, ${getProfileName(profile)}`,
      'Your automated job search at a glance.',
    ],
    'Job Discovery': [
      'Job discovery',
      'Find new opportunities automatically.',
    ],
    'Job Matches': [
      'Job matches',
      'Your highest-signal opportunities, ranked for you.',
    ],
    'My Profile': [
      'My profile',
      'Manage the skills and experience we match against.',
    ],
    Resume: [
      'Resume',
      'Keep your source profile fresh and ready to match.',
    ],
  }

  let content: ReactNode

  if (active === 'Dashboard') {
    content = (
      <Dashboard
        jobs={jobs}
        profile={profile}
        refresh={refresh}
        loading={loading}
        onNavigate={setActive}
      />
    )
  } else if (active === 'Job Discovery') {
    content = (
      <Discovery
        jobs={jobs}
        runSearch={runSearch}
        searching={loading}
        initialKeyword={search.keyword}
        initialLocation={search.location}
      />
    )
  } else if (active === 'Job Matches') {
    content = (
      <Matches
        matches={matches}
        loading={loading}
        reload={async () => {
          setLoading(true)
          try {
            await loadMatches()
            notify('Matches refreshed')
          } catch (error) {
            notify(
              error instanceof Error
                ? error.message
                : 'Could not load matches',
            )
          } finally {
            setLoading(false)
          }
        }}
      />
    )
  } else if (active === 'My Profile') {
    content = <Profile profile={profile} />
  } else {
    content = (
      <ResumePage
        profile={profile}
        onUploaded={uploadedProfile => {
          setProfile(uploadedProfile)
          notify('Resume analyzed successfully')
        }}
      />
    )
  }

  const [title, subtitle] = pageInfo[active]

  return (
    <div className="app-shell">
      <Sidebar
        active={active}
        setActive={setActive}
        open={open}
        setOpen={setOpen}
        online={online}
        profile={profile}
      />

      <main className="main-content">
        <Header
          title={title}
          subtitle={subtitle}
          setOpen={setOpen}
          profile={profile}
        />
        <div className="page-content">{content}</div>
      </main>

      {toast && (
        <div className="toast">
          <Check size={15} />
          {toast}
        </div>
      )}
    </div>
  )
}
