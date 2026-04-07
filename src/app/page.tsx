"use client"

import { useState, useCallback, useRef } from "react"
import Image from "next/image"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { BookOpen, Camera, CheckCircle, ChevronDown, Package, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { PhotoUpload } from "@/components/photo-upload"
import { PhotoCard, type PhotoData } from "@/components/photo-card"
import { DateRangePicker } from "@/components/date-range-picker"

const MIN_CONTENT_PHOTOS = 24

interface EstimateData {
  productAmount: number
  shippingFee: number
  packagingFee: number
  totalAmount: number
  paidCreditAmount: number
  creditBalance: number
  creditSufficient: boolean
  currency: string
}

interface CoverPhoto {
  file: File
  preview: string
}

function CoverPhotoSlot({
  label,
  description,
  photo,
  onFileSelect,
  onRemove,
}: {
  label: string
  description: string
  photo: CoverPhoto | null
  onFileSelect: (file: File) => void
  onRemove: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {photo ? (
        <div className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
          <Image src={photo.preview} alt={label} fill className="object-cover" />
          <button
            type="button"
            onClick={onRemove}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-foreground/80 text-background opacity-0 transition-opacity group-hover:opacity-100 hover:bg-foreground"
            aria-label="사진 삭제"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-square flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-primary/50 hover:bg-primary/5"
        >
          <Camera className="h-8 w-8 text-muted-foreground" />
          <span className="text-xs text-muted-foreground text-center px-2">{description}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            onFileSelect(file)
            e.target.value = ""
          }
        }}
      />
    </div>
  )
}

