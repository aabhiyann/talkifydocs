import { cn, absoluteUrl } from '../utils'

describe('Utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      expect(cn('class1', { class2: true, class3: false })).toBe('class1 class2')
    })

    it('should handle undefined and null values', () => {
      expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2')
    })
  })

  describe('absoluteUrl', () => {
    it('should return path when window is undefined', () => {
      expect(absoluteUrl('/test')).toBe('/test')
    })

    it('should use VERCEL_URL when available', () => {
      process.env.VERCEL_URL = 'test.vercel.app'
      expect(absoluteUrl('/test')).toBe('https://test.vercel.app/test')
      delete process.env.VERCEL_URL
    })

    it('should use localhost when VERCEL_URL is not available', () => {
      process.env.PORT = '3001'
      expect(absoluteUrl('/test')).toBe('http://localhost:3001/test')
      delete process.env.PORT
    })
  })
})
