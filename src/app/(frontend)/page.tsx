'use client'
console.log('HOME PAGE RENDER')

import { useRef } from 'react'
import { useEffect, useState } from 'react'

type FileItem = {
  id: string
  name: string
}

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

  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("useEffect");
    async function fetchFiles() {
      
      try {
        const res = await fetch('/api/files')
        const data = await res.json()
        console.log("RAW API RESPONSE:", data)
        setFiles(data.files || [])
      } catch (err) {
        console.error('Error loading files:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFiles()
  }, [])


  return (
    <>
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

      <div style={{ padding: 40 }}>
        <h1>My Drive Files</h1>

        {loading && <p>Loading...</p>}

        {!loading && files.length === 0 && <p>No files found</p>}

        <ul>
          {files.map((file) => (
            <li key={file.id}>📄 {file.name}</li>
          ))}
        </ul>
      </div>
    </>
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