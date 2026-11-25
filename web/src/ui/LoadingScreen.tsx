import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'

// Drives the poster loader in index.html (#boot): it paints before any JavaScript as a soft image of
// the real 3D scene. Here we fill its progress line from three's LoadingManager, then fade it out
// (the poster sharpens as it goes) once every model and texture has loaded, and remove it.
export default function LoadingScreen() {
  const { progress, total } = useProgress()
  // one-way: has progress reached 100 at least once (avoids jitter when assets register in batches)
  const [reached, setReached] = useState(false)
  const peak = useRef(0)
  peak.current = Math.max(peak.current, Math.min(Math.max(progress, 0), 100))

  // progress line follows the real loading progress
  useEffect(() => {
    const boot = document.getElementById('boot')
    const bar = boot?.querySelector<HTMLElement>('.bb i')
    if (!boot || !bar || total === 0) return
    boot.classList.add('has-p')
    bar.style.width = `${Math.max(8, peak.current)}%`
  }, [progress, total])

  useEffect(() => {
    if (progress >= 100) setReached(true)
  }, [progress])

  // No external assets registered: clear after a short beat
  useEffect(() => {
    if (total > 0) return
    const t = setTimeout(() => setReached(true), 700)
    return () => clearTimeout(t)
  }, [total])

  // Failsafe: never hold the page for more than 8 s; the scene keeps loading behind
  useEffect(() => {
    const t = setTimeout(() => setReached(true), 8000)
    return () => clearTimeout(t)
  }, [])

  // Done: give the first frame a moment to paint, fade and sharpen the poster, then remove it
  useEffect(() => {
    if (!reached) return
    const boot = document.getElementById('boot')
    if (!boot) return
    const bar = boot.querySelector<HTMLElement>('.bb i')
    if (bar) {
      boot.classList.add('has-p')
      bar.style.width = '100%'
    }
    const t1 = setTimeout(() => boot.classList.add('is-done'), 700)
    const t2 = setTimeout(() => boot.remove(), 1550)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [reached])

  return null
}
