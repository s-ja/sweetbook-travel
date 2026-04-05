"use client"

import { useState, useCallback, useRef } from "react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { BookOpen, ChevronDown, Package, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { PhotoUpload } from "@/components/photo-upload"
import { PhotoCard, type PhotoData } from "@/components/photo-card"
import { DateRangePicker } from "@/components/date-range-picker"

export default function TravelBookPage() {
  // Photobook Info State
  const [bookTitle, setBookTitle] = useState("")
  const [travelerName, setTravelerName] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [photos, setPhotos] = useState<PhotoData[]>([])
  
  // Order Info State
  const [recipientName, setRecipientName] = useState("")
  const [phone, setPhone] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [address, setAddress] = useState("")
  const [detailAddress, setDetailAddress] = useState("")
  
  const [isOrdering, setIsOrdering] = useState(false)
  const [orderStatus, setOrderStatus] = useState("")
  const [orderError, setOrderError] = useState("")

  const formRef = useRef<HTMLDivElement>(null)
  
  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  
  const handlePhotoUpload = useCallback((files: FileList) => {
    const newPhotos: PhotoData[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      subtitle: "",
      memo: "",
    }))
    setPhotos((prev) => [...prev, ...newPhotos])
  }, [])
  
  const handlePhotoUpdate = useCallback((id: string, data: Partial<PhotoData>) => {
    setPhotos((prev) =>
      prev.map((photo) => (photo.id === id ? { ...photo, ...data } : photo))
    )
  }, [])
  
  const handlePhotoRemove = useCallback((id: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id)
      if (photo) {
        URL.revokeObjectURL(photo.preview)
      }
      return prev.filter((p) => p.id !== id)
    })
  }, [])
  
  // Calculate price
  const basePrice = 29000
  const photoPrice = photos.length * 500
  const totalPrice = basePrice + photoPrice

  const handleOrder = async () => {
    setOrderError("")
    setOrderStatus("")

    if (!bookTitle.trim()) { setOrderError("포토북 제목을 입력해주세요."); return }
    if (!travelerName.trim()) { setOrderError("여행자 이름을 입력해주세요."); return }
    if (!dateRange?.from) { setOrderError("여행 기간을 선택해주세요."); return }
    if (photos.length === 0) { setOrderError("사진을 1장 이상 업로드해주세요."); return }
    if (!recipientName.trim()) { setOrderError("수령인 이름을 입력해주세요."); return }
    if (!phone.trim()) { setOrderError("전화번호를 입력해주세요."); return }
    if (!postalCode.trim() || !address.trim()) { setOrderError("배송지를 입력해주세요."); return }

    setIsOrdering(true)
    try {
      // 1. 책 생성
      setOrderStatus("포토북을 생성하는 중...")
      const bookRes = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: bookTitle, bookSpecUid: "SQUAREBOOK_HC" }),
      })
      const bookData = await bookRes.json()
      if (!bookData.success) throw new Error(bookData.message)
      const bookUid: string = bookData.data.bookUid

      // 2. 표지 추가
      setOrderStatus("표지를 생성하는 중...")
      const from = dateRange.from
      const to = dateRange.to ?? from
      const dateRangeStr = `${format(from, "yyyy.MM")} - ${format(to, "yyyy.MM")}`

      const coverForm = new FormData()
      coverForm.append("frontPhoto", photos[0].file)
      coverForm.append("backPhoto", photos[photos.length - 1].file)
      coverForm.append("templateUid", "4MY2fokVjkeY")
      coverForm.append("parameters", JSON.stringify({
        title: bookTitle,
        author: travelerName,
        dateRange: dateRangeStr,
        spineTitle: bookTitle,
      }))

      const coverRes = await fetch(`/api/books/${bookUid}/cover`, {
        method: "POST",
        body: coverForm,
      })
      const coverData = await coverRes.json()
      if (!coverData.success) throw new Error(coverData.message)

      // 3. 내지 추가 (사진별 반복)
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i]
        setOrderStatus(`내지를 추가하는 중... (${i + 1}/${photos.length})`)

        const contentsForm = new FormData()
        contentsForm.append("photo1", photo.file)
        contentsForm.append("templateUid", "3FhSEhJ94c0T")
        contentsForm.append("parameters", JSON.stringify({
          date: photo.date ? format(photo.date, "M.d") : "—",
          title: photo.subtitle.trim() || "여행의 순간",
          diaryText: photo.memo.trim() || "—",
        }))

        const contentsRes = await fetch(`/api/books/${bookUid}/contents?breakBefore=page`, {
          method: "POST",
          body: contentsForm,
        })
        const contentsData = await contentsRes.json()
        if (!contentsData.success) throw new Error(contentsData.message)
      }

      // 4. 책 최종화
      setOrderStatus("포토북을 완성하는 중...")
      const finalRes = await fetch(`/api/books/${bookUid}/finalization`, { method: "POST" })
      const finalData = await finalRes.json()
      if (!finalData.success) throw new Error(finalData.message)

      // 5. 주문 생성
      setOrderStatus("주문을 처리하는 중...")
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ bookUid, quantity: 1 }],
          shipping: {
            recipientName,
            recipientPhone: phone,
            postalCode,
            address1: address,
            address2: detailAddress,
          },
        }),
      })
      const orderData = await orderRes.json()
      if (!orderData.success) throw new Error(orderData.message)

      setOrderStatus(`주문 완료! 주문번호: ${orderData.data.orderUid}`)
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : "오류가 발생했습니다. 다시 시도해주세요.")
      setOrderStatus("")
    } finally {
      setIsOrdering(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-transparent" />
        
        <div className="relative z-10 flex max-w-3xl flex-col items-center text-center">
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <BookOpen className="h-10 w-10 text-primary" />
          </div>
          
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            TravelBook
          </h1>
          <p className="mt-3 text-xl font-medium text-primary sm:text-2xl">
            여행을 책으로
          </p>
          
          <p className="mt-8 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            소중한 여행의 순간들을 아름다운 포토북으로 간직하세요.
            사진을 업로드하고 추억을 기록하면, 세상에 하나뿐인 나만의 여행 포토북이 완성됩니다.
          </p>
          
          <Button 
            size="lg" 
            className="mt-10 h-14 px-10 text-lg font-semibold"
            onClick={scrollToForm}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            포토북 만들기
          </Button>
          
          <button 
            onClick={scrollToForm}
            className="mt-16 flex animate-bounce flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="text-sm">시작하기</span>
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>
      </section>
      
      {/* Photobook Info Section */}
      <section ref={formRef} className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-primary">Step 1</span>
            <h2 className="mt-2 text-3xl font-bold text-foreground">포토북 정보</h2>
            <p className="mt-3 text-muted-foreground">여행의 기본 정보와 사진을 입력하세요</p>
          </div>
          
          <Card className="p-8">
            <FieldGroup className="gap-8">
              <Field>
                <FieldLabel className="text-sm font-medium">포토북 제목</FieldLabel>
                <Input
                  placeholder="예: 2024 제주도 여행"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="h-12 bg-input"
                />
              </Field>
              
              <Field>
                <FieldLabel className="text-sm font-medium">여행자 이름</FieldLabel>
                <Input
                  placeholder="이름을 입력하세요"
                  value={travelerName}
                  onChange={(e) => setTravelerName(e.target.value)}
                  className="h-12 bg-input"
                />
              </Field>
              
              <Field>
                <FieldLabel className="text-sm font-medium">여행 기간</FieldLabel>
                <DateRangePicker
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                />
              </Field>
            </FieldGroup>
          </Card>
          
          <div className="mt-12">
            <h3 className="mb-6 text-xl font-semibold text-foreground">사진 업로드</h3>
            <PhotoUpload onUpload={handlePhotoUpload} />
          </div>
          
          {photos.length > 0 && (
            <div className="mt-12">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-foreground">
                  업로드된 사진 ({photos.length}장)
                </h3>
                <p className="text-sm text-muted-foreground">
                  각 사진의 날짜와 설명을 추가하세요
                </p>
              </div>
              
              <div className="grid gap-6 sm:grid-cols-2">
                {photos.map((photo) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    onUpdate={handlePhotoUpdate}
                    onRemove={handlePhotoRemove}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* Order Section */}
      <section className="bg-secondary/30 px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-primary">Step 2</span>
            <h2 className="mt-2 text-3xl font-bold text-foreground">주문 정보</h2>
            <p className="mt-3 text-muted-foreground">배송 정보를 입력하고 주문을 완료하세요</p>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-5">
            <Card className="p-8 lg:col-span-3">
              <h3 className="mb-6 text-lg font-semibold text-foreground">배송지 정보</h3>
              
              <FieldGroup className="gap-6">
                <Field>
                  <FieldLabel className="text-sm font-medium">수령인 이름</FieldLabel>
                  <Input
                    placeholder="받으실 분 이름"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="h-12 bg-input"
                  />
                </Field>
                
                <Field>
                  <FieldLabel className="text-sm font-medium">전화번호</FieldLabel>
                  <Input
                    type="tel"
                    placeholder="010-0000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-12 bg-input"
                  />
                </Field>
                
                <Field>
                  <FieldLabel className="text-sm font-medium">우편번호</FieldLabel>
                  <div className="flex gap-3">
                    <Input
                      placeholder="우편번호"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="h-12 flex-1 bg-input"
                    />
                    <Button variant="outline" className="h-12 px-6">
                      검색
                    </Button>
                  </div>
                </Field>
                
                <Field>
                  <FieldLabel className="text-sm font-medium">주소</FieldLabel>
                  <Input
                    placeholder="기본 주소"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="h-12 bg-input"
                  />
                </Field>
                
                <Field>
                  <FieldLabel className="text-sm font-medium">상세 주소</FieldLabel>
                  <Input
                    placeholder="상세 주소 (동/호수)"
                    value={detailAddress}
                    onChange={(e) => setDetailAddress(e.target.value)}
                    className="h-12 bg-input"
                  />
                </Field>
              </FieldGroup>
            </Card>
            
            <Card className="h-fit p-8 lg:col-span-2">
              <h3 className="mb-6 text-lg font-semibold text-foreground">예상 가격</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">기본 제작비</span>
                  <span className="font-medium">{basePrice.toLocaleString()}원</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">사진 추가 ({photos.length}장)</span>
                  <span className="font-medium">+{photoPrice.toLocaleString()}원</span>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">총 결제 금액</span>
                  <span className="text-2xl font-bold text-primary">
                    {totalPrice.toLocaleString()}원
                  </span>
                </div>
              </div>
              
              <Button
                size="lg"
                className="mt-8 h-14 w-full text-lg font-semibold"
                onClick={handleOrder}
                disabled={isOrdering}
              >
                <Package className="mr-2 h-5 w-5" />
                {isOrdering ? "처리 중..." : "포토북 주문하기"}
              </Button>

              {orderStatus && (
                <p className="mt-3 text-center text-sm text-primary">{orderStatus}</p>
              )}
              {orderError && (
                <p className="mt-3 text-center text-sm text-destructive">{orderError}</p>
              )}

              {!orderStatus && !orderError && (
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  주문 후 영업일 기준 5-7일 내 배송됩니다
                </p>
              )}
            </Card>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-border px-6 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex items-center justify-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">TravelBook</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            소중한 여행의 순간을 영원히 간직하세요
          </p>
          <p className="mt-6 text-xs text-muted-foreground">
            © 2024 TravelBook. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
