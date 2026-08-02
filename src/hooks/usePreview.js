import { useContext } from 'react'
import PreviewContext from '../context/PreviewContext'

export function usePreview() {
  return useContext(PreviewContext)
}
