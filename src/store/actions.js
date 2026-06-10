export const ACTIONS = {
  // navigation
  NAVIGATE: 'NAVIGATE',

  // lifecycle
  ENTER_SYSTEM: 'ENTER_SYSTEM',           // awakening -> onboarding
  COMPLETE_ONBOARDING: 'COMPLETE_ONBOARDING', // profile saved -> oath step handled in screen
  TAKE_OATH: 'TAKE_OATH',                 // start day 1
  OPEN_APP: 'OPEN_APP',                   // rollover check { todayKey }
  ACKNOWLEDGE_REPORT: 'ACKNOWLEDGE_REPORT',
  ABANDON_PROGRAM: 'ABANDON_PROGRAM',
  RESTART_PROGRAM: 'RESTART_PROGRAM',     // after completion

  // quests
  COMPLETE_MANDATORY: 'COMPLETE_MANDATORY', // { questId, value, completed }
  TOGGLE_SIDE_QUEST: 'TOGGLE_SIDE_QUEST',   // { itemId, checked }

  // penalty system
  SHOW_WARNING: 'SHOW_WARNING',
  SNOOZE_WARNING: 'SNOOZE_WARNING',       // { messageIndex }
  SURRENDER_DAY: 'SURRENDER_DAY',

  // settings
  SAVE_SETTINGS: 'SAVE_SETTINGS',         // { updates }

  // ceremonies & toasts
  ACK_CEREMONY: 'ACK_CEREMONY',
  DISMISS_TOAST: 'DISMISS_TOAST',         // { id }
}
