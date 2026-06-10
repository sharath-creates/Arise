/**
 * StreakIndicator — compact badge showing streak status with milestone-aware copy.
 *
 * Props:
 *   streakDays        {number}    current consecutive streak
 *   lockedMilestones  {number[]}  array of day numbers already locked
 *   currentDay        {number}    today's day in the program (1-66)
 */

const MILESTONE_DAYS = [1, 7, 14, 21, 35, 48, 66]

function getStreakCopy(streakDays, lockedMilestones, currentDay) {
  if (lockedMilestones.includes(currentDay)) {
    return `Day ${currentDay} streak — locked 🔒`
  }

  const nextMilestone = MILESTONE_DAYS.find((m) => m > currentDay)

  if (nextMilestone !== undefined && nextMilestone - currentDay <= 3) {
    const daysLeft = nextMilestone - currentDay
    return `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left to lock your ${nextMilestone}-day streak`
  }

  return `${streakDays}-day streak`
}

export default function StreakIndicator({
  streakDays = 0,
  lockedMilestones = [],
  currentDay = 1,
}) {
  const copy = getStreakCopy(streakDays, lockedMilestones, currentDay)

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        color: '#e0c068',
        fontSize: 12,
        fontWeight: 700,
        background:
          'linear-gradient(135deg, rgba(201,168,76,0.16), rgba(201,168,76,0.06))',
        border: '1px solid rgba(201, 168, 76, 0.35)',
        borderRadius: 20,
        pad