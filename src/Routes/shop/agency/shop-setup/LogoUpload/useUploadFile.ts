import React from 'react'

export type useUploadLogoTypes = {
  selectedFile: File
  updateSelectedFile: (file: File) => void
  removeSelectedFile: () => void
}

export function useUploadLogo() {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)

  const updateSelectedFile = (file: File) => {
    setSelectedFile(file)
  }
  const removeSelectedFile = () => {
    setSelectedFile(null)
  }

  return { selectedFile, updateSelectedFile, removeSelectedFile }
}
