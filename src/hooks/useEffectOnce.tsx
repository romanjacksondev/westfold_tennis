import { useRef, useState, useEffect } from 'react'

export const useEffectOnce = (effect: () => void | (() => void)) => {
  const effectFn = useRef(effect)
  const destroyFn = useRef<void | (() => void)>()
  const effectCalled = useRef(false)
  const rendered = useRef(false)
  const [, refresh] = useState<number>(0)

  if (effectCalled.current) {
    rendered.current = true
  }

  useEffect(() => {
    if (!effectCalled.current) {
      destroyFn.current = effectFn.current()
      effectCalled.current = true
    }

    refresh(1)

    return () => {
      if (rendered.current === false) return
      if (destroyFn.current) destroyFn.current()
    }
  }, [])
}
