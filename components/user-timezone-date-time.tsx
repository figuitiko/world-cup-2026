'use client'

type DateStyle = 'short' | 'medium'

interface UserTimezoneDateTimeProps {
  value: Date | string
  className?: string
  dateStyle?: DateStyle
  showTime?: boolean
}

function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value)
}

function formatInUserTimezone(value: Date | string, dateStyle: DateStyle, showTime: boolean) {
  const date = toDate(value)
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    ...(dateStyle === 'medium' ? { year: 'numeric' } : {}),
    ...(showTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }

  return new Intl.DateTimeFormat('es-AR', options).format(date)
}

function browserTimezoneLabel() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'tu zona horaria'
}

export function UserTimezoneDateTime({
  value,
  className,
  dateStyle = 'short',
  showTime = true,
}: UserTimezoneDateTimeProps) {
  const isoValue = toDate(value).toISOString()
  const label = formatInUserTimezone(isoValue, dateStyle, showTime)

  return (
    <time
      className={className}
      dateTime={isoValue}
      title={`Hora local según ${browserTimezoneLabel()} · UTC: ${isoValue}`}
      suppressHydrationWarning
    >
      {label}
    </time>
  )
}
