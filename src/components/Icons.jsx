import React from 'react'

const S = ({ children, size = 20, fill = 'none', sw = 1.8, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...rest}
  >
    {children}
  </svg>
)

const filled = (children) => (props) => <S fill="currentColor" stroke="none" {...props}>{children}</S>

export const IconCalendar = (p) => (
  <S {...p}><rect x="3" y="4" width="18" height="18" rx="4" /><path d="M16 2v4M8 2v4M3 10h18" /></S>
)
export const IconCalendarCheck = (p) => (
  <S {...p}><rect x="3" y="4" width="18" height="18" rx="4" /><path d="M16 2v4M8 2v4M3 10h18" /><path d="m9 16 2 2 4-4" /></S>
)
export const IconCalendarPlus = (p) => (
  <S {...p}><rect x="3" y="4" width="18" height="18" rx="4" /><path d="M16 2v4M8 2v4M3 10h18" /><path d="M12 13v6M9 16h6" /></S>
)
export const IconCalendarX = (p) => (
  <S {...p}><rect x="3" y="4" width="18" height="18" rx="4" /><path d="M16 2v4M8 2v4M3 10h18" /><path d="m10 13 4 4M14 13l-4 4" /></S>
)
export const IconSave = (p) => (
  <S {...p}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><path d="M17 21v-8H7v8" /><path d="M7 3v5h8" /></S>
)
export const IconUserPlus = (p) => (
  <S {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.3 3-5.5 6.5-5.5s6.5 2.2 6.5 5.5" /><path d="M18 9v6M15 12h6" /></S>
)
export const IconUserX = (p) => (
  <S {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.3 3-5.5 6.5-5.5s6.5 2.2 6.5 5.5" /><path d="m16.5 10 4 4M20.5 10l-4 4" /></S>
)
export const IconClock = (p) => (
  <S {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></S>
)
export const IconStethoscope = (p) => (
  <S {...p}><path d="M4.8 2.3a.3.3 0 1 0 0 0h.01" /><path d="M4.8 2.3A.3.3 0 1 0 4.8 2.3Z" /><path d="M4.3 2.6c-.3.2-.3.6-.3 1.1v3.3a4 4 0 0 0 8 0V3.7c0-.5 0-.9-.3-1.1" /><path d="M4.3 8.5a7.7 7.7 0 0 0 8 0" /><path d="M12.3 6.3h.3a3 3 0 0 1 3 3V12" /><circle cx="15.5" cy="16.5" r="4" /><path d="M15.5 20.5v1" /></S>
)
export const IconUser = (p) => (
  <S {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" /></S>
)
export const IconUsers = (p) => (
  <S {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.3 3-5.5 6.5-5.5s6.5 2.2 6.5 5.5" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8" /><path d="M18.5 14.7c2 .8 3 2.4 3 4.3" /></S>
)
export const IconHeartPulse = (p) => (
  <S {...p}><path d="M20 7c-1.5-2-4.2-2.4-6 0-1.8-2.4-4.5-2-6 0" /><path d="M4 13.5 7 9l3 6 3-9 2.5 4.5H20" /></S>
)
export const IconShield = (p) => (
  <S {...p}><path d="M12 3 5 6v5c0 4.4 3 8.2 7 9.5 4-1.3 7-5.1 7-9.5V6Z" /></S>
)
export const IconBell = (p) => (
  <S {...p}><path d="M18 9a6 6 0 0 0-12 0c0 6-2 7-2 7h16s-2-1-2-7" /><path d="M10.3 20a2 2 0 0 0 3.4 0" /></S>
)
export const IconSearch = (p) => (
  <S {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></S>
)
export const IconChevronLeft = (p) => <S {...p}><path d="m15 5-7 7 7 7" /></S>
export const IconChevronRight = (p) => <S {...p}><path d="m9 5 7 7-7 7" /></S>
export const IconChevronDown = (p) => <S {...p}><path d="m6 9 6 6 6-6" /></S>
export const IconArrowRight = (p) => <S {...p}><path d="M4 12h16M14 6l6 6-6 6" /></S>
export const IconArrowLeft = (p) => <S {...p}><path d="M20 12H4M10 6l-6 6 6 6" /></S>
export const IconCheck = (p) => <S {...p}><path d="M20 6 9 17l-5-5" /></S>
export const IconCheckCircle = (p) => (
  <S {...p}><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-4.5" /></S>
)
export const IconX = (p) => <S {...p}><path d="M18 6 6 18M6 6l12 12" /></S>
export const IconXCircle = (p) => (
  <S {...p}><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6M15 9l-6 6" /></S>
)
export const IconAlertTriangle = (p) => (
  <S {...p}><path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v4M12 17.5v.01" /></S>
)
export const IconInfo = (p) => (
  <S {...p}><circle cx="12" cy="12" r="9" /><path d="M12 16v-4M12 8h.01" /></S>
)
export const IconUpload = (p) => (
  <S {...p}><path d="M12 16V4M6 10l6-6 6 6" /><path d="M4 20h16" /></S>
)
export const IconDownload = (p) => (
  <S {...p}><path d="M12 4v12M6 10l6 6 6-6" /><path d="M4 20h16" /></S>
)
export const IconPdf = (p) => (
  <S {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M9 13h6M9 17h6M9 9h1" /></S>
)
export const IconLogout = (p) => (
  <S {...p}><path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3M16 17l5-5-5-5M21 12H9" /></S>
)
export const IconHome = (p) => (
  <S {...p}><path d="m3 11 9-7 9 7" /><path d="M5 9.5V21h14V9.5" /><path d="M10 21v-6h4v6" /></S>
)
export const IconPlus = (p) => <S {...p}><path d="M12 5v14M5 12h14" /></S>
export const IconEdit = (p) => (
  <S {...p}><path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></S>
)
export const IconTrash = (p) => (
  <S {...p}><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></S>
)
export const IconSliders = (p) => (
  <S {...p}><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" /><path d="M2 14h4M10 8h4M18 16h4" /></S>
)
export const IconFilter = (p) => (
  <S {...p}><path d="M4 6h16M7 12h10M10 18h4" /></S>
)
export const IconMail = (p) => (
  <S {...p}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m3.5 7 8.5 6 8.5-6" /></S>
)
export const IconLock = (p) => (
  <S {...p}><rect x="4" y="10" width="16" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></S>
)
export const IconEye = (p) => (
  <S {...p}><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></S>
)
export const IconEyeOff = (p) => (
  <S {...p}><path d="M3 3l18 18M10.6 5.1A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a17.8 17.8 0 0 1-3.4 4.2M6.6 6.6C4 8.4 2 12 2 12s3.5 7 10 7a10 10 0 0 0 3.9-.8" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></S>
)
export const IconCalendarDays = (p) => (
  <S {...p}><rect x="3" y="4" width="18" height="18" rx="4" /><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" /></S>
)
export const IconFileText = (p) => (
  <S {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M9 13h6M9 17h6M9 9h1" /></S>
)
export const IconWallet = (p) => (
  <S {...p}><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /><path d="M16 12h5M3 9h18" /></S>
)
export const IconCreditCard = (p) => (
  <S {...p}><rect x="2" y="5" width="20" height="14" rx="3" /><path d="M2 10h20M6 15h4" /></S>
)
export const IconListCheck = (p) => (
  <S {...p}><path d="M8 6h13M8 12h13M8 18h13" /><path d="m3 6 1 1 2-2M3 12l1 1 2-2M3 18l1 1 2-2" /></S>
)
export const IconList = (p) => (
  <S {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></S>
)
export const IconGraph = (p) => (
  <S {...p}><path d="M3 3v18h18" /><path d="M7 15l4-5 3 3 5-7" /></S>
)
export const IconPie = (p) => (
  <S {...p}><path d="M12 3a9 9 0 1 0 9 9h-9Z" /><path d="M14 3v7h7a9 9 0 0 0-7-7Z" /></S>
)
export const IconRefresh = (p) => (
  <S {...p}><path d="M21 12a9 9 0 1 1-2.6-6.4" /><path d="M21 3v5h-5" /></S>
)
export const IconTimer = (p) => (
  <S {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2M9 2h6" /></S>
)
export const IconPhone = (p) => (
  <S {...p}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.5 2.8.7a2 2 0 0 1 1.7 2Z" /></S>
)
export const IconMapPin = (p) => (
  <S {...p}><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></S>
)
export const IconMenu = (p) => <S {...p}><path d="M4 6h16M4 12h16M4 18h16" /></S>
export const IconHistory = (p) => (
  <S {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l3 2" /></S>
)
export const IconClipboard = (p) => (
  <S {...p}><rect x="5" y="4" width="14" height="17" rx="3" /><path d="M9 4V3h6v1M9 11h6M9 15h4" /></S>
)
export const IconStethoSmall = (p) => (
  <S {...p}><path d="M11 2v2a7 7 0 0 0 14 0V2" /><path d="M18 12v3a4 4 0 0 0 8 0v-3" /><path d="M26 15a5 5 0 0 1-10 0" /></S>
)
export const IconBuilding = (p) => (
  <S {...p}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M9 19h1M14 19h1M2 21h20" /></S>
)
export const IconSettings = (p) => (
  <S {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.01a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h.01a1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.01a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></S>
)
export const IconClockHistory = (p) => (
  <S {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2M3 3v4h4" /></S>
)
export const IconBriefcase = (p) => (
  <S {...p}><rect x="3" y="7" width="18" height="13" rx="3" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18" /></S>
)
export const IconStar = (p) => (
  <S {...p}><path d="m12 3 2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8L6.6 19.6l1-6L3.3 9.4l6-.9Z" /></S>
)
export const IconSmartphone = (p) => (
  <S {...p}><rect x="7" y="2" width="10" height="20" rx="3" /><path d="M11 18h2" /></S>
)
export const IconVideo = (p) => (
  <S {...p}><path d="m22 8-6 4 6 4V8Z" /><rect x="2" y="5" width="14" height="14" rx="3" /></S>
)
export const IconPrint = (p) => (
  <S {...p}><path d="M6 9V3h12v6" /><rect x="6" y="14" width="12" height="7" rx="1" /><path d="M6 18H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2" /></S>
)
export const IconFirstAid = (p) => (
  <S {...p}><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M12 9v6M9 12h6" /></S>
)
export const IconSparkles = (p) => (
  <S {...p}><path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6Z" /><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8Z" /></S>
)
export const IconSend = (p) => (
  <S {...p}><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></S>
)
export const IconPower = (p) => (
  <S {...p}><path d="M12 2v9M18.4 6.6a9 9 0 1 1-12.8 0" /></S>
)
export const IconDollar = (p) => (
  <S {...p}><path d="M12 2v20M17 5.5H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H6" /></S>
)
export const IconActivity = (p) => (
  <S {...p}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></S>
)
export const IconGitBranch = (p) => (
  <S {...p}><circle cx="6" cy="5" r="2.5" /><circle cx="6" cy="19" r="2.5" /><circle cx="18" cy="7" r="2.5" /><path d="M6 7.5v9M18 9.5a5.5 5.5 0 0 1-5.5 5.5H6" /></S>
)
export const IconCheckCircleFilled = filled(
  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.2 14.2-4-4 1.4-1.4 2.6 2.6 5.8-5.8 1.4 1.4-7.2 7.2Z" />
)
export const IconAlertFilled = filled(
  <path d="M12 2 1 21h22L12 2Zm0 6c.6 0 1 .4 1 1v5c0 .6-.4 1-1 1s-1-.4-1-1V9c0-.6.4-1 1-1Zm0 11.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z" />
)
export const IconInfoFilled = filled(
  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 6.5A1.25 1.25 0 1 1 12 6a1.25 1.25 0 0 1 0 2.5Zm1.5 9h-3v-1.5h1V13h-1v-1.5h2.5v5h1V17.5Z" />
)
export const IconCheckboxOn = (p) => (
  <S {...p}><rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" stroke="none" /><path d="m8.5 12 2.5 2.5 5-5" stroke="#fff" strokeWidth="2.4" /></S>
)
export const IconCheckboxOff = (p) => (
  <S {...p}><rect x="3" y="3" width="18" height="18" rx="4" /></S>
)
export const IconMore = (p) => (
  <S {...p}><circle cx="5" cy="12" r="1.5" fill="currentColor" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /><circle cx="19" cy="12" r="1.5" fill="currentColor" /></S>
)
export const IconMonitor = (p) => (
  <S {...p}><rect x="3" y="4" width="18" height="13" rx="3" /><path d="M8 21h8M12 17v4" /></S>
)
export const IconPlay = (p) => <S {...p}><path d="M6 4.5v15l13-7.5Z" fill="currentColor" stroke="none" /></S>
export const IconPause = (p) => <S {...p}><path d="M8 5v14M16 5v14" strokeWidth="2.4" /></S>
export const IconMegaphone = (p) => (
  <S {...p}><path d="M3 11v2a1 1 0 0 0 1 1h2l4 4a1 1 0 0 0 1.7-.7V5.7A1 1 0 0 0 10 5L5 9H4a1 1 0 0 0-1 1Z" /><path d="M19 9a3 3 0 0 1 0 6M21 6a7 7 0 0 1 0 12" /></S>
)
