import html2canvas from 'html2canvas'

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
    // Capturer l'élément avec html2canvas
    const canvas = await html2canvas(element, {
      backgroundColor: null, // Transparent
      scale: 2, // 2x pour une meilleure qualité
      useCORS: true, // Permet de charger les images cross-origin
      logging: false, // Désactiver les logs
      allowTaint: true, // Permet les images de différentes origines
      imageTimeout: 15000, // Timeout pour le chargement des images
    })

    // Convertir le canvas en blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Impossible de créer l\'image'))
            return
          }

          // Créer un lien de téléchargement
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = filename

          // Déclencher le téléchargement
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)

          // Nettoyer
          URL.revokeObjectURL(url)
          resolve()
        },
        format === 'jpg' ? 'image/jpeg' : 'image/png',
        quality
      )
    })
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
