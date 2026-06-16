'use client'

import { useRef } from 'react'

export default function HomePage() {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()

    if (data.success) {
      alert(`Uploaded: ${data.fileName}`)
    } else {
      alert(`Error: ${data.error}`)
    }
  }

  return (
    <div style={styles.container}>
      <input
        ref={inputRef}
        type="file"
        hidden
        onChange={handleUpload}
      />

      <button
        style={styles.button}
        onClick={() => inputRef.current?.click()}
      >
        Upload File
      </button>
    </div>
  )
}

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    padding: '16px 32px',
    fontSize: '18px',
    cursor: 'pointer',
  },
}