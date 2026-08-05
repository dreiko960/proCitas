import React, { useEffect, useState } from 'react'

export default function useCountdown(targetSeconds) {
  const [remaining, setRemaining] = useState(targetSeconds)

  useEffect(() => {
    setRemaining(targetSeconds)
    const iv = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0))
    }, 1000)
    return () => clearInterval(iv)
  }, [targetSeconds])

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  return { remaining, mm, ss, done: remaining <= 0 }
}
