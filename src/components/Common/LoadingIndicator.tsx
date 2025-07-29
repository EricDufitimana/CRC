'use client'
import { useLinkStatus } from 'next/link'
import PreLoader from './PreLoader'

export default function LoadingIndicator() {
  const { pending } = useLinkStatus()
  return pending ? (
    <PreLoader />
  ) : null
}
