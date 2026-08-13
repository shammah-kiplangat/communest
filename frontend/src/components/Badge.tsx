import type { UserRole, EstateStatus, MaintenanceStatus, HouseStatus, InquiryStatus } from '../types'

interface BadgeProps {
  label: string
  variant: 'blue' | 'green' | 'amber' | 'red' | 'slate' | 'purple' | 'cyan'
  size?: 'sm' | 'md'
}

export function Badge({ label, variant, size = 'sm' }: BadgeProps) {
  const variantClasses = {
    blue: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
    green: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
    red: 'bg-red-500/15 text-red-300 border-red-500/25',
    slate: 'bg-slate-500/15 text-slate-300 border-slate-500/25',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/25',
    cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
  }
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'

  return (
    <span className={`inline-flex items-center rounded-full border font-medium tracking-wide ${variantClasses[variant]} ${sizeClasses}`}>
      {label}
    </span>
  )
}

export function UserRoleBadge({ role }: { role: UserRole }) {
  switch (role) {
    case 'communest_admin': return <Badge label="Communest Admin" variant="purple" />
    case 'estate_admin': return <Badge label="Estate Admin" variant="blue" />
    case 'tenant': return <Badge label="Tenant" variant="green" />
    case 'regular_user': return <Badge label="Regular User" variant="slate" />
  }
}

export function EstateStatusBadge({ status }: { status: EstateStatus }) {
  switch (status) {
    case 'approved': return <Badge label="Approved & Verified" variant="green" size="md" />
    case 'pending': return <Badge label="Pending Approval" variant="amber" size="md" />
    case 'denied': return <Badge label="Denied" variant="red" size="md" />
  }
}

export function MaintenanceBadge({ status, onClick }: { status: MaintenanceStatus; onClick?: () => void }) {
  const map: Record<MaintenanceStatus, { label: string; variant: BadgeProps['variant'] }> = {
    scheduled: { label: 'Scheduled', variant: 'blue' },
    in_progress: { label: 'In Progress', variant: 'amber' },
    resolved: { label: 'Resolved', variant: 'green' },
  }
  const { label, variant } = map[status]
  return (
    <span
      onClick={onClick}
      className={onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
    >
      <Badge label={label} variant={variant} size="md" />
    </span>
  )
}

export function HouseBadge({ status }: { status: HouseStatus }) {
  return status === 'vacant'
    ? <Badge label="Vacant" variant="green" size="md" />
    : <Badge label="Occupied" variant="slate" size="md" />
}

export function InquiryBadge({ status }: { status: InquiryStatus }) {
  return status === 'pending'
    ? <Badge label="Pending" variant="amber" size="md" />
    : <Badge label="Resolved" variant="green" size="md" />
}

export function PaymentStatusBadge({ status }: { status: string }) {
  if (status === 'confirmed') return <Badge label="Paid" variant="green" size="md" />
  if (status === 'due') return <Badge label="Due" variant="red" size="md" />
  return <Badge label="Pending" variant="amber" size="md" />
}

export function VerifiedBadge({ verified }: { verified: boolean }) {
  return verified
    ? <Badge label="Verified" variant="green" />
    : <Badge label="Unverified" variant="amber" />
}
