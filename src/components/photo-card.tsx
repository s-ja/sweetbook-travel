"use client"

import { useState } from "react"
import Image from "next/image"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { CalendarIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

export interface PhotoData {
  id: string
  file: File
  preview: string
  date?: Date
  subtitle: string
  memo: string
}

interface PhotoCardProps {
  photo: PhotoData
  onUpdate: (id: string, data: Partial<PhotoData>) => void
  onRemove: (id: string) => void
}

export function PhotoCard({ photo, onUpdate, onRemove }: PhotoCardProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all hover:shadow-md">
      <button
        type="button"
        onClick={() => onRemove(photo.id)}
        className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-foreground/80 text-background opacity-0 transition-opacity group-hover:opacity-100 hover:bg-foreground"
        aria-label="사진 삭제"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-muted">
        <Image
          src={photo.preview}
          alt={photo.subtitle || "여행 사진"}
          fill
          className="object-cover"
        />
      </div>
      
      <div className="space-y-3">
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-11",
                !photo.date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {photo.date ? format(photo.date, "PPP", { locale: ko }) : "날짜 선택"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={photo.date}
              onSelect={(date) => {
                onUpdate(photo.id, { date })
                setIsCalendarOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
        
        <Input
          placeholder="소제목을 입력하세요"
          value={photo.subtitle}
          onChange={(e) => onUpdate(photo.id, { subtitle: e.target.value })}
          className="h-11 bg-input"
        />
        
        <Textarea
          placeholder="이 순간의 추억을 기록하세요..."
          value={photo.memo}
          onChange={(e) => onUpdate(photo.id, { memo: e.target.value })}
          rows={3}
          className="resize-none bg-input"
        />
      </div>
    </div>
  )
}
