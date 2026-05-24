const fs = require('fs')
const path = require('path')
const pdf = require('pdf-parse')

export default {
  meta: {
    type: 'pdfParser',
    name: 'Extracteur PDF',
    description: 'Extrait le texte d\'un fichier PDF local ou distant',
    category: 'core',
    inputs: 1,
    outputs: 1
  },

  async execute(config, inputData) {
    const fileUrlOrPath = config.filePath || ''

    if (!fileUrlOrPath) {
      throw new Error('Extracteur PDF: Le chemin ou l\'URL du fichier est requis')
    }

    try {
      let dataBuffer;
      
      // Check if it's an HTTP URL or a local file
      if (fileUrlOrPath.startsWith('http://') || fileUrlOrPath.startsWith('https://')) {
        const response = await fetch(fileUrlOrPath)
        if (!response.ok) {
          throw new Error(`HTTP Error ${response.status}: ${response.statusText}`)
        }
        const arrayBuffer = await response.arrayBuffer()
        dataBuffer = Buffer.from(arrayBuffer)
      } else {
        // Local file
        const resolvedPath = path.resolve(fileUrlOrPath)
        if (!fs.existsSync(resolvedPath)) {
           throw new Error(`Le fichier n'existe pas : ${resolvedPath}`)
        }
        dataBuffer = fs.readFileSync(resolvedPath)
      }
      
      const data = await pdf(dataBuffer)
      
      // data.text, data.numpages, data.info
      return {
        text: data.text.trim().substring(0, 50000), // Limit to ~50k to avoid huge memory spike
        pages: data.numpages
      }
    } catch (err) {
      throw new Error(`Extracteur PDF: Échec de la lecture (${err.message})`)
    }
  }
}