export default function TravelBookPage() {
  // Photobook Info State
  const [bookTitle, setBookTitle] = useState("")
  const [travelerName, setTravelerName] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  // Cover photos (separate front/back)
  const [frontPhoto, setFrontPhoto] = useState<CoverPhoto | null>(null)
  const [backPhoto, setBackPhoto] = useState<CoverPhoto | null>(null)

  // Content photos (min 24)
  const [contentPhotos, setContentPhotos] = useState<PhotoData[]>([])

  // Order Info State
  const [recipientName, setRecipientName] = useState("")
  const [phone, setPhone] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [address, setAddress] = useState("")
  const [detailAddress, setDetailAddress] = useState("")

  // Order process state
  const [isOrdering, setIsOrdering] = useState(false)
  const [orderStatus, setOrderStatus] = useState("")
  const [orderError, setOrderError] = useState("")
  const [completedOrderUid, setCompletedOrderUid] = useState<string | null>(null)
  const [estimateData, setEstimateData] = useState<EstimateData | null>(null)

  const topRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleReset = () => {
    // Revoke object URLs to free memory
    if (frontPhoto) URL.revokeObjectURL(frontPhoto.preview)
    if (backPhoto) URL.revokeObjectURL(backPhoto.preview)
    contentPhotos.forEach((p) => URL.revokeObjectURL(p.preview))

    setBookTitle("")
    setTravelerName("")
    setDateRange(undefined)
    setFrontPhoto(null)
    setBackPhoto(null)
    setContentPhotos([])
    setRecipientName("")
    setPhone("")
    setPostalCode("")
    setAddress("")
    setDetailAddress("")
    setOrderStatus("")
    setOrderError("")
    setCompletedOrderUid(null)
    setEstimateData(null)

    topRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Cover photo handlers
  const handleFrontPhotoSelect = (file: File) => {
    if (frontPhoto) URL.revokeObjectURL(frontPhoto.preview)
    setFrontPhoto({ file, preview: URL.createObjectURL(file) })
  }
  const handleBackPhotoSelect = (file: File) => {
    if (backPhoto) URL.revokeObjectURL(backPhoto.preview)
    setBackPhoto({ file, preview: URL.createObjectURL(file) })
  }
  const handleFrontPhotoRemove = () => {
    if (frontPhoto) URL.revokeObjectURL(frontPhoto.preview)
    setFrontPhoto(null)
  }
  const handleBackPhotoRemove = () => {
    if (backPhoto) URL.revokeObjectURL(backPhoto.preview)
    setBackPhoto(null)
  }

  // Content photo handlers
  const handleContentPhotoUpload = useCallback((files: FileList) => {
    const newPhotos: PhotoData[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      subtitle: "",
      memo: "",
    }))
    setContentPhotos((prev) => [...prev, ...newPhotos])
  }, [])

  const handleContentPhotoUpdate = useCallback((id: string, data: Partial<PhotoData>) => {
    setContentPhotos((prev) =>
      prev.map((photo) => (photo.id === id ? { ...photo, ...data } : photo))
    )
  }, [])

  const handleContentPhotoRemove = useCallback((id: string) => {
    setContentPhotos((prev) => {
      const photo = prev.find((p) => p.id === id)
      if (photo) URL.revokeObjectURL(photo.preview)
      return prev.filter((p) => p.id !== id)
    })
  }, [])

  // Phone auto-formatting (010-XXXX-XXXX)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11)
    let formatted = digits
    if (digits.length > 7) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
    } else if (digits.length > 3) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`
    }
    setPhone(formatted)
  }

  // Calculate price
  const basePrice = 29000
  const photoPrice = contentPhotos.length * 500
  const totalPrice = basePrice + photoPrice

  const canOrder =
    !isOrdering &&
    !!frontPhoto &&
    !!backPhoto &&
    contentPhotos.length >= MIN_CONTENT_PHOTOS

  const handleOrder = async () => {
    setOrderError("")
    setOrderStatus("")

    if (!bookTitle.trim()) { setOrderError("포토북 제목을 입력해주세요."); return }
    if (!travelerName.trim()) { setOrderError("여행자 이름을 입력해주세요."); return }
    if (!dateRange?.from) { setOrderError("여행 기간을 선택해주세요."); return }
    if (!frontPhoto) { setOrderError("앞표지 사진을 업로드해주세요."); return }
    if (!backPhoto) { setOrderError("뒷표지 사진을 업로드해주세요."); return }
    if (contentPhotos.length < MIN_CONTENT_PHOTOS) {
      setOrderError(`내지 사진을 ${MIN_CONTENT_PHOTOS}장 이상 업로드해주세요. (현재 ${contentPhotos.length}장)`)
      return
    }
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
      coverForm.append("frontPhoto", frontPhoto.file)
      coverForm.append("backPhoto", backPhoto.file)
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
      for (let i = 0; i < contentPhotos.length; i++) {
        const photo = contentPhotos[i]
        setOrderStatus(`내지를 추가하는 중... (${i + 1}/${contentPhotos.length})`)

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

      // 5. 견적 조회
      setOrderStatus("견적을 조회하는 중...")
      const estRes = await fetch("/api/orders/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ bookUid, quantity: 1 }] }),
      })
      const estJson = await estRes.json()
      if (!estJson.success) throw new Error(estJson.message)
      const est: EstimateData = estJson.data
      setEstimateData(est)
      if (!est.creditSufficient) {
        throw new Error(
          `크레딧이 부족합니다. 필요 금액: ${est.paidCreditAmount.toLocaleString()}원 / 잔액: ${est.creditBalance.toLocaleString()}원`
        )
      }

      // 6. 주문 생성
      setOrderStatus("주문을 처리하는 중...")
      const idempotencyKey = crypto.randomUUID()
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          items: [{ bookUid, quantity: 1 }],
          shipping: {
            recipientName,
            recipientPhone: phone.replace(/-/g, ""),
            postalCode,
            address1: address,
            address2: detailAddress,
          },
        }),
      })
      const orderData = await orderRes.json()
      if (!orderData.success) throw new Error(orderData.message)

      setCompletedOrderUid(orderData.data.orderUid)
      topRef.current?.scrollIntoView({ behavior: "smooth" })
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : "오류가 발생했습니다. 다시 시도해주세요.")
      setOrderStatus("")
    } finally {
      setIsOrdering(false)
    }
  }

  return (
    <div ref={topRef} className="min-h-screen bg-background">
      {/* Order Complete Screen */}
      {completedOrderUid && (
        <section className="flex min-h-screen flex-col items-center justify-center px-6 py-24">
          <div className="mx-auto flex max-w-md flex-col items-center text-center">
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-12 w-12 text-primary" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              포토북 주문이 완료되었습니다!
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              소중한 여행의 순간이 아름다운 책으로 만들어집니다.
            </p>

            <div className="mt-8 w-full rounded-2xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">주문번호</p>
              <p className="mt-1 font-mono text-lg font-semibold tracking-wide text-foreground">
                {completedOrderUid}
              </p>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground">
                영업일 기준 5-7일 내 배송됩니다.<br />
                Sandbox 환경에서는 실제 인쇄·배송이 진행되지 않습니다.
              </p>
            </div>

            <Button
              size="lg"
              className="mt-10 h-14 px-10 text-lg font-semibold"
              onClick={handleReset}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              새 포토북 만들기
            </Button>
          </div>
        </section>
      )}

      {/* Main Content (hidden after order complete) */}
      <div className={completedOrderUid ? "hidden" : ""}>

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

          {/* Basic Info */}
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

          {/* Cover Photos */}
          <div className="mt-12">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground">표지 사진</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                앞표지와 뒷표지에 사용할 사진을 각각 1장씩 업로드하세요
              </p>
            </div>
            <Card className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <CoverPhotoSlot
                  label="앞표지"
                  description="클릭하여 앞표지 사진 업로드"
                  photo={frontPhoto}
                  onFileSelect={handleFrontPhotoSelect}
                  onRemove={handleFrontPhotoRemove}
                />
                <CoverPhotoSlot
                  label="뒷표지"
                  description="클릭하여 뒷표지 사진 업로드"
                  photo={backPhoto}
                  onFileSelect={handleBackPhotoSelect}
                  onRemove={handleBackPhotoRemove}
                />
              </div>
            </Card>
          </div>

          {/* Content Photos */}
          <div className="mt-12">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-foreground">내지 사진</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  각 사진이 포토북 한 페이지로 구성됩니다
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={contentPhotos.length >= MIN_CONTENT_PHOTOS ? "default" : "secondary"}
                  className="text-sm"
                >
                  {contentPhotos.length} / {MIN_CONTENT_PHOTOS}장
                </Badge>
              </div>
            </div>

            {contentPhotos.length < MIN_CONTENT_PHOTOS && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                최소 {MIN_CONTENT_PHOTOS}장 이상 업로드해야 주문할 수 있습니다.
                {contentPhotos.length > 0 && ` (${MIN_CONTENT_PHOTOS - contentPhotos.length}장 더 필요)`}
              </div>
            )}

            <PhotoUpload onUpload={handleContentPhotoUpload} />

            {contentPhotos.length > 0 && (
              <div className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">
                    업로드된 사진 ({contentPhotos.length}장)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    날짜·소제목·메모를 입력하면 포토북에 반영됩니다
                  </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  {contentPhotos.map((photo) => (
                    <PhotoCard
                      key={photo.id}
                      photo={photo}
                      onUpdate={handleContentPhotoUpdate}
                      onRemove={handleContentPhotoRemove}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
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
                    autoComplete="off"
                    className="h-12 bg-input"
                  />
                </Field>

                <Field>
                  <FieldLabel className="text-sm font-medium">전화번호</FieldLabel>
                  <Input
                    type="tel"
                    placeholder="010-0000-0000"
                    value={phone}
                    onChange={handlePhoneChange}
                    autoComplete="off"
                    className="h-12 bg-input"
                  />
                </Field>

                <Field>
                  <FieldLabel className="text-sm font-medium">우편번호</FieldLabel>
                  <Input
                    placeholder="우편번호 (예: 07774)"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    autoComplete="off"
                    className="h-12 bg-input"
                  />
                </Field>

                <Field>
                  <FieldLabel className="text-sm font-medium">주소</FieldLabel>
                  <Input
                    placeholder="기본 주소"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    autoComplete="off"
                    className="h-12 bg-input"
                  />
                </Field>

                <Field>
                  <FieldLabel className="text-sm font-medium">상세 주소</FieldLabel>
                  <Input
                    placeholder="상세 주소 (동/호수)"
                    value={detailAddress}
                    onChange={(e) => setDetailAddress(e.target.value)}
                    autoComplete="off"
                    className="h-12 bg-input"
                  />
                </Field>
              </FieldGroup>
            </Card>

            <Card className="h-fit p-8 lg:col-span-2">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">예상 가격</h3>
                {estimateData ? (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">API 견적</span>
                ) : (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">임시 예상가</span>
                )}
              </div>

              <div className="space-y-4">
                {estimateData ? (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">제작비</span>
                      <span className="font-medium">{estimateData.productAmount.toLocaleString()}원</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">배송비</span>
                      <span className="font-medium">{estimateData.shippingFee.toLocaleString()}원</span>
                    </div>
                    {estimateData.packagingFee > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">포장비</span>
                        <span className="font-medium">{estimateData.packagingFee.toLocaleString()}원</span>
                      </div>
                    )}
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">총 결제 금액</span>
                      <span className="text-2xl font-bold text-primary">
                        {estimateData.totalAmount.toLocaleString()}원
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>크레딧 잔액</span>
                      <span>{estimateData.creditBalance.toLocaleString()}원</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">기본 제작비</span>
                      <span className="font-medium">{basePrice.toLocaleString()}원</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">내지 사진 ({contentPhotos.length}장)</span>
                      <span className="font-medium">+{photoPrice.toLocaleString()}원</span>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">총 결제 금액</span>
                      <span className="text-2xl font-bold text-primary">
                        {totalPrice.toLocaleString()}원
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">* 주문 시 API 실측 견적으로 확정됩니다</p>
                  </>
                )}
              </div>

              <Button
                size="lg"
                className="mt-8 h-14 w-full text-lg font-semibold"
                onClick={handleOrder}
                disabled={!canOrder}
              >
                <Package className="mr-2 h-5 w-5" />
                {isOrdering ? "처리 중..." : "포토북 주문하기"}
              </Button>

              {!canOrder && !isOrdering && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  {!frontPhoto || !backPhoto
                    ? "표지 사진을 먼저 업로드해주세요"
                    : `내지 사진 ${MIN_CONTENT_PHOTOS}장 이상 필요 (현재 ${contentPhotos.length}장)`}
                </p>
              )}

              {orderStatus && (
                <p className="mt-3 text-center text-sm text-primary">{orderStatus}</p>
              )}
              {orderError && (
                <p className="mt-3 text-center text-sm text-destructive">{orderError}</p>
              )}

              {canOrder && !orderStatus && !orderError && (
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
            © 2026 TravelBook. All rights reserved.
          </p>
        </div>
      </footer>

      </div>{/* end main content */}
    </div>
  )
}
