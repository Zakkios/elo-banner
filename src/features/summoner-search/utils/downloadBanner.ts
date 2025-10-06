import * as htmlToImage from 'html-to-image'

export interface DownloadBannerOptions {
  filename?: string
  quality?: number
  format?: 'png' | 'jpg'
}

/**
 * Télécharge un élément DOM comme une image
 * @param element - L'élément DOM à capturer
 * @param options - Options de téléchargement
 */
export async function downloadBannerAsImage(
  element: HTMLElement,
  options: DownloadBannerOptions = {}
): Promise<void> {
  const {
    filename = 'league-banner.png',
    quality = 1,
    format = 'png',
  } = options

  try {
    // Options pour html-to-image
    const scale = 2 // 2x pour une meilleure qualité
    const imageOptions = {
      quality: quality,
      pixelRatio: scale,
      cacheBust: true, // Évite les problèmes de cache
    }

    // Capturer l'élément avec html-to-image
    let dataUrl: string
    if (format === 'jpg') {
      dataUrl = await htmlToImage.toJpeg(element, imageOptions)
    } else {
      dataUrl = await htmlToImage.toPng(element, imageOptions)
    }

    // Créer un lien de téléchargement
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename

    // Déclencher le téléchargement
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Erreur lors de la capture de la bannière:', error)
    throw new Error('Impossible de télécharger la bannière')
  }
}

/**
 * Génère un nom de fichier basé sur le nom du joueur
 */
export function generateBannerFilename(playerName: string, tagLine?: string): string {
  const sanitizedName = playerName.replace(/[^a-zA-Z0-9]/g, '_')
  const sanitizedTag = tagLine ? `_${tagLine.replace(/[^a-zA-Z0-9]/g, '_')}` : ''
  return `${sanitizedName}${sanitizedTag}_banner.png`
}
