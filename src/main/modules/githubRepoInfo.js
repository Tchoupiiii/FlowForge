export default {
  meta: {
    type: 'githubRepoInfo',
    name: 'GitHub Repo Info',
    description: 'Récupère les informations publiques d\'un dépôt GitHub (stars, forks, description)',
    category: 'api',
    inputs: 1,
    outputs: 1
  },

  async execute(config, inputData) {
    const owner = config.owner || inputData.owner
    const repo = config.repo || inputData.repo

    if (!owner || !repo) {
      throw new Error('GitHub Repo Info: owner et repo sont requis')
    }

    const url = `https://api.github.com/repos/${owner}/${repo}`
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'FlowForge-App'
      }
    })

    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return {
      name: data.full_name,
      description: data.description,
      stars: data.stargazers_count,
      forks: data.forks_count,
      language: data.language,
      url: data.html_url,
      timestamp: Date.now()
    }
  }
}
