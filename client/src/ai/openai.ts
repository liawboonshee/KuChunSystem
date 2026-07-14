import { runInventoryTool } from '../inventory/AITools'

export type ChatRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  role: ChatRole
  content: string
}

const FREE_VOICE_HELP = `这是免费本机库存语音版，不连接付费 AI。你可以说：
“进货125克，成本4500”
“卖给阿明10克，收800，现金”
“今天赚多少”
“现在库存多少”`

/**
 * 免费本机版只运行库存工具，不向 OpenAI、Worker 或任何收费 AI 接口发送资料。
 * 保留异步签名，让文字输入和连续语音流程无需分叉。
 */
export async function askAI(
  messages: ChatMessage[],
  _signal?: AbortSignal,
): Promise<string> {
  const text = messages[messages.length - 1]?.content?.trim() || ''
  return runInventoryTool(text) || FREE_VOICE_HELP
}
