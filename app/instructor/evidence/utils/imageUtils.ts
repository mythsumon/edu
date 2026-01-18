/**
 * 이미지를 낮은 해상도로 리사이즈하고 다운로드하는 유틸리티
 */

const MAX_WIDTH = 1200 // 낮은 해상도: 최대 너비 1200px
const MAX_HEIGHT = 1200 // 낮은 해상도: 최대 높이 1200px
const QUALITY = 0.7 // JPEG 품질 (0.7 = 70%)

/**
 * 이미지를 리사이즈하여 낮은 해상도로 변환
 */
export function resizeImage(
  imageUrl: string,
  maxWidth: number = MAX_WIDTH,
  maxHeight: number = MAX_HEIGHT,
  quality: number = QUALITY
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height

      // 비율을 유지하면서 리사이즈
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context를 가져올 수 없습니다.'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)
      
      // JPEG로 변환 (낮은 품질)
      const resizedDataUrl = canvas.toDataURL('image/jpeg', quality)
      resolve(resizedDataUrl)
    }

    img.onerror = () => {
      reject(new Error('이미지를 로드할 수 없습니다.'))
    }

    img.src = imageUrl
  })
}

/**
 * 이미지를 Blob으로 변환
 */
export function dataURLToBlob(dataURL: string): Blob {
  const arr = dataURL.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  
  return new Blob([u8arr], { type: mime })
}

/**
 * 여러 이미지를 순차적으로 다운로드 (낮은 해상도)
 */
export async function downloadAllImages(
  imageUrls: string[],
  filenames: string[],
  delay: number = 500
): Promise<void> {
  for (let i = 0; i < imageUrls.length; i++) {
    try {
      await downloadImage(imageUrls[i], filenames[i] || `증빙자료_${i + 1}.jpg`)
      // 각 다운로드 사이에 약간의 지연을 두어 브라우저가 처리할 수 있도록 함
      if (i < imageUrls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    } catch (error) {
      console.error(`이미지 ${i + 1} 다운로드 중 오류:`, error)
      // 에러가 발생해도 다음 이미지 다운로드 계속 진행
    }
  }
}

/**
 * 단일 이미지를 낮은 해상도로 다운로드
 */
export async function downloadImage(
  imageUrl: string,
  filename: string
): Promise<void> {
  try {
    const resizedDataUrl = await resizeImage(imageUrl)
    const blob = dataURLToBlob(resizedDataUrl)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('이미지 다운로드 중 오류:', error)
    throw error
  }
}
