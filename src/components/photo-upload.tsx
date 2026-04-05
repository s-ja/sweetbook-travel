"use client"

import { useCallback, useState } from "react"
import { ImagePlus, Upload } from "lucide-react"
import { cn } from "@/lib/utils"

interface PhotoUploadProps {
  onUpload: (files: FileList) => void
}

export function PhotoUpload({ onUpload }: PhotoUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      onUpload(files)
    }
  }, [onUpload])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onUpload(files)
    }
  }, [onUpload])

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "group relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border bg-card p-8 transition-all",
        isDragOver && "border-primary bg-accent scale-[1.01]",
        "hover:border-primary/50 hover:bg-accent/50"
      )}
    >
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="absolute inset-0 z-10 cursor-pointer opacity-0"
        aria-label="사진 업로드"
      />
      
      <div className={cn(
        "flex h-20 w-20 items-center justify-center rounded-full bg-secondary transition-all",
        isDragOver && "bg-primary/10 scale-110"
      )}>
        {isDragOver ? (
          <Upload className="h-10 w-10 text-primary" />
        ) : (
          <ImagePlus className="h-10 w-10 text-muted-foreground transition-colors group-hover:text-primary" />
        )}
      </div>
      
      <div className="text-center">
        <p className="text-lg font-medium text-foreground">
          {isDragOver ? "여기에 사진을 놓으세요" : "사진을 드래그하거나 클릭하세요"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          PNG, JPG, WEBP 등 이미지 파일 (여러 장 선택 가능)
        </p>
      </div>
    </div>
  )
}
