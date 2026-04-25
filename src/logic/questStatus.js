export function getQuestStatus(quest) {
  return quest?.status ?? 'pending'
}
