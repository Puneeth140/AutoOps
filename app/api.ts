export type Job = {
  title: string
  company: string
  location?: string
  salary?: string
  description?: string
  skills?: string[]
  url?: string
  source?: string
  posted_date?: string
  collected_at?: string
  status?: string
  match_score?: number
  matched_skills?: string[]
  missing_skills?: string[]
  keyword_matches?: string[]
}

export type CandidateProfile = {
  name?: string
  filename?: string
  skills: string[]
  projects: Array<{
    name: string
    technologies: string[]
    description: string[]
  }>
  education: string[]
  suggested_profiles: Array<{
    profile: string
    match_score: number
    matched_skills: string[]
    project_evidence: string[]
  }>
  created_at?: string
}

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
).replace(/\/$/, '')

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options?.body instanceof FormData
        ? {}
        : { 'Content-Type': 'application/json' }),
      ...(options?.headers || {}),
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`

    try {
      const body = await response.json()
      message = body.detail || message
    } catch {}

    throw new Error(message)
  }

  return response.json()
}

export const api = {
  health: () =>
    request<{ status: string }>('/health'),

  jobs: (limit = 50) =>
    request<Job[]>(`/jobs/?limit=${limit}`),

  matches: (limit = 50) =>
    request<{
      profile_skills: string[]
      total_jobs_considered: number
      matches: Job[]
    }>(`/jobs/match?limit=${limit}`),

  searchJobs: (
    keyword: string,
    location = '',
  ) =>
    request<{
      found: number
      new_jobs: number
      keyword: string
      location: string
    }>(
      '/jobs/search?' +
        new URLSearchParams({
          keyword,
          location,
        }),
      {
        method: 'POST',
      },
    ),

  profile: () =>
    request<CandidateProfile | null>(
      '/resume/profile',
    ),

  profiles: () =>
    request<CandidateProfile[]>(
      '/profiles/',
    ),

  uploadResume: async (file: File) => {
    const form = new FormData()

    form.append(
      'file',
      file,
      file.name,
    )

    console.log('Uploading resume:', {
      name: file.name,
      size: file.size,
      type: file.type,
    })

    console.log(
      'FormData file:',
      form.get('file'),
    )

    const response = await fetch(
      `${API_URL}/resume/upload`,
      {
        method: 'POST',
        body: form,
        cache: 'no-store',
      },
    )

    if (!response.ok) {
      let message = `Request failed (${response.status})`

      try {
        const body = await response.json()
        message = body.detail || message
      } catch {}

      throw new Error(message)
    }

    return response.json()
  },
}