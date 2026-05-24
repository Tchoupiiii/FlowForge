export const meta = {
  type: 'rssParser',
  label: 'Lecture RSS',
  category: 'core'
}

function parseRssXml(xmlText) {
  const items = []
  
  // Extract feed title
  let feedTitle = 'Flux RSS'
  const feedTitleMatch = xmlText.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  if (feedTitleMatch) {
    feedTitle = feedTitleMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim()
  }

  // Regex to extract <item> (RSS) or <entry> (Atom) blocks
  const itemRegex = /<(item|entry)>([\s\S]*?)<\/\1>/gi
  let match
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[2]
    
    // Extract title
    let title = ''
    const titleMatch = itemContent.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
    if (titleMatch) {
      title = titleMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim()
    }

    // Extract link
    let link = ''
    const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/i)
    if (linkMatch) {
      link = linkMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim()
    } else {
      const linkHrefMatch = itemContent.match(/<link\s+[^>]*href=["']([\s\S]*?)["']/i)
      if (linkHrefMatch) {
        link = linkHrefMatch[1].trim()
      }
    }

    // Extract description / summary / content
    let description = ''
    const descMatch = itemContent.match(/<description[^>]*>([\s\S]*?)<\/description>/i) || 
                      itemContent.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i) ||
                      itemContent.match(/<content[^>]*>([\s\S]*?)<\/content>/i)
    if (descMatch) {
      description = descMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim()
    }
    
    // Clean up HTML tags and decode basic XML entities
    const cleanDesc = description
      .replace(/<[^>]*>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim()

    // Extract publication date
    let pubDate = ''
    const dateMatch = itemContent.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) || 
                      itemContent.match(/<published[^>]*>([\s\S]*?)<\/published>/i) ||
                      itemContent.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i)
    if (dateMatch) {
      pubDate = dateMatch[1].trim()
    }

    items.push({
      title,
      link,
      description: cleanDesc,
      pubDate,
      guid: title
    })
  }

  feedTitle = feedTitle
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

  return {
    feed: { title: feedTitle, url: '' },
    items
  }
}

export async function execute(config, inputData) {
  try {
    const rssUrl = config.rssUrl || inputData?.rssUrl || ''

    if (!rssUrl) {
      return { success: false, error: 'URL du flux RSS requise' }
    }

    let directSuccess = false
    let parsedData = null
    let fetchErrorMsg = ''

    // 1. Try fetching directly using browser headers to bypass API locks
    try {
      const response = await fetch(rssUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml, */*'
        },
        signal: AbortSignal.timeout(15000)
      })

      if (response.ok) {
        const text = await response.text()
        parsedData = parseRssXml(text)
        if (parsedData.items.length > 0) {
          directSuccess = true
        } else {
          fetchErrorMsg = 'Aucun article XML trouvé'
        }
      } else {
        fetchErrorMsg = `Status HTTP direct: ${response.status} ${response.statusText}`
      }
    } catch (err) {
      fetchErrorMsg = `Erreur direct: ${err.message}`
    }

    // 2. Fall back to rss2json if direct fetch fails
    if (!directSuccess) {
      const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`
      const response = await fetch(apiUrl, {
        signal: AbortSignal.timeout(15000)
      })

      if (!response.ok) {
        return { success: false, error: `Échec direct (${fetchErrorMsg}) & Échec API: ${response.status} ${response.statusText}` }
      }

      const data = await response.json()

      if (data.status !== 'ok') {
        return { success: false, error: `Échec direct (${fetchErrorMsg}) & Échec API RSS: ${data.message}` }
      }

      parsedData = {
        feed: data.feed,
        items: (data.items || []).map(item => ({
          title: item.title || '',
          link: item.link || '',
          description: (item.description || '').replace(/<[^>]*>/g, '').trim(),
          pubDate: item.pubDate || '',
          guid: item.guid || item.title || ''
        }))
      }
    }

    return { 
      success: true, 
      feed: parsedData.feed,
      items: parsedData.items,
      latest: parsedData.items[0] || null
    }
  } catch (error) {
    return { success: false, error: `Erreur critique RSS: ${error.message}` }
  }
}
